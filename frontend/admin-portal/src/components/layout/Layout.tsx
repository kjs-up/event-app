import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const DRAWER_WIDTH = 280;

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { logout } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Handle user menu
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        onMenuClick={handleDrawerToggle}
        onUserMenuClick={handleUserMenuOpen}
        userMenuAnchor={userMenuAnchor}
        onUserMenuClose={handleUserMenuClose}
        onLogout={handleLogout}
      />

      {/* Sidebar */}
      <Sidebar
        open={!isMobile || mobileOpen}
        onClose={handleDrawerToggle}
        variant={isMobile ? 'temporary' : 'permanent'}
        width={DRAWER_WIDTH}
      />

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ease-in-out pt-16 ${!isMobile ? 'ml-[280px]' : ''
          }`}
      >
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}