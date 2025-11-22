"use client"
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import UniversalNavbar from "@/components/ui/universal-navbar";
import Dashboard from "@/components/dashboard";

export default function AppLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    // Set current page based on pathname
    if (pathname === '/dashboard') setCurrentPage('dashboard');
    else if (pathname === '/operations') setCurrentPage('operations');
    else if (pathname === '/products') setCurrentPage('products');
    else if (pathname === '/history') setCurrentPage('history');
    else if (pathname === '/settings') setCurrentPage('settings');
  }, [pathname]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-text-primary)]"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  // Render content based on current page
  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'operations':
        return (
          <div>
            {/* Operations content area - ready for team design */}
          </div>
        );
      case 'products':
        return (
          <div>
            {/* Products content area - ready for team design */}
          </div>
        );
      case 'history':
        return (
          <div>
            {/* History content area - ready for team design */}
          </div>
        );
      case 'settings':
        return (
          <div>
            {/* Settings content area - ready for team design */}
          </div>
        );
      default:
        return (
          <div>
            {/* Default content area */}
          </div>
        );
    }
  };

  // For dashboard page, render the full Dashboard component without extra wrapper
  if (currentPage === 'dashboard') {
    return <Dashboard />;
  }

  // For other pages, use the navbar layout
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <UniversalNavbar />
      
      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto py-8 px-6 mt-20">
        {renderPageContent()}
        {children}
      </main>
    </div>
  );
}