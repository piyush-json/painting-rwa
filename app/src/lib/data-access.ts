import { PublicKey } from '@solana/web3.js'
import { useMemo, useState, useEffect } from 'react'
import {
  useRwaProgram,
  useConnection,
  getVaultPda,
  getKycPda,
  getPlatformConfigPda
} from './sdk'

// Types for our platform
export interface Artwork {
  id: string
  title: string
  artist: string
  description: string
  image: string
  provenance: string
  totalValuation: number
  pricePerShare: number
  totalShares: number
  sharesSold: number
  isActive: boolean
  createdAt: string
  vaultAddress: string
  fractionalMint: string
  originalNftMint: string
}

export interface UserInvestment {
  artworkId: string
  artwork: Artwork
  sharesOwned: number
  currentValue: number
  purchasePrice: number
  purchaseDate: string
}

export interface KycStatus {
  isVerified: boolean
  verificationMethod: string
  verificationLevel: number
  verifiedAt: number
  email?: string
  country?: string
}

export interface VaultData {
  creator: PublicKey
  originalNftMint: PublicKey
  fractionalTokenMint: PublicKey
  totalFractions: number
  pricePerFraction: number
  fractionsSold: number
  isSaleActive: boolean
  creatorPaymentAccount: PublicKey
}

export interface PlatformConfig {
  admin: PublicKey
  platformFeeNumerator: number
  platformFeeDenominator: number
  minInvestmentAmount: number
  maxInvestmentAmount: number
  isActive: boolean
  createdAt: number
  updatedAt: number
}

// Data access hooks
export const useArtworks = () => {
  const program = useRwaProgram()
  const connection = useConnection()
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArtworks = async () => {
      if (!program) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Get all vault accounts from the program
        const vaultAccounts = await program.account.vault.all()

        const artworksData: Artwork[] = []

        for (const vaultAccount of vaultAccounts) {
          try {
            const vault = vaultAccount.account
            const vaultAddress = vaultAccount.publicKey.toString()

            // Create artwork from vault data
            // Note: In a real implementation, you would fetch metadata from IPFS
            // For now, we'll use the vault data directly
            const artwork: Artwork = {
              id: vaultAddress,
              title: `Artwork ${vaultAddress.slice(0, 8)}`,
              artist: 'Unknown Artist',
              description: 'Fractionalized artwork on Solana blockchain',
              image: '/api/placeholder/400/300',
              provenance: 'Minted on Solana blockchain',
              totalValuation:
                vault.totalFractions.toNumber() *
                vault.pricePerFraction.toNumber(),
              pricePerShare: vault.pricePerFraction.toNumber(),
              totalShares: vault.totalFractions.toNumber(),
              sharesSold: vault.fractionsSold.toNumber(),
              isActive: vault.isSaleActive,
              createdAt: new Date(vault.createdAt.toNumber() * 1000)
                .toISOString()
                .split('T')[0],
              vaultAddress,
              fractionalMint: vault.fractionalTokenMint.toString(),
              originalNftMint: vault.originalNftMint.toString()
            }

            artworksData.push(artwork)
          } catch (vaultError) {
            console.warn('Error processing vault:', vaultError)
            continue
          }
        }

        setArtworks(artworksData)
      } catch (err) {
        console.error('Error fetching artworks:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to fetch artworks'
        )
        setArtworks([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchArtworks()
  }, [program])

  return {
    artworks,
    isLoading,
    error
  }
}

export const useUserInvestments = (userAddress?: PublicKey) => {
  const program = useRwaProgram()
  const [investments, setInvestments] = useState<UserInvestment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchInvestments = async () => {
      if (!program || !userAddress) {
        setInvestments([])
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        // Get all vault accounts
        const vaultAccounts = await program.account.vault.all()

        const userInvestments: UserInvestment[] = []

        for (const vaultAccount of vaultAccounts) {
          try {
            const vault = vaultAccount.account

            // Get user's fractional token account
            const { getAssociatedTokenAddress } = await import(
              '@solana/spl-token'
            )
            const userFractionalAccount = await getAssociatedTokenAddress(
              vault.fractionalTokenMint,
              userAddress
            )

            // Get user's balance
            const accountInfo =
              await program.provider.connection.getAccountInfo(
                userFractionalAccount
              )
            if (accountInfo) {
              const balance =
                await program.provider.connection.getTokenAccountBalance(
                  userFractionalAccount
                )
              const sharesOwned = parseInt(balance.value.amount)

              if (sharesOwned > 0) {
                const artwork: Artwork = {
                  id: vaultAccount.publicKey.toString(),
                  title: `Artwork ${vaultAccount.publicKey
                    .toString()
                    .slice(0, 8)}`,
                  artist: 'Unknown Artist',
                  description: 'Fractionalized artwork on Solana blockchain',
                  image: '/api/placeholder/400/300',
                  provenance: 'Minted on Solana blockchain',
                  totalValuation:
                    vault.totalFractions.toNumber() *
                    vault.pricePerFraction.toNumber(),
                  pricePerShare: vault.pricePerFraction.toNumber(),
                  totalShares: vault.totalFractions.toNumber(),
                  sharesSold: vault.fractionsSold.toNumber(),
                  isActive: vault.isSaleActive,
                  createdAt: new Date(vault.createdAt.toNumber() * 1000)
                    .toISOString()
                    .split('T')[0],
                  vaultAddress: vaultAccount.publicKey.toString(),
                  fractionalMint: vault.fractionalTokenMint.toString(),
                  originalNftMint: vault.originalNftMint.toString()
                }

                userInvestments.push({
                  artworkId: vaultAccount.publicKey.toString(),
                  artwork,
                  sharesOwned,
                  currentValue: sharesOwned * vault.pricePerFraction.toNumber(),
                  purchasePrice: vault.pricePerFraction.toNumber(), // Simplified
                  purchaseDate: new Date(vault.createdAt.toNumber() * 1000)
                    .toISOString()
                    .split('T')[0]
                })
              }
            }
          } catch (vaultError) {
            console.warn('Error processing vault for investments:', vaultError)
            continue
          }
        }

        setInvestments(userInvestments)
      } catch (err) {
        console.error('Error fetching user investments:', err)
        setInvestments([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvestments()
  }, [program, userAddress])

  return {
    investments,
    isLoading
  }
}

export const useKycStatus = (userAddress?: PublicKey) => {
  const program = useRwaProgram()
  const [kycStatus, setKycStatus] = useState<KycStatus>({
    isVerified: false,
    verificationMethod: '',
    verificationLevel: 0,
    verifiedAt: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchKycStatus = async () => {
      if (!program || !userAddress) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        const [kycPda] = getKycPda(userAddress, program.programId)
        const kycAccount = await program.account.simpleKycAccount.fetch(kycPda)

        setKycStatus({
          isVerified: kycAccount.isVerified,
          verificationMethod:
            Object.keys(kycAccount.verificationMethod)[0] || '',
          verificationLevel: kycAccount.verificationLevel,
          verifiedAt: kycAccount.verifiedAt.toNumber(),
          email: kycAccount.email || undefined,
          country: kycAccount.country || undefined
        })
      } catch (err) {
        // KYC account doesn't exist yet
        setKycStatus({
          isVerified: false,
          verificationMethod: '',
          verificationLevel: 0,
          verifiedAt: 0
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchKycStatus()
  }, [program, userAddress])

  return {
    kycStatus,
    isLoading
  }
}

export const useVaultData = (vaultAddress: PublicKey) => {
  const program = useRwaProgram()
  const [vaultData, setVaultData] = useState<VaultData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchVaultData = async () => {
      if (!program) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const vault = await program.account.vault.fetch(vaultAddress)

        setVaultData({
          creator: vault.creator,
          originalNftMint: vault.originalNftMint,
          fractionalTokenMint: vault.fractionalTokenMint,
          totalFractions: vault.totalFractions.toNumber(),
          pricePerFraction: vault.pricePerFraction.toNumber(),
          fractionsSold: vault.fractionsSold.toNumber(),
          isSaleActive: vault.isSaleActive,
          creatorPaymentAccount: vault.creatorPaymentAccount
        })
      } catch (err) {
        console.error('Error fetching vault data:', err)
        setVaultData(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVaultData()
  }, [program, vaultAddress])

  return {
    vaultData,
    isLoading
  }
}

export const usePlatformConfig = () => {
  const program = useRwaProgram()
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPlatformConfig = async () => {
      if (!program) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const [platformConfigPda] = getPlatformConfigPda(program.programId)
        const config = await program.account.platformConfig.fetch(
          platformConfigPda
        )

        setPlatformConfig({
          admin: config.admin,
          platformFeeNumerator: config.platformFeeNumerator,
          platformFeeDenominator: config.platformFeeDenominator,
          minInvestmentAmount: config.minInvestmentAmount.toNumber(),
          maxInvestmentAmount: config.maxInvestmentAmount.toNumber(),
          isActive: config.isActive,
          createdAt: config.createdAt.toNumber(),
          updatedAt: config.updatedAt.toNumber()
        })
      } catch (err) {
        console.error('Error fetching platform config:', err)
        setPlatformConfig(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlatformConfig()
  }, [program])

  return {
    platformConfig,
    isLoading
  }
}
