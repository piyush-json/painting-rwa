use anchor_lang::prelude::*;

/// Custom error codes for the Fractional Art Investment Platform
#[error_code]
pub enum RwaError {
    #[msg("Invalid total fractions - must be greater than 0")]
    InvalidTotalFractions,

    #[msg("Invalid price per fraction - must be greater than 0")]
    InvalidPrice,

    #[msg("Invalid royalty fee - numerator must be <= denominator and denominator > 0")]
    InvalidRoyaltyFee,

    #[msg("Sale is not active")]
    SaleNotActive,

    #[msg("Invalid amount - must be greater than 0")]
    InvalidAmount,

    #[msg("Insufficient fractions available for purchase")]
    InsufficientFractions,

    #[msg("KYC verification required to purchase fractions")]
    KycNotVerified,

    #[msg("Insufficient tokens for redemption - must own all fractional tokens")]
    InsufficientTokens,

    #[msg("Math overflow occurred during calculation")]
    MathOverflow,

    #[msg("Unauthorized access - admin authority required")]
    UnauthorizedAccess,

    #[msg("Vault is not ready for redemption - not all fractions sold")]
    VaultNotReadyForRedemption,

    #[msg("Invalid vault state")]
    InvalidVaultState,

    #[msg("Token account mismatch")]
    TokenAccountMismatch,

    #[msg("Payment account insufficient funds")]
    InsufficientPaymentFunds,

    #[msg("Platform authority mismatch")]
    PlatformAuthorityMismatch,

    #[msg("KYC account already exists")]
    KycAccountAlreadyExists,

    #[msg("KYC account not found")]
    KycAccountNotFound,

    #[msg("Vault account already exists")]
    VaultAccountAlreadyExists,

    #[msg("Fractional token mint already exists")]
    FractionalMintAlreadyExists,

    #[msg("Invalid token program")]
    InvalidTokenProgram,

    #[msg("Invalid token 2022 program")]
    InvalidToken2022Program,

    #[msg("Invalid verification code")]
    InvalidVerificationCode,

    #[msg("Invalid document data")]
    InvalidDocumentData,

    #[msg("Invalid KYC provider")]
    InvalidKycProvider,

    #[msg("KYC verification limit exceeded")]
    KycVerificationLimitExceeded,

    #[msg("Invalid verification ID")]
    InvalidVerificationId,

    #[msg("KYC refresh not allowed")]
    KycRefreshNotAllowed,

    #[msg("KYC compliance incomplete")]
    KycComplianceIncomplete,

    #[msg("KYC risk level too high")]
    KycRiskLevelTooHigh,
}
