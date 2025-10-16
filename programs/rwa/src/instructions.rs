use anchor_lang::prelude::*;
use anchor_spl::token::{burn, mint_to, transfer, Burn, MintTo, Transfer};

use crate::account_structs::*;
use crate::error::RwaError;
use crate::kyc::VerificationMethod;

/// Initialize the platform with default configuration
pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
    let platform_config = &mut ctx.accounts.platform_config;
    let clock = Clock::get()?;

    // Initialize platform configuration
    platform_config.admin = ctx.accounts.admin.key();
    platform_config.platform_fee_numerator = 5; // 5%
    platform_config.platform_fee_denominator = 100;
    platform_config.min_investment_amount = 1; // Minimum 1 token
    platform_config.max_investment_amount = 10000; // Maximum 10,000 tokens
    platform_config.is_active = true;
    platform_config.created_at = clock.unix_timestamp;

    msg!("Platform initialized successfully");
    msg!("Admin: {}", platform_config.admin);

    Ok(())
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
    let vault = &mut ctx.accounts.vault;

    // Validate inputs
    require!(total_fractions > 0, RwaError::InvalidTotalFractions);
    require!(price_per_fraction > 0, RwaError::InvalidPrice);

    // Initialize vault
    vault.creator = ctx.accounts.creator.key();
    vault.original_nft_mint = ctx.accounts.original_nft_mint.key();
    vault.fractional_token_mint = ctx.accounts.fractional_token_mint.key();
    vault.total_fractions = total_fractions;
    vault.price_per_fraction = price_per_fraction;
    vault.fractions_sold = 0;
    vault.is_sale_active = true;
    vault.creator_payment_account = ctx.accounts.creator_payment_account.key();

    // Transfer NFT from creator to vault using CPI
    transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.creator_nft_account.to_account_info(),
                to: ctx.accounts.vault_nft_account.to_account_info(),
                authority: ctx.accounts.creator.to_account_info(),
            },
        ),
        1, // amount (1 NFT)
    )?;

    // Mint all fractional tokens to vault account
    let mint_key = ctx.accounts.original_nft_mint.key();
    let bump = ctx.bumps.vault;
    let seeds = &[b"vault", mint_key.as_ref(), &[bump]];

    mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.fractional_token_mint.to_account_info(),
                to: ctx.accounts.vault_fractional_account.to_account_info(),
                authority: vault.to_account_info(),
            },
            &[seeds],
        ),
        total_fractions,
    )?;

    msg!("NFT fractionalized successfully");
    msg!("Total fractions: {}", total_fractions);
    msg!("Price per fraction: {}", price_per_fraction);
    msg!("Vault: {}", vault.key());

    Ok(())
}

/// Buy fractional tokens (SIMPLIFIED FOR HACKATHON)
///
/// This instruction allows KYC-verified users to purchase fractional tokens.
/// Uses standard SPL Token transfers for simplicity.
pub fn buy_fractions(ctx: Context<BuyFractions>, num_fractions: u64) -> Result<()> {
    let vault = &mut ctx.accounts.vault;

    // Validate inputs
    require!(num_fractions > 0, RwaError::InvalidAmount);
    require!(vault.is_sale_active, RwaError::SaleNotActive);
    require!(
        vault.fractions_sold + num_fractions <= vault.total_fractions,
        RwaError::InsufficientFractions
    );

    // Calculate total cost
    let total_cost = num_fractions
        .checked_mul(vault.price_per_fraction)
        .ok_or(RwaError::MathOverflow)?;

    // Calculate platform fee (5%)
    let platform_fee = total_cost
        .checked_mul(5)
        .and_then(|x| x.checked_div(100))
        .ok_or(RwaError::MathOverflow)?;

    let creator_amount = total_cost
        .checked_sub(platform_fee)
        .ok_or(RwaError::MathOverflow)?;

    // Transfer payment from buyer to creator
    transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.buyer_payment_account.to_account_info(),
                to: ctx.accounts.creator_payment_account.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            },
        ),
        creator_amount,
    )?;

    // Transfer fractional tokens from vault to buyer
    let (_vault_pda, vault_bump) = Pubkey::find_program_address(
        &[b"vault", vault.original_nft_mint.as_ref()],
        ctx.program_id,
    );
    let seeds = &[b"vault", vault.original_nft_mint.as_ref(), &[vault_bump]];

    transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault_fractional_account.to_account_info(),
                to: ctx.accounts.buyer_fractional_account.to_account_info(),
                authority: vault.to_account_info(),
            },
            &[seeds],
        ),
        num_fractions,
    )?;

    // Update vault state
    vault.fractions_sold = vault
        .fractions_sold
        .checked_add(num_fractions)
        .ok_or(RwaError::MathOverflow)?;

    msg!("Fractions purchased successfully");
    msg!("Buyer: {}", ctx.accounts.buyer.key());
    msg!("Fractions purchased: {}", num_fractions);
    msg!("Total cost: {}", total_cost);

    Ok(())
}

/// Redeem NFT by burning all fractional tokens (SIMPLIFIED FOR HACKATHON)
///
/// This instruction allows a user who owns all fractional tokens to redeem the original NFT.
pub fn redeem(ctx: Context<Redeem>) -> Result<()> {
    let vault = &mut ctx.accounts.vault;

    // Check if user owns all fractional tokens
    require!(
        ctx.accounts.redeemer_fractional_account.amount == vault.total_fractions,
        RwaError::InsufficientTokens
    );

    // Burn all fractional tokens
    let (_vault_pda, vault_bump) = Pubkey::find_program_address(
        &[b"vault", vault.original_nft_mint.as_ref()],
        ctx.program_id,
    );
    let seeds = &[b"vault", vault.original_nft_mint.as_ref(), &[vault_bump]];

    burn(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.fractional_token_mint.to_account_info(),
                from: ctx.accounts.redeemer_fractional_account.to_account_info(),
                authority: ctx.accounts.redeemer.to_account_info(),
            },
        ),
        vault.total_fractions,
    )?;

    // Transfer NFT from vault to redeemer
    transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault_nft_account.to_account_info(),
                to: ctx.accounts.redeemer_nft_account.to_account_info(),
                authority: vault.to_account_info(),
            },
            &[seeds],
        ),
        1, // Transfer 1 NFT
    )?;

    // Close vault account
    vault.is_sale_active = false;

    msg!("NFT redeemed successfully");
    msg!("Redeemer: {}", ctx.accounts.redeemer.key());
    msg!("Vault closed: {}", vault.key());

    Ok(())
}

/// Register a user for KYC verification (hackathon-friendly)
///
/// This instruction creates a simple KYC account for a user with minimal requirements.
/// Perfect for hackathon demos where you want to show the flow without barriers.
pub fn register_kyc(ctx: Context<RegisterKyc>) -> Result<()> {
    let kyc_account = &mut ctx.accounts.kyc_account;
    let clock = Clock::get()?;

    // Initialize simple KYC account
    kyc_account.user = ctx.accounts.user.key();
    kyc_account.is_verified = false;
    kyc_account.verification_method = VerificationMethod::AdminApproval;
    kyc_account.verified_at = 0;
    kyc_account.email = None;
    kyc_account.country = None;
    kyc_account.verification_level = 0;

    msg!("KYC registration initiated");
    msg!("User: {}", kyc_account.user);
    msg!("Registered at: {}", clock.unix_timestamp);

    Ok(())
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
    let kyc_account = &mut ctx.accounts.kyc_account;
    let clock = Clock::get()?;

    // Verify user
    kyc_account.is_verified = true;
    kyc_account.verification_method = verification_method.clone();
    kyc_account.verified_at = clock.unix_timestamp;
    kyc_account.verification_level = verification_level.min(3); // Max level 3

    msg!("KYC verification completed");
    msg!("User: {}", kyc_account.user);
    msg!("Method: {:?}", verification_method);
    msg!("Level: {}", verification_level);
    msg!("Admin: {}", ctx.accounts.admin.key());

    Ok(())
}

/// Update platform configuration (admin only)
pub fn update_platform_config(
    ctx: Context<UpdatePlatformConfig>,
    platform_fee_numerator: u16,
    platform_fee_denominator: u16,
    min_investment_amount: u64,
    max_investment_amount: u64,
) -> Result<()> {
    let platform_config = &mut ctx.accounts.platform_config;
    let clock = Clock::get()?;

    // Validate inputs
    require!(platform_fee_denominator > 0, RwaError::InvalidPrice);
    require!(
        platform_fee_numerator <= platform_fee_denominator,
        RwaError::InvalidPrice
    );
    require!(min_investment_amount > 0, RwaError::InvalidAmount);
    require!(
        max_investment_amount > min_investment_amount,
        RwaError::InvalidAmount
    );

    // Update configuration
    platform_config.platform_fee_numerator = platform_fee_numerator;
    platform_config.platform_fee_denominator = platform_fee_denominator;
    platform_config.min_investment_amount = min_investment_amount;
    platform_config.max_investment_amount = max_investment_amount;
    platform_config.updated_at = clock.unix_timestamp;

    msg!("Platform configuration updated");
    msg!(
        "Fee: {}/{}",
        platform_fee_numerator,
        platform_fee_denominator
    );
    msg!(
        "Investment range: {} - {}",
        min_investment_amount,
        max_investment_amount
    );

    Ok(())
}
