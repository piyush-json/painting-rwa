import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Rwa } from '../target/types/rwa'
import { PublicKey, Keypair } from '@solana/web3.js'
import {
  createMint,
  createAccount,
  mintTo,
  getAccount,
  getAssociatedTokenAddress
} from '@solana/spl-token'
import { expect } from 'chai'

describe('rwa', () => {
  anchor.setProvider(anchor.AnchorProvider.env())

  const program = anchor.workspace.rwa as Program<Rwa>
  const provider = anchor.getProvider()

  // Test accounts
  let creator: Keypair
  let buyer: Keypair
  let admin: Keypair
  let originalNftMint: PublicKey
  let paymentMint: PublicKey // USDC mint for payments
  let creatorNftTokenAccount: PublicKey
  let buyerPaymentAccount: PublicKey
  let platformPaymentAccount: PublicKey
  let creatorPaymentAccount: PublicKey

  before(async () => {
    // Initialize test accounts
    creator = Keypair.generate()
    buyer = Keypair.generate()
    admin = Keypair.generate()

    // Airdrop SOL to test accounts
    await provider.connection.requestAirdrop(
      creator.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    )
    await provider.connection.requestAirdrop(
      buyer.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    )
    await provider.connection.requestAirdrop(
      admin.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    )

    // Wait for airdrops to confirm
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Create NFT mint (representing the artwork)
    originalNftMint = await createMint(
      provider.connection,
      creator,
      creator.publicKey,
      null,
      0 // NFTs have 0 decimals
    )

    // Create payment mint (USDC)
    paymentMint = await createMint(
      provider.connection,
      admin,
      admin.publicKey,
      null,
      6 // USDC has 6 decimals
    )

    // Create token accounts
    creatorNftTokenAccount = await createAccount(
      provider.connection,
      creator,
      originalNftMint,
      creator.publicKey
    )

    buyerPaymentAccount = await createAccount(
      provider.connection,
      buyer,
      paymentMint,
      buyer.publicKey
    )

    creatorPaymentAccount = await createAccount(
      provider.connection,
      creator,
      paymentMint,
      creator.publicKey
    )

    platformPaymentAccount = await createAccount(
      provider.connection,
      admin,
      paymentMint,
      admin.publicKey
    )

    console.log('PAYER ACCOUNTS')
    console.log(`creatorPaymentAccount: ${creatorPaymentAccount.toString()}`)
    console.log(`buyerPaymentAccount: ${buyerPaymentAccount.toString()}`)
    console.log(`platformPaymentAccount: ${platformPaymentAccount.toString()}`)

    console.log('NFT ACCOUNTS')
    console.log(`creatorNftTokenAccount: ${creatorNftTokenAccount.toString()}`)

    console.log('ORIGINAL NFT MINT')
    console.log(`originalNftMint: ${originalNftMint.toString()}`)

    // Mint NFT to creator
    await mintTo(
      provider.connection,
      creator,
      originalNftMint,
      creatorNftTokenAccount,
      creator,
      1 // Mint 1 NFT
    )

    // Mint USDC to buyer for payments
    await mintTo(
      provider.connection,
      admin,
      paymentMint,
      buyerPaymentAccount,
      admin,
      1000000 * Math.pow(10, 6) // Mint 1M USDC
    )
  })

  it('Initializes the platform', async () => {
    const [platformConfigPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('platform_config')],
      program.programId
    )

    await program.methods
      .initialize()
      .accounts({
        admin: admin.publicKey
      })
      .signers([admin])
      .rpc()

    const platformConfig = await program.account.platformConfig.fetch(
      platformConfigPda
    )
    expect(platformConfig.admin.toString()).to.equal(admin.publicKey.toString())
    expect(platformConfig.isActive).to.be.true
  })

  it('Registers KYC for users', async () => {
    const [creatorKycPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('simple_kyc'), creator.publicKey.toBuffer()],
      program.programId
    )

    const [buyerKycPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('simple_kyc'), buyer.publicKey.toBuffer()],
      program.programId
    )

    // Register creator KYC
    await program.methods
      .registerKyc()
      .accounts({
        user: creator.publicKey
      })
      .signers([creator])
      .rpc()

    // Register buyer KYC
    await program.methods
      .registerKyc()
      .accounts({
        user: buyer.publicKey
      })
      .signers([buyer])
      .rpc()

    const creatorKyc = await program.account.simpleKycAccount.fetch(
      creatorKycPda
    )
    const buyerKyc = await program.account.simpleKycAccount.fetch(buyerKycPda)

    expect(creatorKyc.user.toString()).to.equal(creator.publicKey.toString())
    expect(buyerKyc.user.toString()).to.equal(buyer.publicKey.toString())
    expect(creatorKyc.isVerified).to.be.false
    expect(buyerKyc.isVerified).to.be.false
  })

  it('Verifies KYC for users', async () => {
    const [platformConfigPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('platform_config')],
      program.programId
    )

    const [creatorKycPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('simple_kyc'), creator.publicKey.toBuffer()],
      program.programId
    )

    const [buyerKycPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('simple_kyc'), buyer.publicKey.toBuffer()],
      program.programId
    )

    // Verify creator KYC
    await program.methods
      .verifyKyc({ adminApproval: {} }, 2)
      .accounts({
        admin: admin.publicKey,
        kycAccount: creatorKycPda,
        platformConfig: platformConfigPda
      })
      .signers([admin])
      .rpc()

    // Verify buyer KYC
    await program.methods
      .verifyKyc({ emailVerification: {} }, 1)
      .accounts({
        admin: admin.publicKey,
        kycAccount: buyerKycPda,
        platformConfig: platformConfigPda
      })
      .signers([admin])
      .rpc()

    const creatorKyc = await program.account.simpleKycAccount.fetch(
      creatorKycPda
    )
    const buyerKyc = await program.account.simpleKycAccount.fetch(buyerKycPda)

    expect(creatorKyc.isVerified).to.be.true
    expect(buyerKyc.isVerified).to.be.true
    expect(creatorKyc.verificationLevel).to.equal(2)
    expect(buyerKyc.verificationLevel).to.equal(1)
  })

  it('Fractionalizes an NFT', async () => {
    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), originalNftMint.toBuffer()],
      program.programId
    )

    const fractionalTokenMint = Keypair.generate()

    // Calculate the associated token accounts that will be created by Anchor
    const vaultFractionalAccount = await getAssociatedTokenAddress(
      fractionalTokenMint.publicKey,
      vaultPda,
      true
    )

    const vaultNftAccount = await getAssociatedTokenAddress(
      originalNftMint,
      vaultPda,
      true
    )

    const totalFractions = new anchor.BN(10000)
    const pricePerFraction = new anchor.BN(50) // 50 USDC per fraction

    await program.methods
      .fractionalize(totalFractions, pricePerFraction)
      .accounts({
        creator: creator.publicKey,
        originalNftMint: originalNftMint,
        fractionalTokenMint: fractionalTokenMint.publicKey,
        creatorNftAccount: creatorNftTokenAccount,
        creatorPaymentAccount: creatorPaymentAccount
      })
      .signers([creator, fractionalTokenMint])
      .rpc()

    const vault = await program.account.vault.fetch(vaultPda)
    expect(vault.creator.toString()).to.equal(creator.publicKey.toString())
    expect(vault.totalFractions.toString()).to.equal(totalFractions.toString())
    expect(vault.pricePerFraction.toString()).to.equal(
      pricePerFraction.toString()
    )
    expect(vault.fractionsSold.toString()).to.equal('0')
    expect(vault.isSaleActive).to.be.true
    expect(vault.creatorPaymentAccount.toString()).to.equal(
      creatorPaymentAccount.toString()
    )

    // Check that NFT was transferred to vault
    const vaultNftAccountInfo = await getAccount(
      provider.connection,
      vaultNftAccount
    )
    expect(vaultNftAccountInfo.amount.toString()).to.equal('1')

    // Check that fractional tokens were minted to vault
    const vaultFractionalAccountInfo = await getAccount(
      provider.connection,
      vaultFractionalAccount
    )
    expect(vaultFractionalAccountInfo.amount.toString()).to.equal(
      totalFractions.toString()
    )
  })

  it('Buys fractional tokens', async () => {
    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), originalNftMint.toBuffer()],
      program.programId
    )

    const vault = await program.account.vault.fetch(vaultPda)
    const fractionalTokenMint = vault.fractionalTokenMint

    const buyerFractionalAccount = await getAssociatedTokenAddress(
      fractionalTokenMint,
      buyer.publicKey
    )

    const vaultFractionalAccount = await getAssociatedTokenAddress(
      fractionalTokenMint,
      vaultPda,
      true
    )

    const numFractions = new anchor.BN(100)
    const totalCost = numFractions.mul(vault.pricePerFraction)

    await program.methods
      .buyFractions(numFractions)
      .accounts({
        buyer: buyer.publicKey,
        vault: vaultPda,
        fractionalTokenMint: fractionalTokenMint,
        vaultFractionalAccount: vaultFractionalAccount,
        buyerPaymentAccount: buyerPaymentAccount,
        creatorPaymentAccount: creatorPaymentAccount,
        kycAccount: PublicKey.findProgramAddressSync(
          [Buffer.from('simple_kyc'), buyer.publicKey.toBuffer()],
          program.programId
        )[0],
        platformAuthority: admin.publicKey
      })
      .signers([buyer])
      .rpc()

    // Check buyer's fractional tokens
    const buyerFractionalAccountInfo = await getAccount(
      provider.connection,
      buyerFractionalAccount
    )
    expect(buyerFractionalAccountInfo.amount.toString()).to.equal(
      numFractions.toString()
    )

    // Check vault state
    const updatedVault = await program.account.vault.fetch(vaultPda)
    expect(updatedVault.fractionsSold.toString()).to.equal(
      numFractions.toString()
    )

    // Check payment accounts
    const buyerPaymentAccountInfo = await getAccount(
      provider.connection,
      buyerPaymentAccount
    )
    const creatorPaymentAccountInfo = await getAccount(
      provider.connection,
      creatorPaymentAccount
    )

    // Buyer should have less USDC
    expect(parseInt(buyerPaymentAccountInfo.amount.toString())).to.be.lessThan(
      1000000000000
    )

    // Creator should have received payment (minus platform fee)
    expect(
      parseInt(creatorPaymentAccountInfo.amount.toString())
    ).to.be.greaterThan(0)
  })

  it('Redeems NFT by burning all fractional tokens', async () => {
    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), originalNftMint.toBuffer()],
      program.programId
    )

    const vault = await program.account.vault.fetch(vaultPda)
    const fractionalTokenMint = vault.fractionalTokenMint

    // We already have a `buyer` who bought 100 tokens. Let's use them.
    // First, find the buyer's existing fractional token account.
    // Note: The original test created a *new* account, which isn't what we want.
    // Let's assume the buyer's ATA was created in the 'Buys fractional tokens' test.
    const buyerFractionalAccount = await getAssociatedTokenAddress(
      fractionalTokenMint,
      buyer.publicKey
    )

    // Let's find the vault's fractional account
    const vaultFractionalAccount = await getAssociatedTokenAddress(
      fractionalTokenMint,
      vaultPda,
      true
    )

    // Buy all the *remaining* fractional tokens
    const remainingFractions = vault.totalFractions.sub(vault.fractionsSold)

    if (remainingFractions.gtn(0)) {
      // gtn is 'greater than zero'
      await program.methods
        .buyFractions(remainingFractions)
        .accounts({
          buyer: buyer.publicKey,
          vault: vaultPda,
          fractionalTokenMint: fractionalTokenMint,
          vaultFractionalAccount: vaultFractionalAccount,
          buyerPaymentAccount: buyerPaymentAccount,
          creatorPaymentAccount: creatorPaymentAccount,
          kycAccount: PublicKey.findProgramAddressSync(
            [Buffer.from('simple_kyc'), buyer.publicKey.toBuffer()],
            program.programId
          )[0],
          platformAuthority: admin.publicKey // Assuming admin is the authority
        })
        .signers([buyer])
        .rpc()
    }

    // Now that the buyer owns all tokens, they can redeem the NFT
    const vaultNftAccount = await getAssociatedTokenAddress(
      originalNftMint,
      vaultPda,
      true
    )

    const buyerNftAccount = await getAssociatedTokenAddress(
      originalNftMint,
      buyer.publicKey
    )

    await program.methods
      .redeem()
      .accounts({
        redeemer: buyer.publicKey,
        vault: vaultPda,
        originalNftMint: originalNftMint,
        fractionalTokenMint: fractionalTokenMint,
        redeemerFractionalAccount: buyerFractionalAccount,
        vaultNftAccount: vaultNftAccount,
        kycAccount: PublicKey.findProgramAddressSync(
          [Buffer.from('simple_kyc'), buyer.publicKey.toBuffer()],
          program.programId
        )[0]
      })
      .signers([buyer])
      .rpc()

    // Check that buyer now owns the NFT
    const buyerNftAccountInfo = await getAccount(
      provider.connection,
      buyerNftAccount
    )
    expect(buyerNftAccountInfo.amount.toString()).to.equal('1')

    // Check that fractional tokens were burned (account balance is zero)
    const buyerFractionalAccountInfo = await getAccount(
      provider.connection,
      buyerFractionalAccount
    )
    expect(buyerFractionalAccountInfo.amount.toString()).to.equal('0')
  })

  it('Requires KYC verification to buy fractions', async () => {
    const newNftMint = await createMint(
      provider.connection,
      creator,
      creator.publicKey,
      null,
      0
    )

    const newCreatorNftAccount = await createAccount(
      provider.connection,
      creator,
      newNftMint,
      creator.publicKey
    )

    await mintTo(
      provider.connection,
      creator,
      newNftMint,
      newCreatorNftAccount,
      creator,
      1
    )

    const [newVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), newNftMint.toBuffer()],
      program.programId
    )

    const newFractionalTokenMint = Keypair.generate()

    const newVaultFractionalAccount = await getAssociatedTokenAddress(
      newFractionalTokenMint.publicKey,
      newVaultPda,
      true
    )

    const newVaultNftAccount = await getAssociatedTokenAddress(
      newNftMint,
      newVaultPda,
      true
    )

    // Fractionalize the NFT
    await program.methods
      .fractionalize(new anchor.BN(1000), new anchor.BN(100))
      .accounts({
        creator: creator.publicKey,
        originalNftMint: newNftMint,
        fractionalTokenMint: newFractionalTokenMint.publicKey,
        creatorNftAccount: newCreatorNftAccount,
        creatorPaymentAccount: creatorPaymentAccount
      })
      .signers([creator, newFractionalTokenMint])
      .rpc()

    // Create unverified buyer
    const unverifiedBuyer = Keypair.generate()
    await provider.connection.requestAirdrop(
      unverifiedBuyer.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    )
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const unverifiedBuyerPaymentAccount = await createAccount(
      provider.connection,
      unverifiedBuyer,
      paymentMint,
      unverifiedBuyer.publicKey
    )

    await mintTo(
      provider.connection,
      admin,
      paymentMint,
      unverifiedBuyerPaymentAccount,
      admin,
      1000000 * Math.pow(10, 6)
    )

    const unverifiedBuyerFractionalAccount = await createAccount(
      provider.connection,
      unverifiedBuyer,
      newFractionalTokenMint.publicKey,
      unverifiedBuyer.publicKey
    )

    await program.methods
      .registerKyc()
      .accounts({
        user: unverifiedBuyer.publicKey
      })
      .signers([unverifiedBuyer])
      .rpc()

    try {
      await program.methods
        .buyFractions(new anchor.BN(10))
        .accounts({
          buyer: unverifiedBuyer.publicKey,
          vault: newVaultPda,
          fractionalTokenMint: newFractionalTokenMint.publicKey,
          vaultFractionalAccount: newVaultFractionalAccount,
          buyerPaymentAccount: unverifiedBuyerPaymentAccount,
          creatorPaymentAccount: creatorPaymentAccount,
          kycAccount: PublicKey.findProgramAddressSync(
            [Buffer.from('simple_kyc'), unverifiedBuyer.publicKey.toBuffer()],
            program.programId
          )[0],
          platformAuthority: admin.publicKey
        })
        .signers([unverifiedBuyer])
        .rpc()

      // If we get here, the test should fail
      expect.fail('Expected transaction to fail due to missing KYC')
    } catch (error) {
      // This is expected - the transaction should fail
      expect(error.message).to.include('KycNotVerified')
    }
  })
})
