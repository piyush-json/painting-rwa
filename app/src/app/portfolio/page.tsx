'use client'

import React from 'react'
import { useDataAccess } from '@/providers/data-access-provider'
import { useUserInvestments } from '@/lib/data-access'
import { formatCurrency, calculateProgress } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart
} from 'lucide-react'
import Link from 'next/link'

export default function PortfolioPage() {
  const { userAddress, isConnected, kycStatus } = useDataAccess()
  const { investments, isLoading } = useUserInvestments(
    userAddress || undefined
  )

  if (!isConnected) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center max-w-md mx-auto p-8'>
          <Wallet className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
          <h1 className='text-2xl font-bold text-foreground mb-4'>
            Connect Your Wallet
          </h1>
          <p className='text-muted-foreground mb-8'>
            Connect your wallet to view your art investment portfolio.
          </p>
          <Button size='lg' className='w-full'>
            Connect Wallet
          </Button>
        </div>
      </div>
    )
  }

  const totalInvested = investments.reduce(
    (sum, inv) => sum + inv.purchasePrice * inv.sharesOwned,
    0
  )
  const currentValue = investments.reduce(
    (sum, inv) => sum + inv.currentValue,
    0
  )
  const totalReturn = currentValue - totalInvested
  const returnPercentage =
    totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-foreground mb-2'>
            Your Portfolio
          </h1>
          <p className='text-xl text-muted-foreground'>
            Track your fractional art investments and returns
          </p>
        </div>

        {/* Portfolio Summary */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <DollarSign className='h-8 w-8 text-success mr-3' />
                <div>
                  <p className='text-sm text-muted-foreground'>
                    Total Invested
                  </p>
                  <p className='text-2xl font-bold text-foreground'>
                    {formatCurrency(totalInvested)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <PieChart className='h-8 w-8 text-info mr-3' />
                <div>
                  <p className='text-sm text-muted-foreground'>Current Value</p>
                  <p className='text-2xl font-bold text-foreground'>
                    {formatCurrency(currentValue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                {returnPercentage >= 0 ? (
                  <TrendingUp className='h-8 w-8 text-success mr-3' />
                ) : (
                  <TrendingDown className='h-8 w-8 text-destructive mr-3' />
                )}
                <div>
                  <p className='text-sm text-muted-foreground'>Total Return</p>
                  <p
                    className={`text-2xl font-bold ${
                      returnPercentage >= 0
                        ? 'text-success'
                        : 'text-destructive'
                    }`}
                  >
                    {returnPercentage >= 0 ? '+' : ''}
                    {formatCurrency(totalReturn)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                {returnPercentage >= 0 ? (
                  <TrendingUp className='h-8 w-8 text-success mr-3' />
                ) : (
                  <TrendingDown className='h-8 w-8 text-destructive mr-3' />
                )}
                <div>
                  <p className='text-sm text-muted-foreground'>Return %</p>
                  <p
                    className={`text-2xl font-bold ${
                      returnPercentage >= 0
                        ? 'text-success'
                        : 'text-destructive'
                    }`}
                  >
                    {returnPercentage >= 0 ? '+' : ''}
                    {returnPercentage.toFixed(2)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KYC Status */}
        {!kycStatus.kycStatus.isVerified && (
          <Card className='mb-8 border-warning bg-warning/10'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='font-semibold text-warning-foreground'>
                    KYC Verification Required
                  </h3>
                  <p className='text-sm text-warning-foreground/80'>
                    Complete KYC verification to access all portfolio features.
                  </p>
                </div>
                <Link href='/kyc'>
                  <Button
                    variant='outline'
                    className='border-yellow-300 text-yellow-800'
                  >
                    Complete KYC
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Investments */}
        {investments.length === 0 ? (
          <Card>
            <CardContent className='p-12 text-center'>
              <Wallet className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                No Investments Yet
              </h3>
              <p className='text-gray-600 mb-6'>
                Start building your art portfolio by investing in fractional
                shares.
              </p>
              <Link href='/'>
                <Button size='lg'>Browse Artworks</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-6'>
            <h2 className='text-2xl font-bold text-gray-900'>
              Your Investments
            </h2>

            {investments.map((investment) => {
              const progress = calculateProgress(
                investment.artwork.sharesSold,
                investment.artwork.totalShares
              )
              const investmentReturn =
                investment.currentValue -
                investment.purchasePrice * investment.sharesOwned
              const investmentReturnPercentage =
                (investmentReturn /
                  (investment.purchasePrice * investment.sharesOwned)) *
                100

              return (
                <Card key={investment.artworkId} className='overflow-hidden'>
                  <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 p-6'>
                    {/* Artwork Info */}
                    <div className='flex gap-4'>
                      <div className='w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0'>
                        {/* In a real app, this would be the actual artwork image */}
                        <div className='w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold'>
                          {investment.artwork.title.charAt(0)}
                        </div>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h3 className='text-lg font-semibold text-gray-900 truncate'>
                          {investment.artwork.title}
                        </h3>
                        <p className='text-sm text-gray-600'>
                          {investment.artwork.artist}
                        </p>
                        <p className='text-xs text-gray-500'>
                          Purchased {investment.purchaseDate}
                        </p>
                      </div>
                    </div>

                    {/* Investment Stats */}
                    <div className='space-y-3'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <p className='text-xs text-gray-500'>Shares Owned</p>
                          <p className='font-semibold'>
                            {investment.sharesOwned.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className='text-xs text-gray-500'>
                            Purchase Price
                          </p>
                          <p className='font-semibold'>
                            {formatCurrency(investment.purchasePrice)}
                          </p>
                        </div>
                        <div>
                          <p className='text-xs text-gray-500'>Current Value</p>
                          <p className='font-semibold'>
                            {formatCurrency(investment.currentValue)}
                          </p>
                        </div>
                        <div>
                          <p className='text-xs text-gray-500'>Return</p>
                          <p
                            className={`font-semibold ${
                              investmentReturn >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {investmentReturn >= 0 ? '+' : ''}
                            {investmentReturnPercentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className='space-y-3'>
                      <div className='space-y-2'>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-gray-600'>
                            Funding Progress
                          </span>
                          <span className='font-medium'>
                            {progress.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={progress} className='h-2' />
                      </div>

                      <div className='flex gap-2'>
                        <Link
                          href={`/artwork/${investment.artworkId}`}
                          className='flex-1'
                        >
                          <Button
                            variant='outline'
                            size='sm'
                            className='w-full'
                          >
                            View Details
                          </Button>
                        </Link>
                        {investment.sharesOwned ===
                          investment.artwork.totalShares && (
                          <Button
                            size='sm'
                            className='bg-green-600 hover:bg-green-700'
                          >
                            Redeem NFT
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
