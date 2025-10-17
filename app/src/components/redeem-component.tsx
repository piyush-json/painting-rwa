'use client'

import React, { useState, useEffect } from 'react'
import { PublicKey } from '@solana/web3.js'
import * as anchor from '@coral-xyz/anchor'
import { useRwaProgram, getVaultPda, getKycPda } from '../lib/sdk'
import { useDataAccess } from '../providers/data-access-provider'
import { formatCurrency, cn } from '../lib/utils'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/misc'
import { Gift, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

interface RedeemComponentProps {
  artworkId: string
  className?: string
}

export const RedeemComponent: React.FC<RedeemComponentProps> = ({
  artworkId,
  className
}) => {
  const { userAddress, isConnected, kycStatus } = useDataAccess()
  const program = useRwaProgram()
  const { artworks } = useDataAccess()

  const [isLoading, setIsLoading] = useState(false)
  const [userFractionalBalance, setUserFractionalBalance] = useState(0)
  const [canRedeem, setCanRedeem] = useState(false)

  const artwork = artworks.artworks.find((a) => a.id === artworkId)

  useEffect(() => {
    const checkUserBalance = async () => {
      if (!program || !userAddress || !artwork) return

      try {
        // Get vault PDA
        const originalNftMint = new PublicKey(artwork.originalNftMint)
        const [vaultPda] = getVaultPda(originalNftMint, program.programId)

        // Get vault data
        const vault = await program.account.vault.fetch(vaultPda)
        const fractionalTokenMint = vault.fractionalTokenMint

        // Get user's fractional token account
        const userFractionalAccount = await getAssociatedTokenAddress(
          fractionalTokenMint,
          userAddress
        )

        // Get user's balance
        const accountInfo = await program.provider.connection.getAccountInfo(
          userFractionalAccount
        )
        if (accountInfo) {
          // Parse token account to get balance
          const balance =
            await program.provider.connection.getTokenAccountBalance(
              userFractionalAccount
            )
          const userBalance = parseInt(balance.value.amount)
          setUserFractionalBalance(userBalance)
          setCanRedeem(userBalance === vault.totalFractions.toNumber())
        }
      } catch (error) {
        console.error('Error checking user balance:', error)
      }
    }

    checkUserBalance()
  }, [program, userAddress, artwork])

  const handleRedeem = async () => {
    if (!program || !userAddress || !artwork || !canRedeem) return

    setIsLoading(true)
    try {
      // Get vault PDA
      const originalNftMint = new PublicKey(artwork.originalNftMint)
      const [vaultPda] = getVaultPda(originalNftMint, program.programId)

      // Get vault data
      const vault = await program.account.vault.fetch(vaultPda)
      const fractionalTokenMint = vault.fractionalTokenMint

      // Get associated token addresses
      const userFractionalAccount = await getAssociatedTokenAddress(
        fractionalTokenMint,
        userAddress
      )

      const vaultNftAccount = await getAssociatedTokenAddress(
        originalNftMint,
        vaultPda,
        true
      )

      const userNftAccount = await getAssociatedTokenAddress(
        originalNftMint,
        userAddress
      )

      // Call the redeem instruction
      const tx = await program.methods
        .redeem()
        .accounts({
          redeemer: userAddress,
          vault: vaultPda,
          originalNftMint: originalNftMint,
          fractionalTokenMint: fractionalTokenMint,
          redeemerFractionalAccount: userFractionalAccount,
          vaultNftAccount: vaultNftAccount,
          kycAccount: getKycPda(userAddress, program.programId)[0]
        })
        .rpc()

      toast.success(`Successfully redeemed NFT! You now own ${artwork.title}`)
      setCanRedeem(false)
    } catch (error) {
      console.error('Redeem failed:', error)
      toast.error(
        `Redeem failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (!artwork) {
    return (
      <Card className={cn('w-full max-w-md', className)}>
        <CardContent className='p-6'>
          <p className='text-muted-foreground'>Artwork not found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Gift className='h-5 w-5' />
          Redeem NFT
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* Artwork Info */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>Artwork</span>
            <span className='font-medium'>{artwork.title}</span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>Artist</span>
            <span className='font-medium'>{artwork.artist}</span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>
              Total Fractions
            </span>
            <span className='font-medium'>
              {artwork.totalShares.toLocaleString()}
            </span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>Your Balance</span>
            <Badge variant={canRedeem ? 'default' : 'outline'}>
              {userFractionalBalance.toLocaleString()} shares
            </Badge>
          </div>
        </div>

        {/* Status Messages */}
        {!isConnected && (
          <Alert>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              Please connect your wallet to redeem NFTs.
            </AlertDescription>
          </Alert>
        )}

        {isConnected && !kycStatus.kycStatus.isVerified && (
          <Alert>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              KYC verification required to redeem NFTs.{' '}
              <a href='/kyc' className='text-blue-600 hover:underline'>
                Complete verification
                <ExternalLink className='inline h-3 w-3 ml-1' />
              </a>
            </AlertDescription>
          </Alert>
        )}

        {isConnected && kycStatus.kycStatus.isVerified && !canRedeem && (
          <Alert>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              You need to own all {artwork.totalShares.toLocaleString()} shares
              to redeem the NFT. You currently own{' '}
              {userFractionalBalance.toLocaleString()} shares.
            </AlertDescription>
          </Alert>
        )}

        {isConnected && kycStatus.kycStatus.isVerified && canRedeem && (
          <Alert>
            <CheckCircle className='h-4 w-4' />
            <AlertDescription>
              You own all shares! You can redeem the original NFT.
            </AlertDescription>
          </Alert>
        )}

        {/* Redeem Button */}
        <Button
          onClick={handleRedeem}
          disabled={!canRedeem || isLoading}
          className='w-full'
          size='lg'
        >
          {isLoading
            ? 'Redeeming...'
            : !isConnected
            ? 'Connect Wallet'
            : !kycStatus.kycStatus.isVerified
            ? 'KYC Required'
            : !canRedeem
            ? 'Need All Shares'
            : `Redeem ${artwork.title}`}
        </Button>

        {/* Additional Info */}
        <div className='text-xs text-muted-foreground text-center space-y-1'>
          <p>All fractional tokens will be burned</p>
          <p>Original NFT will be transferred to you</p>
          <p>Vault will be closed</p>
        </div>
      </CardContent>
    </Card>
  )
}
