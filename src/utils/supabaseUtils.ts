import { supabase } from '../supabase/config';
import toast from 'react-hot-toast';

// Certificate interface
interface CertificateData {
  name: string;
  issued_to: string;
  issuer: string;
  organization: string;
  issue_date: string;
  expiry_date?: string | null;
  certificate_type: string;
  ipfs_hash: string;
  blockchain_tx_hash?: string | null;
  issuer_wallet_address: string;
  recipient_wallet_address?: string | null;
  additional_details?: string | null;
  token_id?: number;
}

/**
 * Save certificate metadata to Supabase database
 */
export const saveCertificate = async (certificateData: CertificateData) => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .insert([certificateData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error saving certificate:', error);
    throw new Error(error.message || 'Failed to save certificate');
  }
};

/**
 * Get certificates by issuer wallet address
 */
export const getCertificatesByIssuer = async (walletAddress: string) => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('issuer_wallet_address', walletAddress)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching certificates by issuer:', error);
    throw new Error(error.message || 'Failed to fetch certificates');
  }
};

/**
 * Get certificate by token ID
 */
export const getCertificateByTokenId = async (tokenId: number) => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('token_id', tokenId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error: any) {
    console.error('Error fetching certificate by token ID:', error);
    throw new Error(error.message || 'Failed to fetch certificate');
  }
};

/**
 * Update certificate with token ID after blockchain minting
 */
export const updateCertificateTokenId = async (ipfsHash: string, tokenId: number, txHash?: string) => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .update({ 
        token_id: tokenId,
        blockchain_tx_hash: txHash,
        updated_at: new Date().toISOString()
      })
      .eq('ipfs_hash', ipfsHash)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error updating certificate token ID:', error);
    throw new Error(error.message || 'Failed to update certificate');
  }
};

/**
 * Mark certificate as revoked
 */
export const revokeCertificateInDB = async (tokenId: number) => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .update({ 
        is_revoked: true,
        updated_at: new Date().toISOString()
      })
      .eq('token_id', tokenId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error revoking certificate:', error);
    throw new Error(error.message || 'Failed to revoke certificate');
  }
};

/**
 * Search certificates by various criteria
 */
export const searchCertificates = async (searchTerm: string, walletAddress?: string) => {
  try {
    let query = supabase
      .from('certificates')
      .select('*');

    // If wallet address provided, filter by issuer
    if (walletAddress) {
      query = query.eq('issuer_wallet_address', walletAddress);
    }

    // Add search conditions
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,issued_to.ilike.%${searchTerm}%,issuer.ilike.%${searchTerm}%,organization.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error searching certificates:', error);
    throw new Error(error.message || 'Failed to search certificates');
  }
};

/**
 * Get certificate statistics for dashboard
 */
export const getCertificateStats = async (walletAddress: string) => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('is_revoked, expiry_date')
      .eq('issuer_wallet_address', walletAddress);

    if (error) throw error;

    const now = new Date();
    const stats = {
      total: data?.length || 0,
      valid: 0,
      revoked: 0,
      expired: 0
    };

    data?.forEach(cert => {
      if (cert.is_revoked) {
        stats.revoked++;
      } else if (cert.expiry_date && new Date(cert.expiry_date) <= now) {
        stats.expired++;
      } else {
        stats.valid++;
      }
    });

    return stats;
  } catch (error: any) {
    console.error('Error fetching certificate stats:', error);
    throw new Error(error.message || 'Failed to fetch statistics');
  }
};

/**
 * Record certificate verification attempt
 */
export const recordVerification = async (tokenId: number, verifierInfo?: any) => {
  try {
    const { data, error } = await supabase
      .from('certificate_verifications')
      .insert([{
        token_id: tokenId,
        verified_at: new Date().toISOString(),
        verifier_ip: verifierInfo?.ip || null,
        user_agent: verifierInfo?.userAgent || navigator.userAgent
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error recording verification:', error);
    // Don't throw error for verification recording failures
    return null;
  }
};

/**
 * Get verification history for a certificate
 */
export const getVerificationHistory = async (tokenId: number) => {
  try {
    const { data, error } = await supabase
      .from('certificate_verifications')
      .select('*')
      .eq('token_id', tokenId)
      .order('verified_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching verification history:', error);
    throw new Error(error.message || 'Failed to fetch verification history');
  }
};

/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    throw new Error(error.message || 'Failed to fetch user profile');
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, profileData: any) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    throw new Error(error.message || 'Failed to update profile');
  }
};

/**
 * Get certificates by recipient
 */
export const getCertificatesByRecipient = async (recipientName: string) => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .ilike('issued_to', `%${recipientName}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching certificates by recipient:', error);
    throw new Error(error.message || 'Failed to fetch certificates');
  }
};

/**
 * Get recent certificates (public)
 */
export const getRecentCertificates = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('name, issuer, organization, issue_date, certificate_type, token_id')
      .eq('is_revoked', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching recent certificates:', error);
    throw new Error(error.message || 'Failed to fetch recent certificates');
  }
};

export default {
  saveCertificate,
  getCertificatesByIssuer,
  getCertificateByTokenId,
  updateCertificateTokenId,
  revokeCertificateInDB,
  searchCertificates,
  getCertificateStats,
  recordVerification,
  getVerificationHistory,
  getUserProfile,
  updateUserProfile,
  getCertificatesByRecipient,
  getRecentCertificates
};