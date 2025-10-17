'use client'

import React from 'react'
import Link from 'next/link'
import { Palette, Twitter, Github, Mail } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className='bg-card text-card-foreground'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          {/* Brand */}
          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <Palette className='h-6 w-6' />
              <span className='text-lg font-bold'>ArtShare</span>
            </div>
            <p className='text-muted-foreground text-sm'>
              Democratizing art investment through fractional ownership on
              Solana.
            </p>
            <div className='flex space-x-4'>
              <a
                href='#'
                className='text-muted-foreground hover:text-card-foreground transition-colors'
              >
                <Twitter className='h-5 w-5' />
              </a>
              <a
                href='#'
                className='text-muted-foreground hover:text-card-foreground transition-colors'
              >
                <Github className='h-5 w-5' />
              </a>
              <a
                href='#'
                className='text-muted-foreground hover:text-card-foreground transition-colors'
              >
                <Mail className='h-5 w-5' />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div className='space-y-4'>
            <h3 className='font-semibold'>Platform</h3>
            <ul className='space-y-2 text-sm'>
              <li>
                <Link
                  href='/'
                  className='text-muted-foreground hover:text-card-foreground transition-colors'
                >
                  Artworks
                </Link>
              </li>
              <li>
                <Link
                  href='/portfolio'
                  className='text-muted-foreground hover:text-card-foreground transition-colors'
                >
                  Portfolio
                </Link>
              </li>
              <li>
                <Link
                  href='/market'
                  className='text-muted-foreground hover:text-card-foreground transition-colors'
                >
                  Secondary Market
                </Link>
              </li>
              <li>
                <Link
                  href='/kyc'
                  className='text-muted-foreground hover:text-card-foreground transition-colors'
                >
                  KYC Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className='space-y-4'>
            <h3 className='font-semibold'>Resources</h3>
            <ul className='space-y-2 text-sm'>
              <li>
                <Link
                  href='/about'
                  className='text-muted-foreground hover:text-card-foreground transition-colors'
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href='/help'
                  className='text-muted-foreground hover:text-card-foreground transition-colors'
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href='/docs'
                  className='text-muted-foreground hover:text-card-foreground transition-colors'
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href='/api'
                  className='text-muted-foreground hover:text-card-foreground transition-colors'
                >
                  API
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className='space-y-4'>
            <h3 className='font-semibold'>Legal</h3>
            <ul className='space-y-2 text-sm'>
              <li>
                <Link
                  href='/privacy'
                  className='text-muted-foreground hover:text-card-foreground transition-colors'
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href='/terms'
                  className='text-muted-foreground hover:text-card-foreground transition-colors'
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href='/risk'
                  className='text-muted-foreground hover:text-card-foreground transition-colors'
                >
                  Risk Disclosure
                </Link>
              </li>
              <li>
                <Link
                  href='/compliance'
                  className='text-muted-foreground hover:text-card-foreground transition-colors'
                >
                  Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className='border-t border-border mt-8 pt-8'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <p className='text-muted-foreground text-sm'>
              © 2024 ArtShare. All rights reserved.
            </p>
            <p className='text-gray-400 text-sm mt-2 md:mt-0'>
              Built on Solana - Powered by Anchor
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
