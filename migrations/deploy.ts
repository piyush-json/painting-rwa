// Migrations are an early feature. Currently, they're nothing more than this
// single deploy script that's invoked from the CLI, injecting a provider
// configured from the workspace's Anchor.toml.

import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Rwa } from '../target/types/rwa'
import { Keypair } from '@solana/web3.js'
import fs from 'fs'
import bs58 from 'bs58'
import path from 'path'
import os from 'os'
module.exports = async function (provider: anchor.AnchorProvider) {
  // Configure client to use the provider.
  anchor.setProvider(provider)

  const program = anchor.workspace.rwa as Program<Rwa>

  console.log('🚀 Deploying Fractional Art Investment Platform...')

  let admin = null
  const walletPath = path.join(os.homedir(), '.config', 'solana', 'id.json')

  try {
    const walletData = fs.readFileSync(walletPath, 'utf8')
    let secretKey: Uint8Array

    try {
      const walletJson = JSON.parse(walletData)
      if (walletJson && Array.isArray(walletJson)) {
        secretKey = new Uint8Array(walletJson)
      } else {
        throw new Error('Invalid wallet format')
      }
    } catch (jsonError) {
      secretKey = bs58.decode(walletData.trim())
    }

    admin = Keypair.fromSecretKey(secretKey)
    console.log('✅ Admin keypair loaded from', walletPath)
  } catch (error) {
    console.error('❌ Admin keypair not found')
    throw error
  }
  try {
    const tx = await program.methods
      .initialize()
      .accounts({
        admin: admin.publicKey
      })
      .signers([admin])
      .rpc({
        commitment: 'confirmed'
      })
    console.log('✅ Program initialized successfully!')
    console.log('📝 Transaction signature:', tx)

    console.log('🎨 Fractional Art Investment Platform deployed!')
    console.log('🔗 Program ID:', program.programId.toString())
    console.log('📊 Program deployed to:', provider.connection.rpcEndpoint)

    console.log('\n🎯 Next Steps:')
    console.log('1. Register KYC for users')
    console.log('2. Fractionalize NFTs')
    console.log('3. Enable trading of fractional shares')
    console.log('4. Monitor royalty distributions')
  } catch (error) {
    console.error('❌ Deployment failed:', error)
    throw error
  }
}
