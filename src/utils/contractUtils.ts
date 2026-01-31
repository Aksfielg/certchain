import { ethers } from 'ethers';
import { abi as CertNFTABI } from '../abis/CertNFT.json';
import toast from 'react-hot-toast';

// Contract address (should be stored in .env)
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0xYourContractAddressHere';

/**
 * Gets the contract instance
 * @returns Contract instance
 */
export const getContract = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, CertNFTABI, signer);
  } catch (error) {
    console.error('Error getting contract:', error);
    throw error;
  }
};

/**
 * Issues a new certificate
 * @param ipfsHash IPFS hash of the certificate data
 * @param name Name of the certificate holder
 * @param issuer Name of the issuer
 * @param issueDate Date the certificate was issued
 * @returns Transaction hash
 */
export const issueCertificate = async (
  ipfsHash: string,
  name: string,
  issuer: string,
  issueDate: string
): Promise<string> => {
  try {
    const contract = await getContract();
    
    toast.loading('Issuing certificate on blockchain...', { id: 'issue-cert' });
    
    const tx = await contract.mint(ipfsHash, name, issuer, issueDate);
    await tx.wait();
    
    toast.success('Certificate issued successfully!', { id: 'issue-cert' });
    return tx.hash;
  } catch (error: any) {
    console.error('Error issuing certificate:', error);
    toast.error(error.message || 'Failed to issue certificate', { id: 'issue-cert' });
    throw error;
  }
};

/**
 * Issues multiple certificates at once
 * @param certificates Array of certificate data
 * @returns Transaction hash
 */
export const batchIssueCertificates = async (
  certificates: {
    ipfsHash: string;
    name: string;
    issuer: string;
    issueDate: string;
  }[]
): Promise<string> => {
  try {
    const contract = await getContract();
    
    // Prepare arrays for batch minting
    const ipfsHashes = certificates.map(cert => cert.ipfsHash);
    const names = certificates.map(cert => cert.name);
    const issuers = certificates.map(cert => cert.issuer);
    const issueDates = certificates.map(cert => cert.issueDate);
    
    toast.loading('Batch issuing certificates...', { id: 'batch-issue' });
    
    const tx = await contract.batchMint(ipfsHashes, names, issuers, issueDates);
    await tx.wait();
    
    toast.success('Certificates issued successfully!', { id: 'batch-issue' });
    return tx.hash;
  } catch (error: any) {
    console.error('Error batch issuing certificates:', error);
    toast.error(error.message || 'Failed to issue certificates', { id: 'batch-issue' });
    throw error;
  }
};

/**
 * Verifies a certificate
 * @param tokenId Token ID of the certificate
 * @returns Certificate data and verification status
 */
export const verifyCertificate = async (tokenId: number) => {
  try {
    const contract = await getContract();
    
    toast.loading('Verifying certificate...', { id: 'verify-cert' });
    
    // Get certificate data
    const certData = await contract.getCert(tokenId);
    
    // Check if certificate is revoked
    const isRevoked = await contract.isCertificateRevoked(tokenId);
    
    toast.success('Certificate verified!', { id: 'verify-cert' });
    
    return {
      id: tokenId,
      ipfsHash: certData.ipfsHash,
      name: certData.name,
      issuer: certData.issuer,
      issueDate: certData.issueDate,
      isRevoked
    };
  } catch (error: any) {
    console.error('Error verifying certificate:', error);
    toast.error(error.message || 'Failed to verify certificate', { id: 'verify-cert' });
    throw error;
  }
};

/**
 * Revokes a certificate
 * @param tokenId Token ID of the certificate to revoke
 * @returns Transaction hash
 */
export const revokeCertificate = async (tokenId: number): Promise<string> => {
  try {
    const contract = await getContract();
    
    toast.loading('Revoking certificate...', { id: 'revoke-cert' });
    
    const tx = await contract.revokeCertificate(tokenId);
    await tx.wait();
    
    toast.success('Certificate revoked successfully!', { id: 'revoke-cert' });
    return tx.hash;
  } catch (error: any) {
    console.error('Error revoking certificate:', error);
    toast.error(error.message || 'Failed to revoke certificate', { id: 'revoke-cert' });
    throw error;
  }
};

/**
 * Gets certificates issued by the current user
 * @returns Array of certificates issued by the current user
 */
export const getIssuedCertificates = async () => {
  try {
    const contract = await getContract();
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    
    // Get total supply of certificates
    const totalSupply = await contract.nextId();
    
    // Array to store certificates issued by the user
    const certificates = [];
    
    // Loop through all certificates to find ones issued by the user
    for (let i = 0; i < totalSupply; i++) {
      try {
        const owner = await contract.ownerOf(i);
        
        // Check if the user is the owner of the certificate
        if (owner.toLowerCase() === userAddress.toLowerCase()) {
          const certData = await contract.getCert(i);
          const isRevoked = await contract.isCertificateRevoked(i);
          
          certificates.push({
            id: i,
            ipfsHash: certData.ipfsHash,
            name: certData.name,
            issuer: certData.issuer,
            issueDate: certData.issueDate,
            isRevoked
          });
        }
      } catch (error) {
        // Skip if token doesn't exist or other error
        console.log(`Token ID ${i} might not exist or error:`, error);
      }
    }
    
    return certificates;
  } catch (error) {
    console.error('Error getting issued certificates:', error);
    throw error;
  }
};