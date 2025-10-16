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

    /// Initialize the platform with default configuration
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize(ctx)
    }

    /// Fractionalize an NFT into tradeable shares (SIMPLIFIED FOR HACKATHON)
    ///
    /// This instruction takes an NFT and creates fractional ownership tokens.
    /// Uses standard SPL Token for simplicity and speed.
    pub fn fractionalize(
        ctx: Context<Fractionalize>,
        total_fractions: u64,
        price_per_fraction: u64,
    ) -> Result<()> {
        instructions::fractionalize(ctx, total_fractions, price_per_fraction)
    }

    /// Buy fractional tokens (SIMPLIFIED FOR HACKATHON)
    ///
    /// This instruction allows KYC-verified users to purchase fractional tokens.
    /// Uses standard SPL Token transfers for simplicity.
    pub fn buy_fractions(ctx: Context<BuyFractions>, num_fractions: u64) -> Result<()> {
        instructions::buy_fractions(ctx, num_fractions)
    }

    /// Redeem NFT by burning all fractional tokens (SIMPLIFIED FOR HACKATHON)
    ///
    /// This instruction allows a user who owns all fractional tokens to redeem the original NFT.
    pub fn redeem(ctx: Context<Redeem>) -> Result<()> {
        instructions::redeem(ctx)
    }

    /// Register a user for KYC verification (hackathon-friendly)
    ///
    /// This instruction creates a simple KYC account for a user with minimal requirements.
    /// Perfect for hackathon demos where you want to show the flow without barriers.
    pub fn register_kyc(ctx: Context<RegisterKyc>) -> Result<()> {
        instructions::register_kyc(ctx)
    }

    /// Verify a user's KYC status (admin only)
    ///
    /// This instruction allows platform admins to manually verify users.
    /// This is the main verification method for hackathon demos.
    pub fn verify_kyc(
        ctx: Context<VerifyKyc>,
        verification_method: VerificationMethod,
        verification_level: u8,
    ) -> Result<()> {
        instructions::verify_kyc(ctx, verification_method, verification_level)
    }

    /// Update platform configuration (admin only)
    pub fn update_platform_config(
        ctx: Context<UpdatePlatformConfig>,
        platform_fee_numerator: u16,
        platform_fee_denominator: u16,
        min_investment_amount: u64,
        max_investment_amount: u64,
    ) -> Result<()> {
        instructions::update_platform_config(
            ctx,
            platform_fee_numerator,
            platform_fee_denominator,
            min_investment_amount,
            max_investment_amount,
        )
    }
}
