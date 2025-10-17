import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Connection, PublicKey, clusterApiUrl, Keypair } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { useMemo } from 'react'

// Import the generated IDL
import idl from '../idl/rwa.json'
import { Rwa } from '../types/rwa'

export const PROGRAM_ID = new PublicKey(
  'Guhyo3fAg6Qys962ngVbsidvzEWsBiGmZ3XYMyo73MfE'
)

// Helper function to get platform authority (admin) - for demo purposes, use connected wallet
export const PLATFORM_AUTHORITY = new PublicKey(
  'GTm5z1peTZ2GTVJkcaTcArptUnDw5a6CGpmrrLo2caed'
)

// Helper function to get vault PDA
export const getVaultPda = (
  originalNftMint: PublicKey,
  programId: PublicKey
): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), originalNftMint.toBuffer()],
    programId
  )
}

// Helper function to get KYC PDA
export const getKycPda = (
  user: PublicKey,
  programId: PublicKey
): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('simple_kyc'), user.toBuffer()],
    programId
  )
}

// Helper function to get platform config PDA
export const getPlatformConfigPda = (
  programId: PublicKey
): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('platform_config')],
    programId
  )
}

export const useRwaProgram = () => {
  const { wallet, publicKey } = useWallet()

  const program = useMemo(() => {
    if (!wallet || !publicKey) return null

    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('devnet'),
      'confirmed'
    )

    const provider = new AnchorProvider(connection, wallet.adapter as any, {
      commitment: 'confirmed'
    })

    return new Program<Rwa>(idl, provider)
  }, [wallet, publicKey])

  return program
}

export const useConnection = () => {
  return useMemo(() => {
    return new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('devnet'),
      'confirmed'
    )
  }, [])
}
