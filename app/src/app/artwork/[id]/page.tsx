'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { useDataAccess } from '@/providers/data-access-provider'
import { PurchaseComponent } from '@/components/purchase-component'
import { RedeemComponent } from '@/components/redeem-component'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, calculateProgress } from '@/lib/utils'
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Calendar,
  Shield,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

export default function ArtworkPage() {
  const params = useParams()
  const artworkId = params.id as string
  const { artworks } = useDataAccess()

  const artwork = artworks.artworks.find((a) => a.id === artworkId)

  if (!artwork) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-foreground mb-4'>
            Artwork Not Found
          </h1>
          <p className='text-muted-foreground mb-8'>
            The artwork you're looking for doesn't exist.
          </p>
          <Link href='/'>
            <Button>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const progress = calculateProgress(artwork.sharesSold, artwork.totalShares)
  const sharesAvailable = artwork.totalShares - artwork.sharesSold
  const isSoldOut = sharesAvailable === 0
  const isNearlySoldOut = progress >= 90

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Back Button */}
        <div className='mb-8'>
          <Link href='/'>
            <Button variant='outline'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Artworks
            </Button>
          </Link>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Artwork Image */}
          <div className='space-y-6'>
            <div className='relative aspect-square overflow-hidden rounded-lg bg-card shadow-lg'>
              <Image
                src={artwork.image}
                alt={artwork.title}
                fill
                className='object-cover'
              />

              {/* Status badges */}
              <div className='absolute top-4 left-4 flex flex-col gap-2'>
                {isSoldOut && (
                  <Badge variant='destructive' className='bg-red-600'>
                    Sold Out
                  </Badge>
                )}
                {isNearlySoldOut && !isSoldOut && (
                  <Badge
                    variant='secondary'
                    className='bg-orange-500 text-white'
                  >
                    Nearly Sold Out
                  </Badge>
                )}
                {!artwork.isActive && (
                  <Badge
                    variant='outline'
                    className='bg-background0 text-white border-gray-400'
                  >
                    Inactive
                  </Badge>
                )}
              </div>
            </div>

            {/* Artwork Details */}
            <Card>
              <CardHeader>
                <CardTitle>Artwork Details</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <h3 className='text-2xl font-bold text-foreground'>
                    {artwork.title}
                  </h3>
                  <p className='text-lg text-muted-foreground'>
                    by {artwork.artist}
                  </p>
                </div>

                <p className='text-gray-700'>{artwork.description}</p>

                <div className='space-y-2'>
                  <h4 className='font-semibold text-foreground'>Provenance</h4>
                  <p className='text-sm text-muted-foreground'>
                    {artwork.provenance}
                  </p>
                </div>

                <div className='flex items-center gap-2 text-sm text-gray-500'>
                  <Calendar className='h-4 w-4' />
                  <span>Listed on {artwork.createdAt}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Investment Panel */}
          <div className='space-y-6'>
            {/* Investment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <TrendingUp className='h-5 w-5' />
                  Investment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Total Valuation
                    </p>
                    <p className='text-2xl font-bold text-green-600'>
                      {formatCurrency(artwork.totalValuation)}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Price per Share
                    </p>
                    <p className='text-2xl font-bold text-blue-600'>
                      {formatCurrency(artwork.pricePerShare)}
                    </p>
                  </div>
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>
                      Funding Progress
                    </span>
                    <span className='font-medium'>{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className='h-3' />
                  <div className='flex items-center justify-between text-xs text-gray-500'>
                    <span>{artwork.sharesSold.toLocaleString()} sold</span>
                    <span>{sharesAvailable.toLocaleString()} remaining</span>
                  </div>
                </div>

                <div className='flex items-center justify-between pt-4 border-t'>
                  <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                    <Users className='h-4 w-4' />
                    <span>
                      {Math.floor(artwork.sharesSold / 100)} investors
                    </span>
                  </div>
                  <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                    <Shield className='h-4 w-4' />
                    <span>KYC Required</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Purchase Component */}
            {artwork.isActive && !isSoldOut && (
              <PurchaseComponent artwork={artwork} />
            )}

            {/* Redeem Component */}
            <RedeemComponent artworkId={artworkId} />

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4 text-sm'>
                <div className='space-y-2'>
                  <h4 className='font-semibold'>How It Works</h4>
                  <ul className='space-y-2 text-muted-foreground'>
                    <li className='flex items-start'>
                      <span className='w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0'></span>
                      Purchase fractional shares of this artwork
                    </li>
                    <li className='flex items-start'>
                      <span className='w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0'></span>
                      Each share represents ownership in the original NFT
                    </li>
                    <li className='flex items-start'>
                      <span className='w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0'></span>
                      Shares can be traded on secondary markets
                    </li>
                    <li className='flex items-start'>
                      <span className='w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0'></span>
                      Own all shares to redeem the original NFT
                    </li>
                  </ul>
                </div>

                <div className='space-y-2'>
                  <h4 className='font-semibold'>Platform Fees</h4>
                  <ul className='space-y-2 text-muted-foreground'>
                    <li className='flex items-start'>
                      <span className='w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0'></span>
                      5% platform fee on purchases
                    </li>
                    <li className='flex items-start'>
                      <span className='w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0'></span>
                      No fees for holding shares
                    </li>
                    <li className='flex items-start'>
                      <span className='w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0'></span>
                      Standard network fees apply
                    </li>
                  </ul>
                </div>

                <div className='space-y-2'>
                  <h4 className='font-semibold'>Requirements</h4>
                  <ul className='space-y-2 text-muted-foreground'>
                    <li className='flex items-start'>
                      <span className='w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0'></span>
                      Solana wallet connection required
                    </li>
                    <li className='flex items-start'>
                      <span className='w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0'></span>
                      KYC verification mandatory
                    </li>
                    <li className='flex items-start'>
                      <span className='w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0'></span>
                      USDC for payments
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
