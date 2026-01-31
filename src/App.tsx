import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { WagmiConfig } from 'wagmi';

// Config
import { wagmiConfig } from './wagmi';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import IssueCertificate from './pages/IssueCertificate';
import VerifyCertificate from './pages/VerifyCertificate';
import ViewCertificate from './pages/ViewCertificate';
import BatchUpload from './pages/BatchUpload';
import NotFound from './pages/NotFound';
import VerifyLegacyPage from './pages/VerifyLegacyPage';
import InstitutionDashboard from './pages/InstitutionDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Components
import Layout from './components/Layout';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';

// HOC for protected routes
const ProtectedRoute = ({ children, roles }: { children: JSX.Element, roles: string[] }) => {
  const { user } = useAuth();
  
  // You would have a 'role' in your user profile in Supabase
  // @ts-ignore
  const userRole = user?.profile?.role; 

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (roles && !roles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};


function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/issue" element={<IssueCertificate />} />
              <Route path="/verify" element={<VerifyCertificate />} />
              <Route path="/verify-legacy" element={<VerifyLegacyPage />} />
              <Route path="/certificate/:id" element={<ViewCertificate />} />
              <Route path="/batch-upload" element={<BatchUpload />} />
              
              {/* Protected Routes */}
              <Route 
                path="/institution" 
                element={
                  <ProtectedRoute roles={['institution', 'admin']}>
                    <InstitutionDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
        <Toaster 
          position="bottom-right" 
          toastOptions={{
            duration: 5000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '8px',
            },
          }}
        />
      </AuthProvider>
    </WagmiConfig>
  );
}

export default App;