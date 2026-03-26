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
import VerifyOTP from './pages/VerifyOTP';

// Temporary placeholders while components are built
const Placeholder = ({ title }) => <div className="flex items-center justify-center h-full text-slate-400">{title}</div>;

function App() {
  return (
    <Router>
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
          <Route path="access-control" element={<Placeholder title="Access Control Management" />} />
          <Route path="consent" element={<Placeholder title="Research Consent & Policy" />} />
          <Route path="settings" element={<Placeholder title="System Settings" />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
