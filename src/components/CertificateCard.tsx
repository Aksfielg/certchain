import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, User, Eye, AlertTriangle, Clock, Building } from 'lucide-react';
import { formatDate } from '../utils/helpers';

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

interface CertificateCardProps {
  certificate: Certificate;
}

const CertificateCard: React.FC<CertificateCardProps> = ({ certificate }) => {
  // Calculate if certificate is expired
  const isExpired = certificate.expiry_date && new Date(certificate.expiry_date) < new Date();
  
  return (
    <div className={`bg-white rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md border ${
      certificate.is_revoked 
        ? 'border-red-200' 
        : isExpired 
          ? 'border-yellow-200' 
          : 'border-green-200'
    }`}>
      {/* Status header */}
      <div className={`px-4 py-2 text-xs font-medium ${
        certificate.is_revoked 
          ? 'bg-red-100 text-red-800' 
          : isExpired 
            ? 'bg-yellow-100 text-yellow-800' 
            : 'bg-green-100 text-green-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {certificate.is_revoked ? (
              <>
                <AlertTriangle size={14} className="mr-1" />
                Revoked
              </>
            ) : isExpired ? (
              <>
                <Clock size={14} className="mr-1" />
                Expired
              </>
            ) : (
              <>
                <FileText size={14} className="mr-1" />
                Valid
              </>
            )}
          </div>
          <span className="text-xs font-mono">#{certificate.token_id}</span>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 truncate max-w-[70%]" title={certificate.name}>
            {certificate.name}
          </h3>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
            {certificate.certificate_type}
          </span>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm">
            <User size={16} className="text-gray-400 mr-2" />
            <span className="text-gray-800 truncate" title={certificate.issued_to}>
              {certificate.issued_to}
            </span>
          </div>
          
          <div className="flex items-center text-sm">
            <Building size={16} className="text-gray-400 mr-2" />
            <span className="text-gray-600 truncate" title={certificate.organization}>
              {certificate.organization}
            </span>
          </div>
          
          <div className="flex items-center text-sm">
            <Calendar size={16} className="text-gray-400 mr-2" />
            <span className="text-gray-600">
              {formatDate(certificate.issue_date)}
            </span>
          </div>
          
          {certificate.expiry_date && (
            <div className="flex items-center text-sm">
              <Clock size={16} className="text-gray-400 mr-2" />
              <span className={`text-sm ${isExpired ? 'text-red-600' : 'text-gray-600'}`}>
                Expires: {formatDate(certificate.expiry_date)}
              </span>
            </div>
          )}
        </div>
        
        <Link
          to={`/certificate/${certificate.token_id}`}
          className="flex items-center justify-center w-full py-2 mt-2 bg-blue-50 hover:bg-blue-100 transition-colors text-blue-600 rounded-md text-sm font-medium"
        >
          <Eye size={16} className="mr-1" /> View Certificate
        </Link>
      </div>
    </div>
  );
};

export default CertificateCard;