'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Artwork } from '../lib/data-access'
import { formatCurrency, calculateProgress, cn } from '@/lib/utils'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Eye, TrendingUp, Users } from 'lucide-react'

interface ArtCardProps {
  artwork: Artwork
  className?: string
}

export const ArtCard: React.FC<ArtCardProps> = ({ artwork, className }) => {
  const progress = calculateProgress(artwork.sharesSold, artwork.totalShares)
  const sharesAvailable = artwork.totalShares - artwork.sharesSold
  const isSoldOut = sharesAvailable === 0
  const isNearlySoldOut = progress >= 90

  return (
    <Card
      className={cn(
        'group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
        className
      )}
    >
      <div className='relative aspect-square overflow-hidden'>
        <Image
          src={artwork.image}
          alt={artwork.title}
          fill
          className='object-cover transition-transform duration-300 group-hover:scale-105'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />

        {/* Status badges */}
        <div className='absolute top-4 left-4 flex flex-col gap-2'>
          {isSoldOut && <Badge variant='destructive'>Sold Out</Badge>}
          {isNearlySoldOut && !isSoldOut && (
            <Badge
              variant='secondary'
              className='bg-warning text-warning-foreground'
            >
              Nearly Sold Out
            </Badge>
          )}
          {!artwork.isActive && (
            <Badge variant='outline' className='bg-muted text-muted-foreground'>
              Inactive
            </Badge>
          )}
        </div>

        {/* Artist name overlay */}
        <div className='absolute bottom-4 left-4 text-card-foreground'>
          <p className='text-sm font-medium opacity-90'>{artwork.artist}</p>
          <h3 className='text-lg font-bold'>{artwork.title}</h3>
        </div>
      </div>

      <CardContent className='p-6'>
        <div className='space-y-4'>
          {/* Valuation and pricing */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>
                Total Valuation
              </span>
              <span className='text-lg font-bold text-success'>
                {formatCurrency(artwork.totalValuation)}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>
                Price per Share
              </span>
              <span className='text-lg font-semibold'>
                {formatCurrency(artwork.pricePerShare)}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>Funding Progress</span>
              <span className='font-medium'>{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className='h-2' />
            <div className='flex items-center justify-between text-xs text-muted-foreground/70'>
              <span>{artwork.sharesSold.toLocaleString()} sold</span>
              <span>{sharesAvailable.toLocaleString()} remaining</span>
            </div>
          </div>

          {/* Investment stats */}
          <div className='flex items-center justify-between pt-2 border-t'>
            <div className='flex items-center gap-1 text-sm text-muted-foreground'>
              <Users className='h-4 w-4' />
              <span>{Math.floor(artwork.sharesSold / 100)} investors</span>
            </div>
            <div className='flex items-center gap-1 text-sm text-muted-foreground'>
              <TrendingUp className='h-4 w-4' />
              <span>Active</span>
            </div>
          </div>

          {/* Action button */}
          <Link href={`/artwork/${artwork.id}`} className='block'>
            <Button
              className='w-full'
              disabled={!artwork.isActive || isSoldOut}
              variant={isSoldOut ? 'outline' : 'default'}
            >
              <Eye className='h-4 w-4 mr-2' />
              {isSoldOut ? 'Sold Out' : 'View Investment'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
