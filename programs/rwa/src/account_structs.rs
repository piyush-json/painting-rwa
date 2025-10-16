use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::kyc::SimpleKycAccount;
use crate::state::{PlatformConfig, Vault};

/// Account validation struct for the initialize instruction
#[derive(Accounts)]
pub struct Initialize<'info> {
    /// The platform admin initializing the program
    #[account(mut)]
    pub admin: Signer<'info>,

    /// Platform configuration account
    #[account(
        init,
        payer = admin,
        space = PlatformConfig::LEN,
        seeds = [b"platform_config"],
        bump
    )]
    pub platform_config: Account<'info, PlatformConfig>,

    /// System program for account creation
    pub system_program: Program<'info, System>,
}

/// Account validation struct for the fractionalize instruction (SIMPLIFIED FOR HACKATHON)
#[derive(Accounts)]
#[instruction(total_fractions: u64, price_per_fraction: u64)]
pub struct Fractionalize<'info> {
    /// The original NFT owner who wants to fractionalize their asset
    #[account(mut)]
    pub creator: Signer<'info>,

    /// The NFT mint being fractionalized
    /// CHECK: This is validated by the constraint on creator_nft_token_account
    pub original_nft_mint: UncheckedAccount<'info>,

    /// Vault account that will store the NFT and manage fractional tokens
    #[account(
        init,
        payer = creator,
        space = Vault::LEN,
        seeds = [b"vault", original_nft_mint.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,

    /// Fractional token mint created for this NFT (STANDARD SPL TOKEN)
    #[account(
        init,
        payer = creator,
        mint::decimals = 0,
        mint::authority = vault,
        mint::freeze_authority = vault,
    )]
    pub fractional_token_mint: Account<'info, Mint>,

    /// Fractional token account for the vault
    #[account(
        init,
        payer = creator,
        token::mint = fractional_token_mint,
        token::authority = vault,
    )]
    pub vault_fractional_account: Account<'info, TokenAccount>,

    /// Creator's NFT token account
    #[account(mut)]
    pub creator_nft_account: Account<'info, TokenAccount>,

    /// Vault's NFT token account
    #[account(
        init,
        payer = creator,
        token::mint = original_nft_mint,
        token::authority = vault,
    )]
    pub vault_nft_account: Account<'info, TokenAccount>,

    /// Token program for standard SPL tokens
    pub token_program: Program<'info, Token>,

    /// System program for account creation
    pub system_program: Program<'info, System>,

    /// Rent sysvar
    pub rent: Sysvar<'info, Rent>,
}

/// Account validation struct for the buy_fractions instruction (SIMPLIFIED)
#[derive(Accounts)]
#[instruction(num_fractions: u64)]
pub struct BuyFractions<'info> {
    /// The buyer purchasing fractional tokens
    #[account(mut)]
    pub buyer: Signer<'info>,

    /// The vault containing the fractionalized NFT
    #[account(mut)]
    pub vault: Account<'info, Vault>,

    /// Fractional token mint
    #[account(mut)]
    pub fractional_token_mint: Account<'info, Mint>,

    /// Buyer's fractional token account
    #[account(
        init_if_needed,
        payer = buyer,
        token::mint = fractional_token_mint,
        token::authority = buyer,
    )]
    pub buyer_fractional_account: Account<'info, TokenAccount>,

    /// Vault's fractional token account
    #[account(mut)]
    pub vault_fractional_account: Account<'info, TokenAccount>,

    /// Buyer's payment token account (USDC)
    #[account(mut)]
    pub buyer_payment_account: Account<'info, TokenAccount>,

    /// Creator's payment token account for receiving proceeds
    #[account(mut)]
    pub creator_payment_account: Account<'info, TokenAccount>,

    /// Buyer's KYC account for compliance verification
    #[account(
        constraint = kyc_account.user == buyer.key(),
        constraint = kyc_account.is_valid() @ crate::error::RwaError::KycNotVerified
    )]
    pub kyc_account: Account<'info, SimpleKycAccount>,

    /// Platform authority for payment distribution
    /// CHECK: This is validated by the platform config
    pub platform_authority: UncheckedAccount<'info>,

    /// Token program for standard SPL tokens
    pub token_program: Program<'info, Token>,

    /// System program for account creation
    pub system_program: Program<'info, System>,
}

/// Account validation struct for the redeem instruction (SIMPLIFIED)
#[derive(Accounts)]
pub struct Redeem<'info> {
    /// The user redeeming the NFT (must own all fractional tokens)
    #[account(mut)]
    pub redeemer: Signer<'info>,

    /// The vault containing the NFT
    #[account(mut)]
    pub vault: Account<'info, Vault>,

    /// Original NFT mint
    /// CHECK: This is validated by the vault account
    pub original_nft_mint: UncheckedAccount<'info>,

    /// Fractional token mint
    #[account(mut)]
    pub fractional_token_mint: Account<'info, Mint>,

    /// Redeemer's fractional token account
    #[account(mut)]
    pub redeemer_fractional_account: Account<'info, TokenAccount>,

    /// Vault's NFT token account
    #[account(mut)]
    pub vault_nft_account: Account<'info, TokenAccount>,

    /// Redeemer's NFT token account
    #[account(
        init_if_needed,
        payer = redeemer,
        token::mint = original_nft_mint,
        token::authority = redeemer,
    )]
    pub redeemer_nft_account: Account<'info, TokenAccount>,

    /// Token program for standard SPL tokens
    pub token_program: Program<'info, Token>,

    /// System program for account creation
    pub system_program: Program<'info, System>,
}

/// Account validation struct for the register_kyc instruction
#[derive(Accounts)]
pub struct RegisterKyc<'info> {
    /// The user registering for KYC verification
    #[account(mut)]
    pub user: Signer<'info>,

    /// KYC account to be created for the user
    #[account(
        init,
        payer = user,
        space = SimpleKycAccount::LEN,
        seeds = [b"simple_kyc", user.key().as_ref()],
        bump
    )]
    pub kyc_account: Account<'info, SimpleKycAccount>,

    /// System program for account creation
    pub system_program: Program<'info, System>,
}

/// Account validation struct for the verify_kyc instruction
#[derive(Accounts)]
pub struct VerifyKyc<'info> {
    /// The admin verifying the KYC status
    #[account(mut)]
    pub admin: Signer<'info>,

    /// The KYC account to be verified
    #[account(mut)]
    pub kyc_account: Account<'info, SimpleKycAccount>,

    /// Platform configuration for admin authority validation
    #[account(
        constraint = platform_config.admin == admin.key() @ crate::error::RwaError::UnauthorizedAccess
    )]
    pub platform_config: Account<'info, PlatformConfig>,
}

/// Account validation struct for updating platform configuration
#[derive(Accounts)]
pub struct UpdatePlatformConfig<'info> {
    /// The platform admin updating configuration
    #[account(mut)]
    pub admin: Signer<'info>,

    /// Platform configuration account
    #[account(
        mut,
        constraint = platform_config.admin == admin.key() @ crate::error::RwaError::UnauthorizedAccess
    )]
    pub platform_config: Account<'info, PlatformConfig>,
}
