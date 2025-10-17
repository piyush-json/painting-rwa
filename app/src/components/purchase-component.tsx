'use client'

import React, { useState, useEffect } from 'react'
import { PublicKey } from '@solana/web3.js'
import * as anchor from '@coral-xyz/anchor'
import { Artwork } from '../lib/data-access'
import {
  useRwaProgram,
  getVaultPda,
  getKycPda,
  PLATFORM_AUTHORITY
} from '../lib/sdk'
import { useDataAccess } from '../providers/data-access-provider'
import {
  formatCurrency,
  calculateSharesFromAmount,
  calculateAmountFromShares,
  cn
} from '../lib/utils'
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction
} from '@solana/spl-token'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Alert, AlertDescription } from './ui/misc'
import {
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { USDC_MINT } from '@/lib/constant'

interface PurchaseComponentProps {
  artwork: Artwork
  className?: string
}

export const PurchaseComponent: React.FC<PurchaseComponentProps> = ({
  artwork,
  className
}) => {
  const { kycStatus, userAddress, isConnected } = useDataAccess()
  const program = useRwaProgram()

  const [sharesInput, setSharesInput] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [inputMode, setInputMode] = useState<'shares' | 'amount'>('shares')

  const sharesAvailable = artwork.totalShares - artwork.sharesSold
  const maxShares = Math.min(sharesAvailable, 1000) // Limit for demo
  const maxAmount = maxShares * artwork.pricePerShare

  // Calculate derived values
  const shares =
    inputMode === 'shares'
      ? parseInt(sharesInput) || 0
      : calculateSharesFromAmount(
          parseFloat(amountInput) || 0,
          artwork.pricePerShare
        )

  const amount =
    inputMode === 'amount'
      ? parseFloat(amountInput) || 0
      : calculateAmountFromShares(shares, artwork.pricePerShare)

  const isValidShares = shares > 0 && shares <= maxShares
  const isValidAmount = amount > 0 && amount <= maxAmount
  const isValidPurchase = isValidShares && isValidAmount

  // Platform fee (5%)
  const platformFee = amount * 0.05
  const totalCost = amount + platformFee

  // Update derived input when switching modes
  useEffect(() => {
    if (inputMode === 'shares') {
      setAmountInput(amount.toFixed(2))
    } else {
      setSharesInput(shares.toString())
    }
  }, [shares, amount, inputMode])

  const handleSharesChange = (value: string) => {
    setSharesInput(value)
    setInputMode('shares')
  }

  const handleAmountChange = (value: string) => {
    setAmountInput(value)
    setInputMode('amount')
  }

  const handlePurchase = async () => {
    if (!program || !userAddress || !isValidPurchase) return

    setIsLoading(true)
    try {
      // Get vault PDA using the original NFT mint
      const originalNftMint = new PublicKey(artwork.originalNftMint)
      const [vaultPda] = getVaultPda(originalNftMint, program.programId)

      // Get KYC PDA
      const [kycPda] = getKycPda(userAddress, program.programId)

      // Get platform authority
      const platformAuthority = PLATFORM_AUTHORITY

      // Get fractional token mint from vault
      const vault = await program.account.vault.fetch(vaultPda)
      const fractionalTokenMint = vault.fractionalTokenMint

      // Get associated token addresses
      const buyerFractionalAccount = await getAssociatedTokenAddress(
        fractionalTokenMint,
        userAddress
      )

      const vaultFractionalAccount = await getAssociatedTokenAddress(
        fractionalTokenMint,
        vaultPda,
        true
      )

      const buyerPaymentAccount = await getAssociatedTokenAddress(
        USDC_MINT, // USDC mint
        userAddress
      )

      const creatorPaymentAccount = vault.creatorPaymentAccount

      // Call the buyFractions instruction
      const buyTx = await program.methods
        .buyFractions(new anchor.BN(shares))
        .accounts({
          buyer: userAddress,
          vault: vaultPda,
          fractionalTokenMint: fractionalTokenMint,
          vaultFractionalAccount: vaultFractionalAccount,
          buyerPaymentAccount: buyerPaymentAccount,
          creatorPaymentAccount: creatorPaymentAccount,
          kycAccount: kycPda,
          platformAuthority: platformAuthority
        })
        .rpc()

      toast.success(
        `Successfully purchased ${shares} shares for ${formatCurrency(
          totalCost
        )}!`
      )

      // Reset inputs
      setSharesInput('')
      setAmountInput('')
    } catch (error) {
      console.error('Purchase failed:', error)
      toast.error(
        `Purchase failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    } finally {
      setIsLoading(false)
    }
  }

  const canPurchase =
    isConnected && kycStatus.kycStatus.isVerified && isValidPurchase

  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <ShoppingCart className='h-5 w-5' />
          Purchase Shares
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* Investment Summary */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>Total Shares</span>
            <span className='font-medium'>
              {artwork.totalShares.toLocaleString()}
            </span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>
              Shares Available
            </span>
            <Badge variant={sharesAvailable > 0 ? 'default' : 'destructive'}>
              {sharesAvailable.toLocaleString()}
            </Badge>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>
              Price per Share
            </span>
            <span className='font-medium'>
              {formatCurrency(artwork.pricePerShare)}
            </span>
          </div>
        </div>

        <Separator />

        {/* Purchase Input */}
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='shares'>Number of Shares</Label>
            <Input
              id='shares'
              type='number'
              placeholder='Enter number of shares'
              value={sharesInput}
              onChange={(e) => handleSharesChange(e.target.value)}
              min='1'
              max={maxShares}
              className={!isValidShares && sharesInput ? 'border-red-500' : ''}
            />
            {!isValidShares && sharesInput && (
              <p className='text-sm text-destructive'>
                Must be between 1 and {maxShares.toLocaleString()} shares
              </p>
            )}
          </div>

          <div className='text-center text-sm text-muted-foreground'>or</div>

          <div className='space-y-2'>
            <Label htmlFor='amount'>Investment Amount</Label>
            <Input
              id='amount'
              type='number'
              placeholder='Enter investment amount'
              value={amountInput}
              onChange={(e) => handleAmountChange(e.target.value)}
              min='0.01'
              max={maxAmount}
              step='0.01'
              className={!isValidAmount && amountInput ? 'border-red-500' : ''}
            />
            {!isValidAmount && amountInput && (
              <p className='text-sm text-destructive'>
                Must be between ${artwork.pricePerShare} and{' '}
                {formatCurrency(maxAmount)}
              </p>
            )}
          </div>
        </div>

        {/* Cost Breakdown */}
        {isValidPurchase && (
          <div className='space-y-3 p-4 bg-background rounded-lg'>
            <h4 className='font-medium text-sm'>Cost Breakdown</h4>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span>Shares ({shares})</span>
                <span>{formatCurrency(amount)}</span>
              </div>
              <div className='flex justify-between'>
                <span>Platform Fee (5%)</span>
                <span>{formatCurrency(platformFee)}</span>
              </div>
              <Separator />
              <div className='flex justify-between font-medium'>
                <span>Total Cost</span>
                <span>{formatCurrency(totalCost)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {!isConnected && (
          <Alert>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              Please connect your wallet to purchase shares.
            </AlertDescription>
          </Alert>
        )}

        {isConnected && !kycStatus.kycStatus.isVerified && (
          <Alert>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              KYC verification required to purchase shares.{' '}
              <Link href='/kyc' className='text-primary hover:underline'>
                Complete verification
                <ExternalLink className='inline h-3 w-3 ml-1' />
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {isConnected && kycStatus.kycStatus.isVerified && (
          <Alert>
            <CheckCircle className='h-4 w-4' />
            <AlertDescription>
              KYC verified. You can purchase shares.
            </AlertDescription>
          </Alert>
        )}

        {/* Purchase Button */}
        <Button
          onClick={handlePurchase}
          disabled={!canPurchase || isLoading}
          className='w-full'
          size='lg'
        >
          {isLoading
            ? 'Processing...'
            : !isConnected
            ? 'Connect Wallet'
            : !kycStatus.kycStatus.isVerified
            ? 'KYC Required'
            : `Buy ${shares} Shares for ${formatCurrency(totalCost)}`}
        </Button>

        {/* Additional Info */}
        <div className='text-xs text-muted-foreground text-center space-y-1'>
          <p>Shares are non-refundable</p>
          <p>Platform fee: 5%</p>
          <p>Minimum investment: {formatCurrency(artwork.pricePerShare)}</p>
        </div>
      </CardContent>
    </Card>
  )
}
