import { useState } from 'react';
import { SearchIcon, FileCheck, AlertTriangle, Shield, ArrowUpRight, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { verifyCertificate } from '../utils/contractUtils';
import { getCertificateByTokenId, recordVerification } from '../utils/supabaseUtils';
import { retrieveFromIPFS, getIPFSGatewayURL } from '../utils/ipfsUtils';
import toast from 'react-hot-toast';

interface VerifiedCertificate {
  token_id: number;
  ipfsHash: string;
  name: string;
  issuer: string;
  issueDate: string;
  isRevoked: boolean;
  // Additional fields from IPFS data
  issuedTo?: string;
  certificateType?: string;
  organization?: string;
  additionalDetails?: string;
  imageUrl?: string;
  blockchainTxHash?: string;
}

const VerifyCertificate = () => {
  const [certificateId, setCertificateId] = useState('');
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<VerifiedCertificate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!certificateId || isNaN(Number(certificateId))) {
      setError('Please enter a valid certificate ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setCertificate(null);
      
      // Verify certificate on blockchain
      const tokenId = Number(certificateId);
      const certData = await verifyCertificate(tokenId);
      
      // Try to get additional data from Supabase database
      let dbData = null;
      try {
        dbData = await getCertificateByTokenId(tokenId);
      } catch (dbError) {
        console.error('Error retrieving from database:', dbError);
      }
      
      // Try to retrieve additional data from IPFS
      let ipfsData = {};
      try {
        ipfsData = await retrieveFromIPFS(certData.ipfsHash);
      } catch (ipfsError) {
        console.error('Error retrieving from IPFS:', ipfsError);
      }
      
      // Record this verification attempt
      try {
        await recordVerification(tokenId);
      } catch (verifyError) {
        console.error('Error recording verification:', verifyError);
      }
      
      setCertificate({
        ...certData,
        ...dbData,
        ...ipfsData,
      });
      
    } catch (error: any) {
      console.error('Error verifying certificate:', error);
      setError(error.message || 'Failed to verify certificate. It may not exist or could be invalid.');
      toast.error('Certificate verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Verify Certificate Authenticity</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Enter the certificate ID to instantly verify its authenticity on the blockchain. 
          All certificates are tamper-proof and securely stored on the Polygon blockchain.
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="certificateId" className="block text-sm font-medium text-gray-700 mb-2">
              Certificate ID
            </label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                id="certificateId"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                placeholder="Enter certificate ID (e.g., 123456)"
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
          
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="mr-2" size={18} /> 
                  Verify Certificate
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {certificate && (
        <div className={`rounded-xl shadow-md overflow-hidden border-l-4 ${
          certificate.isRevoked 
            ? 'border-l-red-500 bg-red-50' 
            : 'border-l-green-500 bg-green-50'
        }`}>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                {certificate.isRevoked ? (
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <FileCheck className="w-6 h-6 text-green-600" />
                  </div>
                )}
                
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Certificate {certificate.isRevoked ? 'Revoked' : 'Valid'}
                  </h3>
                  <p className={`text-sm ${
                    certificate.isRevoked ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {certificate.isRevoked 
                      ? 'This certificate has been revoked and is no longer valid' 
                      : 'This certificate is authentic and verified on the blockchain'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Link
                  to={`/certificate/${certificate.token_id}`}
                  className="inline-flex items-center px-3 py-1 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Eye size={16} className="mr-1" />
                  View
                </Link>
                
                {certificate.ipfsHash && (
                  <a
                    href={getIPFSGatewayURL(certificate.ipfsHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <ArrowUpRight size={16} className="mr-1" />
                    IPFS
                  </a>
                )}
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Certificate Name</h4>
                <p className="text-gray-900">{certificate.name}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Certificate ID</h4>
                <p className="text-gray-900 font-mono">{certificate.token_id}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Issued To</h4>
                <p className="text-gray-900">{certificate.issuedTo || 'Not specified'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Issuer</h4>
                <p className="text-gray-900">{certificate.issuer}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Organization</h4>
                <p className="text-gray-900">{certificate.organization || 'Not specified'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Issue Date</h4>
                <p className="text-gray-900">{certificate.issueDate}</p>
              </div>
              
              {certificate.certificateType && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Certificate Type</h4>
                  <p className="text-gray-900">{certificate.certificateType}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
                <p className="ml-2 text-sm text-gray-500">
                  This certificate is secured on the Polygon blockchain with transaction ID and IPFS storage for maximum security and verifiability.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* How verification works */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">How Certificate Verification Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <SearchIcon className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">1. Enter Certificate ID</h3>
            <p className="text-gray-600 text-sm">
              Input the unique certificate ID provided on the certificate
            </p>
          </div>
          
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">2. Blockchain Verification</h3>
            <p className="text-gray-600 text-sm">
              Our system checks the Polygon blockchain to verify the certificate's authenticity
            </p>
          </div>
          
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <FileCheck className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">3. View Results</h3>
            <p className="text-gray-600 text-sm">
              See detailed information about the certificate and its verification status
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;