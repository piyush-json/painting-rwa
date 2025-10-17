'use client'

import React, { useState } from 'react'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { useDataAccess } from '@/providers/data-access-provider'
import {
  useRwaProgram,
  getKycPda,
  getPlatformConfigPda,
  PLATFORM_AUTHORITY
} from '@/lib/sdk'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/misc'
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Mail,
  Phone,
  User,
  Settings
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function KycPage() {
  const { kycStatus, userAddress, isConnected } = useDataAccess()
  const program = useRwaProgram()
  const platformAuthority = PLATFORM_AUTHORITY

  const [email, setEmail] = useState('')
  const [country, setCountry] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [targetUserAddress, setTargetUserAddress] = useState('')

  // Check if current user is admin by comparing with platform authority
  const isAdmin =
    userAddress && userAddress.toString() === platformAuthority.toString()
  const handleRegisterKyc = async () => {
    if (!program || !userAddress) return

    setIsLoading(true)
    try {
      // Get KYC PDA
      const [kycPda] = getKycPda(userAddress, program.programId)

      // Call the registerKyc instruction
      const tx = await program.methods
        .registerKyc()
        .accounts({
          user: userAddress
        })
        .rpc()

      toast.success('KYC registration submitted successfully!')
      setEmail('')
      setCountry('')
    } catch (error) {
      console.error('KYC registration failed:', error)
      toast.error(
        `KYC registration failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdminVerification = async () => {
    if (!program || !userAddress || !targetUserAddress) return

    setIsLoading(true)
    try {
      // Validate the target user address
      const targetUser = new PublicKey(targetUserAddress)

      // Get KYC PDA for the target user
      const [kycPda] = getKycPda(targetUser, program.programId)

      // Get platform config PDA
      const [platformConfigPda] = getPlatformConfigPda(program.programId)

      // Use the platform authority as admin
      const admin = platformAuthority

      // Call the verifyKyc instruction
      const tx = await program.methods
        .verifyKyc({ adminApproval: {} }, 2)
        .accounts({
          admin: admin,
          kycAccount: kycPda,
          platformConfig: platformConfigPda
        })
        .rpc()

      toast.success(
        `KYC verification completed for ${targetUserAddress.slice(0, 8)}...!`
      )
      setTargetUserAddress('')
    } catch (error) {
      console.error('Admin KYC verification failed:', error)
      toast.error(
        `Admin KYC verification failed: ${
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
            Connect your wallet to complete KYC verification for art investment.
          </p>
          <Button size='lg' className='w-full'>
            Connect Wallet
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='text-center mb-12'>
          <Shield className='h-16 w-16 text-primary mx-auto mb-4' />
          <h1 className='text-4xl font-bold text-foreground mb-4'>
            KYC Verification
          </h1>
          <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
            Complete identity verification to invest in fractional art
            ownership. This is required for regulatory compliance and platform
            security.
          </p>
        </div>

        <div className='max-w-2xl mx-auto space-y-8'>
          {/* Admin Verification Section */}
          {isAdmin && (
            <Card className='bg-accent border-accent'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Settings className='h-5 w-5' />
                  Admin KYC Verification
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <Alert>
                  <AlertTriangle className='h-4 w-4' />
                  <AlertDescription>
                    As an admin, you can verify any user's KYC by entering their
                    wallet address.
                  </AlertDescription>
                </Alert>

                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='targetUser'>
                      Target User Wallet Address
                    </Label>
                    <Input
                      id='targetUser'
                      placeholder='Enter user wallet address to verify'
                      value={targetUserAddress}
                      onChange={(e) => setTargetUserAddress(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={handleAdminVerification}
                    disabled={!targetUserAddress || isLoading}
                    className='w-full'
                    size='lg'
                  >
                    {isLoading ? 'Verifying...' : 'Verify User KYC'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Shield className='h-5 w-5' />
                Verification Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='font-medium'>
                    {kycStatus.kycStatus.isVerified
                      ? 'Verified'
                      : kycStatus.kycStatus.verificationMethod ===
                        'AdminApproval'
                      ? 'Applied for Approval'
                      : 'Not Verified'}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {kycStatus.kycStatus.isVerified
                      ? `Level ${kycStatus.kycStatus.verificationLevel} verification completed`
                      : kycStatus.kycStatus.verificationMethod ===
                        'AdminApproval'
                      ? 'Waiting for admin approval to complete verification'
                      : 'Complete verification to start investing'}
                  </p>
                </div>
                <Badge
                  variant={
                    kycStatus.kycStatus.isVerified
                      ? 'default'
                      : kycStatus.kycStatus.verificationMethod ===
                        'AdminApproval'
                      ? 'secondary'
                      : 'outline'
                  }
                >
                  {kycStatus.kycStatus.isVerified
                    ? 'Verified'
                    : kycStatus.kycStatus.verificationMethod === 'AdminApproval'
                    ? 'Applied for Approval'
                    : 'Pending'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Registration Form */}
          {!kycStatus.kycStatus.isVerified &&
            kycStatus.kycStatus.verificationMethod !== 'AdminApproval' && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <User className='h-5 w-5' />
                    Register for KYC
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='email'>Email Address</Label>
                      <Input
                        id='email'
                        type='email'
                        placeholder='Enter your email address'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='country'>Country</Label>
                      <Input
                        id='country'
                        placeholder='Enter your country'
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleRegisterKyc}
                    disabled={!email || !country || isLoading}
                    className='w-full'
                    size='lg'
                  >
                    {isLoading ? 'Registering...' : 'Submit Application'}
                  </Button>
                </CardContent>
              </Card>
            )}

          {/* Applied for Approval Status */}
          {!kycStatus.kycStatus.isVerified &&
            kycStatus.kycStatus.verificationMethod === 'AdminApproval' && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <CheckCircle className='h-5 w-5' />
                    Application Submitted
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <Alert>
                    <CheckCircle className='h-4 w-4' />
                    <AlertDescription>
                      Your KYC application has been submitted and is waiting for
                      admin approval. You will be notified once the verification
                      is complete.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

          {/* Verification Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <h4 className='font-medium'>Investment Access</h4>
                  <ul className='text-sm text-muted-foreground space-y-2'>
                    <li className='flex items-start'>
                      <span className='w-1.5 h-1.5 bg-success rounded-full mt-2 mr-2 flex-shrink-0'></span>
                      Purchase fractional art shares
                    </li>
                    <li className='flex items-start'>
                      <span className='w-1.5 h-1.5 bg-success rounded-full mt-2 mr-2 flex-shrink-0'></span>
                      Access to all artworks
                    </li>
                    <li className='flex items-start'>
                      <span className='w-1.5 h-1.5 bg-success rounded-full mt-2 mr-2 flex-shrink-0'></span>
                      Higher investment limits
                    </li>
                  </ul>
                </div>
                <div className='space-y-2'>
                  <h4 className='font-medium'>Security Features</h4>
                  <ul className='text-sm text-muted-foreground space-y-2'>
                    <li className='flex items-start'>
                      <span className='w-1.5 h-1.5 bg-success rounded-full mt-2 mr-2 flex-shrink-0'></span>
                      Enhanced account security
                    </li>
                    <li className='flex items-start'>
                      <span className='w-1.5 h-1.5 bg-success rounded-full mt-2 mr-2 flex-shrink-0'></span>
                      Fraud protection
                    </li>
                    <li className='flex items-start'>
                      <span className='w-1.5 h-1.5 bg-success rounded-full mt-2 mr-2 flex-shrink-0'></span>
                      Regulatory compliance
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information */}
          <Card className='bg-info/10 border-info/20'>
            <CardContent className='p-6'>
              <h3 className='font-semibold text-info mb-2'>
                About KYC Verification
              </h3>
              <p className='text-info/80 text-sm'>
                Know Your Customer (KYC) verification is required for regulatory
                compliance and platform security. Your information is encrypted
                and stored securely. We never share your personal data with
                third parties without your explicit consent.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
