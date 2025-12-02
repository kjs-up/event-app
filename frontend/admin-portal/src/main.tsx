import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles/global.css';

// Ensure the app is accessible
if (process.env.NODE_ENV === 'development') {
  console.log('Event Management Platform - Admin Portal');
  console.log('Environment:', import.meta.env.VITE_NODE_ENV || 'development');
  console.log('API URL:', import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);