use anchor_lang::prelude::*;

use crate::account_structs::*;
use crate::error::RwaError;

/// Enhanced KYC instructions for professional compliance

/// Initialize KYC verification with a specific provider
///
/// This instruction starts the KYC process with an external provider
/// and stores the verification session information.
pub fn initiate_kyc_verification(
    ctx: Context<InitiateKycVerification>,
    provider: KycProvider,
    user_email: String,
    user_phone: Option<String>,
) -> Result<()> {
    let kyc_account = &mut ctx.accounts.kyc_account;
    let clock = Clock::get()?;

    // Validate provider is active
    require!(
        ctx.accounts
            .provider_config
            .active_providers
            .contains(&provider),
        RwaError::InvalidKycProvider
    );

    // Check if user can attempt verification
    require!(
        kyc_account.can_attempt_verification(),
        RwaError::KycVerificationLimitExceeded
    );

    // Initialize KYC account
    kyc_account.user = ctx.accounts.user.key();
    kyc_account.status = KycStatus::InProgress;
    kyc_account.provider = provider.clone();
    kyc_account.registered_at = clock.unix_timestamp;
    kyc_account.verification_attempts = kyc_account.verification_attempts.saturating_add(1);
    kyc_account.last_attempt_at = Some(clock.unix_timestamp);
    kyc_account.compliance_flags = ComplianceFlags::default();

    // Generate provider-specific verification ID
    let verification_id = format!(
        "{}_{}_{}",
        provider.to_string(),
        ctx.accounts.user.key().to_string()[..8].to_string(),
        clock.unix_timestamp
    );
    kyc_account.provider_verification_id = Some(verification_id.clone());

    msg!("KYC verification initiated");
    msg!("User: {}", ctx.accounts.user.key());
    msg!("Provider: {:?}", provider);
    msg!("Verification ID: {}", verification_id);
    msg!("Email: {}", user_email);

    // In a real implementation, you would:
    // 1. Call the provider's API to initiate verification
    // 2. Store the session ID and redirect URL
    // 3. Send verification link to user's email

    Ok(())
}

/// Process KYC verification result from provider webhook
///
/// This instruction processes the result from a KYC provider webhook
/// and updates the user's verification status.
pub fn process_kyc_result(
    ctx: Context<ProcessKycResult>,
    verification_id: String,
    status: KycStatus,
    risk_score: Option<u8>,
    compliance_data: ComplianceFlags,
    provider_metadata: Option<String>,
) -> Result<()> {
    let kyc_account = &mut ctx.accounts.kyc_account;
    let clock = Clock::get()?;

    // Validate verification ID matches
    require!(
        kyc_account.provider_verification_id.as_ref() == Some(&verification_id),
        RwaError::InvalidVerificationId
    );

    // Update KYC status
    kyc_account.status = status.clone();
    kyc_account.risk_score = risk_score;
    kyc_account.compliance_flags = compliance_data;
    kyc_account.provider_metadata = provider_metadata;

    // Set verification timestamp if successful
    if status == KycStatus::Verified {
        kyc_account.verified_at = Some(clock.unix_timestamp);

        // Set expiration if configured
        if let Some(expiration_days) = ctx.accounts.provider_config.requirements.expiration_days {
            kyc_account.expires_at =
                Some(clock.unix_timestamp + (expiration_days as i64 * 24 * 60 * 60));
        }
    }

    msg!("KYC verification result processed");
    msg!("User: {}", kyc_account.user);
    msg!("Status: {:?}", status);
    msg!("Risk Score: {:?}", risk_score);
    msg!("Compliance Flags: {:?}", kyc_account.compliance_flags);

    Ok(())
}

/// Manually verify KYC (admin only)
///
/// This instruction allows platform admins to manually verify users
/// for cases where automated verification fails or is not available.
pub fn manual_kyc_verification(
    ctx: Context<ManualKycVerification>,
    is_verified: bool,
    risk_score: Option<u8>,
    compliance_data: ComplianceFlags,
    notes: Option<String>,
) -> Result<()> {
    let kyc_account = &mut ctx.accounts.kyc_account;
    let clock = Clock::get()?;

    // Update KYC status
    kyc_account.status = if is_verified {
        KycStatus::Verified
    } else {
        KycStatus::Rejected
    };

    kyc_account.provider = KycProvider::Manual;
    kyc_account.risk_score = risk_score;
    kyc_account.compliance_flags = compliance_data;
    kyc_account.provider_metadata = notes;

    if is_verified {
        kyc_account.verified_at = Some(clock.unix_timestamp);

        // Set expiration if configured
        if let Some(expiration_days) = ctx.accounts.provider_config.requirements.expiration_days {
            kyc_account.expires_at =
                Some(clock.unix_timestamp + (expiration_days as i64 * 24 * 60 * 60));
        }
    }

    msg!("Manual KYC verification completed");
    msg!("User: {}", kyc_account.user);
    msg!("Verified: {}", is_verified);
    msg!("Risk Score: {:?}", risk_score);
    msg!("Admin: {}", ctx.accounts.admin.key());

    Ok(())
}

/// Suspend KYC verification (admin only)
///
/// This instruction allows platform admins to suspend a user's
/// KYC verification due to compliance issues or suspicious activity.
pub fn suspend_kyc_verification(
    ctx: Context<SuspendKycVerification>,
    reason: String,
) -> Result<()> {
    let kyc_account = &mut ctx.accounts.kyc_account;

    // Update status to suspended
    kyc_account.status = KycStatus::Suspended;
    kyc_account.provider_metadata = Some(reason.clone());

    msg!("KYC verification suspended");
    msg!("User: {}", kyc_account.user);
    msg!("Reason: {}", reason);
    msg!("Admin: {}", ctx.accounts.admin.key());

    Ok(())
}

/// Refresh KYC verification
///
/// This instruction allows users to refresh their KYC verification
/// if it has expired or needs to be updated.
pub fn refresh_kyc_verification(
    ctx: Context<RefreshKycVerification>,
    provider: Option<KycProvider>,
) -> Result<()> {
    let kyc_account = &mut ctx.accounts.kyc_account;

    // Check if refresh is allowed
    require!(
        kyc_account.status == KycStatus::Expired || kyc_account.status == KycStatus::Failed,
        RwaError::KycRefreshNotAllowed
    );

    // Check verification attempt limit
    require!(
        kyc_account.can_attempt_verification(),
        RwaError::KycVerificationLimitExceeded
    );

    // Use provided provider or default
    let selected_provider =
        provider.unwrap_or_else(|| ctx.accounts.provider_config.default_provider.clone());

    // Reset status to pending
    kyc_account.status = KycStatus::Pending;
    kyc_account.provider = selected_provider.clone();
    kyc_account.verified_at = None;
    kyc_account.expires_at = None;
    kyc_account.risk_score = None;
    kyc_account.compliance_flags = ComplianceFlags::default();
    kyc_account.provider_metadata = None;

    msg!("KYC verification refresh initiated");
    msg!("User: {}", kyc_account.user);
    msg!("Provider: {:?}", selected_provider);

    Ok(())
}

/// Update KYC provider configuration (admin only)
///
/// This instruction allows platform admins to update KYC provider
/// configurations and requirements.
pub fn update_kyc_provider_config(
    ctx: Context<UpdateKycProviderConfig>,
    active_providers: Vec<KycProvider>,
    default_provider: KycProvider,
    requirements: KycRequirements,
) -> Result<()> {
    let provider_config = &mut ctx.accounts.provider_config;
    let clock = Clock::get()?;

    // Update configuration
    provider_config.active_providers = active_providers.clone();
    provider_config.default_provider = default_provider;
    provider_config.requirements = requirements;
    provider_config.updated_at = clock.unix_timestamp;

    msg!("KYC provider configuration updated");
    msg!("Active Providers: {:?}", active_providers);
    msg!("Default Provider: {:?}", default_provider);
    msg!("Admin: {}", ctx.accounts.admin.key());

    Ok(())
}

/// Validate KYC status for transaction
///
/// This instruction validates that a user's KYC status allows them
/// to perform transactions on the platform.
pub fn validate_kyc_for_transaction(
    ctx: Context<ValidateKycForTransaction>,
    transaction_type: TransactionType,
) -> Result<()> {
    let kyc_account = &ctx.accounts.kyc_account;

    // Check if KYC is valid
    require!(kyc_account.is_valid(), RwaError::KycNotVerified);

    // Check compliance requirements based on transaction type
    match transaction_type {
        TransactionType::Purchase => {
            require!(
                kyc_account.is_fully_compliant(),
                RwaError::KycComplianceIncomplete
            );
        }
        TransactionType::Redemption => {
            // Redemption might have different requirements
            require!(
                kyc_account.compliance_flags.aml_cleared,
                RwaError::KycComplianceIncomplete
            );
        }
        TransactionType::Transfer => {
            // Transfer might have stricter requirements
            require!(
                kyc_account.is_fully_compliant(),
                RwaError::KycComplianceIncomplete
            );
        }
    }

    // Check risk level
    let risk_level = kyc_account.get_risk_level();
    require!(risk_level != RiskLevel::High, RwaError::KycRiskLevelTooHigh);

    msg!("KYC validation successful");
    msg!("User: {}", kyc_account.user);
    msg!("Transaction Type: {:?}", transaction_type);
    msg!("Risk Level: {:?}", risk_level);

    Ok(())
}

/// Transaction types for KYC validation
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum TransactionType {
    Purchase,
    Redemption,
    Transfer,
}

// Account validation structs for enhanced KYC instructions

#[derive(Accounts)]
pub struct InitiateKycVerification<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = EnhancedKycAccount::LEN,
        seeds = [b"kyc", user.key().as_ref()],
        bump
    )]
    pub kyc_account: Account<'info, EnhancedKycAccount>,

    #[account(
        constraint = provider_config.active_providers.len() > 0
    )]
    pub provider_config: Account<'info, KycProviderConfig>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ProcessKycResult<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(mut)]
    pub kyc_account: Account<'info, EnhancedKycAccount>,

    #[account(
        constraint = provider_config.admin == admin.key()
    )]
    pub provider_config: Account<'info, KycProviderConfig>,
}

#[derive(Accounts)]
pub struct ManualKycVerification<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(mut)]
    pub kyc_account: Account<'info, EnhancedKycAccount>,

    #[account(
        constraint = provider_config.admin == admin.key()
    )]
    pub provider_config: Account<'info, KycProviderConfig>,
}

#[derive(Accounts)]
pub struct SuspendKycVerification<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(mut)]
    pub kyc_account: Account<'info, EnhancedKycAccount>,

    #[account(
        constraint = provider_config.admin == admin.key()
    )]
    pub provider_config: Account<'info, KycProviderConfig>,
}

#[derive(Accounts)]
pub struct RefreshKycVerification<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub kyc_account: Account<'info, EnhancedKycAccount>,

    pub provider_config: Account<'info, KycProviderConfig>,
}

#[derive(Accounts)]
pub struct UpdateKycProviderConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        constraint = provider_config.admin == admin.key()
    )]
    pub provider_config: Account<'info, KycProviderConfig>,
}

#[derive(Accounts)]
pub struct ValidateKycForTransaction<'info> {
    pub user: Signer<'info>,

    #[account(
        constraint = kyc_account.user == user.key()
    )]
    pub kyc_account: Account<'info, EnhancedKycAccount>,

    pub provider_config: Account<'info, KycProviderConfig>,
}
