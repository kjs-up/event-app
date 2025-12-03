import React from 'react';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Settings,
  Notifications,
  Person,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
  onUserMenuClick: (event: React.MouseEvent<HTMLElement>) => void;
  userMenuAnchor: HTMLElement | null;
  onUserMenuClose: () => void;
  onLogout: () => void;
}

export function Header({
  onMenuClick,
  onUserMenuClick,
  userMenuAnchor,
  onUserMenuClose,
  onLogout,
}: HeaderProps) {
  const { user } = useAuth();
  const isMenuOpen = Boolean(userMenuAnchor);

  return (
    <header className="fixed top-0 right-0 left-0 md:left-72 z-20 bg-white border-b border-gray-200 shadow-sm h-16 transition-all duration-200">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
          >
            <MenuIcon />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 ml-2 md:ml-0 truncate">
            Event Management Platform
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative">
            <Notifications />
            <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>

          {/* User Menu Button */}
          <div className="relative">
            <button
              onClick={onUserMenuClick}
              className="flex items-center focus:outline-none"
            >
              {user?.firstName ? (
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                  {user.firstName.charAt(0).toUpperCase()}
                  {user.lastName?.charAt(0).toUpperCase()}
                </div>
              ) : (
                <AccountCircle className="h-8 w-8 text-gray-500" />
              )}
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={onUserMenuClose}
                ></div>
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      {user?.role.toUpperCase()}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={onUserMenuClose}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Person fontSize="small" className="mr-2 text-gray-400" />
                      Profile
                    </button>
                    <button
                      onClick={onUserMenuClose}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings fontSize="small" className="mr-2 text-gray-400" />
                      Settings
                    </button>
                  </div>

                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={onLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <Logout fontSize="small" className="mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}