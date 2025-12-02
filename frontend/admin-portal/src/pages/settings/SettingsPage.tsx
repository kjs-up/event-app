import React from 'react';
import { Box, Typography } from '@mui/material';

export function SettingsPage() {
  return (
    <Box>
      <Typography variant="h4">Settings</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>Settings page - User preferences and system configuration</Typography>
    </Box>
  );
}