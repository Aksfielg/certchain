# CertChain - Blockchain Certificate Verification System
<img width="1919" height="866" alt="image" src="https://github.com/user-attachments/assets/076c5a80-d351-4e0f-b3cb-871a547f43bf" />
<img width="1884" height="775" alt="image" src="https://github.com/user-attachments/assets/0e3d1139-0028-48df-b5d3-1b03a6280ba4" />



CertChain is a decentralized application (dApp) for issuing, managing, and verifying digital certificates using blockchain technology. It uses Polygon Mumbai blockchain for storing certificates as NFTs and IPFS for decentralized storage of certificate data.

## Features

- Issue digital certificates as NFTs on the Polygon Mumbai blockchain
- Store certificate data on IPFS for decentralized, permanent storage
- Verify certificate authenticity using blockchain
- View all issued certificates in a dashboard
- Batch upload multiple certificates
- Revoke certificates if needed
- Supabase integration for user authentication and database storage

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Blockchain**: Ethereum/Polygon, Solidity, ethers.js
- **Storage**: IPFS via Web3.Storage
- **Backend/Auth**: Supabase (Authentication, PostgreSQL Database)
- **Development**: Vite, ESLint

## Prerequisites

Before setting up the project, make sure you have:

- Node.js (v14 or higher) and npm
- MetaMask browser extension
- A Web3.Storage account and API token
- A Supabase project (for authentication and database)
- Test MATIC tokens from the Polygon Mumbai Faucet (for testing)

## Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/certchain.git
cd certchain
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up MetaMask Wallet**

Follow the detailed guide in `METAMASK_SETUP.md` to:
- Install and configure MetaMask
- Add Polygon Mumbai testnet
- Get test MATIC tokens
- Connect wallet to the application

4. **Deploy Smart Contract**

Follow the detailed guide in `SMART_CONTRACT_SETUP.md` to:
- Deploy the CertNFT contract to Polygon Mumbai
- Get the contract address
- Verify the deployment

5. **Set up Web3.Storage for IPFS**

Follow the detailed guide in `WEB3_STORAGE_SETUP.md` to:
- Create Web3.Storage account
- Generate API token
- Configure IPFS storage

6. **Set up Supabase Backend**

Follow the detailed guide in `SUPABASE_SETUP.md` to:
- Create Supabase project
- Set up database schema
- Configure authentication
- Set up Row Level Security

7. **Configure environment variables**

Create a `.env` file in the root directory based on `.env.example`:

```
# MetaMask & Blockchain Configuration
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
VITE_CHAIN_ID=80001

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# IPFS Configuration
VITE_WEB3_STORAGE_TOKEN=your_web3_storage_token
```

8. **Start development server**

```bash
npm run dev
```

9. **Build for production**

```bash
npm run build
```

## 📚 Detailed Setup Guides

For complete setup instructions, follow these detailed guides in order:

1. **[MetaMask Setup](METAMASK_SETUP.md)** - Wallet configuration and testnet setup
2. **[Smart Contract Setup](SMART_CONTRACT_SETUP.md)** - Deploy and configure the blockchain contract
3. **[Web3.Storage Setup](WEB3_STORAGE_SETUP.md)** - Configure IPFS decentralized storage
4. **[Supabase Setup](SUPABASE_SETUP.md)** - Backend database and authentication

## 🔧 Quick Start Checklist

- [ ] MetaMask installed with Polygon Mumbai network
- [ ] Test MATIC tokens in wallet (at least 0.5 MATIC)
- [ ] Smart contract deployed to Mumbai testnet
- [ ] Web3.Storage account created with API token
- [ ] Supabase project set up with database schema
- [ ] All environment variables configured in `.env`
- [ ] Development server running successfully
- [ ] Can connect wallet and issue test certificate

## Smart Contract

The `CertNFT.sol` contract implements the ERC721 standard for NFTs with additional functionality for certificates:

- `mint`: Issues a new certificate
- `batchMint`: Issues multiple certificates at once
- `revokeCertificate`: Marks a certificate as revoked
- `getCert`: Retrieves certificate data
- `isCertificateRevoked`: Checks if a certificate has been revoked

## Supabase Integration

The application uses Supabase for:

1. **User Authentication**: Sign in/sign up functionality with email/password
2. **PostgreSQL Database**: Storing certificate metadata, user profiles, and verification records
3. **Real-time Updates**: Instant synchronization across all clients
4. **Row Level Security**: Fine-grained access control for data protection

## Project Structure

```
certchain/
├── public/               # Static assets
├── src/
│   ├── abis/            # Contract ABIs
│   ├── components/      # React components
│   ├── contexts/        # Context providers (Wallet, Auth)
│   ├── contracts/       # Smart contract source
│   ├── supabase/        # Supabase configuration
│   ├── pages/           # Page components
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Application entry point
├── .env.example         # Example environment variables
├── package.json         # Project dependencies
└── vite.config.js       # Vite configuration
```

## License

This project is licensed under the MIT License.

## Acknowledgments

- OpenZeppelin for the ERC721 implementation
- Web3.Storage for IPFS storage
- Polygon for the Mumbai testnet
- Supabase for authentication and database services
