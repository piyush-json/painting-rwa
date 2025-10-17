'use client'

import React from 'react'
import { useDataAccess } from '../providers/data-access-provider'
import { useArtworks } from '../lib/data-access'
import { ArtCard } from '../components/art-card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Palette, TrendingUp, Users, Shield, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const { isConnected, kycStatus } = useDataAccess()
  const artworksData = useArtworks()

  return (
    <div className='min-h-screen bg-gradient-to-br from-background to-muted/20'>
      {/* Hero Section */}
      <section className='py-20 px-4 sm:px-6 lg:px-8'>
        <div className='container mx-auto text-center'>
          <div className='max-w-4xl mx-auto'>
            <Badge variant='outline' className='mb-6 bg-card/80'>
              <Palette className='h-4 w-4 mr-2' />
              Fractional Art Investment Platform
            </Badge>

            <h1 className='text-5xl md:text-6xl font-bold text-foreground mb-6'>
              Own a Piece of <span className='text-primary'>Art History</span>
            </h1>

            <p className='text-xl text-muted-foreground mb-8 max-w-2xl mx-auto'>
              Invest in multi-million dollar masterpieces through fractional
              ownership. Start with as little as $50 and own shares in
              world-renowned artworks.
            </p>

            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link href='#artworks'>
                <Button size='lg'>
                  Explore Artworks
                  <ArrowRight className='h-5 w-5 ml-2' />
                </Button>
              </Link>
              <Link href='/about'>
                <Button size='lg' variant='outline' className='bg-card/80'>
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='py-16 px-4 sm:px-6 lg:px-8 bg-card/50'>
        <div className='container mx-auto'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8 text-center'>
            <div className='space-y-2'>
              <div className='text-3xl font-bold text-primary'>$2.5M+</div>
              <div className='text-muted-foreground'>Total Artwork Value</div>
            </div>
            <div className='space-y-2'>
              <div className='text-3xl font-bold text-success'>1,200+</div>
              <div className='text-muted-foreground'>Active Investors</div>
            </div>
            <div className='space-y-2'>
              <div className='text-3xl font-bold text-primary'>15</div>
              <div className='text-muted-foreground'>Masterpieces Listed</div>
            </div>
            <div className='space-y-2'>
              <div className='text-3xl font-bold text-warning'>95%</div>
              <div className='text-muted-foreground'>Average Funding Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-20 px-4 sm:px-6 lg:px-8'>
        <div className='container mx-auto'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-foreground mb-4'>
              Why Choose ArtShare?
            </h2>
            <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
              We make art investment accessible, secure, and profitable for
              everyone.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='text-center p-6 bg-card rounded-lg shadow-sm'>
              <div className='w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4'>
                <TrendingUp className='h-6 w-6 text-primary' />
              </div>
              <h3 className='text-xl font-semibold mb-2'>Proven Returns</h3>
              <p className='text-muted-foreground'>
                Art has historically outperformed stocks with 7.5% annual
                returns over the past 25 years.
              </p>
            </div>

            <div className='text-center p-6 bg-card rounded-lg shadow-sm'>
              <div className='w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4'>
                <Users className='h-6 w-6 text-success' />
              </div>
              <h3 className='text-xl font-semibold mb-2'>
                Accessible Investment
              </h3>
              <p className='text-muted-foreground'>
                Start investing with as little as $50. No need to buy entire
                artworks worth millions.
              </p>
            </div>

            <div className='text-center p-6 bg-card rounded-lg shadow-sm'>
              <div className='w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4'>
                <Shield className='h-6 w-6 text-primary' />
              </div>
              <h3 className='text-xl font-semibold mb-2'>Secure & Compliant</h3>
              <p className='text-muted-foreground'>
                Built on Solana blockchain with KYC verification and regulatory
                compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Artworks Section */}
      <section id='artworks' className='py-20 px-4 sm:px-6 lg:px-8 bg-card'>
        <div className='container mx-auto'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-foreground mb-4'>
              Available Artworks
            </h2>
            <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
              Discover masterpieces from world-renowned artists, now available
              for fractional investment.
            </p>
          </div>

          {artworksData.isLoading ? (
            <div className='text-center py-12'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
              <p className='mt-4 text-muted-foreground'>Loading artworks...</p>
            </div>
          ) : artworksData.error ? (
            <div className='text-center py-12'>
              <p className='text-destructive'>
                Error loading artworks. Please try again.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {artworksData.artworks.map((artwork) => (
                <ArtCard key={artwork.id} artwork={artwork} />
              ))}
            </div>
          )}

          <div className='text-center mt-12'>
            <Link href='/artworks'>
              <Button variant='outline' size='lg'>
                View All Artworks
                <ArrowRight className='h-5 w-5 ml-2' />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 px-4 sm:px-6 lg:px-8 bg-primary'>
        <div className='container mx-auto text-center'>
          <div className='max-w-2xl mx-auto'>
            <h2 className='text-4xl font-bold text-white mb-4'>
              Ready to Start Investing?
            </h2>
            <p className='text-xl text-primary-foreground mb-8'>
              Join thousands of investors who are already building wealth
              through art ownership.
            </p>

            {!isConnected ? (
              <Button
                size='lg'
                variant='secondary'
                className='bg-card text-primary hover:bg-card/90'
              >
                Connect Wallet to Get Started
              </Button>
            ) : !kycStatus.kycStatus.isVerified ? (
              <Link href='/kyc'>
                <Button
                  size='lg'
                  variant='secondary'
                  className='bg-card text-primary hover:bg-card/90'
                >
                  Complete KYC Verification
                </Button>
              </Link>
            ) : (
              <Link href='/portfolio'>
                <Button
                  size='lg'
                  variant='secondary'
                  className='bg-card text-primary hover:bg-card/90'
                >
                  View Your Portfolio
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
