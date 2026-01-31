# MetaMask Setup Guide for CertChain

This guide will help you set up MetaMask wallet and connect it to the Polygon Mumbai testnet for CertChain development and testing.

## 📋 Prerequisites

- A modern web browser (Chrome, Firefox, Edge, or Brave)
- Basic understanding of cryptocurrency wallets
- Internet connection

## 🦊 Step 1: Install MetaMask

### Option A: Browser Extension (Recommended)

1. **Visit MetaMask Website**
   - Go to [https://metamask.io](https://metamask.io)
   - Click "Download" button

2. **Install Extension**
   - Choose your browser (Chrome, Firefox, Edge, Brave)
   - Click "Install MetaMask for [Your Browser]"
   - Add the extension to your browser

3. **Pin Extension (Optional)**
   - Click the puzzle piece icon in your browser
   - Pin MetaMask for easy access

### Option B: Mobile App

1. **Download from App Store**
   - iOS: Search "MetaMask" in App Store
   - Android: Search "MetaMask" in Google Play Store

2. **Install and Open**
   - Download and install the app
   - Open MetaMask mobile app

## 🔐 Step 2: Create or Import Wallet

### For New Users (Create New Wallet)

1. **Get Started**
   - Open MetaMask extension/app
   - Click "Get Started"
   - Click "Create a Wallet"

2. **Set Password**
   - Create a strong password (8+ characters)
   - Check the terms and conditions
   - Click "Create"

3. **Secure Your Wallet**
   - Watch the security video (recommended)
   - Click "Next"

4. **Backup Secret Recovery Phrase**
   - **CRITICAL**: Write down your 12-word recovery phrase
   - Store it in a safe place (NOT on your computer)
   - Click "Next"
   - Confirm your recovery phrase
   - Click "Confirm"

### For Existing Users (Import Wallet)

1. **Import Existing Wallet**
   - Click "Import wallet"
   - Enter your 12-word recovery phrase
   - Set a new password
   - Click "Import"

## 🌐 Step 3: Add Polygon Mumbai Testnet

### Automatic Setup (Recommended)

1. **Visit Chainlist**
   - Go to [https://chainlist.org](https://chainlist.org)
   - Search for "Mumbai"
   - Find "Polygon Mumbai" (Chain ID: 80001)
   - Click "Connect Wallet"
   - Click "Add to MetaMask"

### Manual Setup

1. **Open MetaMask**
   - Click the network dropdown (usually shows "Ethereum Mainnet")
   - Click "Add Network"

2. **Add Network Details**
   ```
   Network Name: Polygon Mumbai
   New RPC URL: https://rpc-mumbai.maticvigil.com/
   Chain ID: 80001
   Currency Symbol: MATIC
   Block Explorer URL: https://mumbai.polygonscan.com/
   ```

3. **Save Network**
   - Click "Save"
   - Switch to "Polygon Mumbai" network

## 💰 Step 4: Get Test MATIC Tokens

### Using Polygon Faucet

1. **Visit Polygon Faucet**
   - Go to [https://faucet.polygon.technology/](https://faucet.polygon.technology/)
   - Select "Mumbai" network
   - Select "MATIC Token"

2. **Get Your Wallet Address**
   - Open MetaMask
   - Click on your account name to copy address
   - It looks like: `0x1234...5678`

3. **Request Tokens**
   - Paste your wallet address in the faucet
   - Complete any verification (captcha, etc.)
   - Click "Submit"
   - Wait 1-2 minutes for tokens to arrive

### Alternative Faucets

If the main faucet doesn't work, try these:

- **Alchemy Faucet**: [https://mumbaifaucet.com/](https://mumbaifaucet.com/)
- **QuickNode Faucet**: [https://faucet.quicknode.com/polygon/mumbai](https://faucet.quicknode.com/polygon/mumbai)

## 🔗 Step 5: Connect to CertChain

1. **Open CertChain Application**
   - Go to `http://localhost:5173`
   - You should see the CertChain homepage

2. **Connect Wallet**
   - Click "Connect Wallet" button
   - MetaMask popup will appear
   - Click "Next" then "Connect"
   - Approve the connection

3. **Verify Connection**
   - Your wallet address should appear in the header
   - You should see your MATIC balance
   - Network should show "Polygon Mumbai"

## ⚠️ Step 6: Troubleshooting

### Common Issues

1. **"Wrong Network" Warning**
   - Make sure you're on Polygon Mumbai (Chain ID: 80001)
   - Click the network dropdown and switch networks

2. **No MATIC Tokens**
   - Use the faucet to get test tokens
   - Wait a few minutes for tokens to arrive
   - Refresh your wallet

3. **Connection Failed**
   - Refresh the page and try again
   - Make sure MetaMask is unlocked
   - Check if you have the latest MetaMask version

4. **Transaction Fails**
   - Ensure you have enough MATIC for gas fees
   - Try increasing gas limit in MetaMask
   - Wait and retry if network is congested

### Reset Connection

If you need to reset the connection:

1. **In MetaMask**
   - Go to Settings → Advanced
   - Click "Reset Account" (this clears transaction history)

2. **In Browser**
   - Clear browser cache for localhost:5173
   - Disconnect and reconnect wallet

## 🔒 Security Best Practices

### Wallet Security

1. **Never Share Your Recovery Phrase**
   - Don't store it digitally
   - Don't share it with anyone
   - Write it down and store safely

2. **Use Strong Passwords**
   - Use unique password for MetaMask
   - Enable browser password manager

3. **Verify URLs**
   - Always check you're on the correct website
   - Bookmark important sites

### Development Safety

1. **Use Testnet Only**
   - Never use mainnet for development
   - Mumbai testnet tokens have no real value

2. **Separate Development Wallet**
   - Consider using a separate wallet for development
   - Don't use your main wallet with real funds

## 📱 Mobile Setup (Optional)

### MetaMask Mobile

1. **Install MetaMask Mobile**
   - Download from official app stores
   - Import your existing wallet or create new

2. **Connect to DApp**
   - Open MetaMask browser in the app
   - Navigate to your CertChain URL
   - Connect wallet as usual

### WalletConnect (Advanced)

For connecting mobile wallets to desktop apps:

1. **Enable WalletConnect**
   - This requires additional setup in the app
   - Useful for mobile-first workflows

## ✅ Verification Checklist

Before proceeding with CertChain:

- [ ] MetaMask installed and set up
- [ ] Wallet created or imported successfully
- [ ] Polygon Mumbai network added
- [ ] Test MATIC tokens received (at least 0.1 MATIC)
- [ ] Successfully connected to CertChain app
- [ ] Can see wallet address in app header
- [ ] Network shows as "Polygon Mumbai"

## 🎯 Next Steps

Once MetaMask is set up:

1. **Deploy Smart Contract** - Follow `SMART_CONTRACT_SETUP.md`
2. **Complete Supabase Setup** - Follow `SUPABASE_SETUP.md`
3. **Test Certificate Issuance** - Try creating your first certificate
4. **Verify Certificates** - Test the verification system

Your MetaMask wallet is now ready for CertChain development and testing!

## 📞 Getting Help

- **MetaMask Support**: [https://metamask.zendesk.com](https://metamask.zendesk.com)
- **Polygon Docs**: [https://docs.polygon.technology](https://docs.polygon.technology)
- **CertChain Issues**: Check the project repository