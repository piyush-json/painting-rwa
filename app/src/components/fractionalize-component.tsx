'use client'

import React, { useState, useRef } from 'react'
import { PublicKey, Keypair } from '@solana/web3.js'
import * as anchor from '@coral-xyz/anchor'
import { useRwaProgram, getVaultPda, getKycPda } from '../lib/sdk'
import { useDataAccess } from '../providers/data-access-provider'
import { formatCurrency, cn } from '../lib/utils'
import { uploadArtworkToIPFS, getIPFSUrl } from '../lib/ipfs'
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from './ui/misc'
import {
  Upload,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Image,
  FileText
} from 'lucide-react'
import toast from 'react-hot-toast'
import { USDC_MINT } from '@/lib/constant'

interface FractionalizeComponentProps {
  className?: string
}

export const FractionalizeComponent: React.FC<FractionalizeComponentProps> = ({
  className
}) => {
  const { userAddress, isConnected, kycStatus } = useDataAccess()
  const program = useRwaProgram()

  const [nftMint, setNftMint] = useState('')
  const [totalFractions, setTotalFractions] = useState('')
  const [pricePerFraction, setPricePerFraction] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [artworkTitle, setArtworkTitle] = useState('')
  const [artworkDescription, setArtworkDescription] = useState('')
  const [artworkArtist, setArtworkArtist] = useState('')
  const [uploadingToIPFS, setUploadingToIPFS] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isValidInputs =
    nftMint &&
    totalFractions &&
    pricePerFraction &&
    artworkTitle &&
    artworkDescription &&
    artworkArtist &&
    imageFile &&
    parseInt(totalFractions) > 0 &&
    parseFloat(pricePerFraction) > 0

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        setImageFile(file)
        const reader = new FileReader()
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        toast.error('Please select a valid image file')
      }
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFractionalize = async () => {
    if (!program || !userAddress || !isValidInputs || !imageFile) return

    setIsLoading(true)
    setUploadingToIPFS(true)
    try {
      // Upload artwork to IPFS first
      const ipfsResult = await uploadArtworkToIPFS(imageFile, {
        name: artworkTitle,
        description: artworkDescription,
        attributes: [
          { trait_type: 'Artist', value: artworkArtist },
          { trait_type: 'Total Fractions', value: parseInt(totalFractions) },
          {
            trait_type: 'Price per Fraction',
            value: parseFloat(pricePerFraction)
          }
        ]
      })

      toast.success('Artwork uploaded to IPFS successfully!')
      setUploadingToIPFS(false)
      // Validate NFT mint address
      const originalNftMint = new PublicKey(nftMint)

      // Get vault PDA
      const [vaultPda] = getVaultPda(originalNftMint, program.programId)

      // Generate new fractional token mint
      const fractionalTokenMint = Keypair.generate()

      // Get associated token addresses
      const vaultFractionalAccount = await getAssociatedTokenAddress(
        fractionalTokenMint.publicKey,
        vaultPda,
        true
      )

      const vaultNftAccount = await getAssociatedTokenAddress(
        originalNftMint,
        vaultPda,
        true
      )

      const creatorNftAccount = await getAssociatedTokenAddress(
        originalNftMint,
        userAddress
      )

      const creatorPaymentAccount = await getAssociatedTokenAddress(
        USDC_MINT, // USDC mint
        userAddress
      )

      // Call the fractionalize instruction
      await program.methods
        .fractionalize(
          new anchor.BN(totalFractions),
          new anchor.BN(
            Math.floor(parseFloat(pricePerFraction) * Math.pow(10, 6))
          )
        )
        .accounts({
          creator: userAddress,
          originalNftMint: originalNftMint,
          fractionalTokenMint: fractionalTokenMint.publicKey,
          creatorNftAccount: creatorNftAccount,
          creatorPaymentAccount: creatorPaymentAccount
        })
        .signers([fractionalTokenMint])
        .rpc({ commitment: 'confirmed' })

      toast.success(
        `Successfully fractionalized NFT into ${totalFractions} shares!`
      )

      // Reset inputs
      setNftMint('')
      setTotalFractions('')
      setPricePerFraction('')
      setArtworkTitle('')
      setArtworkDescription('')
      setArtworkArtist('')
      setImageFile(null)
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Fractionalization failed:', error)
      toast.error(
        `Fractionalization failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    } finally {
      setIsLoading(false)
    }
  }

  const canFractionalize =
    isConnected && kycStatus.kycStatus.isVerified && isValidInputs

  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Upload className='h-5 w-5' />
          Fractionalize NFT
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* Form Fields */}
        <div className='space-y-4'>
          {/* Artwork Information */}
          <div className='space-y-4 p-4 bg-background rounded-lg'>
            <h4 className='font-medium text-sm'>Artwork Information</h4>

            <div className='space-y-2'>
              <Label htmlFor='artworkTitle'>Artwork Title</Label>
              <Input
                id='artworkTitle'
                placeholder='Enter artwork title'
                value={artworkTitle}
                onChange={(e) => setArtworkTitle(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='artworkArtist'>Artist Name</Label>
              <Input
                id='artworkArtist'
                placeholder='Enter artist name'
                value={artworkArtist}
                onChange={(e) => setArtworkArtist(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='artworkDescription'>Description</Label>
              <textarea
                id='artworkDescription'
                placeholder='Enter artwork description'
                value={artworkDescription}
                onChange={(e) => setArtworkDescription(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                rows={3}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='imageUpload'>Artwork Image</Label>
              <div className='border-2 border-dashed border-gray-300 rounded-lg p-4'>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  onChange={handleImageUpload}
                  className='hidden'
                  id='imageUpload'
                />
                {imagePreview ? (
                  <div className='space-y-2'>
                    <img
                      src={imagePreview}
                      alt='Preview'
                      className='w-full h-32 object-cover rounded'
                    />
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-muted-foreground'>
                        {imageFile?.name}
                      </span>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={handleRemoveImage}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor='imageUpload'
                    className='cursor-pointer flex flex-col items-center justify-center space-y-2'
                  >
                    <Image className='h-8 w-8 text-muted-foreground' />
                    <span className='text-sm text-muted-foreground'>
                      Click to upload artwork image
                    </span>
                    <span className='text-xs text-gray-500'>
                      PNG, JPG, GIF up to 10MB
                    </span>
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='nftMint'>NFT Mint Address</Label>
            <Input
              id='nftMint'
              placeholder='Enter NFT mint address'
              value={nftMint}
              onChange={(e) => setNftMint(e.target.value)}
            />
            <p className='text-xs text-gray-500'>
              The mint address of the NFT you want to fractionalize
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='totalFractions'>Total Fractions</Label>
            <Input
              id='totalFractions'
              type='number'
              placeholder='Enter total number of fractions'
              value={totalFractions}
              onChange={(e) => setTotalFractions(e.target.value)}
              min='1'
            />
            <p className='text-xs text-gray-500'>
              How many shares to create from this NFT
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='pricePerFraction'>Price per Fraction (USDC)</Label>
            <Input
              id='pricePerFraction'
              type='number'
              placeholder='Enter price per fraction'
              value={pricePerFraction}
              onChange={(e) => setPricePerFraction(e.target.value)}
              min='0.01'
              step='0.01'
            />
            <p className='text-xs text-gray-500'>
              Price in USDC for each fractional share
            </p>
          </div>
        </div>

        {/* Cost Breakdown */}
        {isValidInputs && (
          <div className='space-y-3 p-4 bg-background rounded-lg'>
            <h4 className='font-medium text-sm'>Fractionalization Summary</h4>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span>Total Fractions</span>
                <span>{parseInt(totalFractions).toLocaleString()}</span>
              </div>
              <div className='flex justify-between'>
                <span>Price per Fraction</span>
                <span>{formatCurrency(parseFloat(pricePerFraction))}</span>
              </div>
              <div className='flex justify-between'>
                <span>Total Valuation</span>
                <span>
                  {formatCurrency(
                    parseInt(totalFractions) * parseFloat(pricePerFraction)
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {!isConnected && (
          <Alert>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              Please connect your wallet to fractionalize NFTs.
            </AlertDescription>
          </Alert>
        )}

        {isConnected && !kycStatus.kycStatus.isVerified && (
          <Alert>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              KYC verification required to fractionalize NFTs.{' '}
              <a href='/kyc' className='text-blue-600 hover:underline'>
                Complete verification
                <ExternalLink className='inline h-3 w-3 ml-1' />
              </a>
            </AlertDescription>
          </Alert>
        )}

        {/* Fractionalize Button */}
        <Button
          onClick={handleFractionalize}
          disabled={!canFractionalize || isLoading}
          className='w-full'
          size='lg'
        >
          {isLoading
            ? uploadingToIPFS
              ? 'Uploading to IPFS...'
              : 'Fractionalizing...'
            : !isConnected
            ? 'Connect Wallet'
            : !kycStatus.kycStatus.isVerified
            ? 'KYC Required'
            : `Fractionalize NFT`}
        </Button>

        {/* Additional Info */}
        <div className='text-xs text-gray-500 text-center space-y-1'>
          <p>NFT will be locked in vault</p>
          <p>Fractions will be minted to vault</p>
          <p>Sale will start immediately</p>
        </div>
      </CardContent>
    </Card>
  )
}
