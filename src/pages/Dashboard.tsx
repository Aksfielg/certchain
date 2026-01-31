import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Search, Filter, BarChart3, Download, Wallet } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAuth } from '../contexts/AuthContext';
import { getCertificatesByIssuer } from '../utils/supabaseUtils';
import CertificateCard from '../components/CertificateCard';
import EmptyState from '../components/EmptyState';

interface Certificate {
  id: number;
  token_id: number;
  name: string;
  issued_to: string;
  issuer: string;
  organization: string;
  issue_date: string;
  expiry_date?: string;
  certificate_type: string;
  is_revoked: boolean;
  ipfs_hash: string;
  blockchain_tx_hash?: string;
  created_at: string;
}

interface CertificateStats {
  total: number;
  valid: number;
  revoked: number;
  expired: number;
}

const Dashboard = () => {
  const { address: account, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { user, linkWallet } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<CertificateStats>({ total: 0, valid: 0, revoked: 0, expired: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'valid' | 'revoked' | 'expired'>('all');
  
  // Link wallet to user profile when both are available
  useEffect(() => {
    if (user && account && user.wallet_address !== account) {
      linkWallet(account);
    }
  }, [user, account, linkWallet]);

  // Fetch certificates and stats
  useEffect(() => {
    const fetchData = async () => {
      if (!account) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch certificates issued by this wallet
        const certs = await getCertificatesByIssuer(account);
        setCertificates(certs);
        
        // Calculate stats
        const now = new Date();
        const validCerts = certs.filter((cert: Certificate) => 
          !cert.is_revoked && 
          (!cert.expiry_date || new Date(cert.expiry_date) > now)
        );
        const revokedCerts = certs.filter((cert: Certificate) => cert.is_revoked);
        const expiredCerts = certs.filter((cert: Certificate) => 
          !cert.is_revoked && 
          cert.expiry_date && 
          new Date(cert.expiry_date) <= now
        );
        
        setStats({
          total: certs.length,
          valid: validCerts.length,
          revoked: revokedCerts.length,
          expired: expiredCerts.length
        });
        
      } catch (error) {
        console.error('Error fetching certificates:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [account]);
  
  // Apply filters and search to certificates
  const filteredCertificates = certificates
    .filter(cert => {
      if (filterStatus === 'all') return true;
      if (filterStatus === 'valid') {
        const now = new Date();
        return !cert.is_revoked && (!cert.expiry_date || new Date(cert.expiry_date) > now);
      }
      if (filterStatus === 'revoked') return cert.is_revoked;
      if (filterStatus === 'expired') {
        const now = new Date();
        return !cert.is_revoked && cert.expiry_date && new Date(cert.expiry_date) <= now;
      }
      return true;
    })
    .filter(cert => {
      if (!searchTerm) return true;
      const searchTermLower = searchTerm.toLowerCase();
      return (
        cert.name.toLowerCase().includes(searchTermLower) ||
        cert.issued_to.toLowerCase().includes(searchTermLower) ||
        cert.issuer.toLowerCase().includes(searchTermLower) ||
        cert.organization.toLowerCase().includes(searchTermLower) ||
        cert.token_id.toString().includes(searchTermLower)
      );
    });

  if (!isConnected) {
    return (
      <EmptyState
        title="Connect Your Wallet"
        description="Please connect your MetaMask wallet to view your dashboard."
        icon={<Wallet className="w-16 h-16 text-blue-600" />}
        actionText="Connect Wallet"
        actionFn={open}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certificate Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage and track all your blockchain certificates</p>
          {user && (
            <p className="text-sm text-gray-500 mt-1">
              Welcome back, {user.full_name} ({user.role})
            </p>
          )}
        </div>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Link
            to="/issue"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" /> Issue Certificate
          </Link>
          <Link
            to="/batch-upload"
            className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" /> Batch Upload
          </Link>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Certificates</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Valid Certificates</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">{stats.valid}</h3>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Revoked Certificates</p>
              <h3 className="text-2xl font-bold text-red-600 mt-1">{stats.revoked}</h3>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Download className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Expired Certificates</p>
              <h3 className="text-2xl font-bold text-yellow-600 mt-1">{stats.expired}</h3>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Download className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search certificates by name, recipient, issuer, or ID..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="inline-flex">
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'valid' | 'revoked' | 'expired')}
              className="pl-10 pr-10 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Certificates</option>
              <option value="valid">Valid Only</option>
              <option value="revoked">Revoked Only</option>
              <option value="expired">Expired Only</option>
            </select>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Certificates List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-3 text-lg font-medium text-gray-700">Loading certificates...</p>
        </div>
      ) : filteredCertificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((certificate) => (
            <CertificateCard key={certificate.id} certificate={certificate} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={
            searchTerm || filterStatus !== 'all'
              ? "No matching certificates found"
              : "No certificates found"
          }
          description={
            searchTerm || filterStatus !== 'all'
              ? "Try adjusting your search or filter criteria."
              : "Get started by issuing your first certificate."
          }
          icon={<FileText className="w-16 h-16 text-gray-400" />}
          actionText="Issue Certificate"
          actionLink="/issue"
        />
      )}
    </div>
  );
};

export default Dashboard;