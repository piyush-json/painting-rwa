use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

use crate::state::Vault;

/// Utility functions for the Fractional Art Investment Platform

/// Calculate the royalty amount for a given transfer amount
///
/// # Arguments
/// * `amount` - The transfer amount
/// * `royalty_numerator` - The royalty numerator (e.g., 500 for 5%)
/// * `royalty_denominator` - The royalty denominator (e.g., 10000 for 100%)
///
/// # Returns
/// * `Result<u64>` - The calculated royalty amount
pub fn calculate_royalty_amount(
    amount: u64,
    royalty_numerator: u16,
    royalty_denominator: u16,
) -> Result<u64> {
    amount
        .checked_mul(royalty_numerator as u64)
        .and_then(|result| result.checked_div(royalty_denominator as u64))
        .ok_or(crate::error::RwaError::MathOverflow.into())
}

/// Calculate the net amount after deducting royalty
///
/// # Arguments
/// * `amount` - The original amount
/// * `royalty_numerator` - The royalty numerator
/// * `royalty_denominator` - The royalty denominator
///
/// # Returns
/// * `Result<u64>` - The net amount after royalty deduction
pub fn calculate_net_amount(
    amount: u64,
    royalty_numerator: u16,
    royalty_denominator: u16,
) -> Result<u64> {
    let royalty_amount = calculate_royalty_amount(amount, royalty_numerator, royalty_denominator)?;
    amount
        .checked_sub(royalty_amount)
        .ok_or(crate::error::RwaError::MathOverflow.into())
}

/// Validate that a vault is ready for redemption
///
/// # Arguments
/// * `vault` - The vault account
/// * `redeemer_token_account` - The redeemer's fractional token account
///
/// # Returns
/// * `Result<()>` - Success if validation passes
pub fn validate_redemption_eligibility(
    vault: &Vault,
    redeemer_token_account: &TokenAccount,
) -> Result<()> {
    require!(
        redeemer_token_account.amount == vault.total_fractions,
        crate::error::RwaError::InsufficientTokens
    );

    require!(
        vault.is_fully_sold(),
        crate::error::RwaError::VaultNotReadyForRedemption
    );

    Ok(())
}

/// Calculate the percentage of vault ownership
///
/// # Arguments
/// * `fractional_amount` - The amount of fractional tokens owned
/// * `total_fractions` - The total number of fractional tokens
///
/// # Returns
/// * `Result<f64>` - The ownership percentage
pub fn calculate_ownership_percentage(fractional_amount: u64, total_fractions: u64) -> Result<f64> {
    if total_fractions == 0 {
        return Ok(0.0);
    }

    let percentage = (fractional_amount as f64 / total_fractions as f64) * 100.0;
    Ok(percentage)
}

/// Generate PDA seeds for vault-related accounts
///
/// # Arguments
/// * `nft_mint` - The original NFT mint address
///
/// # Returns
/// * `Vec<Vec<u8>>` - The PDA seeds
pub fn generate_vault_seeds(nft_mint: &Pubkey) -> Vec<Vec<u8>> {
    vec![b"vault".to_vec(), nft_mint.to_bytes().to_vec()]
}

/// Generate PDA seeds for fractional mint accounts
///
/// # Arguments
/// * `nft_mint` - The original NFT mint address
///
/// # Returns
/// * `Vec<Vec<u8>>` - The PDA seeds
pub fn generate_fractional_mint_seeds(nft_mint: &Pubkey) -> Vec<Vec<u8>> {
    vec![b"fractional_mint".to_vec(), nft_mint.to_bytes().to_vec()]
}

/// Generate PDA seeds for KYC accounts
///
/// # Arguments
/// * `user` - The user's wallet address
///
/// # Returns
/// * `Vec<Vec<u8>>` - The PDA seeds
pub fn generate_kyc_seeds(user: &Pubkey) -> Vec<Vec<u8>> {
    vec![b"kyc".to_vec(), user.to_bytes().to_vec()]
}

/// Validate that a vault sale is active and has available fractions
///
/// # Arguments
/// * `vault` - The vault account
/// * `requested_fractions` - The number of fractions requested
///
/// # Returns
/// * `Result<()>` - Success if validation passes
pub fn validate_sale_availability(vault: &Vault, requested_fractions: u64) -> Result<()> {
    require!(vault.is_sale_active, crate::error::RwaError::SaleNotActive);
    require!(
        requested_fractions > 0,
        crate::error::RwaError::InvalidAmount
    );
    require!(
        vault.fractions_sold + requested_fractions <= vault.total_fractions,
        crate::error::RwaError::InsufficientFractions
    );

    Ok(())
}

/// Calculate the total cost for purchasing fractional tokens
///
/// # Arguments
/// * `num_fractions` - The number of fractions to purchase
/// * `price_per_fraction` - The price per fraction
///
/// # Returns
/// * `Result<u64>` - The total cost
pub fn calculate_purchase_cost(num_fractions: u64, price_per_fraction: u64) -> Result<u64> {
    num_fractions
        .checked_mul(price_per_fraction)
        .ok_or(crate::error::RwaError::MathOverflow.into())
}

/// Calculate the distribution amounts for a payment
///
/// # Arguments
/// * `total_amount` - The total payment amount
/// * `creator_fee_bps` - Creator fee in basis points
/// * `platform_fee_bps` - Platform fee in basis points
///
/// # Returns
/// * `Result<(u64, u64)>` - (creator_amount, platform_amount)
pub fn calculate_payment_distribution(
    total_amount: u64,
    creator_fee_bps: u16,
    platform_fee_bps: u16,
) -> Result<(u64, u64)> {
    let creator_amount = total_amount
        .checked_mul(creator_fee_bps as u64)
        .and_then(|amount| amount.checked_div(10000))
        .ok_or(crate::error::RwaError::MathOverflow)?;

    let platform_amount = total_amount
        .checked_sub(creator_amount)
        .ok_or(crate::error::RwaError::MathOverflow)?;

    Ok((creator_amount, platform_amount))
}

/// Format a timestamp for display
///
/// # Arguments
/// * `timestamp` - Unix timestamp
///
/// # Returns
/// * `String` - Formatted timestamp string
pub fn format_timestamp(timestamp: i64) -> String {
    // Simple formatting - in production, you might want to use a proper date library
    format!("{}", timestamp)
}

/// Validate royalty fee parameters
///
/// # Arguments
/// * `numerator` - Royalty numerator
/// * `denominator` - Royalty denominator
///
/// # Returns
/// * `Result<()>` - Success if validation passes
pub fn validate_royalty_fee(numerator: u16, denominator: u16) -> Result<()> {
    require!(denominator > 0, crate::error::RwaError::InvalidRoyaltyFee);
    require!(
        numerator <= denominator,
        crate::error::RwaError::InvalidRoyaltyFee
    );

    // Additional validation: royalty should not exceed 50% (5000 basis points)
    require!(numerator <= 5000, crate::error::RwaError::InvalidRoyaltyFee);

    Ok(())
}

/// Check if a vault is eligible for redemption
///
/// # Arguments
/// * `vault` - The vault account
///
/// # Returns
/// * `bool` - True if eligible for redemption
pub fn is_vault_redemption_eligible(vault: &Vault) -> bool {
    vault.is_fully_sold() && vault.is_sale_active
}

// /// Calculate the remaining sale duration (if applicable)
// ///
// /// # Arguments
// /// * `vault` - The vault account
// ///
// /// # Returns
// /// * `Option<i64>` - Remaining seconds until sale ends (if time-limited)
// pub fn calculate_remaining_sale_duration(vault: &Vault) -> Option<i64> {
//     // This is a placeholder for future time-limited sales
//     // Currently, sales don't have time limits
//     None
// }
