use anchor_lang::prelude::*;

/// Simplified KYC account for our own implementation
///
/// This account stores basic KYC information for our hackathon demo.
/// Focuses on essential fields without complex provider integrations.
#[account]
pub struct SimpleKycAccount {
    /// The user's wallet address
    pub user: Pubkey,

    /// KYC verification status
    pub is_verified: bool,

    /// Verification method used
    pub verification_method: VerificationMethod,

    /// Timestamp when KYC was completed
    pub verified_at: i64,

    /// Optional: User's email for notifications
    pub email: Option<String>,

    /// Optional: User's country for compliance
    pub country: Option<String>,

    /// Verification level (1-3)
    pub verification_level: u8,
}

/// Simple verification methods for our implementation
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug)]
pub enum VerificationMethod {
    /// Manual admin verification
    AdminApproval,
    /// Email verification
    EmailVerification,
    /// Social media verification
    SocialVerification,
    /// Document upload (mock)
    DocumentUpload,
    /// Phone verification
    PhoneVerification,
}

impl SimpleKycAccount {
    /// Calculate the space required for SimpleKycAccount
    pub const LEN: usize = 8 + // discriminator
        32 + // user
        1 +  // is_verified
        1 +  // verification_method
        8 +  // verified_at
        4 +  // email length
        64 + // email string (max 64 chars)
        4 +  // country length
        32 + // country string (max 32 chars)
        1 +  // verification_level
        8; // padding

    /// Check if KYC is valid for transactions
    pub fn is_valid(&self) -> bool {
        self.is_verified && self.verification_level >= 1
    }

    /// Check if user can perform high-value transactions
    pub fn can_perform_high_value_transactions(&self) -> bool {
        self.is_verified && self.verification_level >= 2
    }

    /// Get verification method description
    pub fn get_verification_description(&self) -> String {
        match self.verification_method {
            VerificationMethod::AdminApproval => "Admin Approved".to_string(),
            VerificationMethod::EmailVerification => "Email Verified".to_string(),
            VerificationMethod::SocialVerification => "Social Media Verified".to_string(),
            VerificationMethod::DocumentUpload => "Document Verified".to_string(),
            VerificationMethod::PhoneVerification => "Phone Verified".to_string(),
        }
    }
}
