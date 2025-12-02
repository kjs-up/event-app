import React from 'react';
import { Box, Typography, Container } from '@mui/material';

export function LoginPage() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4">
          Login
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Login page - To be implemented in future tasks
        </Typography>
      </Box>
    </Container>
  );
}