'use client'

import React, { useState, useEffect } from 'react'
import { useDataAccess } from '@/providers/data-access-provider'
import { useRwaProgram, getVaultPda } from '@/lib/sdk'
import { formatCurrency, calculateProgress } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/misc'
import {
  Palette,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  Plus,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface ArtistArtwork {
  id: string
  title: string
  artist: string
  image: string
  description: string
  originalNftMint: string
  totalShares: number
  sharesSold: number
  pricePerShare: number
  totalValuation: number
  isActive: boolean
  createdAt: string
  ipfsHash: string
  earnings: number
  investors: number
}

export default function ArtistPage() {
  const { userAddress, isConnected, kycStatus } = useDataAccess()
  const program = useRwaProgram()

  const [isLoading, setIsLoading] = useState(false)
  const [artworks, setArtworks] = useState<ArtistArtwork[]>([])
  const [stats, setStats] = useState({
    totalArtworks: 0,
    totalEarnings: 0,
    totalInvestors: 0,
    avgValuation: 0
  })

  useEffect(() => {
    if (program && userAddress && kycStatus.kycStatus.isVerified) {
      loadArtistData()
    }
  }, [program, userAddress, kycStatus])

  const loadArtistData = async () => {
    try {
      if (!program || !userAddress) {
        setArtworks([])
        setStats({
          totalArtworks: 0,
          totalEarnings: 0,
          totalInvestors: 0,
          avgValuation: 0
        })
        return
      }

      // Get all vault accounts created by this user
      const vaultAccounts = await program.account.vault.all()
      const userVaults = vaultAccounts.filter((vault) =>
        vault.account.creator.equals(userAddress)
      )

      const userArtworks: ArtistArtwork[] = []

      for (const vaultAccount of userVaults) {
        try {
          const vault = vaultAccount.account
          const vaultAddress = vaultAccount.publicKey.toString()

          // Calculate earnings (simplified - would need transaction history for accurate earnings)
          const earnings =
            vault.fractionsSold.toNumber() * vault.pricePerFraction.toNumber()

          const artwork: ArtistArtwork = {
            id: vaultAddress,
            title: `Artwork ${vaultAddress.slice(0, 8)}`,
            artist: 'You', // This is the artist's own dashboard
            image: '/api/placeholder/400/300',
            description: 'Your fractionalized artwork on Solana blockchain',
            originalNftMint: vault.originalNftMint.toString(),
            totalShares: vault.totalFractions.toNumber(),
            sharesSold: vault.fractionsSold.toNumber(),
            pricePerShare: vault.pricePerFraction.toNumber(),
            totalValuation:
              vault.totalFractions.toNumber() *
              vault.pricePerFraction.toNumber(),
            isActive: vault.isSaleActive,
            createdAt: new Date(vault.createdAt.toNumber() * 1000)
              .toISOString()
              .split('T')[0],
            ipfsHash: 'Qm' + Math.random().toString(36).substring(2, 46), // Mock IPFS hash
            earnings,
            investors: Math.floor(vault.fractionsSold.toNumber() / 100) // Estimated investors
          }

          userArtworks.push(artwork)
        } catch (vaultError) {
          console.warn('Error processing vault:', vaultError)
          continue
        }
      }

      setArtworks(userArtworks)

      // Calculate stats from real data
      const totalEarnings = userArtworks.reduce(
        (sum, artwork) => sum + artwork.earnings,
        0
      )
      const totalInvestors = userArtworks.reduce(
        (sum, artwork) => sum + artwork.investors,
        0
      )
      const avgValuation =
        userArtworks.length > 0
          ? userArtworks.reduce(
              (sum, artwork) => sum + artwork.totalValuation,
              0
            ) / userArtworks.length
          : 0

      setStats({
        totalArtworks: userArtworks.length,
        totalEarnings,
        totalInvestors,
        avgValuation
      })
    } catch (error) {
      console.error('Error loading artist data:', error)
      setArtworks([])
      setStats({
        totalArtworks: 0,
        totalEarnings: 0,
        totalInvestors: 0,
        avgValuation: 0
      })
    }
  }

  const handleToggleSale = async (artworkId: string) => {
    setIsLoading(true)
    try {
      // In production, call program instruction to toggle sale
      setArtworks((prev) =>
        prev.map((artwork) =>
          artwork.id === artworkId
            ? { ...artwork, isActive: !artwork.isActive }
            : artwork
        )
      )

      toast.success('Sale status updated successfully!')
    } catch (error) {
      console.error('Error toggling sale:', error)
      toast.error('Failed to update sale status')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteArtwork = async (artworkId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this artwork? This action cannot be undone.'
      )
    ) {
      return
    }

    setIsLoading(true)
    try {
      setArtworks((prev) => prev.filter((artwork) => artwork.id !== artworkId))
      toast.success('Artwork deleted successfully!')
    } catch (error) {
      console.error('Error deleting artwork:', error)
      toast.error('Failed to delete artwork')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center max-w-md mx-auto p-8'>
          <Palette className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
          <h1 className='text-2xl font-bold text-foreground mb-4'>
            Connect Your Wallet
          </h1>
          <p className='text-muted-foreground mb-8'>
            Connect your wallet to access your artist dashboard.
          </p>
          <Button size='lg' className='w-full'>
            Connect Wallet
          </Button>
        </div>
      </div>
    )
  }

  if (!kycStatus.kycStatus.isVerified) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center max-w-md mx-auto p-8'>
          <AlertTriangle className='h-16 w-16 text-orange-500 mx-auto mb-4' />
          <h1 className='text-2xl font-bold text-foreground mb-4'>
            KYC Verification Required
          </h1>
          <p className='text-muted-foreground mb-8'>
            Complete KYC verification to access your artist dashboard.
          </p>
          <Link href='/kyc'>
            <Button size='lg' className='w-full'>
              Complete KYC Verification
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-4xl font-bold text-foreground mb-2'>
              Artist Dashboard
            </h1>
            <p className='text-xl text-muted-foreground'>
              Manage your fractionalized artworks and track earnings
            </p>
          </div>
          <Link href='/fractionalize'>
            <Button size='lg' className='flex items-center gap-2'>
              <Plus className='h-4 w-4' />
              Fractionalize New Artwork
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <Palette className='h-8 w-8 text-blue-600 mr-3' />
                <div>
                  <p className='text-sm text-muted-foreground'>
                    Total Artworks
                  </p>
                  <p className='text-2xl font-bold text-foreground'>
                    {stats.totalArtworks}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <DollarSign className='h-8 w-8 text-green-600 mr-3' />
                <div>
                  <p className='text-sm text-muted-foreground'>
                    Total Earnings
                  </p>
                  <p className='text-2xl font-bold text-foreground'>
                    {formatCurrency(stats.totalEarnings)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <Users className='h-8 w-8 text-purple-600 mr-3' />
                <div>
                  <p className='text-sm text-muted-foreground'>
                    Total Investors
                  </p>
                  <p className='text-2xl font-bold text-foreground'>
                    {stats.totalInvestors}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <BarChart3 className='h-8 w-8 text-orange-600 mr-3' />
                <div>
                  <p className='text-sm text-muted-foreground'>Avg Valuation</p>
                  <p className='text-2xl font-bold text-foreground'>
                    {formatCurrency(stats.avgValuation)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Artworks List */}
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-bold text-foreground'>
              Your Artworks
            </h2>
            <Badge variant='outline'>
              {artworks.filter((a) => a.isActive).length} Active
            </Badge>
          </div>

          {artworks.length === 0 ? (
            <Card>
              <CardContent className='p-12 text-center'>
                <Palette className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
                <h3 className='text-xl font-semibold text-foreground mb-2'>
                  No Artworks Yet
                </h3>
                <p className='text-muted-foreground mb-6'>
                  Start by fractionalizing your first NFT artwork.
                </p>
                <Link href='/fractionalize'>
                  <Button size='lg'>
                    <Plus className='h-4 w-4 mr-2' />
                    Fractionalize Artwork
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {artworks.map((artwork) => {
                const progress = calculateProgress(
                  artwork.sharesSold,
                  artwork.totalShares
                )
                const isSoldOut = artwork.sharesSold === artwork.totalShares

                return (
                  <Card key={artwork.id} className='overflow-hidden'>
                    <div className='relative'>
                      <Image
                        src={artwork.image}
                        alt={artwork.title}
                        width={400}
                        height={300}
                        className='w-full h-48 object-cover'
                      />
                      <div className='absolute top-4 left-4 flex flex-col gap-2'>
                        <Badge
                          variant={artwork.isActive ? 'default' : 'secondary'}
                        >
                          {artwork.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {isSoldOut && (
                          <Badge variant='destructive'>Sold Out</Badge>
                        )}
                      </div>
                    </div>

                    <CardContent className='p-6'>
                      <div className='space-y-4'>
                        <div>
                          <h3 className='text-lg font-semibold text-foreground mb-1'>
                            {artwork.title}
                          </h3>
                          <p className='text-sm text-muted-foreground mb-2'>
                            {artwork.description.slice(0, 100)}...
                          </p>
                          <div className='flex items-center justify-between text-sm text-gray-500'>
                            <span>Created {artwork.createdAt}</span>
                            <span>{artwork.investors} investors</span>
                          </div>
                        </div>

                        <div className='space-y-3'>
                          <div className='grid grid-cols-2 gap-4 text-sm'>
                            <div>
                              <p className='text-muted-foreground'>
                                Total Shares
                              </p>
                              <p className='font-semibold'>
                                {artwork.totalShares.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className='text-muted-foreground'>
                                Price per Share
                              </p>
                              <p className='font-semibold'>
                                {formatCurrency(artwork.pricePerShare)}
                              </p>
                            </div>
                            <div>
                              <p className='text-muted-foreground'>Earnings</p>
                              <p className='font-semibold text-green-600'>
                                {formatCurrency(artwork.earnings)}
                              </p>
                            </div>
                            <div>
                              <p className='text-muted-foreground'>Progress</p>
                              <p className='font-semibold'>
                                {progress.toFixed(1)}%
                              </p>
                            </div>
                          </div>

                          <div className='space-y-2'>
                            <div className='flex items-center justify-between text-sm'>
                              <span className='text-muted-foreground'>
                                Funding Progress
                              </span>
                              <span className='font-medium'>
                                {progress.toFixed(1)}%
                              </span>
                            </div>
                            <Progress value={progress} className='h-2' />
                            <div className='flex items-center justify-between text-xs text-gray-500'>
                              <span>
                                {artwork.sharesSold.toLocaleString()} sold
                              </span>
                              <span>
                                {(
                                  artwork.totalShares - artwork.sharesSold
                                ).toLocaleString()}{' '}
                                remaining
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className='flex gap-2 pt-4'>
                          <Link
                            href={`/artwork/${artwork.id}`}
                            className='flex-1'
                          >
                            <Button
                              variant='outline'
                              size='sm'
                              className='w-full'
                            >
                              <Eye className='h-3 w-3 mr-1' />
                              View
                            </Button>
                          </Link>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleToggleSale(artwork.id)}
                            disabled={isLoading || isSoldOut}
                          >
                            <Edit className='h-3 w-3 mr-1' />
                            {artwork.isActive ? 'Pause' : 'Resume'}
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleDeleteArtwork(artwork.id)}
                            disabled={isLoading}
                            className='text-red-600 hover:text-red-700'
                          >
                            <Trash2 className='h-3 w-3' />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
