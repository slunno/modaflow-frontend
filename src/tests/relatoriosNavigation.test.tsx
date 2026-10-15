import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';

const mocks = vi.hoisted(() => ({
  logout: vi.fn(),
  getNotifications: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { nome: 'Usuário de teste', email: 'teste@example.invalid', cargo: 'Estilista' },
    logout: mocks.logout,
  }),
}));

vi.mock('../services/plmService', () => ({ getNotifications: mocks.getNotifications }));
vi.mock('../components/ui/ThemeToggle', () => ({ ThemeToggle: () => null }));

function HistoryControl() {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(-1)}>
      Voltar no histórico de navegação
    </button>
  );
}

function renderLayout(path = '/gestao') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <HistoryControl />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<h1>Tela inicial</h1>} />
          <Route path="products" element={<h1>Tela de Peças</h1>} />
          <Route path="dashboard" element={<h1>Tela de Dashboard</h1>} />
          <Route path="bi" element={<h1>Tela de Gráficos</h1>} />
          <Route path="gestao" element={<h1>Tela de Gestão</h1>} />
          <Route path="kanban" element={<h1>Tela de Kanban</h1>} />
          <Route path="relatorios" element={<h1>Tela legada de Relatórios</h1>} />
          <Route path="notifications" element={<h1>Tela de Notificações</h1>} />
        </Route>
        <Route path="/login" element={<h1>Tela de Login</h1>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getNotifications.mockResolvedValue([]);
});

afterEach(cleanup);

describe('Submenu horizontal de Relatórios', () => {
  it('abre Peças diretamente pelo cabeçalho, sem expandir um menu suspenso', async () => {
    renderLayout();
    const principal = within(screen.getByRole('navigation', { name: 'Navegação principal' }));
    const relatorios = principal.getByRole('button', { name: 'Relatórios' });

    expect(relatorios.hasAttribute('aria-expanded')).toBe(false);
    expect(screen.queryByRole('navigation', { name: 'Submenu de Relatórios' })).toBeNull();
    fireEvent.click(relatorios);

    expect(await screen.findByRole('heading', { name: 'Tela de Peças' })).toBeDefined();
    const submenu = within(screen.getByRole('navigation', { name: 'Submenu de Relatórios' }));
    const row = submenu.getByRole('link', { name: 'Peças' }).parentElement!;
    expect(row.classList.contains('justify-center')).toBe(true);
    expect(row.classList.contains('min-w-full')).toBe(true);
    expect(submenu.getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Peças',
      'Dashboard',
      'Gráficos',
    ]);
    expect(submenu.queryAllByRole('button')).toHaveLength(0);
    expect(relatorios.getAttribute('aria-current')).toBe('location');
  });

  it.each([
    ['/products', 'Peças'],
    ['/dashboard', 'Dashboard'],
    ['/bi', 'Gráficos'],
    ['/dashboard/', 'Dashboard'],
  ])('indica a aba ativa ao acessar diretamente %s', async (path, label) => {
    renderLayout(path);
    await waitFor(() => expect(mocks.getNotifications).toHaveBeenCalled());

    const submenu = within(screen.getByRole('navigation', { name: 'Submenu de Relatórios' }));
    const active = submenu.getByRole('link', { name: label });
    expect(active.getAttribute('aria-current')).toBe('page');
    expect(active.className).toContain('border-b-2 border-primary');
    expect(
      submenu.getAllByRole('link').filter((link) => link.hasAttribute('aria-current'))
    ).toEqual([active]);
  });

  it('mantém as rotas existentes e acompanha o voltar do navegador', async () => {
    renderLayout('/products');
    const getSubmenu = () =>
      within(screen.getByRole('navigation', { name: 'Submenu de Relatórios' }));

    expect(getSubmenu().getByRole('link', { name: 'Peças' }).getAttribute('href')).toBe(
      '/products'
    );
    expect(getSubmenu().getByRole('link', { name: 'Dashboard' }).getAttribute('href')).toBe(
      '/dashboard'
    );
    expect(getSubmenu().getByRole('link', { name: 'Gráficos' }).getAttribute('href')).toBe('/bi');

    fireEvent.click(getSubmenu().getByRole('link', { name: 'Dashboard' }));
    expect(await screen.findByRole('heading', { name: 'Tela de Dashboard' })).toBeDefined();
    fireEvent.click(getSubmenu().getByRole('link', { name: 'Gráficos' }));
    expect(await screen.findByRole('heading', { name: 'Tela de Gráficos' })).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Voltar no histórico de navegação' }));
    expect(await screen.findByRole('heading', { name: 'Tela de Dashboard' })).toBeDefined();
    expect(getSubmenu().getByRole('link', { name: 'Dashboard' }).getAttribute('aria-current')).toBe(
      'page'
    );
    expect(screen.getAllByRole('navigation', { name: 'Submenu de Relatórios' })).toHaveLength(1);
  });

  it.each(['/', '/gestao', '/kanban', '/notifications'])(
    'não mostra o submenu de Relatórios em %s',
    async (path) => {
      renderLayout(path);
      await waitFor(() => expect(mocks.getNotifications).toHaveBeenCalled());

      expect(screen.queryByRole('navigation', { name: 'Submenu de Relatórios' })).toBeNull();
      expect(
        within(screen.getByRole('navigation', { name: 'Navegação principal' }))
          .getByRole('button', { name: 'Relatórios' })
          .hasAttribute('aria-current')
      ).toBe(false);
    }
  );

  it('remove a barra de Relatórios ao voltar para Gestão', async () => {
    renderLayout('/bi');
    fireEvent.click(
      within(screen.getByRole('navigation', { name: 'Navegação principal' })).getByRole('button', {
        name: 'Gestão',
      })
    );

    expect(await screen.findByRole('heading', { name: 'Tela de Gestão' })).toBeDefined();
    expect(screen.queryByRole('navigation', { name: 'Submenu de Relatórios' })).toBeNull();
  });

  it('abre a mesma seção no celular e fecha o menu mobile', async () => {
    renderLayout();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu de navegação' }));
    const mobile = within(screen.getByRole('navigation', { name: 'Navegação mobile' }));

    expect(mobile.queryByRole('button', { name: 'Peças' })).toBeNull();
    expect(mobile.queryByRole('button', { name: 'Dashboard' })).toBeNull();
    expect(mobile.queryByRole('button', { name: 'Gráficos' })).toBeNull();
    fireEvent.click(mobile.getByRole('button', { name: 'Relatórios' }));

    expect(await screen.findByRole('heading', { name: 'Tela de Peças' })).toBeDefined();
    expect(screen.queryByRole('navigation', { name: 'Navegação mobile' })).toBeNull();
    expect(screen.getByRole('navigation', { name: 'Submenu de Relatórios' })).toBeDefined();
    expect(
      screen.getByRole('button', { name: 'Abrir menu de navegação' }).getAttribute('aria-expanded')
    ).toBe('false');
  });

  it('preserva a rota legada sem acrescentar uma segunda barra de sub-abas', async () => {
    renderLayout('/relatorios');
    await waitFor(() => expect(mocks.getNotifications).toHaveBeenCalled());

    expect(screen.getByRole('heading', { name: 'Tela legada de Relatórios' })).toBeDefined();
    expect(screen.queryByRole('navigation', { name: 'Submenu de Relatórios' })).toBeNull();
    expect(
      within(screen.getByRole('navigation', { name: 'Navegação principal' }))
        .getByRole('button', { name: 'Relatórios' })
        .getAttribute('aria-current')
    ).toBe('location');
  });

  it('preserva marca e coleção entre as abas de Relatórios', async () => {
    renderLayout('/products?marca=1&colecao=c1');
    fireEvent.click(screen.getByRole('link', { name: 'Dashboard' }));
    expect(await screen.findByRole('heading', { name: 'Tela de Dashboard' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Gráficos' }).getAttribute('href')).toBe(
      '/bi?marca=1&colecao=c1'
    );
  });

  it('continua fechando o menu da conta ao clicar fora', async () => {
    renderLayout('/products');
    await waitFor(() => expect(mocks.getNotifications).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Conta de Usuário de teste' }));
    expect(screen.getByRole('button', { name: 'Sair do Sistema' })).toBeDefined();
    fireEvent.mouseDown(screen.getByRole('heading', { name: 'Tela de Peças' }));
    expect(screen.queryByRole('button', { name: 'Sair do Sistema' })).toBeNull();
  });
});
