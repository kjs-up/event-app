import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Chip,
} from '@mui/material';
import {
  Dashboard,
  Event,
  People,
  Approval,
  Settings,
  EventNote,
  PersonAdd,
  Analytics,
  Assignment,
  CheckCircle,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '@/shared/types';

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

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Brand */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Admin Portal
        </Typography>
      </Box>

      {/* User info */}
      <Box sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Welcome, {user?.firstName}
        </Typography>
        <Chip
          label={user?.role.toUpperCase()}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ mt: 0.5 }}
        />
      </Box>

      <Divider />

      {/* Navigation */}
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {navigationItems.map((item) => {
          // Check if user has required role for this item
          if (item.roles && !hasAnyRole(item.roles)) {
            return null;
          }

          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? 'inherit' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 500 : 400,
                  }}
                />
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    color="error"
                    sx={{
                      height: 20,
                      fontSize: '0.75rem',
                      fontWeight: 500,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Typography variant="caption" color="text.secondary">
          Event Management Platform
        </Typography>
        <br />
        <Typography variant="caption" color="text.secondary">
          v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        width: width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e0e0e0',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}