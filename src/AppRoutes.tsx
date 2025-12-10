/**
 * 🛣️ App Routes - React Router configuration
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { ProtectedRoute } from './components/protected-route';
import App from '../App';
import { LandingPage } from './components/landing/LandingPage';

import { useAuthStore } from './store/auth.store';

export function AppRoutes() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/app" replace /> : <LandingPage />}
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/app" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/app" replace /> : <RegisterPage />}
        />

        {/* Protected routes - Main app */}
        <Route
          path="/app/*"
          element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

