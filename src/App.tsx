import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './components/pages/Landing';
import Registration from './components/pages/Registration';
import Login from './components/pages/Login';
import Dashboard from './components/pages/Dashboard';
import AboutUs from './components/pages/AboutUs';
import Merch from './components/pages/Merch';
import ForgotPassword from './components/pages/ForgotPassword';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/merch" element={<Merch />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}