import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, Calendar, User, Wallet } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAuth } from '../contexts/AuthContext';
import { uploadJSONToIPFS } from '../utils/ipfsUtils';
import { issueCertificate } from '../utils/contractUtils';
import { saveCertificate } from '../utils/supabaseUtils';
import toast from 'react-hot-toast';

interface CertificateData {
  name: string;
  issuedTo: string;
  issueDate: string;
  expiryDate?: string;
  certificateType: string;
  issuer: string;
  organization: string;
  additionalDetails?: string;
  image?: File | null;
}

const IssueCertificate = () => {
  const navigate = useNavigate();
  const { address: account, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [certificateData, setCertificateData] = useState<CertificateData>({
    name: '',
    issuedTo: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    certificateType: '',
    issuer: '',
    organization: '',
    additionalDetails: '',
    image: null
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCertificateData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setCertificateData(prev => ({
      ...prev,
      image: file
    }));
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (step === 1) {
      setStep(2); // Move to preview/confirmation step
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare certificate data for IPFS
      const ipfsData = {
        ...certificateData,
        issuerAddress: account,
        timestamp: Date.now()
      };
      
      // Upload certificate data to IPFS
      const ipfsHash = await uploadJSONToIPFS(ipfsData);
      
      // Issue certificate on blockchain
      const txHash = await issueCertificate(
        ipfsHash,
        certificateData.issuedTo,
        certificateData.issuer,
        certificateData.issueDate
      );
      
      // Save certificate metadata to Supabase
      if (user && account) {
        try {
          await saveCertificate({
            name: certificateData.name,
            issued_to: certificateData.issuedTo,
            issuer: certificateData.issuer,
            organization: certificateData.organization,
            issue_date: certificateData.issueDate,
            expiry_date: certificateData.expiryDate || null,
            certificate_type: certificateData.certificateType,
            ipfs_hash: ipfsHash,
            blockchain_tx_hash: txHash,
            issuer_wallet_address: account,
            additional_details: certificateData.additionalDetails || null
          });
        } catch (dbError) {
          console.error('Error saving to database:', dbError);
          // Don't fail the whole process if database save fails
        }
      }
      
      toast.success('Certificate issued successfully!');
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error issuing certificate:', error);
      toast.error('Failed to issue certificate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Wallet className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Not Connected</h2>
        <p className="text-gray-600 mb-8 text-center max-w-md">
          Please connect your wallet to issue certificates on the blockchain.
        </p>
        <button
          onClick={() => open()}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" /> Back
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Issue New Certificate</h1>
        <p className="text-gray-600">
          {step === 1 
            ? 'Fill in the details to create a new blockchain certificate' 
            : 'Review certificate information before issuing'
          }
        </p>
      </div>
      
      {/* Progress steps */}
      <div className="flex mb-8">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className={`text-sm font-medium ${step >= 1 ? 'text-blue-600' : 'text-gray-600'}`}>
            Details
          </div>
        </div>
        <div className={`flex-1 h-0.5 mx-2 self-center ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
          <div className={`text-sm font-medium ${step >= 2 ? 'text-blue-600' : 'text-gray-600'}`}>
            Preview
          </div>
        </div>
      </div>
      
      {step === 1 ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate Name
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={certificateData.name}
                    onChange={handleChange}
                    placeholder="e.g., Bachelor of Computer Science"
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="issuedTo" className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    id="issuedTo"
                    name="issuedTo"
                    required
                    value={certificateData.issuedTo}
                    onChange={handleChange}
                    placeholder="Full name of recipient"
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    id="issueDate"
                    name="issueDate"
                    required
                    value={certificateData.issueDate}
                    onChange={handleChange}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date (Optional)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    id="expiryDate"
                    name="expiryDate"
                    value={certificateData.expiryDate}
                    onChange={handleChange}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="certificateType" className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate Type
                </label>
                <select
                  id="certificateType"
                  name="certificateType"
                  required
                  value={certificateData.certificateType}
                  onChange={handleChange}
                  className="pl-4 pr-10 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" disabled>Select certificate type</option>
                  <option value="academic">Academic Degree</option>
                  <option value="course">Course Completion</option>
                  <option value="professional">Professional Certification</option>
                  <option value="achievement">Achievement Award</option>
                  <option value="participation">Participation Certificate</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="issuer" className="block text-sm font-medium text-gray-700 mb-1">
                  Issuer Name
                </label>
                <input
                  type="text"
                  id="issuer"
                  name="issuer"
                  required
                  value={certificateData.issuer}
                  onChange={handleChange}
                  placeholder="e.g., Prof. Jane Smith"
                  className="px-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                  Organization
                </label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  required
                  value={certificateData.organization}
                  onChange={handleChange}
                  placeholder="e.g., Stanford University"
                  className="px-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate Image/Template
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
                  <input 
                    type="file"
                    id="image"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="image" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-sm text-gray-500 mt-2">
                      {certificateData.image 
                        ? certificateData.image.name
                        : 'Drag & drop an image or click to browse'
                      }
                    </p>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <label htmlFor="additionalDetails" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Details (Optional)
            </label>
            <textarea
              id="additionalDetails"
              name="additionalDetails"
              rows={4}
              value={certificateData.additionalDetails}
              onChange={handleChange}
              placeholder="Add any additional information about the certificate..."
              className="px-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Preview Certificate
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Certificate Preview */}
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Certificate Preview</h3>
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 flex-grow flex flex-col items-center justify-center">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Certificate preview" 
                    className="max-h-80 object-contain rounded-md"
                  />
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No certificate image uploaded</p>
                  </div>
                )}
                
                <div className="w-full mt-4 bg-white rounded-md p-4 border border-gray-200">
                  <h4 className="text-xl font-bold text-center text-gray-900 mb-1">
                    {certificateData.name || 'Certificate Title'}
                  </h4>
                  <p className="text-center text-gray-500 text-sm mb-3">
                    {certificateData.certificateType || 'Certificate Type'}
                  </p>
                  
                  <div className="text-center mb-3">
                    <p className="text-base">Presented to</p>
                    <p className="text-lg font-semibold">{certificateData.issuedTo || 'Recipient Name'}</p>
                  </div>
                  
                  <div className="text-center text-sm text-gray-600">
                    <p>Issued by {certificateData.issuer || 'Issuer'}</p>
                    <p>From {certificateData.organization || 'Organization'}</p>
                    <p>Issue Date: {certificateData.issueDate || 'Date'}</p>
                    {certificateData.expiryDate && (
                      <p>Expiry Date: {certificateData.expiryDate}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Certificate Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Certificate Details</h3>
              
              <div className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <h4 className="text-sm font-medium text-gray-500">Certificate Name</h4>
                  <p className="text-gray-900">{certificateData.name}</p>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <h4 className="text-sm font-medium text-gray-500">Recipient</h4>
                  <p className="text-gray-900">{certificateData.issuedTo}</p>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <h4 className="text-sm font-medium text-gray-500">Certificate Type</h4>
                  <p className="text-gray-900">{certificateData.certificateType}</p>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <h4 className="text-sm font-medium text-gray-500">Issuer</h4>
                  <p className="text-gray-900">{certificateData.issuer}</p>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <h4 className="text-sm font-medium text-gray-500">Organization</h4>
                  <p className="text-gray-900">{certificateData.organization}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <h4 className="text-sm font-medium text-gray-500">Issue Date</h4>
                    <p className="text-gray-900">{certificateData.issueDate}</p>
                  </div>
                  
                  {certificateData.expiryDate && (
                    <div className="flex flex-col space-y-1">
                      <h4 className="text-sm font-medium text-gray-500">Expiry Date</h4>
                      <p className="text-gray-900">{certificateData.expiryDate}</p>
                    </div>
                  )}
                </div>
                
                {certificateData.additionalDetails && (
                  <div className="flex flex-col space-y-1">
                    <h4 className="text-sm font-medium text-gray-500">Additional Details</h4>
                    <p className="text-gray-900 whitespace-pre-wrap">{certificateData.additionalDetails}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-6 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Back to Edit
            </button>
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Issuing...
                </>
              ) : (
                <>Issue Certificate</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueCertificate;