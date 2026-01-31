# Supabase Setup Guide for CertChain

This guide will walk you through setting up Supabase as the backend and database for your CertChain application.

## 📋 Prerequisites

- A Supabase account (free tier available)
- Basic understanding of SQL
- Your CertChain project running locally

## 🚀 Step 1: Create Supabase Project

1. **Go to Supabase Dashboard**
   - Visit [https://supabase.com](https://supabase.com)
   - Click "Start your project" or "Sign in"

2. **Create Account/Sign In**
   - Sign up with GitHub, Google, or email
   - Verify your email if required

3. **Create New Project**
   - Click "New Project"
   - Choose your organization (or create one)
   - Fill in project details:
     - **Name**: `certchain` (or your preferred name)
     - **Database Password**: Create a strong password (save this!)
     - **Region**: Choose closest to your location
     - **Pricing Plan**: Free tier is sufficient for development

4. **Wait for Setup**
   - Project creation takes 1-2 minutes
   - You'll see a progress indicator

## 🔑 Step 2: Get API Keys

1. **Navigate to Settings**
   - In your project dashboard, click "Settings" in the sidebar
   - Click "API" under Project Settings

2. **Copy Your Credentials**
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)
   - **Service Role Key**: Keep this secret! (for server-side operations)

3. **Update Environment Variables**
   - Open your `.env` file in the project root
   - Update with your actual values:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   
   # Other existing variables
   VITE_CONTRACT_ADDRESS=0xYourContractAddressHere
   VITE_CHAIN_ID=80001
   VITE_WEB3_STORAGE_TOKEN=your_web3_storage_token
   ```

## 🗄️ Step 3: Set Up Database Schema

1. **Open SQL Editor**
   - In Supabase dashboard, click "SQL Editor" in sidebar
   - Click "New Query"

2. **Create Tables**
   Copy and paste this SQL code, then click "Run":

```sql
-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('issuer', 'verifier', 'user')) DEFAULT 'user',
  organization TEXT,
  wallet_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id SERIAL PRIMARY KEY,
  token_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  issued_to TEXT NOT NULL,
  issuer TEXT NOT NULL,
  organization TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  certificate_type TEXT NOT NULL,
  ipfs_hash TEXT NOT NULL,
  blockchain_tx_hash TEXT,
  is_revoked BOOLEAN DEFAULT FALSE,
  issuer_wallet_address TEXT NOT NULL,
  recipient_wallet_address TEXT,
  additional_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create certificate verifications table
CREATE TABLE IF NOT EXISTS certificate_verifications (
  id SERIAL PRIMARY KEY,
  certificate_id INTEGER REFERENCES certificates(id),
  token_id INTEGER NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verifier_ip TEXT,
  user_agent TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_certificates_token_id ON certificates(token_id);
CREATE INDEX IF NOT EXISTS idx_certificates_issuer_wallet ON certificates(issuer_wallet_address);
CREATE INDEX IF NOT EXISTS idx_certificates_issued_to ON certificates(issued_to);
CREATE INDEX IF NOT EXISTS idx_certificates_organization ON certificates(organization);
CREATE INDEX IF NOT EXISTS idx_verifications_token_id ON certificate_verifications(token_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_verifications ENABLE ROW LEVEL SECURITY;
```

3. **Set Up Row Level Security Policies**
   Run this SQL to create security policies:

```sql
-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Certificates policies
CREATE POLICY "Anyone can view certificates" ON certificates
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert certificates" ON certificates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Certificate issuers can update their certificates" ON certificates
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE wallet_address = certificates.issuer_wallet_address
    )
  );

-- Certificate verifications policies
CREATE POLICY "Anyone can insert verifications" ON certificate_verifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view verifications" ON certificate_verifications
  FOR SELECT USING (true);
```

4. **Create Functions for Better Performance**
   Run this SQL to create helper functions:

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON certificates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 🔐 Step 4: Configure Authentication

1. **Enable Email Authentication**
   - Go to "Authentication" → "Settings" in Supabase dashboard
   - Under "Auth Providers", ensure "Email" is enabled
   - Set "Enable email confirmations" to OFF for development (you can enable later)

2. **Configure Site URL**
   - In Authentication Settings, set:
   - **Site URL**: `http://localhost:5173`
   - **Redirect URLs**: Add `http://localhost:5173/**`

3. **Email Templates (Optional)**
   - Go to "Authentication" → "Email Templates"
   - Customize signup/reset password emails if needed

## 🧪 Step 5: Test the Setup

1. **Restart Your Development Server**
   ```bash
   npm run dev
   ```

2. **Test User Registration**
   - Go to your app at `http://localhost:5173`
   - Try to sign up with a test email
   - Check Supabase dashboard → Authentication → Users

3. **Test Database Connection**
   - After signing up, check if a profile was created
   - Go to Supabase dashboard → Table Editor → profiles

## 🔧 Step 6: Optional Configurations

### Enable Real-time (Optional)
```sql
-- Enable real-time for certificates table
ALTER PUBLICATION supabase_realtime ADD TABLE certificates;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
```

### Add Sample Data (Optional)
```sql
-- Insert sample certificate types
INSERT INTO certificates (
  token_id, name, issued_to, issuer, organization, 
  issue_date, certificate_type, ipfs_hash, 
  issuer_wallet_address
) VALUES 
(1, 'Sample Certificate', 'John Doe', 'Jane Smith', 'Test University', 
 '2024-01-15', 'academic', 'QmSampleHash123', '0x1234567890123456789012345678901234567890');
```

## 🚨 Troubleshooting

### Common Issues:

1. **"Invalid API Key" Error**
   - Double-check your `.env` file
   - Ensure no extra spaces in the keys
   - Restart your dev server after updating `.env`

2. **"Row Level Security" Errors**
   - Make sure RLS policies are created
   - Check if user is authenticated
   - Verify policy conditions

3. **Database Connection Issues**
   - Verify your project URL is correct
   - Check if your Supabase project is active
   - Ensure you're using the anon key, not service key

4. **Authentication Not Working**
   - Check Site URL configuration
   - Verify email provider settings
   - Look at browser network tab for errors

### Getting Help:

- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Discord Community**: [https://discord.supabase.com](https://discord.supabase.com)
- **GitHub Issues**: Check the project repository

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] API keys copied to `.env` file
- [ ] Database tables created successfully
- [ ] Row Level Security policies applied
- [ ] Authentication configured
- [ ] Development server running without errors
- [ ] Can sign up/sign in users
- [ ] Database operations working

## 🎉 Next Steps

Once Supabase is set up:

1. **Deploy Smart Contract** - Deploy your CertNFT contract to Polygon Mumbai
2. **Get Web3.Storage Token** - For IPFS storage
3. **Test Certificate Issuance** - Try issuing a test certificate
4. **Configure Production** - Set up production Supabase project when ready

Your CertChain application should now be fully functional with Supabase as the backend!