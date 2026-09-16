/**
 * ============================================================================
 * MÓDULO: Componente Raiz da Aplicação com React Router Dom
 * ARQUIVO: src/App.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Configuração declarativa do Roteamento SPA com rotas protegidas
 *            compatíveis com o portal Coleção Moda (/products, /dashboard,
 *            /bi, /notifications, /gestao, /kanban, /, /login).
 * ============================================================================
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useOutletContext } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/Login/LoginPage';
import { MainLayout } from './components/layout/MainLayout';
import { HomePage } from './pages/Home/HomePage';
import { ProductsPage } from './pages/Products/ProductsPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { BIPage } from './pages/BI/BIPage';
import { NotificationsPage } from './pages/Notifications/NotificationsPage';
import { GestaoPage } from './pages/Gestao/GestaoPage';
import { RelatoriosPage } from './pages/Relatorios/RelatoriosPage';
import { KanbanPage } from './pages/Kanban/KanbanPage';
import type { MarcaSummary } from './types/auth';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const GestaoRouteWrapper: React.FC = () => {
  const { handleOpenColecoesFromGestao } = useOutletContext<{
    handleOpenColecoesFromGestao: (marca: MarcaSummary) => void;
  }>();

  return <GestaoPage onOpenColecoes={handleOpenColecoesFromGestao} />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<HomePage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="bi" element={<BIPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="gestao" element={<GestaoRouteWrapper />} />
              <Route path="relatorios" element={<RelatoriosPage />} />
              <Route path="kanban" element={<KanbanPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
