import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ChatPage from '../pages/chat/ChatPage';
import ChatLayout from '../layouts/ChatLayout';

import { PublicRoute } from '../components/auth/PublicRoute';

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      
      <Route
        path="/"
        element={
          <ChatLayout />
        }
      >
        <Route index element={<ChatPage />} />
        <Route path="c/:conversationId" element={<ChatPage />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
