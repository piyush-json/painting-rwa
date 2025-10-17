# ArtShare Frontend

A modern Next.js frontend for the ArtShare fractional art investment platform built on Solana.

## 🎨 Features

- **Artwork Gallery**: Browse available fractional art investments
- **Investment Interface**: Purchase fractional shares with real-time calculations
- **Portfolio Dashboard**: Track investments and performance
- **KYC Verification**: Complete identity verification for compliance
- **Wallet Integration**: Connect with Phantom, Solflare, and other Solana wallets
- **Responsive Design**: Beautiful UI that works on all devices

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Solana wallet (Phantom, Solflare, etc.)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your Solana RPC URL:
```
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

3. Start the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Architecture

### Core Components

- **Providers**: Wallet connection, data access, and React Query
- **Components**: Reusable UI components (ArtCard, PurchaseComponent, etc.)
- **Pages**: Main application pages (Home, Portfolio, KYC, etc.)
- **Lib**: SDK integration, data access hooks, and utilities

### Key Files

```
src/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Home page
│   ├── portfolio/         # Portfolio page
│   ├── artwork/[id]/      # Artwork detail page
│   └── kyc/              # KYC verification page
├── components/            # React components
│   ├── art-card.tsx      # Artwork display card
│   ├── purchase-component.tsx # Investment interface
│   ├── header.tsx        # Navigation header
│   └── ui/               # Reusable UI components
├── providers/            # React context providers
│   ├── providers.tsx     # Main provider setup
│   └── data-access-provider.tsx # Data access context
├── lib/                  # Utilities and SDK
│   ├── sdk.ts            # Solana program integration
│   ├── data-access.ts    # Data fetching hooks
│   └── utils.ts          # Helper functions
└── idl/                  # Anchor program IDL
    └── rwa.json          # Program interface definition
```

## 🔧 Configuration

### Wallet Adapters

The app supports multiple Solana wallets:
- Phantom
- Solflare  
- Torus

### Data Access

The `DataAccessProvider` provides:
- Artwork listings
- User investments
- KYC status
- Vault data

### Mock Data

For development and demos, the app uses mock data. In production, this would connect to:
- Solana program accounts
- IPFS for artwork metadata
- Real KYC providers

## 🎯 User Flow

1. **Connect Wallet**: User connects their Solana wallet
2. **Browse Artworks**: View available fractional art investments
3. **Complete KYC**: Verify identity for compliance
4. **Purchase Shares**: Buy fractional ownership tokens
5. **Track Portfolio**: Monitor investments and performance

## 🛠️ Development

### Adding New Components

1. Create component in `src/components/`
2. Export from appropriate index file
3. Add to relevant page

### Styling

- Uses Tailwind CSS for styling
- Custom CSS variables for theming
- Responsive design patterns

### State Management

- React Query for server state
- Context providers for app state
- Local state with useState/useReducer

## 📱 Pages

### Home Page (`/`)
- Hero section with platform overview
- Featured artworks gallery
- Platform statistics and benefits
- Call-to-action sections

### Artwork Detail (`/artwork/[id]`)
- Full artwork information
- Investment interface
- Purchase component with calculations
- Security and compliance info

### Portfolio (`/portfolio`)
- Investment overview dashboard
- Individual investment cards
- Performance tracking
- Secondary market access

### KYC (`/kyc`)
- Identity verification form
- Demo verification options
- Status tracking
- Compliance information

## 🔐 Security

- Wallet-based authentication
- KYC verification requirements
- Input validation and sanitization
- Secure transaction handling

## 🚀 Deployment

### Build for Production

```bash
pnpm build
```

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Environment Variables

- `NEXT_PUBLIC_SOLANA_RPC_URL`: Solana RPC endpoint
- `NEXT_PUBLIC_PROGRAM_ID`: Anchor program ID

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Join our Discord community
- Check the documentation

---

Built with ❤️ for the Solana ecosystem