import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { EventsPage } from './pages/events/EventsPage';
import { EventCreatePage } from './pages/events/EventCreatePage';
import { EventDetailPage } from './pages/events/EventDetailPage';
import { ApprovalQueuePage } from './pages/events/ApprovalQueuePage';
import { ApprovalReviewPage } from './pages/events/ApprovalReviewPage';

// ... (imports)

// ... (inside Routes)

import { UsersPage } from './pages/users/UsersPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { NotFoundPage } from './pages/error/NotFoundPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />

                {/* Dashboard */}
                <Route path="dashboard" element={<DashboardPage />} />

                {/* Events Management */}
                <Route path="events" element={<EventsPage />} />
                <Route path="events/create" element={<EventCreatePage />} />
                <Route path="events/:id" element={<EventDetailPage />} />

                {/* Approval Queue */}
                <Route path="approvals" element={<ApprovalQueuePage />} />
                <Route path="events/approvals/:id" element={<ApprovalReviewPage />} />

                {/* User Management */}
                <Route path="users" element={<UsersPage />} />

                {/* Settings */}
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* 404 Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>

          {/* Global toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;