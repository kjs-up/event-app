import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Dashboard,
  Event,
  People,
  Approval,
  Settings,
  EventNote,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant: 'permanent' | 'temporary';
  width: number;
}

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactElement;
  roles?: UserRole[];
  badge?: string;
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <Dashboard />,
  },
  {
    label: 'Events',
    path: '/events',
    icon: <Event />,
  },
  {
    label: 'Create Event',
    path: '/events/create',
    icon: <EventNote />,
    roles: [UserRole.MAKER, UserRole.ADMIN],
  },
  {
    label: 'Approval Queue',
    path: '/approvals',
    icon: <Approval />,
    roles: [UserRole.APPROVER, UserRole.ADMIN],
    badge: '3', // This would come from actual data
  },
  {
    label: 'User Management',
    path: '/users',
    icon: <People />,
    roles: [UserRole.ADMIN],
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: <Settings />,
  },
];

export function Sidebar({ open, onClose, variant, width }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, hasAnyRole } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (variant === 'temporary') {
      onClose();
    }
  };

  const sidebarClasses = `
    fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-30 transition-transform duration-300 ease-in-out
    ${open ? 'translate-x-0' : '-translate-x-full'}
    ${variant === 'permanent' ? 'md:translate-x-0' : ''}
  `;

  const overlayClasses = `
    fixed inset-0 bg-gray-600 bg-opacity-50 z-20 transition-opacity duration-300
    ${open && variant === 'temporary' ? 'opacity-100' : 'opacity-0 pointer-events-none'}
    md:hidden
  `;

  return (
    <>
      {/* Mobile Overlay */}
      <div className={overlayClasses} onClick={onClose}></div>

      {/* Sidebar */}
      <aside className={sidebarClasses} style={{ width: `${width}px` }}>
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="h-16 flex items-center justify-center border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Admin Portal</h2>
          </div>

          {/* User info */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">
              Welcome, {user?.firstName}
            </p>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
              {user?.role.toUpperCase()}
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
            {navigationItems.map((item) => {
              if (item.roles && !hasAnyRole(item.roles)) {
                return null;
              }

              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150
                    ${isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <span className={`mr-3 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`}>
                    {item.icon}
                  </span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className={`
                      ml-auto inline-block py-0.5 px-2 text-xs font-medium rounded-full
                      ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}
                    `}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">Event Management Platform</p>
            <p className="text-xs text-gray-400">v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}