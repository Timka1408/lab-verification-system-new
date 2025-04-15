import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Құрылым компоненттері
import Layout from './components/Layout';

// Беттер
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AssignmentsPage from './pages/AssignmentsPage';
import AssignmentDetailPage from './pages/AssignmentDetailPage';
import SubmissionPage from './pages/SubmissionPage';
import SubmissionDetailPage from './pages/SubmissionDetailPage';
import ProfilePage from './pages/ProfilePage';

// Қорғалған бағыт компоненті
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Тек оқытушыға арналған бағыт компоненті
const TeacherRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  return (
    <Routes>
      {/* Жалпыға қолжетімді бағыттар */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Қорғалған бағыттар */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="assignments/:id" element={<AssignmentDetailPage />} />
        <Route path="submissions" element={<SubmissionPage />} />
        <Route path="submissions/:id" element={<SubmissionDetailPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      
      {/* Барлық қалған бағыттар */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
