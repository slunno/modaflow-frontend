/**
 * ============================================================================
 * COMPONENTE: Proteção de Rotas (ProtectedRoute)
 * ARQUIVO: src/components/auth/ProtectedRoute.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: HOC de guarda de rota para redirecionar usuários não autenticados
 *            para a página de login preservando a rota de destino original.
 * ============================================================================
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
