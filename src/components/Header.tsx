import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Wallet, LogOut, User } from 'lucide-react';
import { useAccount, useDisconnect, useNetwork } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAuth } from '../contexts/AuthContext';
import { truncateAddress } from '../utils/helpers';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  // Wagmi hooks
  const { address: account, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const { user, signOut } = useAuth();

  const expectedChainId = Number(import.meta.env.VITE_CHAIN_ID);
  const isWrongNetwork = isConnected && chain?.id !== expectedChainId;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleConnectWallet = async () => {
    await open();
  };
  
  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'Dashboard', path: '/dashboard' },
    { title: 'Issue Certificate', path: '/issue' },
    { title: 'Verify Certificate', path: '/verify' },
    { title: 'Batch Upload', path: '/batch-upload' },
  ];

  return (
    <header 
      className={`sticky top-0 z-30 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-md py-3' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Wallet className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold text-gray-900">CertChain</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <ul className="flex space-x-6">
            {navLinks.map((link, index) => (
              <li key={index}>
                <Link
                  to={link.path}
                  className={`text-sm font-medium transition hover:text-blue-600 ${
                    location.pathname === link.path
                      ? 'text-blue-600'
                      : 'text-gray-700'
                  }`}
                >
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>

          {account ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isWrongNetwork 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {isWrongNetwork ? 'Wrong Network' : truncateAddress(account)}
                <ChevronDown size={16} className="ml-2" />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                  <button
                    onClick={() => {
                      disconnect();
                      setIsDropdownOpen(false);
                    }}
                    className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut size={16} className="mr-2" />
                    Disconnect Wallet
                  </button>
                  {user && (
                    <button
                      onClick={() => {
                        signOut();
                        setIsDropdownOpen(false);
                      }}
                      className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign Out
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Wallet size={16} className="mr-2" />
              Connect Wallet
            </button>
          )}

          {!user && account && (
            <Link
              to="/login"
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <User size={16} className="mr-2" />
              Sign In
            </Link>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-700 focus:outline-none"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className={`block py-2 px-4 rounded-md ${
                  location.pathname === link.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.title}
              </Link>
            ))}
            
            {account ? (
              <div className="py-2 px-4">
                <p className={`text-sm mb-2 ${isWrongNetwork ? 'text-red-600' : 'text-gray-600'}`}>
                  {isWrongNetwork ? 'Wrong Network' : 'Connected Wallet'}
                </p>
                <p className="font-mono text-sm">{truncateAddress(account)}</p>
                <button
                  onClick={() => disconnect()}
                  className="mt-2 flex items-center text-red-600 text-sm"
                >
                  <LogOut size={16} className="mr-1" /> Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md flex items-center justify-center text-sm"
              >
                <Wallet size={16} className="mr-2" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;