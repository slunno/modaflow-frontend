/**
 * ============================================================================
 * MÓDULO: Componente Raiz da Aplicação com React Router Dom
 * ARQUIVO: src/App.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Configuração declarativa do Roteamento SPA com rotas protegidas
 *            e suporte a deep linking (/login, /, /gestao, /relatorios, /kanban).
 * ============================================================================
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useOutletContext } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/Login/LoginPage';
import { MainLayout } from './components/layout/MainLayout';
import { HomePage } from './pages/Home/HomePage';
import { GestaoPage } from './pages/Gestao/GestaoPage';
import type { MarcaSummary } from './types/auth';
import { BarChart3, Kanban } from 'lucide-react';

const GestaoRouteWrapper: React.FC = () => {
  const { handleOpenColecoesFromGestao } = useOutletContext<{
    handleOpenColecoesFromGestao: (marca: MarcaSummary) => void;
  }>();

  return <GestaoPage onOpenColecoes={handleOpenColecoesFromGestao} />;
};

const RelatoriosPage: React.FC = () => (
  <div className="max-w-7xl mx-auto p-8">
    <div className="p-12 rounded-xl bg-fabric-pattern border border-border shadow-2xs text-center space-y-3">
      <BarChart3 className="w-12 h-12 text-accent-camel mx-auto opacity-80" />
      <h3 className="text-xl font-bold font-editorial text-primary">
        Módulo de Relatórios & BI Executivo
      </h3>
      <p className="text-xs text-muted-foreground max-w-md mx-auto">
        Histórico consolidado de coleções, índices de repilotagem por marca, consumo de
        matéria-prima e exportação de relatórios gerenciais.
      </p>
    </div>
  </div>
);

const KanbanPage: React.FC = () => (
  <div className="max-w-7xl mx-auto p-8">
    <div className="p-8 rounded-xl bg-surface border border-border text-center">
      <Kanban className="w-12 h-12 text-accent-camel mx-auto mb-3" />
      <h3 className="text-lg font-bold font-editorial text-primary">
        Quadro Kanban de Planejamento Visual
      </h3>
      <p className="text-xs text-muted-foreground mt-1">
        Visualização por colunas com as 23 etapas de produção e drag-and-drop de peças.
      </p>
    </div>
  </div>
);

export default function App() {
  return (
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
            <Route path="gestao" element={<GestaoRouteWrapper />} />
            <Route path="relatorios" element={<RelatoriosPage />} />
            <Route path="kanban" element={<KanbanPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
