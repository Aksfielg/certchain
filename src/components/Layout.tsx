import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  
  // Determine if we're on the home page to apply different styling
  const isHomePage = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <main className={clsx(
        "flex-grow container mx-auto px-4 py-6 md:py-8",
        isHomePage ? "max-w-7xl" : "max-w-6xl"
      )}>
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;