import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ModernAuthPage from './components/auth/ModernAuthPage';
import ModernHeader from './components/layout/ModernHeader';
import LoadingScreen from './components/ui/LoadingScreen';
import FarmerDashboard from './components/dashboard/FarmerDashboard';
import BuyerDashboard from './components/dashboard/BuyerDashboard';

const AppContent: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <ModernAuthPage />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <ModernHeader />
        <main>
          <Routes>
            <Route 
              path="/" 
              element={
                currentUser.role === 'farmer' ? (
                  <FarmerDashboard />
                ) : (
                  <BuyerDashboard />
                )
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
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
  );
}

export default App;