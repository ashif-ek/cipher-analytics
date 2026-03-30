import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import DashboardOverview from '../pages/DashboardOverview';
import ResearcherDashboard from '../pages/ResearcherDashboard';

const RoleRouter = () => {
  let role = 'DATA_OWNER';
  try {
    const token = localStorage.getItem('access_token');
    if (token) role = jwtDecode(token).role;
  } catch (e) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'RESEARCHER') {
    return <ResearcherDashboard />;
  }

  return <DashboardOverview />;
};

export default RoleRouter;
