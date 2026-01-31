import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  FileCheck, 
  Upload, 
  ArrowRight, 
  ChevronRight,
  Globe,
  Users,
  Award,
  Building,
  Sparkles,
  Zap,
  Lock
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';

const Home = () => {
  const { isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const [activeFeature, setActiveFeature] = useState(0);

  // Features for the animated showcase
  const features = [
    {
      title: "Issue Certificates",
      description: "Create and issue tamper-proof digital certificates on the blockchain",
      icon: <Award className="w-6 h-6" />,
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Verify Instantly",
      description: "Verify any certificate's authenticity in seconds",
      icon: <Shield className="w-6 h-6" />,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Batch Processing",
      description: "Upload and process multiple certificates at once",
      icon: <Upload className="w-6 h-6" />,
      color: "from-purple-500 to-pink-600"
    }
  ];

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 to-blue-900">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-10"></div>
        </div>

        <div className="container mx-auto px-4 z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="mb-8 inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-400 mr-2" />
              <span className="text-white/90 text-sm">Revolutionizing Certificate Management with Blockchain</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
              The Future of
              <span className="relative">
                <span className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 blur-lg opacity-50"></span>
                <span className="relative"> Digital Certificates</span>
              </span>
            </h1>

            <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              Issue, verify, and manage digital certificates with unmatched security using blockchain technology. 
              Perfect for educational institutions, organizations, and certification authorities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isConnected ? (
                <button
                  onClick={() => open()}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center group"
                >
                  Connect Wallet
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <Link
                  to="/dashboard"
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center group"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              <Link
                to="/verify"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 font-medium rounded-lg hover:bg-white/20 transition-all transform hover:scale-105 flex items-center justify-center group"
              >
                Verify Certificate
                <FileCheck className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Feature Showcase */}
          <div className="mt-24 max-w-4xl mx-auto">
            <div className="relative h-[400px] rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 overflow-hidden">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 p-8 transition-all duration-500 transform ${
                    index === activeFeature
                      ? 'translate-x-0 opacity-100'
                      : 'translate-x-full opacity-0'
                  }`}
                >
                  <div className="h-full flex flex-col justify-between">
                    <div>
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color}`}>
                        {feature.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-white mt-4">{feature.title}</h3>
                      <p className="text-white/70 mt-2">{feature.description}</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        {features.map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              i === activeFeature ? 'bg-white' : 'bg-white/30'
                            }`}
                          />
                        ))}
                      </div>
                      <button className="text-white/70 hover:text-white flex items-center transition-colors">
                        Learn more <ArrowRight className="ml-2 w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to manage certificates
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive suite of tools for issuing, managing, and verifying digital certificates on the blockchain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Lock className="w-6 h-6 text-blue-600" />,
                title: "Blockchain Security",
                description: "Tamper-proof certificates secured by blockchain technology"
              },
              {
                icon: <Zap className="w-6 h-6 text-yellow-500" />,
                title: "Instant Verification",
                description: "Verify certificates in seconds with guaranteed authenticity"
              },
              {
                icon: <Upload className="w-6 h-6 text-green-600" />,
                title: "Batch Processing",
                description: "Issue multiple certificates at once efficiently"
              },
              {
                icon: <Globe className="w-6 h-6 text-purple-600" />,
                title: "Global Access",
                description: "Access certificates from anywhere in the world"
              },
              {
                icon: <Users className="w-6 h-6 text-indigo-600" />,
                title: "Multi-user Support",
                description: "Collaborate with team members and manage permissions"
              },
              {
                icon: <Building className="w-6 h-6 text-pink-600" />,
                title: "Institution Dashboard",
                description: "Comprehensive dashboard for managing all certificates"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-blue-500/20 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to revolutionize your certificate management?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of organizations already using CertChain to secure their digital certificates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/issue"
              className="px-8 py-4 bg-white text-blue-600 font-medium rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center group"
            >
              Start Issuing
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/verify"
              className="px-8 py-4 bg-blue-700 text-white border border-blue-500 font-medium rounded-lg hover:bg-blue-800 transition-all transform hover:scale-105 flex items-center justify-center group"
            >
              Verify Certificate
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;