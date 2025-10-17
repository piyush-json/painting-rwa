'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  useArtworks,
  useUserInvestments,
  useKycStatus,
  useVaultData
} from '../lib/data-access'

interface DataAccessContextType {
  // Artworks
  artworks: ReturnType<typeof useArtworks>

  // User investments
  investments: ReturnType<typeof useUserInvestments>

  // KYC status
  kycStatus: ReturnType<typeof useKycStatus>

  // Vault data
  // getVaultData: (vaultAddress: string) => ReturnType<typeof useVaultData>;

  // User info
  userAddress: PublicKey | null
  isConnected: boolean
}

const DataAccessContext = createContext<DataAccessContextType | undefined>(
  undefined
)

interface DataAccessProviderProps {
  children: ReactNode
}

export const DataAccessProvider: React.FC<DataAccessProviderProps> = ({
  children
}) => {
  const { publicKey, connected } = useWallet()

  // Fetch all data
  const artworks = useArtworks()
  const investments = useUserInvestments(publicKey || undefined)
  const kycStatus = useKycStatus(publicKey || undefined)

  const value: DataAccessContextType = {
    artworks,
    investments,
    kycStatus,
    userAddress: publicKey,
    isConnected: connected
  }

  return (
    <DataAccessContext.Provider value={value}>
      {children}
    </DataAccessContext.Provider>
  )
}

export const useDataAccess = () => {
  const context = useContext(DataAccessContext)
  if (context === undefined) {
    throw new Error('useDataAccess must be used within a DataAccessProvider')
  }
  return context
}
