import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { ArrowLeft, Upload, FileSpreadsheet, Trash2, AlertCircle, Check, X, Wallet } from 'lucide-react';
import { parseCSV } from '../utils/helpers';
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAuth } from '../contexts/AuthContext';
import { batchIssueCertificates } from '../utils/contractUtils';
import { saveCertificate } from '../utils/supabaseUtils';
import { uploadJSONToIPFS } from '../utils/ipfsUtils';
import toast from 'react-hot-toast';

interface CertificateData {
  name: string;
  issuedTo: string;
  issueDate: string;
  issuer: string;
  organization: string;
  certificateType: string;
  expiryDate?: string;
  additionalDetails?: string;
}

const BatchUpload = () => {
  const navigate = useNavigate();
  const { address: account, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    
    setFile(file);
    
    // Read and parse CSV file
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      try {
        const data = parseCSV(content);
        
        // Validate the data
        const requiredFields = ['name', 'issuedTo', 'issueDate', 'issuer', 'organization', 'certificateType'];
        const newErrors: string[] = [];
        
        const validCertificates = data.filter((row, index) => {
          const missingFields = requiredFields.filter(field => !row[field]);
          
          if (missingFields.length > 0) {
            newErrors.push(`Row ${index + 1}: Missing required fields: ${missingFields.join(', ')}`);
            return false;
          }
          
          return true;
        });
        
        if (newErrors.length > 0) {
          setErrors(newErrors);
        }
        
        setCertificates(validCertificates as unknown as CertificateData[]);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        setErrors(['Failed to parse CSV file. Please ensure it is correctly formatted.']);
      }
    };
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });

  const handleRemoveFile = () => {
    setFile(null);
    setCertificates([]);
    setErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !account) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (certificates.length === 0) {
      toast.error('No valid certificates to issue');
      return;
    }
    
    try {
      setLoading(true);
      
      // Upload all certificate data to IPFS and prepare arrays for batch minting
      const uploadPromises = certificates.map(cert => 
        uploadJSONToIPFS({
          ...cert,
          issuerAddress: account,
          timestamp: Date.now()
        })
      );
      
      toast.loading(`Uploading ${certificates.length} certificates to IPFS...`, {
        id: 'batch-upload'
      });
      
      const ipfsHashes = await Promise.all(uploadPromises);
      
      toast.loading(`Issuing ${certificates.length} certificates on blockchain...`, {
        id: 'batch-upload'
      });
      
      // Prepare data for batch minting
      const names = certificates.map(cert => cert.name);
      const issuers = certificates.map(cert => cert.issuer);
      const issueDates = certificates.map(cert => cert.issueDate);
      
      // Issue certificates in batch
      await batchIssueCertificates(
        ipfsHashes.map((hash, index) => ({
          ipfsHash: hash,
          name: names[index],
          issuer: issuers[index],
          issueDate: issueDates[index]
        }))
      );
      
      // Save certificates to Supabase database
      if (user) {
        try {
          const savePromises = certificates.map((cert, index) => 
            saveCertificate({
              name: cert.name,
              issued_to: cert.issuedTo,
              issuer: cert.issuer,
              organization: cert.organization,
              issue_date: cert.issueDate,
              expiry_date: cert.expiryDate || null,
              certificate_type: cert.certificateType,
              ipfs_hash: ipfsHashes[index],
              issuer_wallet_address: account,
              additional_details: cert.additionalDetails || null
            })
          );
          
          await Promise.all(savePromises);
        } catch (dbError) {
          console.error('Error saving to database:', dbError);
          // Don't fail the whole process if database save fails
        }
      }
      
      toast.success(`Successfully issued ${certificates.length} certificates!`, {
        id: 'batch-upload'
      });
      
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error in batch upload:', error);
      toast.error('Failed to issue certificates. Please try again.', {
        id: 'batch-upload'
      });
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
        
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Batch Upload Certificates</h1>
        <p className="text-gray-600">
          Upload a CSV file to issue multiple certificates at once
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        {!file ? (
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
            }`}
          >
            <input {...getInputProps()} />
            
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            
            <p className="text-gray-700 font-medium mb-1">
              {isDragActive ? 'Drop the CSV file here' : 'Drag & drop a CSV file here'}
            </p>
            <p className="text-gray-500 text-sm mb-4">
              or click to browse your files
            </p>
            
            <p className="text-xs text-gray-500">
              Only CSV files are supported. The file should include columns for name, issuedTo, issueDate, issuer, organization, and certificateType.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
              <div className="flex items-center">
                <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">{file.size} bytes</p>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                className="text-gray-500 hover:text-red-500 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
            
            {errors.length > 0 && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {errors.length} error{errors.length > 1 ? 's' : ''} found in the CSV file
                    </h3>
                    <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Certificate Preview ({certificates.length} valid)
              </h3>
              
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issuer</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valid</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {certificates.slice(0, 5).map((cert, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{cert.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{cert.issuedTo}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{cert.issueDate}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{cert.issuer}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Check size={12} className="mr-1" /> Valid
                          </span>
                        </td>
                      </tr>
                    ))}
                    
                    {certificates.length > 5 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-2 text-sm text-gray-500 text-center">
                          And {certificates.length - 5} more certificates...
                        </td>
                      </tr>
                    )}
                    
                    {certificates.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-sm text-center text-gray-500">
                          No valid certificates found in the CSV file
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || certificates.length === 0}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Issuing Certificates...
                  </>
                ) : (
                  <>Issue {certificates.length} Certificates</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-4">CSV File Format</h3>
        
        <p className="text-sm text-blue-700 mb-4">
          Your CSV file should contain the following columns (header row required):
        </p>
        
        <table className="min-w-full bg-white rounded-md overflow-hidden shadow-sm border border-blue-100 text-sm">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th scope="col" className="px-4 py-2 text-left">Column Name</th>
              <th scope="col" className="px-4 py-2 text-left">Required</th>
              <th scope="col" className="px-4 py-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100">
            <tr>
              <td className="px-4 py-2 font-medium">name</td>
              <td className="px-4 py-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Check size={12} className="mr-1" /> Yes
                </span>
              </td>
              <td className="px-4 py-2">Certificate name or title</td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-medium">issuedTo</td>
              <td className="px-4 py-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Check size={12} className="mr-1" /> Yes
                </span>
              </td>
              <td className="px-4 py-2">Recipient's name</td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-medium">issueDate</td>
              <td className="px-4 py-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Check size={12} className="mr-1" /> Yes
                </span>
              </td>
              <td className="px-4 py-2">Date of issuance (YYYY-MM-DD)</td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-medium">issuer</td>
              <td className="px-4 py-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Check size={12} className="mr-1" /> Yes
                </span>
              </td>
              <td className="px-4 py-2">Name of the issuing person</td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-medium">organization</td>
              <td className="px-4 py-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Check size={12} className="mr-1" /> Yes
                </span>
              </td>
              <td className="px-4 py-2">Name of the organization</td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-medium">certificateType</td>
              <td className="px-4 py-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Check size={12} className="mr-1" /> Yes
                </span>
              </td>
              <td className="px-4 py-2">Type of certificate</td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-medium">expiryDate</td>
              <td className="px-4 py-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <X size={12} className="mr-1" /> No
                </span>
              </td>
              <td className="px-4 py-2">Expiry date if applicable (YYYY-MM-DD)</td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-medium">additionalDetails</td>
              <td className="px-4 py-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <X size={12} className="mr-1" /> No
                </span>
              </td>
              <td className="px-4 py-2">Additional information about the certificate</td>
            </tr>
          </tbody>
        </table>
        
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
          <p className="ml-2 text-sm text-yellow-700">
            Note: We recommend keeping your batch size under 50 certificates per upload for optimal performance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BatchUpload;