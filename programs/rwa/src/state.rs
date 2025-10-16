use anchor_lang::prelude::*;

/// Vault account that stores the original NFT and manages fractional token sales
///
/// This account acts as the central hub for the fractionalization process:
/// - Stores the original NFT in a secure vault
/// - Manages the fractional token mint
/// - Tracks sales progress and pricing
/// - Controls the redemption process
#[account]
pub struct Vault {
    /// The original owner of the NFT being fractionalized
    pub creator: Pubkey,

    /// The mint address of the original NFT locked in the vault
    pub original_nft_mint: Pubkey,

    /// The mint address of the fractional tokens created from the NFT
    pub fractional_token_mint: Pubkey,

    /// Total number of fractional shares created
    pub total_fractions: u64,

    /// Price per fractional share in lamports (or smallest unit of payment token)
    pub price_per_fraction: u64,

    /// Number of fractional shares sold so far
    pub fractions_sold: u64,

    /// Whether the sale is currently active
    pub is_sale_active: bool,

    /// Timestamp when the vault was created
    pub created_at: i64,

    /// Optional: Timestamp when the sale ended
    pub sale_ended_at: Option<i64>,
}

impl Vault {
    /// Calculate the space required for the Vault account
    pub const LEN: usize = 8 + // discriminator
        32 + // creator
        32 + // original_nft_mint
        32 + // fractional_token_mint
        8 +  // total_fractions
        8 +  // price_per_fraction
        8 +  // fractions_sold
        1 +  // is_sale_active
        8 +  // created_at
        9; // sale_ended_at (Option<i64>)

    /// Check if all fractions have been sold
    pub fn is_fully_sold(&self) -> bool {
        self.fractions_sold >= self.total_fractions
    }

    /// Get the number of remaining fractions available for sale
    pub fn remaining_fractions(&self) -> u64 {
        self.total_fractions.saturating_sub(self.fractions_sold)
    }

    /// Calculate the total value of the vault based on current sales
    pub fn total_value(&self) -> Result<u64> {
        self.total_fractions
            .checked_mul(self.price_per_fraction)
            .ok_or(crate::error::RwaError::MathOverflow.into())
    }

    /// Calculate the value of sold fractions
    pub fn sold_value(&self) -> Result<u64> {
        self.fractions_sold
            .checked_mul(self.price_per_fraction)
            .ok_or(crate::error::RwaError::MathOverflow.into())
    }
}

/// KYC (Know Your Customer) account for regulatory compliance
///
/// This account stores user verification status required for purchasing
/// fractional tokens, ensuring compliance with financial regulations.
#[account]
pub struct KycAccount {
    /// The user's wallet address
    pub user: Pubkey,

    /// Whether the user has been verified through KYC process
    pub is_verified: bool,

    /// Timestamp when KYC registration was initiated
    pub registered_at: i64,

    /// Timestamp when KYC verification was completed (if verified)
    pub verified_at: Option<i64>,

    /// Optional: Additional metadata for KYC process
    pub metadata: Option<String>,
}

impl KycAccount {
    /// Calculate the space required for the KycAccount
    pub const LEN: usize = 8 + // discriminator
        32 + // user
        1 +  // is_verified
        8 +  // registered_at
        9 +  // verified_at (Option<i64>)
        4 +  // metadata length prefix
        256; // metadata string (max 256 chars)

    /// Check if the KYC account is ready for verification
    pub fn is_pending_verification(&self) -> bool {
        !self.is_verified && self.verified_at.is_none()
    }

    /// Check if the KYC account has been verified
    pub fn is_verified(&self) -> bool {
        self.is_verified && self.verified_at.is_some()
    }
}

/// Platform configuration account for managing platform-wide settings
///
/// This account stores platform configuration including fee structures,
/// admin authorities, and other global settings.
#[account]
pub struct PlatformConfig {
    /// Platform admin authority
    pub admin: Pubkey,

    /// Platform fee percentage (basis points, e.g., 500 = 5%)
    pub platform_fee_bps: u16,

    /// Creator fee percentage (basis points, e.g., 9500 = 95%)
    pub creator_fee_bps: u16,

    /// Default royalty fee for fractional tokens (basis points)
    pub default_royalty_bps: u16,

    /// Platform treasury wallet for collecting fees
    pub treasury: Pubkey,

    /// Whether the platform is currently active
    pub is_active: bool,

    /// Timestamp when the platform was initialized
    pub initialized_at: i64,

    /// Platform fee numerator for legacy compatibility
    pub platform_fee_numerator: u16,

    /// Platform fee denominator for legacy compatibility
    pub platform_fee_denominator: u16,

    /// Minimum investment amount
    pub min_investment_amount: u64,

    /// Maximum investment amount
    pub max_investment_amount: u64,

    /// Last update timestamp
    pub updated_at: i64,

    /// Created at timestamp
    pub created_at: i64,
}

impl PlatformConfig {
    /// Calculate the space required for the PlatformConfig account
    pub const LEN: usize = 8 + // discriminator
        32 + // admin
        2 +  // platform_fee_bps
        2 +  // creator_fee_bps
        2 +  // default_royalty_bps
        32 + // treasury
        1 +  // is_active
        8 +  // initialized_at
        2 +  // platform_fee_numerator
        2 +  // platform_fee_denominator
        8 +  // min_investment_amount
        8 +  // max_investment_amount
        8 +  // updated_at
        8; // created_at

    /// Validate that platform and creator fees sum to 100%
    pub fn validate_fee_structure(&self) -> bool {
        self.platform_fee_bps + self.creator_fee_bps == 10000
    }

    /// Calculate platform fee amount from total payment
    pub fn calculate_platform_fee(&self, total_amount: u64) -> Result<u64> {
        total_amount
            .checked_mul(self.platform_fee_bps as u64)
            .and_then(|amount| amount.checked_div(10000))
            .ok_or(crate::error::RwaError::MathOverflow.into())
    }

    /// Calculate creator fee amount from total payment
    pub fn calculate_creator_fee(&self, total_amount: u64) -> Result<u64> {
        total_amount
            .checked_mul(self.creator_fee_bps as u64)
            .and_then(|amount| amount.checked_div(10000))
            .ok_or(crate::error::RwaError::MathOverflow.into())
    }
}
