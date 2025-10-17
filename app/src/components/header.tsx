'use client'

import React from 'react'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useDataAccess } from '../providers/data-access-provider'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Palette, User, BarChart3, Shield, Sparkles } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'

export const Header: React.FC = () => {
  const { userAddress, isConnected, kycStatus } = useDataAccess()

  return (
    <header className='border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          {/* Logo */}
          <Link href='/' className='flex items-center space-x-2'>
            <Palette className='h-8 w-8 text-primary' />
            <span className='text-xl font-bold text-foreground'>ArtShare</span>
          </Link>

          {/* Navigation */}
          <nav className='hidden md:flex items-center space-x-8'>
            <Link
              href='/'
              className='text-muted-foreground hover:text-foreground transition-colors'
            >
              Artworks
            </Link>
            <Link
              href='/portfolio'
              className='text-muted-foreground hover:text-foreground transition-colors'
            >
              Portfolio
            </Link>
            <Link
              href='/artist'
              className='text-muted-foreground hover:text-foreground transition-colors'
            >
              Artist
            </Link>
            <Link
              href='/fractionalize'
              className='text-muted-foreground hover:text-foreground transition-colors'
            >
              Fractionalize
            </Link>
            <Link
              href='/launch-nft'
              className='text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1'
            >
              <Sparkles className='h-4 w-4' />
              Launch NFT
            </Link>
            <Link
              href='/admin'
              className='text-muted-foreground hover:text-foreground transition-colors'
            >
              Admin
            </Link>
          </nav>

          {/* Right side */}
          <div className='flex items-center space-x-4'>
            {/* KYC Status */}
            {isConnected && (
              <div className='flex items-center space-x-2'>
                {kycStatus.kycStatus.isVerified ? (
                  <Badge variant='default' className='bg-success'>
                    <Shield className='h-3 w-3 mr-1' />
                    KYC Verified
                  </Badge>
                ) : (
                  <Link href='/kyc'>
                    <Badge
                      variant='outline'
                      className='border-warning text-warning'
                    >
                      <Shield className='h-3 w-3 mr-1' />
                      Verify KYC
                    </Badge>
                  </Link>
                )}
              </div>
            )}

            {/* User Menu */}
            {isConnected && (
              <div className='flex items-center space-x-2'>
                <Link href='/profile'>
                  <Button variant='ghost' size='sm'>
                    <User className='h-4 w-4 mr-2' />
                    Profile
                  </Button>
                </Link>
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Wallet Button */}
            <WalletMultiButton className='!bg-primary hover:!bg-primary/90' />
          </div>
        </div>
      </div>
    </header>
  )
}
