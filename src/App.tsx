import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AuthProvider } from './contexts/AuthContext';
import Landing from './components/pages/Landing';
import RegistrationNew from './components/pages/RegistrationNew';
import LoginNew from './components/pages/LoginNew';
import ForgotPassword from './components/pages/ForgotPassword';
import ResetPassword from './components/pages/ResetPassword';
import Dashboard from './components/pages/Dashboard';
import AboutUs from './components/pages/AboutUs';
import Merch from './components/pages/Merch';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/merch" element={<Merch />} />
          <Route path="/register" element={<RegistrationNew />} />
          <Route path="/login" element={<LoginNew />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <SpeedInsights />
      </AuthProvider>
    </Router>
  );
}