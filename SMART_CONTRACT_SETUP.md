# Smart Contract Setup Guide for CertChain

This guide will help you deploy the CertNFT smart contract to Polygon Mumbai testnet and integrate it with your CertChain application.

## 📋 Prerequisites

- MetaMask wallet set up with Polygon Mumbai testnet
- Test MATIC tokens (at least 0.5 MATIC for deployment)
- Node.js and npm installed
- Basic understanding of smart contracts

## 🛠️ Step 1: Choose Deployment Method

### Option A: Using Remix IDE (Recommended for Beginners)

**Remix IDE** is a web-based development environment that's perfect for beginners.

### Option B: Using Hardhat (Advanced)

**Hardhat** is a professional development framework for more advanced users.

---

## 🌐 Method A: Deploy with Remix IDE

### Step 1: Open Remix IDE

1. **Go to Remix**
   - Visit [https://remix.ethereum.org](https://remix.ethereum.org)
   - Wait for the IDE to load

2. **Create New File**
   - In the file explorer, click the "+" icon
   - Name it `CertNFT.sol`

### Step 2: Add Smart Contract Code

Copy and paste this complete smart contract code:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title CertNFT
 * @dev Contract for issuing certificates as NFTs on the blockchain
 */
contract CertNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    
    // State variables
    Counters.Counter private _tokenIds;
    
    // Certificate data structure
    struct CertData {
        string ipfsHash;
        string name;
        string issuer;
        string issueDate;
    }
    
    // Mappings to store certificate data and revocation status
    mapping(uint256 => CertData) public certData;
    mapping(uint256 => bool) public revokedCerts;
    
    // Events
    event CertificateIssued(uint256 indexed tokenId, string ipfsHash, string name, string indexed issuer);
    event CertificateRevoked(uint256 indexed tokenId);
    
    // Constructor
    constructor() ERC721("DigitalCertificate", "DCERT") {}
    
    /**
     * @dev Issue a new certificate
     * @param to Address to mint the certificate to
     * @param ipfsHash IPFS hash of the certificate data
     * @param name Name of the certificate
     * @param issuer Name of the issuer
     * @param issueDate Date of issuance
     */
    function mint(
        address to,
        string memory ipfsHash,
        string memory name,
        string memory issuer,
        string memory issueDate
    ) public returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        certData[newTokenId] = CertData(ipfsHash, name, issuer, issueDate);
        _safeMint(to, newTokenId);
        
        emit CertificateIssued(newTokenId, ipfsHash, name, issuer);
        return newTokenId;
    }
    
    /**
     * @dev Issue multiple certificates at once
     * @param to Address to mint certificates to
     * @param ipfsHashes Array of IPFS hashes
     * @param names Array of certificate names
     * @param issuers Array of issuer names
     * @param issueDates Array of issuance dates
     */
    function batchMint(
        address to,
        string[] memory ipfsHashes,
        string[] memory names,
        string[] memory issuers,
        string[] memory issueDates
    ) public {
        require(
            ipfsHashes.length == names.length &&
            names.length == issuers.length &&
            issuers.length == issueDates.length,
            "Array lengths must match"
        );
        
        for (uint256 i = 0; i < ipfsHashes.length; i++) {
            mint(to, ipfsHashes[i], names[i], issuers[i], issueDates[i]);
        }
    }
    
    /**
     * @dev Revoke a certificate
     * @param tokenId Token ID of the certificate to revoke
     */
    function revokeCertificate(uint256 tokenId) public onlyOwner {
        require(_exists(tokenId), "Certificate does not exist");
        revokedCerts[tokenId] = true;
        
        emit CertificateRevoked(tokenId);
    }
    
    /**
     * @dev Check if a certificate is revoked
     * @param tokenId Token ID of the certificate to check
     * @return bool indicating if the certificate is revoked
     */
    function isCertificateRevoked(uint256 tokenId) public view returns (bool) {
        return revokedCerts[tokenId];
    }
    
    /**
     * @dev Get certificate data
     * @param tokenId Token ID of the certificate
     * @return CertData structure containing certificate data
     */
    function getCert(uint256 tokenId) public view returns (CertData memory) {
        require(_exists(tokenId), "Certificate does not exist");
        return certData[tokenId];
    }
    
    /**
     * @dev Get next token ID
     * @return Next token ID that will be minted
     */
    function nextId() public view returns (uint256) {
        return _tokenIds.current() + 1;
    }
    
    /**
     * @dev Override tokenURI to return IPFS hash
     * @param tokenId Token ID
     * @return Token URI
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return string(abi.encodePacked("https://", certData[tokenId].ipfsHash, ".ipfs.w3s.link"));
    }
}
```

### Step 3: Compile the Contract

1. **Go to Solidity Compiler**
   - Click the Solidity icon in the left sidebar
   - Select compiler version `0.8.19` or higher

2. **Compile Contract**
   - Click "Compile CertNFT.sol"
   - Wait for compilation to complete
   - Check for any errors (should be none)

### Step 4: Deploy to Mumbai

1. **Go to Deploy & Run**
   - Click the Ethereum icon in the left sidebar
   - Change environment to "Injected Provider - MetaMask"

2. **Connect MetaMask**
   - MetaMask popup will appear
   - Make sure you're on Polygon Mumbai network
   - Click "Connect"

3. **Deploy Contract**
   - Select "CertNFT" from the contract dropdown
   - Click "Deploy"
   - Confirm transaction in MetaMask
   - Wait for deployment (1-2 minutes)

4. **Copy Contract Address**
   - After deployment, you'll see the contract address
   - Copy this address (starts with 0x...)
   - Save it for later use

---

## ⚡ Method B: Deploy with Hardhat (Advanced)

### Step 1: Set Up Hardhat Project

1. **Create New Directory**
   ```bash
   mkdir certchain-contracts
   cd certchain-contracts
   ```

2. **Initialize Project**
   ```bash
   npm init -y
   npm install --save-dev hardhat
   npx hardhat
   ```
   - Choose "Create a JavaScript project"
   - Accept all defaults

3. **Install Dependencies**
   ```bash
   npm install @openzeppelin/contracts
   npm install --save-dev @nomiclabs/hardhat-ethers ethers
   ```

### Step 2: Configure Hardhat

1. **Update hardhat.config.js**
   ```javascript
   require("@nomiclabs/hardhat-ethers");

   module.exports = {
     solidity: "0.8.19",
     networks: {
       mumbai: {
         url: "https://rpc-mumbai.maticvigil.com/",
         accounts: ["YOUR_PRIVATE_KEY_HERE"] // Replace with your private key
       }
     }
   };
   ```

2. **Get Private Key**
   - In MetaMask: Account Details → Export Private Key
   - **NEVER share this key or commit it to version control**

### Step 3: Create Contract

1. **Create contracts/CertNFT.sol**
   - Use the same contract code from Method A above

### Step 4: Create Deployment Script

1. **Create scripts/deploy.js**
   ```javascript
   async function main() {
     const CertNFT = await ethers.getContractFactory("CertNFT");
     const certNFT = await CertNFT.deploy();
     
     await certNFT.deployed();
     
     console.log("CertNFT deployed to:", certNFT.address);
   }
   
   main()
     .then(() => process.exit(0))
     .catch((error) => {
       console.error(error);
       process.exit(1);
     });
   ```

### Step 5: Deploy

1. **Deploy to Mumbai**
   ```bash
   npx hardhat run scripts/deploy.js --network mumbai
   ```

2. **Save Contract Address**
   - Copy the deployed contract address from the output

---

## 🔧 Step 2: Update CertChain Application

### Update Environment Variables

1. **Open .env file**
   ```env
   # Add your deployed contract address
   VITE_CONTRACT_ADDRESS=0xYourContractAddressHere
   VITE_CHAIN_ID=80001
   
   # Your existing Supabase config
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   
   # Your Web3.Storage token
   VITE_WEB3_STORAGE_TOKEN=your_web3_storage_token
   ```

### Update Contract ABI (if needed)

1. **Copy ABI from Remix**
   - In Remix, go to contracts/CertNFT.sol
   - In the compilation artifacts, copy the ABI
   - Update `src/abis/CertNFT.json` if different

---

## 🧪 Step 3: Test the Integration

### Test Contract Functions

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test Certificate Issuance**
   - Go to "Issue Certificate" page
   - Fill in certificate details
   - Click "Issue Certificate"
   - Confirm transaction in MetaMask

3. **Test Certificate Verification**
   - Go to "Verify Certificate" page
   - Enter the token ID from issuance
   - Verify the certificate appears correctly

### Verify on Block Explorer

1. **Visit Mumbai PolygonScan**
   - Go to [https://mumbai.polygonscan.com](https://mumbai.polygonscan.com)
   - Search for your contract address
   - View transactions and contract interactions

---

## 🔍 Step 4: Contract Verification (Optional)

### Verify on PolygonScan

1. **Go to Contract Page**
   - Visit your contract on mumbai.polygonscan.com
   - Click "Contract" tab
   - Click "Verify and Publish"

2. **Enter Details**
   - Compiler Type: Solidity (Single file)
   - Compiler Version: v0.8.19
   - License: MIT
   - Paste your contract source code

3. **Submit for Verification**
   - Click "Verify and Publish"
   - Wait for verification (few minutes)

---

## ⚠️ Troubleshooting

### Common Issues

1. **Deployment Fails**
   - Check you have enough MATIC (need ~0.1 MATIC)
   - Ensure you're on Mumbai network
   - Try increasing gas limit

2. **Contract Interaction Fails**
   - Verify contract address in .env
   - Check ABI matches deployed contract
   - Ensure wallet is connected

3. **Transaction Reverts**
   - Check function parameters
   - Ensure you have permission (owner functions)
   - Verify contract state

### Gas Optimization

1. **Estimate Gas Costs**
   - Deployment: ~2-3 million gas
   - Mint: ~100,000 gas
   - Batch mint: ~100,000 gas per certificate

2. **Reduce Costs**
   - Use batch functions for multiple operations
   - Deploy during low network usage
   - Optimize contract code if needed

---

## 📊 Step 5: Monitor and Maintain

### Track Contract Usage

1. **Monitor Events**
   - Use PolygonScan to view events
   - Track CertificateIssued events
   - Monitor CertificateRevoked events

2. **Analytics Dashboard**
   - Consider adding analytics to your app
   - Track certificate issuance trends
   - Monitor verification requests

### Contract Upgrades

1. **Proxy Patterns**
   - For production, consider upgradeable contracts
   - Use OpenZeppelin's proxy patterns
   - Plan upgrade strategy

2. **Migration Strategy**
   - Plan for contract migrations
   - Backup important data
   - Test thoroughly before production

---

## ✅ Verification Checklist

- [ ] Smart contract compiled successfully
- [ ] Contract deployed to Mumbai testnet
- [ ] Contract address saved and added to .env
- [ ] Test certificate issuance works
- [ ] Test certificate verification works
- [ ] Contract verified on PolygonScan (optional)
- [ ] All functions working in CertChain app

## 🎯 Next Steps

Once your smart contract is deployed:

1. **Complete Supabase Setup** - Follow `SUPABASE_SETUP.md`
2. **Get Web3.Storage Token** - For IPFS storage
3. **Test Full Workflow** - Issue and verify certificates
4. **Deploy to Production** - When ready for mainnet

Your CertChain smart contract is now deployed and ready for use!

## 📞 Getting Help

- **Hardhat Docs**: [https://hardhat.org/docs](https://hardhat.org/docs)
- **OpenZeppelin**: [https://docs.openzeppelin.com](https://docs.openzeppelin.com)
- **Polygon Docs**: [https://docs.polygon.technology](https://docs.polygon.technology)
- **Remix IDE**: [https://remix-ide.readthedocs.io](https://remix-ide.readthedocs.io)