# 🎨 Fractional Art Investment Platform

A cutting-edge Solana-based platform that democratizes fine art investment by transforming multi-million dollar paintings into affordable, tradable digital assets through blockchain fractionalization.

## 🚀 **Hackathon-Optimized Implementation**

This project has been **simplified for hackathon speed** by using **standard SPL Token** instead of Token-2022:

### **✅ Why Standard SPL Token?**
- **⚡ Speed**: Much faster to implement and test
- **🔧 Simplicity**: Less complex account setup  
- **📚 Documentation**: Tons of examples available
- **🎯 Focus**: Focus on core fractionalization logic

### **🔧 What's Simplified:**
- ❌ **No Token-2022 extensions** (not needed for MVP)
- ❌ **No automatic royalties** (can add later)
- ❌ **No complex transfer fees** (simpler implementation)

### **✅ What Still Works:**
- ✅ NFT fractionalization
- ✅ Fractional token minting
- ✅ Share purchasing with KYC
- ✅ NFT redemption
- ✅ Platform fee collection (5%)

## 🌟 Overview

This platform fundamentally changes how people invest in fine art by:

- **Fractionalizing** high-value NFTs into thousands of affordable shares
- **Enabling** global access to previously exclusive art investments
- **Providing** automatic royalty distribution using Token-2022 standard
- **Ensuring** regulatory compliance through KYC verification
- **Creating** unprecedented liquidity in the art market

## 🏗️ Architecture

### Core Components

1. **Vault System**: Secure on-chain storage for original NFTs
2. **Fractional Tokens**: Token-2022 based shares with built-in royalties
3. **KYC System**: Regulatory compliance for all participants
4. **Payment Distribution**: Automated creator and platform fee handling

### Smart Contract Features

- **Fractionalization**: Convert single NFT into multiple fungible tokens
- **Royalty Enforcement**: Automatic 5% royalty on all secondary sales
- **KYC Verification**: Required for all purchases
- **Secure Vaulting**: Original NFT locked until full redemption
- **Payment Distribution**: 95% to creator, 5% to platform

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- Rust 1.70+
- Solana CLI 1.16+
- Anchor Framework 0.31+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rwa
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Build the program**
   ```bash
   anchor build
   ```

4. **Run tests**
   ```bash
   anchor test
   ```

## 📋 Program Instructions

### 1. Fractionalize NFT

Converts a single NFT into multiple fractional tokens:

```rust
pub fn fractionalize(
    ctx: Context<Fractionalize>,
    total_fractions: u64,
    price_per_fraction: u64,
    royalty_fee_numerator: u16,
    royalty_fee_denominator: u16,
) -> Result<()>
```

**Parameters:**
- `total_fractions`: Number of shares to create (e.g., 1000)
- `price_per_fraction`: Price per share in lamports
- `royalty_fee_numerator`: Royalty percentage numerator (e.g., 500 for 5%)
- `royalty_fee_denominator`: Royalty percentage denominator (e.g., 10000 for 100%)

### 2. Buy Fractions

Allows KYC-verified users to purchase fractional tokens:

```rust
pub fn buy_fractions(ctx: Context<BuyFractions>, num_fractions: u64) -> Result<()>
```

**Requirements:**
- User must be KYC verified
- Sufficient payment tokens (USDC)
- Sale must be active
- Sufficient fractions available

### 3. Redeem NFT

Allows users with 100% ownership to reclaim the original NFT:

```rust
pub fn redeem(ctx: Context<Redeem>) -> Result<()>
```

**Requirements:**
- Must own all fractional tokens
- All tokens will be burned
- Original NFT transferred to redeemer

### 4. KYC Management

#### Register KYC
```rust
pub fn register_kyc(ctx: Context<RegisterKyc>) -> Result<()>
```

#### Verify KYC (Admin Only)
```rust
pub fn verify_kyc(ctx: Context<VerifyKyc>, is_verified: bool) -> Result<()>
```

## 🏛️ Account Structures

### Vault Account
```rust
pub struct Vault {
    pub creator: Pubkey,              // Original NFT owner
    pub original_nft_mint: Pubkey,    // Locked NFT mint
    pub fractional_token_mint: Pubkey, // Fractional token mint
    pub total_fractions: u64,         // Total shares created
    pub price_per_fraction: u64,      // Price per share
    pub fractions_sold: u64,          // Shares sold
    pub is_sale_active: bool,         // Sale status
}
```

### KYC Account
```rust
pub struct KycAccount {
    pub user: Pubkey,           // User wallet
    pub is_verified: bool,      // Verification status
    pub registered_at: i64,     // Registration timestamp
    pub verified_at: Option<i64>, // Verification timestamp
}
```

## 🔒 Security Features

### Token-2022 Integration
- **Transfer Fees**: Automatic royalty collection on secondary sales
- **Decentralized**: No central authority controls royalties
- **Transparent**: All fees visible on-chain

### KYC Compliance
- **Regulatory**: Meets financial compliance requirements
- **One-time**: Single verification per user
- **Admin Controlled**: Platform manages verification process

### Vault Security
- **PDA Protection**: Vault controlled by program-derived addresses
- **Atomic Operations**: All-or-nothing transaction safety
- **Burn-to-Redeem**: Original NFT only released when all tokens burned

## 💰 Economic Model

### Primary Sale
- **Creator**: 95% of sale proceeds
- **Platform**: 5% platform fee
- **Payment**: USDC or other SPL tokens

### Secondary Sales
- **Artist**: 5% automatic royalty (via Token-2022)
- **Platform**: Built into token standard
- **Transparent**: All fees visible on-chain

## 🧪 Testing

The test suite covers:

- ✅ Program initialization
- ✅ KYC registration and verification
- ✅ NFT fractionalization
- ✅ Fractional token purchases
- ✅ NFT redemption
- ✅ Error handling and edge cases

### Running Tests

```bash
# Run all tests
anchor test

# Run specific test
anchor test -- --grep "Fractionalizes an NFT"
```

## 🌐 Use Cases

### For Artists
- **Liquidity**: Convert illiquid art into tradeable assets
- **Royalties**: Earn perpetual income from secondary sales
- **Accessibility**: Reach global investor base
- **Transparency**: All transactions recorded on-chain

### For Investors
- **Accessibility**: Invest in art with small amounts
- **Liquidity**: Trade shares on secondary markets
- **Transparency**: Full ownership visibility
- **Diversification**: Own fractions of multiple artworks

### For Platforms
- **Revenue**: 5% platform fee on primary sales
- **Compliance**: Built-in KYC verification
- **Scalability**: Handle multiple artworks simultaneously
- **Innovation**: First-mover advantage in fractional art

## 🔮 Future Enhancements

- **Multi-NFT Vaults**: Fractionalize collections
- **Governance Tokens**: Community voting on vault decisions
- **Insurance Integration**: Protect against physical damage
- **Cross-Chain**: Support for other blockchains
- **AI Valuation**: Automated art appraisal

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details.

## 📞 Support

For support and questions:
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Documentation: [Read the docs](https://docs.your-platform.com)
- Community: [Join our Discord](https://discord.gg/your-community)

---

**Built with ❤️ on Solana**
