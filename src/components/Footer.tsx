import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, Wallet } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Wallet className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-white">CertChain</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              A decentralized blockchain-based platform for secure, tamper-proof digital certificate issuance, management, and verification.
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white text-sm transition">Home</Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-white text-sm transition">Dashboard</Link>
              </li>
              <li>
                <Link to="/issue" className="text-gray-300 hover:text-white text-sm transition">Issue Certificate</Link>
              </li>
              <li>
                <Link to="/verify" className="text-gray-300 hover:text-white text-sm transition">Verify Certificate</Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://docs.polygon.technology/" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-white text-sm transition">Polygon Docs</a>
              </li>
              <li>
                <a href="https://web3.storage/" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-white text-sm transition">IPFS Storage</a>
              </li>
              <li>
                <a href="https://metamask.io/" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-white text-sm transition">MetaMask</a>
              </li>
              <li>
                <a href="https://firebase.google.com/docs" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-white text-sm transition">Firebase Docs</a>
              </li>
            </ul>
          </div>
          
          {/* Connect */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition">
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} CertChain. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition">Privacy Policy</Link>
            <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;