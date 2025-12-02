import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Box,
  Badge,
  Tooltip,
} from '@mui/material';
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

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - 280px)` },
        ml: { md: '280px' },
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#ffffff',
        color: '#333333',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      <Toolbar>
        {/* Mobile menu button */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Title */}
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Event Management Platform
        </Typography>

        {/* Right side actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton color="inherit">
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User menu */}
          <Tooltip title="Account">
            <IconButton
              color="inherit"
              onClick={onUserMenuClick}
              sx={{ ml: 1 }}
            >
              {user?.firstName ? (
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: 'primary.main',
                    fontSize: '0.875rem',
                  }}
                >
                  {user.firstName.charAt(0).toUpperCase()}
                  {user.lastName?.charAt(0).toUpperCase()}
                </Avatar>
              ) : (
                <AccountCircle />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        {/* User menu dropdown */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={onUserMenuClose}
          onClick={onUserMenuClose}
          PaperProps={{
            elevation: 4,
            sx: {
              mt: 1.5,
              minWidth: 200,
              '& .MuiAvatar-root': {
                width: 24,
                height: 24,
                ml: -0.5,
                mr: 1,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {/* User info */}
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" noWrap>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {user?.email}
            </Typography>
            <Typography variant="caption" color="primary">
              {user?.role.toUpperCase()}
            </Typography>
          </Box>

          <Divider />

          {/* Menu items */}
          <MenuItem onClick={onUserMenuClose}>
            <Person fontSize="small" sx={{ mr: 1 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={onUserMenuClose}>
            <Settings fontSize="small" sx={{ mr: 1 }} />
            Settings
          </MenuItem>

          <Divider />

          <MenuItem onClick={onLogout} sx={{ color: 'error.main' }}>
            <Logout fontSize="small" sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}