import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardOverview from './pages/DashboardOverview';
import Datasets from './pages/Datasets';
import DatasetDetails from './pages/DatasetDetails';
import UploadDataset from './pages/UploadDataset';
import AuditLogs from './pages/AuditLogs';
import AccessControl from './pages/AccessControl';
import ResearchConsent from './pages/ResearchConsent';
import Settings from './pages/Settings';

import { AuthProvider } from './components/auth/AuthLayout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            } 
          >
            <Route index element={<DashboardOverview />} />
            <Route path="datasets" element={<Datasets />} />
            <Route path="datasets/:id" element={<DatasetDetails />} />
            <Route path="upload" element={<UploadDataset />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="access-control" element={<AccessControl />} />
            <Route path="consent" element={<ResearchConsent />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
