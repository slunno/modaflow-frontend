import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Outlet } from 'react-router-dom';
import App from '../App';

vi.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('../contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('../components/auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('../components/layout/MainLayout', () => ({
  MainLayout: () => <Outlet context={{ handleOpenColecoesFromGestao: vi.fn() }} />,
}));
vi.mock('../pages/Home/HomePage', () => ({ default: () => <h1>Marcas e coleções anteriores</h1> }));
vi.mock('../pages/Products/ProductsPage', () => ({ default: () => <h1>Catálogo anterior</h1> }));
vi.mock('../pages/Dashboard/DashboardPage', () => ({ default: () => <h1>Dashboard anterior</h1> }));
vi.mock('../pages/BI/BIPage', () => ({ default: () => <h1>Gráficos anteriores</h1> }));
vi.mock('../pages/Notifications/NotificationsPage', () => ({
  default: () => <h1>Notificações anteriores</h1>,
}));
vi.mock('../pages/Gestao/GestaoPage', () => ({ default: () => <h1>Gestão anterior</h1> }));
vi.mock('../pages/Relatorios/RelatoriosPage', () => ({
  default: () => <h1>Relatórios anteriores</h1>,
}));
vi.mock('../pages/Kanban/KanbanPage', () => ({ default: () => <h1>Kanban anterior</h1> }));
vi.mock('../pages/Workspace/WorkspaceShell', () => ({ default: () => <Outlet /> }));
vi.mock('../pages/Workspace/CollectionsPage', () => ({
  CollectionsPage: () => <h1>Coleções compartilhadas preservadas</h1>,
}));
vi.mock('../pages/Workspace/ModelsPage', () => ({
  ModelsPage: () => <h1>Peças compartilhadas preservadas</h1>,
}));
vi.mock('../pages/Workspace/ProductRecordPage', () => ({
  ProductRecordPage: () => <h1>Ficha compartilhada preservada</h1>,
}));
vi.mock('../pages/Workspace/AnalyticsPage', () => ({
  AnalyticsPage: () => <h1>Indicadores compartilhados preservados</h1>,
}));
vi.mock('../pages/Workspace/WorkflowPage', () => ({
  WorkflowPage: () => <h1>Fluxo compartilhado preservado</h1>,
}));
vi.mock('../pages/Workspace/RegistryPage', () => ({
  RegistryPage: () => <h1>Cadastros compartilhados preservados</h1>,
}));
afterEach(cleanup);

describe('Restauração das páginas principais sem excluir a área compartilhada', () => {
  it.each([
    ['/', 'Marcas e coleções anteriores'],
    ['/?marca=1&colecao=c1', 'Marcas e coleções anteriores'],
    ['/catalogo-legado', 'Marcas e coleções anteriores'],
    ['/products', 'Catálogo anterior'],
    ['/dashboard', 'Dashboard anterior'],
    ['/bi', 'Gráficos anteriores'],
    ['/notifications', 'Notificações anteriores'],
    ['/gestao', 'Gestão anterior'],
    ['/gestao/fornecedores', 'Gestão anterior'],
    ['/gestao/tags', 'Gestão anterior'],
    ['/relatorios', 'Relatórios anteriores'],
    ['/kanban', 'Kanban anterior'],
    ['/colecoes', 'Coleções compartilhadas preservadas'],
    ['/pecas', 'Peças compartilhadas preservadas'],
    ['/pecas/modelo1', 'Ficha compartilhada preservada'],
    ['/workspace/dashboard', 'Indicadores compartilhados preservados'],
    ['/workspace/kanban', 'Fluxo compartilhado preservado'],
    ['/workspace/gestao/tags', 'Cadastros compartilhados preservados'],
  ])('abre %s na tela correspondente', async (path, heading) => {
    window.history.replaceState({}, '', path);
    render(<App />);
    expect(await screen.findByRole('heading', { name: heading })).toBeDefined();
  });
});
