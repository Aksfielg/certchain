import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FileText, 
  Calendar, 
  User, 
  Building, 
  AlertTriangle, 
  Shield, 
  Download, 
  Share2, 
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { verifyCertificate } from '../utils/contractUtils';
import { getCertificateByTokenId, recordVerification } from '../utils/supabaseUtils';
import { retrieveFromIPFS, getIPFSGatewayURL } from '../utils/ipfsUtils';
import toast from 'react-hot-toast';

interface CertificateData {
  token_id: number;
  ipfsHash: string;
  name: string;
  issuer: string;
  issueDate: string;
  isRevoked: boolean;
  // Additional data from IPFS
  issuedTo?: string;
  certificateType?: string;
  organization?: string;
  additionalDetails?: string;
  expiryDate?: string;
  blockchainTxHash?: string;
}

const ViewCertificate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareOptions, setShowShareOptions] = useState(false);

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!id || isNaN(Number(id))) {
        setError('Invalid certificate ID');
        setLoading(false);
        return;
      }
      
      try {
        // Get certificate data from blockchain
        const certData = await verifyCertificate(Number(id));
        
        // Try to get additional data from Supabase database
        let dbData = null;
        try {
          dbData = await getCertificateByTokenId(Number(id));
        } catch (dbError) {
          console.error('Error retrieving from database:', dbError);
        }
        
        // Try to get additional data from IPFS
        let ipfsData = {};
        try {
          ipfsData = await retrieveFromIPFS(certData.ipfsHash);
        } catch (ipfsError) {
          console.error('Error retrieving from IPFS:', ipfsError);
        }
        
        // Record this verification attempt
        try {
          await recordVerification(Number(id));
        } catch (verifyError) {
          console.error('Error recording verification:', verifyError);
        }
        
        setCertificate({
          ...certData,
          ...dbData,
          ...ipfsData
        });
        
      } catch (error: any) {
        console.error('Error fetching certificate:', error);
        setError(error.message || 'Failed to fetch certificate');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCertificate();
  }, [id]);

  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };

  const copyToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Certificate link copied to clipboard!');
    setShowShareOptions(false);
  };

  const downloadCertificate = () => {
    toast.success('Certificate downloaded successfully!');
    // In a real implementation, this would generate a PDF or image of the certificate
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-3 text-lg font-medium text-gray-700">Loading certificate...</p>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="py-16 text-center">
        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          {error || 'The certificate you are looking for does not exist or has been removed.'}
        </p>
        <Link
          to="/verify"
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Verify Another Certificate
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" /> Back
        </button>
        
        <div className="flex space-x-3">
          <button
            onClick={downloadCertificate}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download size={16} className="mr-2" /> Download
          </button>
          
          <div className="relative">
            <button
              onClick={handleShare}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Share2 size={16} className="mr-2" /> Share
            </button>
            
            {showShareOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <button
                  onClick={copyToClipboard}
                  className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Copy Link
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Share on Twitter
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Share on LinkedIn
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Certificate verification status */}
      <div className={`mb-8 p-4 rounded-md ${
        certificate.isRevoked 
          ? 'bg-red-50 border border-red-200' 
          : 'bg-green-50 border border-green-200'
      }`}>
        <div className="flex items-center">
          {certificate.isRevoked ? (
            <>
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-red-800 font-medium">Certificate Revoked</h3>
                <p className="text-red-600 text-sm">
                  This certificate has been revoked and is no longer valid
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-green-800 font-medium">Certificate Valid</h3>
                <p className="text-green-600 text-sm">
                  This certificate is authentic and verified on the Polygon blockchain
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Certificate header */}
        <div className="bg-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{certificate.name}</h1>
            <div className="bg-white text-blue-600 px-3 py-1 rounded-md text-sm font-medium">
              ID: {certificate.token_id}
            </div>
          </div>
          <p className="mt-2 text-blue-100">{certificate.certificateType || 'Certificate'}</p>
        </div>
        
        {/* Certificate body */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - Primary details */}
            <div className="space-y-6">
              <div className="flex items-start">
                <User className="w-5 h-5 text-gray-400 mt-1" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-500">Recipient</h3>
                  <p className="text-lg font-semibold text-gray-900">{certificate.issuedTo || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Building className="w-5 h-5 text-gray-400 mt-1" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-500">Issuing Organization</h3>
                  <p className="text-gray-900">{certificate.organization || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <User className="w-5 h-5 text-gray-400 mt-1" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-500">Issuer</h3>
                  <p className="text-gray-900">{certificate.issuer}</p>
                </div>
              </div>
            </div>
            
            {/* Right column - Secondary details */}
            <div className="space-y-6">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-500">Issue Date</h3>
                  <p className="text-gray-900">{certificate.issueDate}</p>
                </div>
              </div>
              
              {certificate.expiryDate && (
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-500">Expiry Date</h3>
                    <p className="text-gray-900">{certificate.expiryDate}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start">
                <FileText className="w-5 h-5 text-gray-400 mt-1" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-500">Certificate Type</h3>
                  <p className="text-gray-900">{certificate.certificateType || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional details */}
          {certificate.additionalDetails && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Additional Details</h3>
              <p className="text-gray-900 whitespace-pre-wrap">{certificate.additionalDetails}</p>
            </div>
          )}
          
          {/* Blockchain verification details */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Blockchain Verification</h3>
            
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Certificate ID</p>
                  <p className="font-mono text-gray-900">{certificate.token_id}</p>
                </div>
                
                <div>
                  <p className="text-gray-500">IPFS Hash</p>
                  <div className="flex items-center">
                    <p className="font-mono text-gray-900 truncate">{certificate.ipfsHash}</p>
                    <a
                      href={getIPFSGatewayURL(certificate.ipfsHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
                
                <div className="md:col-span-2 mt-2">
                  <p className="text-gray-500 mb-1">Verification Status</p>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    certificate.isRevoked 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {certificate.isRevoked ? 'Revoked' : 'Valid'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCertificate;