"use client"
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export default function UniversalNavbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const navigationTabs = [
    { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { name: "Operations", href: "/operations", icon: "operations" },
    { name: "Stocks", href: "/stock", icon: "products" },
    { name: "Move History", href: "/history", icon: "history" },
    { name: "Settings", href: "/settings", icon: "settings" },
  ];

  const getIcon = (iconName) => {
    const icons = {
      dashboard: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v14l-4-2-4 2V5z" />
        </svg>
      ),
      operations: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      products: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      history: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      settings: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    };
    return icons[iconName] || icons.dashboard;
  };

  const handleNavigation = (href) => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    router.push(href);
  };

  // Get current page name for display - only show for exact dashboard route
  const getCurrentPageName = () => {
    if (pathname === '/dashboard') {
      return 'Dashboard';
    }
    return '';
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
      {/* Unified Navigation Bar */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="max-w-full px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation Items */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <svg 
                    className="w-6 h-6 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-[var(--color-text-primary)]">StockMaster</span>
              </Link>
              
              {/* Navigation Items - always show but redirect unauthenticated users to login */}
              <nav className="flex space-x-6" aria-label="Main navigation">
                {navigationTabs.map((tab) => {
                  const isActive = pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(tab.href));
                  return (
                    <button
                      key={tab.name}
                      onClick={() => handleNavigation(tab.href)}
                      className={`group flex items-center py-2 px-1 font-medium text-sm transition-colors ${
                        isActive
                          ? 'text-blue-400'
                          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                      }`}
                    >
                      <span className={`mr-2 ${isActive ? 'text-blue-400' : 'text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]'}`}>
                        {getIcon(tab.icon)}
                      </span>
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Account Section */}
            <div className="flex items-center space-x-4">
              {status === "authenticated" ? (
                <>
                  {/* Current Page Indicator */}
                  {getCurrentPageName() && (
                    <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-lg bg-[var(--color-muted-surface)]">
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">
                        {getCurrentPageName()}
                      </span>
                    </div>
                  )}
                  
                  {/* Account Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                      className="flex items-center space-x-3 p-2 rounded-lg bg-[var(--color-muted-surface)] hover:bg-[var(--color-border)] transition-colors"
                    >
                      {session?.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt="Profile"
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                      <div className="text-left">
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                          {session?.user?.name || "User"}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          {session?.user?.email}
                        </p>
                      </div>
                      <svg className="w-4 h-4 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {isAccountMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-xl z-50">
                        <div className="py-2">
                          <a href="#" className="flex items-center px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-muted-surface)]">
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Profile Settings
                          </a>
                          <a href="#" className="flex items-center px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-muted-surface)]">
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                            </svg>
                            Preferences
                          </a>
                          <hr className="my-2 border-[var(--color-border)]" />
                          <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-[var(--color-muted-surface)]"
                          >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Sign In Button for unauthenticated users */
                <Link
                  href="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}