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

import React, { Suspense, lazy } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useOutletContext,
  useParams,
  useLocation,
} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import type { MarcaSummary } from './types/auth';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const LoginPage = lazy(() => import('./pages/Login/LoginPage'));
const HomePage = lazy(() => import('./pages/Home/HomePage'));
const ProductsPage = lazy(() => import('./pages/Products/ProductsPage'));
const AnalyticsPage = lazy(() =>
  import('./pages/Workspace/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage }))
);
const ModelsPage = lazy(() =>
  import('./pages/Workspace/ModelsPage').then((m) => ({ default: m.ModelsPage }))
);
const CollectionsPage = lazy(() =>
  import('./pages/Workspace/CollectionsPage').then((m) => ({ default: m.CollectionsPage }))
);
const ProductRecordPage = lazy(() =>
  import('./pages/Workspace/ProductRecordPage').then((m) => ({ default: m.ProductRecordPage }))
);
const RegistryPage = lazy(() =>
  import('./pages/Workspace/RegistryPage').then((m) => ({ default: m.RegistryPage }))
);
const WorkflowPage = lazy(() =>
  import('./pages/Workspace/WorkflowPage').then((m) => ({ default: m.WorkflowPage }))
);
import type { RegistryKind } from './types/workspace';
const GestaoPage = lazy(() => import('./pages/Gestao/GestaoPage'));

const RouteLoadingFallback: React.FC = () => (
  <div
    role="status"
    aria-label="Carregando módulo..."
    className="flex-1 flex flex-col items-center justify-center min-h-[50vh] p-8"
  >
    <div className="w-10 h-10 rounded-full border-2 border-stone-700 border-t-amber-600 animate-spin" />
    <span className="sr-only">Carregando...</span>
  </div>
);

const GestaoRouteWrapper: React.FC = () => {
  const { tab } = useParams();
  const { handleOpenColecoesFromGestao } = useOutletContext<{
    handleOpenColecoesFromGestao: (marca: MarcaSummary) => void;
  }>();

  const kinds: Record<string, RegistryKind> = {
    custos_fixos: 'fixed-costs',
    precificacao: 'pricing',
    tipos_peca: 'piece-types',
    tags: 'tags',
    fluxos: 'flows',
    campos_custom: 'custom-fields',
    caracteristicas: 'measurements',
    times: 'teams',
  };
  return tab && kinds[tab] ? (
    <RegistryPage key={kinds[tab]} kind={kinds[tab]} />
  ) : (
    <GestaoPage onOpenColecoes={handleOpenColecoesFromGestao} />
  );
};

function StartRoute() {
  const { search } = useLocation();
  return <Navigate to={'/dashboard' + search} replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<RouteLoadingFallback />}>
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
                  <Route index element={<StartRoute />} />
                  <Route path="catalogo-legado" element={<HomePage />} />
                  <Route path="colecoes" element={<CollectionsPage />} />
                  <Route path="pecas" element={<ModelsPage />} />
                  <Route path="pecas/:id" element={<ProductRecordPage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="dashboard" element={<AnalyticsPage dashboard />} />
                  <Route path="bi" element={<AnalyticsPage />} />
                  <Route path="notifications" element={<AnalyticsPage notifications />} />
                  <Route path="gestao" element={<GestaoRouteWrapper />} />
                  <Route path="gestao/:tab" element={<GestaoRouteWrapper />} />
                  <Route path="relatorios" element={<AnalyticsPage />} />
                  <Route path="kanban" element={<WorkflowPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
