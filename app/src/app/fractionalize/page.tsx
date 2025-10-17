'use client'

import React from 'react'
import { useDataAccess } from '@/providers/data-access-provider'
import { FractionalizeComponent } from '@/components/fractionalize-component'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/misc'
import {
  Upload,
  AlertTriangle,
  CheckCircle,
  Shield,
  Users,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'

export default function FractionalizePage() {
  const { userAddress, isConnected, kycStatus } = useDataAccess()

  if (!isConnected) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center max-w-md mx-auto p-8'>
          <Upload className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
          <h1 className='text-2xl font-bold text-foreground mb-4'>
            Connect Your Wallet
          </h1>
          <p className='text-muted-foreground mb-8'>
            Connect your wallet to fractionalize your NFTs and create investment
            opportunities.
          </p>
          <Button size='lg' className='w-full'>
            Connect Wallet
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='text-center mb-12'>
          <Upload className='h-16 w-16 text-blue-600 mx-auto mb-4' />
          <h1 className='text-4xl font-bold text-foreground mb-4'>
            Fractionalize Your NFT
          </h1>
          <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
            Transform your NFT into tradeable fractional shares and create
            investment opportunities for others.
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto'>
          {/* Fractionalize Form */}
          <div>
            {/* KYC Status Check */}
            {!kycStatus.kycStatus.isVerified ? (
              <Alert className='mb-6'>
                <AlertTriangle className='h-4 w-4' />
                <AlertDescription>
                  KYC verification is required to fractionalize NFTs.{' '}
                  <Link href='/kyc' className='text-blue-600 hover:underline'>
                    Complete verification first
                  </Link>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className='mb-6'>
                <CheckCircle className='h-4 w-4' />
                <AlertDescription>
                  KYC verified. You can fractionalize NFTs.
                </AlertDescription>
              </Alert>
            )}

            <FractionalizeComponent />
          </div>

          {/* Information Panel */}
          <div className='space-y-6'>
            {/* How It Works */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Users className='h-5 w-5' />
                  How Fractionalization Works
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-3 text-sm'>
                  <div className='flex items-start gap-3'>
                    <div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                      <span className='text-xs font-bold text-blue-600'>1</span>
                    </div>
                    <div>
                      <p className='font-medium'>Upload Your NFT</p>
                      <p className='text-muted-foreground'>
                        Provide the mint address of the NFT you want to
                        fractionalize
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start gap-3'>
                    <div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                      <span className='text-xs font-bold text-blue-600'>2</span>
                    </div>
                    <div>
                      <p className='font-medium'>Set Parameters</p>
                      <p className='text-muted-foreground'>
                        Choose how many shares to create and the price per share
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start gap-3'>
                    <div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                      <span className='text-xs font-bold text-blue-600'>3</span>
                    </div>
                    <div>
                      <p className='font-medium'>Create Vault</p>
                      <p className='text-muted-foreground'>
                        Your NFT is locked in a vault and fractional tokens are
                        minted
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start gap-3'>
                    <div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                      <span className='text-xs font-bold text-blue-600'>4</span>
                    </div>
                    <div>
                      <p className='font-medium'>Start Selling</p>
                      <p className='text-muted-foreground'>
                        Investors can purchase shares and you receive payments
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <DollarSign className='h-5 w-5' />
                  Benefits for Creators
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='space-y-2 text-sm'>
                  <div className='flex items-start gap-2'>
                    <div className='w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0'></div>
                    <p>
                      <span className='font-medium'>Liquidity:</span> Convert
                      your NFT into liquid assets
                    </p>
                  </div>
                  <div className='flex items-start gap-2'>
                    <div className='w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0'></div>
                    <p>
                      <span className='font-medium'>Revenue:</span> Earn from
                      selling fractional shares
                    </p>
                  </div>
                  <div className='flex items-start gap-2'>
                    <div className='w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0'></div>
                    <p>
                      <span className='font-medium'>Accessibility:</span> Make
                      your art accessible to more investors
                    </p>
                  </div>
                  <div className='flex items-start gap-2'>
                    <div className='w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0'></div>
                    <p>
                      <span className='font-medium'>Community:</span> Build a
                      community of fractional owners
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Shield className='h-5 w-5' />
                  Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='space-y-2 text-sm'>
                  <div className='flex items-start gap-2'>
                    <div className='w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0'></div>
                    <p>Own an NFT on Solana blockchain</p>
                  </div>
                  <div className='flex items-start gap-2'>
                    <div className='w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0'></div>
                    <p>Complete KYC verification</p>
                  </div>
                  <div className='flex items-start gap-2'>
                    <div className='w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0'></div>
                    <p>Have SOL for transaction fees</p>
                  </div>
                  <div className='flex items-start gap-2'>
                    <div className='w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0'></div>
                    <p>Set reasonable pricing and fractions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card className='border-yellow-200 bg-yellow-50'>
              <CardHeader>
                <CardTitle className='text-yellow-800'>
                  Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 text-sm text-yellow-700'>
                <p className='flex items-start'>
                  <span className='w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 mr-2 flex-shrink-0'></span>
                  Your NFT will be locked in a vault until all shares are
                  redeemed
                </p>
                <p className='flex items-start'>
                  <span className='w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 mr-2 flex-shrink-0'></span>
                  You'll receive payments as shares are sold (minus platform
                  fees)
                </p>
                <p className='flex items-start'>
                  <span className='w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 mr-2 flex-shrink-0'></span>
                  Platform fee is 5% of total sales
                </p>
                <p className='flex items-start'>
                  <span className='w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 mr-2 flex-shrink-0'></span>
                  Fractionalization is irreversible once started
                </p>
                <p className='flex items-start'>
                  <span className='w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 mr-2 flex-shrink-0'></span>
                  Ensure your NFT has proper metadata and provenance
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
