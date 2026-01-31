# Web3.Storage Setup Guide for CertChain

This guide will help you set up Web3.Storage for IPFS storage in your CertChain application. Web3.Storage provides free, decentralized storage for your certificate data.

## 📋 Prerequisites

- A valid email address
- GitHub account (recommended for easier signup)
- Basic understanding of IPFS and decentralized storage

## 🌐 Step 1: Create Web3.Storage Account

### Sign Up Process

1. **Visit Web3.Storage**
   - Go to [https://web3.storage](https://web3.storage)
   - Click "Sign Up" or "Get Started"

2. **Choose Sign-Up Method**
   - **Option A**: Sign up with GitHub (recommended)
   - **Option B**: Sign up with email address

3. **Complete Registration**
   - Follow the verification process
   - Check your email for verification link
   - Complete account setup

### Account Verification

1. **Verify Email**
   - Check your inbox for verification email
   - Click the verification link
   - Return to Web3.Storage dashboard

2. **Complete Profile**
   - Add your name and organization (optional)
   - Accept terms of service
   - Complete onboarding

## 🔑 Step 2: Generate API Token

### Create New Token

1. **Access API Tokens**
   - Log in to your Web3.Storage dashboard
   - Navigate to "Account" → "API Tokens"
   - Click "Create an API Token"

2. **Configure Token**
   - **Name**: `CertChain Development` (or your preferred name)
   - **Description**: `Token for CertChain certificate storage`
   - Click "Create"

3. **Copy Token**
   - **IMPORTANT**: Copy the token immediately
   - Store it securely (you won't see it again)
   - The token looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Token Security

⚠️ **Security Best Practices:**
- Never commit tokens to version control
- Store tokens in environment variables only
- Regenerate tokens if compromised
- Use different tokens for development/production

## 🔧 Step 3: Configure CertChain

### Update Environment Variables

1. **Open .env File**
   ```env
   # Web3.Storage Configuration
   VITE_WEB3_STORAGE_TOKEN=your_web3_storage_token_here
   
   # Your existing configuration
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   VITE_CONTRACT_ADDRESS=your_contract_address
   VITE_CHAIN_ID=80001
   ```

2. **Restart Development Server**
   ```bash
   npm run dev
   ```

### Verify Integration

1. **Check IPFS Utils**
   - The `src/utils/ipfsUtils.ts` file should automatically use your token
   - No additional configuration needed

2. **Test Upload Function**
   - Try issuing a test certificate
   - Check browser console for IPFS upload logs
   - Verify no authentication errors

## 🧪 Step 4: Test IPFS Integration

### Test Certificate Upload

1. **Issue Test Certificate**
   - Go to "Issue Certificate" page
   - Fill in test data:
     ```
     Certificate Name: Test Certificate
     Recipient: John Doe
     Issuer: Test Issuer
     Organization: Test Org
     Issue Date: Today's date
     Certificate Type: Course Completion
     ```

2. **Monitor Upload Process**
   - Open browser developer tools
   - Watch console for IPFS upload messages
   - Should see "Uploading to IPFS..." and "File uploaded to IPFS successfully!"

3. **Verify IPFS Storage**
   - After successful upload, you'll get a CID (Content Identifier)
   - Visit: `https://[CID].ipfs.w3s.link` to view stored data
   - Example: `https://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi.ipfs.w3s.link`

### Test Certificate Verification

1. **Verify Uploaded Certificate**
   - Go to "Verify Certificate" page
   - Enter the token ID from your test certificate
   - Should successfully retrieve and display certificate data

2. **Check IPFS Retrieval**
   - Console should show "Retrieving from IPFS..." and success message
   - Certificate details should populate correctly

## 📊 Step 5: Monitor Usage

### Web3.Storage Dashboard

1. **View Storage Stats**
   - Log in to Web3.Storage dashboard
   - Check "Storage" section for usage statistics
   - Monitor uploaded files and storage used

2. **File Management**
   - View all uploaded files
   - Check file sizes and upload dates
   - Monitor IPFS pin status

### Usage Limits

**Free Tier Includes:**
- 1TB of storage
- Unlimited bandwidth
- Unlimited requests
- No time limits

**Best Practices:**
- Monitor storage usage regularly
- Clean up test files periodically
- Optimize file sizes when possible

## 🔍 Step 6: Advanced Configuration

### Custom IPFS Gateways

You can configure custom IPFS gateways in `src/utils/ipfsUtils.ts`:

```typescript
// Alternative gateways for better performance
const IPFS_GATEWAYS = [
  'https://w3s.link/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/'
];

export const getIPFSGatewayURL = (cid: string, gatewayIndex = 0): string => {
  const gateway = IPFS_GATEWAYS[gatewayIndex] || IPFS_GATEWAYS[0];
  return `${gateway}${cid}`;
};
```

### Error Handling

Enhanced error handling for IPFS operations:

```typescript
export const uploadToIPFS = async (file: File): Promise<string> => {
  try {
    const client = new Web3Storage({ 
      token: import.meta.env.VITE_WEB3_STORAGE_TOKEN 
    });
    
    if (!client.token) {
      throw new Error('Web3.Storage token not configured');
    }
    
    const cid = await client.put([file], {
      name: file.name,
      maxRetries: 3,
      wrapWithDirectory: false
    });
    
    return cid;
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error(`Failed to upload to IPFS: ${error.message}`);
  }
};
```

## ⚠️ Troubleshooting

### Common Issues

1. **"Invalid API Token" Error**
   - Check token is correctly copied to .env
   - Ensure no extra spaces or characters
   - Verify token hasn't expired
   - Try regenerating token

2. **Upload Fails**
   - Check internet connection
   - Verify file size (max 100MB per file)
   - Try uploading smaller test file
   - Check Web3.Storage service status

3. **Retrieval Fails**
   - IPFS propagation can take 1-2 minutes
   - Try different IPFS gateway
   - Check CID format is correct
   - Verify file was actually uploaded

4. **CORS Errors**
   - Web3.Storage should handle CORS automatically
   - If issues persist, check browser console
   - Try different browser or incognito mode

### Debug Mode

Enable debug logging in `src/utils/ipfsUtils.ts`:

```typescript
const DEBUG = import.meta.env.DEV;

export const uploadToIPFS = async (file: File): Promise<string> => {
  if (DEBUG) {
    console.log('Uploading file:', file.name, 'Size:', file.size);
  }
  
  try {
    // ... upload logic
    
    if (DEBUG) {
      console.log('Upload successful, CID:', cid);
    }
    
    return cid;
  } catch (error) {
    if (DEBUG) {
      console.error('Upload failed:', error);
    }
    throw error;
  }
};
```

## 🔄 Step 7: Production Considerations

### Separate Tokens

1. **Development Token**
   - Use for testing and development
   - Can be regenerated frequently
   - Store in `.env` (not committed)

2. **Production Token**
   - Use for live application
   - Store securely in production environment
   - Monitor usage carefully

### Backup Strategy

1. **Multiple Storage Providers**
   - Consider using multiple IPFS providers
   - Implement fallback mechanisms
   - Pin important content to multiple nodes

2. **Data Redundancy**
   - Store critical certificate data in multiple locations
   - Use Supabase as backup for metadata
   - Consider additional IPFS pinning services

## ✅ Verification Checklist

- [ ] Web3.Storage account created and verified
- [ ] API token generated and saved securely
- [ ] Token added to .env file
- [ ] Development server restarted
- [ ] Test certificate upload successful
- [ ] IPFS retrieval working correctly
- [ ] Dashboard shows uploaded files
- [ ] No console errors during operations

## 🎯 Next Steps

Once Web3.Storage is configured:

1. **Complete Smart Contract Setup** - Follow `SMART_CONTRACT_SETUP.md`
2. **Test Full Certificate Workflow** - Issue, store, and verify certificates
3. **Monitor Storage Usage** - Keep track of your storage consumption
4. **Plan Production Deployment** - Set up production tokens and monitoring

Your CertChain application now has decentralized storage capabilities!

## 📞 Getting Help

- **Web3.Storage Docs**: [https://web3.storage/docs](https://web3.storage/docs)
- **IPFS Documentation**: [https://docs.ipfs.io](https://docs.ipfs.io)
- **Web3.Storage Discord**: [https://discord.gg/KKucsCpK](https://discord.gg/KKucsCpK)
- **GitHub Issues**: [https://github.com/web3-storage/web3.storage](https://github.com/web3-storage/web3.storage)

## 💡 Additional Resources

- **IPFS Best Practices**: [https://docs.ipfs.io/concepts/best-practices](https://docs.ipfs.io/concepts/best-practices)
- **Web3.Storage Examples**: [https://github.com/web3-storage/web3.storage/tree/main/packages/client/examples](https://github.com/web3-storage/web3.storage/tree/main/packages/client/examples)
- **Decentralized Storage Guide**: [https://web3.storage/docs/concepts/decentralized-storage](https://web3.storage/docs/concepts/decentralized-storage)