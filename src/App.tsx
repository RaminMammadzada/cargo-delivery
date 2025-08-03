import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import CreateOrderPage from './pages/orders/CreateOrderPage';
import { UserRole } from './types';

const AppContent: React.FC = () => {
  const { initializeAuth, isAuthenticated } = useAuth();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          
          {/* Customer routes */}
          <Route path="orders/create" element={
            <ProtectedRoute requiredRole={UserRole.CUSTOMER}>
              <CreateOrderPage />
            </ProtectedRoute>
          } />
          
          {/* Placeholder routes - will be implemented in next iterations */}
          <Route path="orders" element={<div className="p-6"><h1 className="text-2xl font-bold">Orders Page</h1><p>Coming soon...</p></div>} />
          <Route path="packages" element={<div className="p-6"><h1 className="text-2xl font-bold">Packages Page</h1><p>Coming soon...</p></div>} />
          <Route path="tracking" element={<div className="p-6"><h1 className="text-2xl font-bold">Tracking Page</h1><p>Coming soon...</p></div>} />
          <Route path="warehouse" element={<div className="p-6"><h1 className="text-2xl font-bold">Warehouse Page</h1><p>Coming soon...</p></div>} />
          <Route path="users" element={<div className="p-6"><h1 className="text-2xl font-bold">Users Page</h1><p>Coming soon...</p></div>} />
          <Route path="organizations" element={<div className="p-6"><h1 className="text-2xl font-bold">Organizations Page</h1><p>Coming soon...</p></div>} />
          <Route path="analytics" element={<div className="p-6"><h1 className="text-2xl font-bold">Analytics Page</h1><p>Coming soon...</p></div>} />
          <Route path="payments" element={<div className="p-6"><h1 className="text-2xl font-bold">Payments Page</h1><p>Coming soon...</p></div>} />
          <Route path="documents" element={<div className="p-6"><h1 className="text-2xl font-bold">Documents Page</h1><p>Coming soon...</p></div>} />
          <Route path="settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Settings Page</h1><p>Coming soon...</p></div>} />
          <Route path="notifications" element={<div className="p-6"><h1 className="text-2xl font-bold">Notifications Page</h1><p>Coming soon...</p></div>} />
          <Route path="help" element={<div className="p-6"><h1 className="text-2xl font-bold">Help & Support Page</h1><p>Coming soon...</p></div>} />
          <Route path="profile" element={<div className="p-6"><h1 className="text-2xl font-bold">Profile Page</h1><p>Coming soon...</p></div>} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        } />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;