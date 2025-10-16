use anchor_lang::prelude::*;

// Import our modular components
mod account_structs;
mod error;
mod instructions;
mod kyc;
mod state;
mod utils;

// Re-export commonly used types
pub use account_structs::*;
pub use error::RwaError;
pub use kyc::*;
pub use state::*;

declare_id!("Guhyo3fAg6Qys962ngVbsidvzEWsBiGmZ3XYMyo73MfE");

/// Fractional Art Investment Platform
///
/// A cutting-edge Solana-based platform that democratizes fine art investment
/// by transforming multi-million dollar paintings into affordable, tradable digital assets.
///
/// ## Key Features:
/// - NFT Fractionalization: Convert single NFTs into thousands of tradeable shares
/// - Token-2022 Integration: Automatic royalty distribution on secondary sales
/// - KYC Compliance: Built-in verification system for regulatory compliance
/// - Secure Vaulting: Original NFTs locked until full redemption
/// - Global Access: Enable worldwide art investment with small amounts
///
/// ## Hackathon-Friendly KYC Flow:
/// 1. **Simple Registration**: Users register with minimal info (email, country)
/// 2. **Auto-Verification**: Demo mode allows instant verification
/// 3. **Mock Verification**: Simulate email/document verification
/// 4. **Admin Override**: Admins can manually verify users
/// 5. **Compliance Ready**: Structure supports real KYC providers
#[program]
pub mod rwa {
    use super::*;

    // Core platform instructions
    pub use instructions::*;

    // Simple KYC instructions for hackathon demos
    pub use kyc::*;
}
