import { pinata } from '@/utils/config'

// Pinata IPFS configuration
const PINATA_GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs/'

export interface IPFSUploadResult {
  hash: string
  url: string
  size: number
}

export interface IPFSMetadata {
  name: string
  description: string
  image: string
  attributes?: Array<{
    trait_type: string
    value: string | number
  }>
  external_url?: string
}

/**
 * Upload a file to IPFS using Pinata SDK with signed URL
 */
export async function uploadToIPFS(file: File): Promise<IPFSUploadResult> {
  try {
    // Get signed URL from our API
    const urlRequest = await fetch('/api/url')
    const urlResponse = await urlRequest.json()

    if (!urlResponse.url) {
      throw new Error('Failed to get signed URL')
    }

    // Upload file using signed URL
    const { cid } = await pinata.upload.public.file(file).url(urlResponse.url)
    const url = await pinata.gateways.public.convert(cid)

    return {
      hash: cid,
      url: url,
      size: file.size
    }
  } catch (error) {
    console.error('Error uploading to IPFS:', error)
    throw new Error('Failed to upload file to IPFS')
  }
}

/**
 * Upload metadata JSON to IPFS using Pinata SDK with signed URL
 */
export async function uploadMetadataToIPFS(
  metadata: IPFSMetadata
): Promise<IPFSUploadResult> {
  try {
    // Get signed URL from our API
    const urlRequest = await fetch('/api/url')
    const urlResponse = await urlRequest.json()

    if (!urlResponse.url) {
      throw new Error('Failed to get signed URL')
    }

    // Create metadata file
    const metadataFile = new File(
      [JSON.stringify(metadata, null, 2)],
      'metadata.json',
      {
        type: 'application/json'
      }
    )

    // Upload metadata using signed URL
    const { cid } = await pinata.upload.public
      .file(metadataFile)
      .url(urlResponse.url)
    const url = await pinata.gateways.public.convert(cid)

    return {
      hash: cid,
      url: url,
      size: metadataFile.size
    }
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error)
    throw new Error('Failed to upload metadata to IPFS')
  }
}

/**
 * Upload both image and metadata, returning the metadata hash
 */
export async function uploadArtworkToIPFS(
  imageFile: File,
  metadata: Omit<IPFSMetadata, 'image'>
): Promise<{
  imageHash: string
  metadataHash: string
  imageUrl: string
  metadataUrl: string
}> {
  try {
    // Upload image first
    const imageResult = await uploadToIPFS(imageFile)

    // Create metadata with image URL
    const fullMetadata: IPFSMetadata = {
      ...metadata,
      image: imageResult.url
    }

    // Upload metadata
    const metadataResult = await uploadMetadataToIPFS(fullMetadata)

    return {
      imageHash: imageResult.hash,
      metadataHash: metadataResult.hash,
      imageUrl: imageResult.url,
      metadataUrl: metadataResult.url
    }
  } catch (error) {
    console.error('Error uploading artwork to IPFS:', error)
    throw new Error('Failed to upload artwork to IPFS')
  }
}

/**
 * Get file from IPFS by hash using Pinata gateway
 */
export async function getFromIPFS(hash: string): Promise<Response> {
  try {
    const response = await fetch(`${PINATA_GATEWAY_URL}${hash}`)

    if (!response.ok) {
      throw new Error('Failed to retrieve file from IPFS')
    }

    return response
  } catch (error) {
    console.error('Error getting file from IPFS:', error)
    throw new Error('Failed to retrieve file from IPFS')
  }
}

/**
 * Get metadata from IPFS
 */
export async function getMetadataFromIPFS(hash: string): Promise<IPFSMetadata> {
  try {
    const response = await getFromIPFS(hash)
    const jsonString = await response.text()
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('Error getting metadata from IPFS:', error)
    throw new Error('Failed to retrieve metadata from IPFS')
  }
}

/**
 * Validate IPFS hash format
 */
export function isValidIPFSHash(hash: string): boolean {
  // Basic validation for IPFS hash format
  return (
    /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash) ||
    /^bafybei[A-Za-z0-9]{52}$/.test(hash) ||
    /^bafkrei[A-Za-z0-9]{52}$/.test(hash)
  )
}

/**
 * Get IPFS URL from hash
 */
export function getIPFSUrl(hash: string): string {
  return `${PINATA_GATEWAY_URL}${hash}`
}
