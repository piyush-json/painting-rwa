'use client'

import React, { useState, useMemo } from 'react'
import { useArtworks } from '@/lib/data-access'
import { ArtCard } from '@/components/art-card'
import { Pagination } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react'
import Link from 'next/link'

type SortOption =
  | 'title'
  | 'artist'
  | 'totalValuation'
  | 'pricePerShare'
  | 'createdAt'
type SortOrder = 'asc' | 'desc'

export default function ArtworksPage() {
  const { artworks, isLoading, error } = useArtworks()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [filterActive, setFilterActive] = useState<boolean | null>(null)

  const itemsPerPage = 12

  // Filter and sort artworks
  const filteredAndSortedArtworks = useMemo(() => {
    let filtered = artworks.filter((artwork) => {
      const matchesSearch =
        artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artwork.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artwork.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesFilter =
        filterActive === null ||
        (filterActive === true && artwork.isActive) ||
        (filterActive === false && !artwork.isActive)

      return matchesSearch && matchesFilter
    })

    // Sort artworks
    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'artist':
          aValue = a.artist.toLowerCase()
          bValue = b.artist.toLowerCase()
          break
        case 'totalValuation':
          aValue = a.totalValuation
          bValue = b.totalValuation
          break
        case 'pricePerShare':
          aValue = a.pricePerShare
          bValue = b.pricePerShare
          break
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [artworks, searchQuery, sortBy, sortOrder, filterActive])

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedArtworks.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentArtworks = filteredAndSortedArtworks.slice(startIndex, endIndex)

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortBy, sortOrder, filterActive])

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(option)
      setSortOrder('asc')
    }
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-background'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='text-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
            <p className='mt-4 text-muted-foreground'>Loading artworks...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='min-h-screen bg-background'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='text-center py-12'>
            <p className='text-destructive mb-4'>
              Error loading artworks. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h1 className='text-4xl font-bold text-foreground mb-2'>
                All Artworks
              </h1>
              <p className='text-xl text-muted-foreground'>
                Discover and invest in fractional art ownership
              </p>
            </div>
            <Link href='/'>
              <Button variant='outline'>Back to Home</Button>
            </Link>
          </div>

          {/* Stats */}
          <div className='flex flex-wrap gap-4 text-sm text-muted-foreground'>
            <span>{artworks.length} total artworks</span>
            <span>•</span>
            <span>{artworks.filter((a) => a.isActive).length} active</span>
            <span>•</span>
            <span>{filteredAndSortedArtworks.length} showing</span>
          </div>
        </div>

        {/* Filters and Search */}
        <div className='mb-8 space-y-4'>
          <div className='flex flex-col sm:flex-row gap-4'>
            {/* Search */}
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search artworks, artists, or descriptions...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>

            {/* Status Filter */}
            <div className='flex gap-2'>
              <Button
                variant={filterActive === null ? 'default' : 'outline'}
                size='sm'
                onClick={() => setFilterActive(null)}
              >
                All
              </Button>
              <Button
                variant={filterActive === true ? 'default' : 'outline'}
                size='sm'
                onClick={() => setFilterActive(true)}
              >
                Active
              </Button>
              <Button
                variant={filterActive === false ? 'default' : 'outline'}
                size='sm'
                onClick={() => setFilterActive(false)}
              >
                Inactive
              </Button>
            </div>
          </div>

          {/* Sort Options */}
          <div className='flex flex-wrap items-center gap-2'>
            <span className='text-sm text-muted-foreground mr-2'>Sort by:</span>
            {[
              { key: 'title', label: 'Title' },
              { key: 'artist', label: 'Artist' },
              { key: 'totalValuation', label: 'Value' },
              { key: 'pricePerShare', label: 'Price/Share' },
              { key: 'createdAt', label: 'Date Added' }
            ].map((option) => (
              <Button
                key={option.key}
                variant={sortBy === option.key ? 'default' : 'outline'}
                size='sm'
                onClick={() => handleSort(option.key as SortOption)}
                className='h-8'
              >
                {option.label}
                {sortBy === option.key &&
                  (sortOrder === 'asc' ? (
                    <SortAsc className='h-3 w-3 ml-1' />
                  ) : (
                    <SortDesc className='h-3 w-3 ml-1' />
                  ))}
              </Button>
            ))}
          </div>
        </div>

        {/* Artworks Grid */}
        {currentArtworks.length === 0 ? (
          <div className='text-center py-12'>
            <Filter className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
            <h3 className='text-xl font-semibold text-foreground mb-2'>
              No artworks found
            </h3>
            <p className='text-muted-foreground mb-6'>
              Try adjusting your search or filter criteria.
            </p>
            <Button
              onClick={() => {
                setSearchQuery('')
                setFilterActive(null)
                setSortBy('createdAt')
                setSortOrder('desc')
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8'>
              {currentArtworks.map((artwork) => (
                <ArtCard key={artwork.id} artwork={artwork} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='flex justify-center'>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
