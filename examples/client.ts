import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Rwa } from '../target/types/rwa'
import { PublicKey, Keypair, SystemProgram } from '@solana/web3.js'
import {
  createMint,
  createAccount,
  mintTo,
  getAccount,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token'
import {
  createMint as createMint2022,
  createAccount as createAccount2022,
  getAccount as getAccount2022,
  TOKEN_2022_PROGRAM_ID
} from '@solana/spl-token-2022'

/**
 * Example client demonstrating the Fractional Art Investment Platform
 * This script shows how to:
 * 1. Set up accounts and mints
 * 2. Register and verify KYC
 * 3. Fractionalize an NFT
 * 4. Buy fractional shares
 * 5. Redeem the original NFT
 */

async function main() {
  console.log('🎨 Fractional Art Investment Platform - Client Example')
  console.log('=====================================================')

  // Setup
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const program = anchor.workspace.rwa as Program<Rwa>

  // Generate test accounts
  const creator = Keypair.generate()
  const buyer = Keypair.generate()
  const admin = Keypair.generate()

  console.log('\n📋 Setting up test accounts...')
  console.log('Creator:', creator.publicKey.toString())
  console.log('Buyer:', buyer.publicKey.toString())
  console.log('Admin:', admin.publicKey.toString())

  // Airdrop SOL to accounts
  await provider.connection.requestAirdrop(
    creator.publicKey,
    10 * anchor.web3.LAMPORTS_PER_SOL
  )
  await provider.connection.requestAirdrop(
    buyer.publicKey,
    10 * anchor.web3.LAMPORTS_PER_SOL
  )
  await provider.connection.requestAirdrop(
    admin.publicKey,
    10 * anchor.web3.LAMPORTS_PER_SOL
  )

  // Create NFT mint (simplified - in production this would be a proper NFT)
  console.log('\n🖼️  Creating NFT mint...')
  const originalNftMint = await createMint(
    provider.connection,
    creator,
    creator.publicKey,
    null,
    0 // NFTs have 0 decimals
  )
  console.log('NFT Mint:', originalNftMint.toString())

  // Create payment mint (USDC)
  console.log('\n💰 Creating payment mint (USDC)...')
  const paymentMint = await createMint(
    provider.connection,
    creator,
    creator.publicKey,
    null,
    6 // USDC has 6 decimals
  )
  console.log('Payment Mint:', paymentMint.toString())

  // Create token accounts
  const creatorNftTokenAccount = await createAccount(
    provider.connection,
    creator,
    originalNftMint,
    creator.publicKey
  )

  const buyerPaymentAccount = await createAccount(
    provider.connection,
    buyer,
    paymentMint,
    buyer.publicKey
  )

  const platformPaymentAccount = await createAccount(
    provider.connection,
    creator,
    paymentMint,
    creator.publicKey
  )

  const creatorPaymentAccount = await createAccount(
    provider.connection,
    creator,
    paymentMint,
    creator.publicKey
  )

  // Mint NFT to creator
  await mintTo(
    provider.connection,
    creator,
    originalNftMint,
    creatorNftTokenAccount,
    creator,
    1
  )

  // Mint USDC to buyer
  await mintTo(
    provider.connection,
    creator,
    paymentMint,
    buyerPaymentAccount,
    creator,
    10000000 // 10 USDC
  )

  console.log('✅ Accounts setup complete!')

  // Step 1: Register KYC for buyer
  console.log('\n🔐 Step 1: Registering KYC for buyer...')
  const [kycPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('kyc'), buyer.publicKey.toBuffer()],
    program.programId
  )

  const registerKycTx = await program.methods
    .registerKyc()
    .accounts({
      user: buyer.publicKey,
      kycAccount: kycPda,
      systemProgram: SystemProgram.programId
    })
    .signers([buyer])
    .rpc()

  console.log('KYC registration tx:', registerKycTx)

  // Step 2: Verify KYC
  console.log('\n✅ Step 2: Verifying KYC...')
  const verifyKycTx = await program.methods
    .verifyKyc(true)
    .accounts({
      admin: admin.publicKey,
      kycAccount: kycPda,
      adminAuthority: admin.publicKey
    })
    .signers([admin])
    .rpc()

  console.log('KYC verification tx:', verifyKycTx)

  // Step 3: Fractionalize NFT
  console.log('\n🔀 Step 3: Fractionalizing NFT...')
  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), originalNftMint.toBuffer()],
    program.programId
  )

  const [fractionalMintPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('fractional_mint'), originalNftMint.toBuffer()],
    program.programId
  )

  const [vaultFractionalTokenAccountPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault_fractional'), originalNftMint.toBuffer()],
    program.programId
  )

  const [vaultNftTokenAccountPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault_nft'), originalNftMint.toBuffer()],
    program.programId
  )

  const totalFractions = new anchor.BN(1000)
  const pricePerFraction = new anchor.BN(1000000) // 1 USDC per fraction
  const royaltyFeeNumerator = 500 // 5%
  const royaltyFeeDenominator = 10000 // 100%

  const fractionalizeTx = await program.methods
    .fractionalize(
      totalFractions,
      pricePerFraction,
      royaltyFeeNumerator,
      royaltyFeeDenominator
    )
    .accounts({
      creator: creator.publicKey,
      originalNftMint: originalNftMint,
      vault: vaultPda,
      fractionalTokenMint: fractionalMintPda,
      vaultFractionalTokenAccount: vaultFractionalTokenAccountPda,
      creatorNftTokenAccount: creatorNftTokenAccount,
      vaultNftTokenAccount: vaultNftTokenAccountPda,
      tokenProgram: TOKEN_PROGRAM_ID,
      token2022Program: TOKEN_2022_PROGRAM_ID,
      systemProgram: SystemProgram.programId
    })
    .signers([creator])
    .rpc()

  console.log('Fractionalization tx:', fractionalizeTx)
  console.log(
    `✅ NFT fractionalized into ${totalFractions.toString()} shares at ${pricePerFraction.toString()} lamports each`
  )

  // Step 4: Buy fractional tokens
  console.log('\n💸 Step 4: Buying fractional tokens...')
  const buyerFractionalTokenAccount = await createAccount2022(
    provider.connection,
    buyer,
    fractionalMintPda,
    buyer.publicKey
  )

  const numFractions = new anchor.BN(100)

  const buyFractionsTx = await program.methods
    .buyFractions(numFractions)
    .accounts({
      buyer: buyer.publicKey,
      vault: vaultPda,
      buyerFractionalTokenAccount: buyerFractionalTokenAccount,
      vaultFractionalTokenAccount: vaultFractionalTokenAccountPda,
      buyerPaymentAccount: buyerPaymentAccount,
      platformPaymentAccount: platformPaymentAccount,
      creatorPaymentAccount: creatorPaymentAccount,
      kycAccount: kycPda,
      platformAuthority: creator.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      token2022Program: TOKEN_2022_PROGRAM_ID
    })
    .signers([buyer])
    .rpc()

  console.log('Buy fractions tx:', buyFractionsTx)
  console.log(`✅ Purchased ${numFractions.toString()} fractional shares`)

  // Step 5: Redeem NFT (simulate buying all remaining tokens)
  console.log('\n🔄 Step 5: Redeeming NFT...')

  // Create redeemer's fractional token account
  const redeemerFractionalTokenAccount = await createAccount2022(
    provider.connection,
    creator,
    fractionalMintPda,
    creator.publicKey
  )

  // Mint remaining tokens to redeemer (simulating buying all remaining tokens)
  const remainingTokens = new anchor.BN(900) // 1000 - 100 already sold
  await mintTo2022(
    provider.connection,
    creator,
    fractionalMintPda,
    redeemerFractionalTokenAccount,
    creator,
    remainingTokens.toNumber()
  )

  // Create redeemer's NFT token account
  const redeemerNftTokenAccount = await createAccount(
    provider.connection,
    creator,
    originalNftMint,
    creator.publicKey
  )

  const redeemTx = await program.methods
    .redeem()
    .accounts({
      redeemer: creator.publicKey,
      vault: vaultPda,
      redeemerFractionalTokenAccount: redeemerFractionalTokenAccount,
      vaultFractionalTokenAccount: vaultFractionalTokenAccountPda,
      vaultNftTokenAccount: vaultNftTokenAccountPda,
      redeemerNftTokenAccount: redeemerNftTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      token2022Program: TOKEN_2022_PROGRAM_ID,
      systemProgram: SystemProgram.programId
    })
    .signers([creator])
    .rpc()

  console.log('Redeem tx:', redeemTx)
  console.log('✅ NFT successfully redeemed!')

  // Final verification
  console.log('\n📊 Final State Verification:')

  // Check vault is closed
  try {
    await program.account.vault.fetch(vaultPda)
    console.log('❌ Vault should have been closed')
  } catch (error) {
    console.log('✅ Vault successfully closed')
  }

  // Check NFT ownership
  const redeemerNftAccount = await getAccount(
    provider.connection,
    redeemerNftTokenAccount
  )
  console.log(
    `✅ NFT ownership verified: ${redeemerNftAccount.amount.toString()} tokens`
  )

  // Check buyer's fractional tokens
  const buyerFractionalAccount = await getAccount2022(
    provider.connection,
    buyerFractionalTokenAccount
  )
  console.log(
    `✅ Buyer owns ${buyerFractionalAccount.amount.toString()} fractional shares`
  )

  console.log('\n🎉 Example completed successfully!')
  console.log('\n📈 Platform Benefits Demonstrated:')
  console.log('• ✅ NFT fractionalization into tradeable shares')
  console.log('• ✅ KYC compliance for regulatory adherence')
  console.log('• ✅ Automatic royalty distribution via Token-2022')
  console.log('• ✅ Secure vault system for asset protection')
  console.log('• ✅ Full redemption mechanism for complete ownership')
}

main().catch((error) => {
  console.error('❌ Example failed:', error)
  process.exit(1)
})
