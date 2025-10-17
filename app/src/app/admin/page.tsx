'use client'

import React, { useState, useEffect } from 'react'
import { PublicKey } from '@solana/web3.js'
import * as anchor from '@coral-xyz/anchor'
import { useDataAccess } from '@/providers/data-access-provider'
import {
  useRwaProgram,
  getPlatformConfigPda,
  getKycPda,
  PLATFORM_AUTHORITY
} from '@/lib/sdk'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Settings,
  Users,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  BarChart3,
  UserCheck,
  UserX
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const { userAddress, isConnected, kycStatus } = useDataAccess()
  const program = useRwaProgram()

  const [isLoading, setIsLoading] = useState(false)
  const [platformConfig, setPlatformConfig] = useState<any>(null)
  const [pendingKycUsers, setPendingKycUsers] = useState<any[]>([])
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    totalVaults: 0,
    totalVolume: 0
  })

  // Platform config form state
  const [configForm, setConfigForm] = useState({
    platformFeeNumerator: 500, // 5%
    platformFeeDenominator: 10000,
    minInvestmentAmount: 1000000, // 1 USDC (6 decimals)
    maxInvestmentAmount: 1000000000 // 1000 USDC
  })

  // Check if user is admin
  const isAdmin =
    userAddress && userAddress.toString() === PLATFORM_AUTHORITY.toString()

  useEffect(() => {
    if (program && isAdmin) {
      loadPlatformData()
    }
  }, [program, isAdmin])

  const loadPlatformData = async () => {
    try {
      const [platformConfigPda] = getPlatformConfigPda(program!.programId)
      const config = await program!.account.platformConfig.fetch(
        platformConfigPda
      )
      setPlatformConfig(config)

      setConfigForm({
        platformFeeNumerator: config.platformFeeNumerator,
        platformFeeDenominator: config.platformFeeDenominator,
        minInvestmentAmount: config.minInvestmentAmount.toNumber(),
        maxInvestmentAmount: config.maxInvestmentAmount.toNumber()
      })

      // Load real platform stats
      const vaultAccounts = await program!.account.vault.all()
      const totalVaults = vaultAccounts.length

      // Calculate total volume from vault data (convert from lamports to USDC)
      // USDC has 6 decimals, so we need to divide by 1,000,000 to get the actual USDC amount
      const totalVolume = vaultAccounts.reduce((sum, vault) => {
        const fractionsSold = vault.account.fractionsSold.toNumber()
        const pricePerFraction = vault.account.pricePerFraction.toNumber()
        return sum + (fractionsSold * pricePerFraction) / 1000000 // Convert from lamports to USDC
      }, 0)

      // Load real user statistics by querying all KYC accounts
      const allKycAccounts = await program!.account.simpleKycAccount.all()
      const totalUsers = allKycAccounts.length
      const verifiedUsers = allKycAccounts.filter(
        (kyc) => kyc.account.isVerified
      ).length

      setPlatformStats({
        totalUsers,
        verifiedUsers,
        totalVaults,
        totalVolume
      })

      // Load real pending KYC users (users with KYC accounts but not verified)
      const pendingUsers = allKycAccounts
        .filter((kyc) => !kyc.account.isVerified)
        .map((kyc) => ({
          address: kyc.account.user.toString(),
          email: kyc.account.email,
          country: kyc.account.country,
          submittedAt: new Date(kyc.account.verifiedAt.toNumber() * 1000)
        }))

      setPendingKycUsers(pendingUsers)
    } catch (error) {
      console.error('Error loading platform data:', error)
    }
  }

  const handleUpdateConfig = async () => {
    if (!program || !isAdmin) return

    setIsLoading(true)
    try {
      const [platformConfigPda] = getPlatformConfigPda(program.programId)

      await program.methods
        .updatePlatformConfig(
          configForm.platformFeeNumerator,
          configForm.platformFeeDenominator,
          new anchor.BN(configForm.minInvestmentAmount),
          new anchor.BN(configForm.maxInvestmentAmount)
        )
        .accounts({
          admin: userAddress,
          platformConfig: platformConfigPda
        })
        .rpc()

      toast.success('Platform configuration updated successfully!')
      await loadPlatformData()
    } catch (error) {
      console.error('Error updating config:', error)
      toast.error(
        `Failed to update configuration: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyKyc = async (targetUserAddress: string) => {
    if (!program || !isAdmin || !userAddress) return

    setIsLoading(true)
    try {
      const [kycPda] = getKycPda(
        new PublicKey(targetUserAddress),
        program.programId
      )
      const [platformConfigPda] = getPlatformConfigPda(program.programId)

      // Use the connected wallet as admin
      const admin = userAddress

      await program.methods
        .verifyKyc({ adminApproval: {} }, 2)
        .accounts({
          admin: admin,
          kycAccount: kycPda,
          platformConfig: platformConfigPda
        })
        .rpc()

      toast.success('KYC verification completed!')
      await loadPlatformData()
    } catch (error) {
      console.error('Error verifying KYC:', error)
      toast.error(
        `Failed to verify KYC: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center max-w-md mx-auto p-8'>
          <Shield className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
          <h1 className='text-2xl font-bold text-foreground mb-4'>
            Connect Your Wallet
          </h1>
          <p className='text-muted-foreground mb-8'>
            Connect your admin wallet to access the platform management panel.
          </p>
          <Button size='lg' className='w-full'>
            Connect Wallet
          </Button>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center max-w-md mx-auto p-8'>
          <AlertTriangle className='h-16 w-16 text-destructive mx-auto mb-4' />
          <h1 className='text-2xl font-bold text-foreground mb-4'>
            Access Denied
          </h1>
          <p className='text-muted-foreground mb-8'>
            You don't have admin privileges to access this panel.
          </p>
          <Button size='lg' className='w-full' variant='outline'>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-foreground mb-2'>
            Admin Dashboard
          </h1>
          <p className='text-xl text-muted-foreground'>
            Manage platform settings and user verifications
          </p>
        </div>

        {/* Stats Overview */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <Users className='h-8 w-8 text-primary mr-3' />
                <div>
                  <p className='text-sm text-muted-foreground'>Total Users</p>
                  <p className='text-2xl font-bold text-foreground'>
                    {platformStats.totalUsers.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <UserCheck className='h-8 w-8 text-success mr-3' />
                <div>
                  <p className='text-sm text-muted-foreground'>
                    Verified Users
                  </p>
                  <p className='text-2xl font-bold text-foreground'>
                    {platformStats.verifiedUsers.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <BarChart3 className='h-8 w-8 text-primary mr-3' />
                <div>
                  <p className='text-sm text-muted-foreground'>Total Vaults</p>
                  <p className='text-2xl font-bold text-foreground'>
                    {platformStats.totalVaults.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <DollarSign className='h-8 w-8 text-success mr-3' />
                <div>
                  <p className='text-sm text-muted-foreground'>Total Volume</p>
                  <p className='text-2xl font-bold text-foreground'>
                    ${platformStats.totalVolume.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Platform Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Settings className='h-5 w-5' />
                Platform Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='feeNumerator'>Platform Fee Numerator</Label>
                  <Input
                    id='feeNumerator'
                    type='number'
                    value={configForm.platformFeeNumerator}
                    onChange={(e) =>
                      setConfigForm((prev) => ({
                        ...prev,
                        platformFeeNumerator: parseInt(e.target.value) || 0
                      }))
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='feeDenominator'>
                    Platform Fee Denominator
                  </Label>
                  <Input
                    id='feeDenominator'
                    type='number'
                    value={configForm.platformFeeDenominator}
                    onChange={(e) =>
                      setConfigForm((prev) => ({
                        ...prev,
                        platformFeeDenominator: parseInt(e.target.value) || 0
                      }))
                    }
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='minInvestment'>Min Investment (USDC)</Label>
                <Input
                  id='minInvestment'
                  type='number'
                  value={configForm.minInvestmentAmount / 1000000}
                  onChange={(e) =>
                    setConfigForm((prev) => ({
                      ...prev,
                      minInvestmentAmount: Math.floor(
                        (parseFloat(e.target.value) || 0) * 1000000
                      )
                    }))
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='maxInvestment'>Max Investment (USDC)</Label>
                <Input
                  id='maxInvestment'
                  type='number'
                  value={configForm.maxInvestmentAmount / 1000000}
                  onChange={(e) =>
                    setConfigForm((prev) => ({
                      ...prev,
                      maxInvestmentAmount: Math.floor(
                        (parseFloat(e.target.value) || 0) * 1000000
                      )
                    }))
                  }
                />
              </div>

              <Button
                onClick={handleUpdateConfig}
                disabled={isLoading}
                className='w-full'
              >
                {isLoading ? 'Updating...' : 'Update Configuration'}
              </Button>
            </CardContent>
          </Card>

          {/* Pending KYC Verifications */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Shield className='h-5 w-5' />
                Pending KYC Verifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingKycUsers.length === 0 ? (
                <div className='text-center py-8'>
                  <CheckCircle className='h-12 w-12 text-success mx-auto mb-4' />
                  <p className='text-muted-foreground'>
                    No pending KYC verifications
                  </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {pendingKycUsers.map((user, index) => (
                    <div key={index} className='border rounded-lg p-4'>
                      <div className='flex items-center justify-between mb-2'>
                        <div>
                          <p className='font-medium text-sm'>
                            {user.address.slice(0, 8)}...
                            {user.address.slice(-8)}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {user.email} • {user.country}
                          </p>
                        </div>
                        <Badge variant='outline'>Pending</Badge>
                      </div>
                      <p className='text-xs text-muted-foreground mb-3'>
                        Submitted {user.submittedAt.toLocaleString()}
                      </p>
                      <div className='flex gap-2'>
                        <Button
                          size='sm'
                          onClick={() => handleVerifyKyc(user.address)}
                          disabled={isLoading}
                          className='flex-1'
                        >
                          <UserCheck className='h-3 w-3 mr-1' />
                          Approve
                        </Button>
                        <Button size='sm' variant='outline' className='flex-1'>
                          <UserX className='h-3 w-3 mr-1' />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Platform Status */}
        <Card className='mt-8'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='h-5 w-5' />
              Platform Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-success mb-2'>
                  {platformStats.totalUsers > 0
                    ? Math.round(
                        (platformStats.verifiedUsers /
                          platformStats.totalUsers) *
                          100
                      )
                    : 0}
                  %
                </div>
                <p className='text-sm text-muted-foreground'>
                  KYC Verification Rate
                </p>
                <Progress
                  value={
                    platformStats.totalUsers > 0
                      ? (platformStats.verifiedUsers /
                          platformStats.totalUsers) *
                        100
                      : 0
                  }
                  className='mt-2'
                />
              </div>

              <div className='text-center'>
                <div className='text-2xl font-bold text-primary mb-2'>
                  {platformConfig?.isActive ? 'Active' : 'Inactive'}
                </div>
                <p className='text-sm text-muted-foreground'>Platform Status</p>
                <Badge
                  variant={platformConfig?.isActive ? 'default' : 'destructive'}
                  className='mt-2'
                >
                  {platformConfig?.isActive ? 'Live' : 'Maintenance'}
                </Badge>
              </div>

              <div className='text-center'>
                <div className='text-2xl font-bold text-primary mb-2'>
                  {(
                    (configForm.platformFeeNumerator /
                      configForm.platformFeeDenominator) *
                    100
                  ).toFixed(1)}
                  %
                </div>
                <p className='text-sm text-muted-foreground'>Platform Fee</p>
                <p className='text-xs text-muted-foreground mt-1'>
                  {configForm.platformFeeNumerator}/
                  {configForm.platformFeeDenominator}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
