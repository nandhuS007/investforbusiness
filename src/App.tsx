import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Pricing from './pages/Pricing';
import BusinessDetails from './pages/BusinessDetails';
import AddListing from './pages/AddListing';
import AcquirerDashboard from './pages/AcquirerDashboard';
 import EnquiryChat from './pages/EnquiryChat';

// Admin Imports
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSellers from './pages/admin/AdminSellers';
import AdminPlanRequests from './pages/admin/AdminPlanRequests';
import AdminListings from './pages/admin/AdminListings';
import AdminEnquiries from './pages/admin/AdminEnquiries';
import AdminNotifications from './pages/admin/AdminNotifications';

// Merchant Imports
import MerchantLayout from './pages/merchant/MerchantLayout';
import MerchantDashboard from './pages/MerchantDashboard';
import MerchantListings from './pages/merchant/MerchantListings';
import MerchantEnquiries from './pages/merchant/MerchantEnquiries';
import MerchantSubscription from './pages/merchant/MerchantSubscription';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: string }> = ({ children, role }) => {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-corporate-gray">
      <div className="w-12 h-12 border-4 border-royal-blue border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  
  // Admin bypasses all checks
  if (isAdmin) return <>{children}</>;
  
  // Specific role checks
  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/about" element={<div className="p-20 text-center text-royal-blue font-bold text-3xl">About Invest 4 Business</div>} />
          <Route path="/pricing" element={
            <ProtectedRoute role="seller">
              <Pricing />
            </ProtectedRoute>
          } />
          
          {/* Business Details (Public but login encouraged) */}
          <Route path="/business/:id" element={<BusinessDetails />} />

          {/* Protected Routes */}
          <Route path="/merchant" element={
            <ProtectedRoute role="seller">
              <MerchantLayout />
            </ProtectedRoute>
          }>
            <Route index element={<MerchantDashboard />} />
            <Route path="listings" element={<MerchantListings />} />
            <Route path="enquiries" element={<MerchantEnquiries />} />
            <Route path="membership" element={<MerchantSubscription />} />
            <Route path="add-listing" element={<AddListing />} />
          </Route>
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="sellers" element={<AdminSellers />} />
            <Route path="plan-requests" element={<AdminPlanRequests />} />
            <Route path="listings" element={<AdminListings />} />
            <Route path="enquiries" element={<AdminEnquiries />} />
            <Route path="notifications" element={<AdminNotifications />} />
          </Route>
          <Route path="/acquirer" element={
            <ProtectedRoute role="acquirer">
              <AcquirerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/chat/:enquiryId" element={
            <ProtectedRoute>
              <EnquiryChat />
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
