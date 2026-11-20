import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRouter from './components/RoleRouter';
import DashboardOverview from './pages/DashboardOverview';
import Datasets from './pages/Datasets';
import DatasetDetails from './pages/DatasetDetails';
import UploadDataset from './pages/UploadDataset';
import AuditLogs from './pages/AuditLogs';
import AccessControl from './pages/AccessControl';
import ResearchConsent from './pages/ResearchConsent';
import MyRequests from './pages/MyRequests';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

import { AuthProvider } from './components/auth/AuthLayout';

// Component that presents Landing page for unauthenticated visitors, 
// and directly renders the authenticated RoleRouter inside Layout if the user is already logged in
const RootRoute = () => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Landing />;
  }
  return (
    <ProtectedRoute>
      <Layout />
    </ProtectedRoute>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Root Landing Page for unauthenticated visitors / Workspace Console for authenticated */}
          <Route path="/" element={<RootRoute />}>
            <Route index element={<RoleRouter />} />
          </Route>

          {/* Dedicated Independent Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />

          {/* Protected Application Workspace Routes */}
          <Route 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/console" element={<RoleRouter />} />
            <Route 
              path="/datasets" 
              element={
                <ProtectedRoute allowedRoles={['DATA_OWNER']}>
                  <Datasets />
                </ProtectedRoute>
              } 
            />
            <Route path="/datasets/:id" element={<DatasetDetails />} />
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute allowedRoles={['DATA_OWNER']}>
                  <UploadDataset />
                </ProtectedRoute>
              } 
            />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/access-control" element={<AccessControl />} />
            <Route 
              path="/research-requests" 
              element={
                <ProtectedRoute allowedRoles={['RESEARCHER', 'ADMIN']}>
                  <MyRequests />
                </ProtectedRoute>
              } 
            />
            <Route path="/consent" element={<ResearchConsent />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
