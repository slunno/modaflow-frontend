import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
const mocks = vi.hoisted(() => ({ logout: vi.fn(), setActiveMarca: vi.fn() }));
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      nome: 'Usuário de teste',
      email: 'test@example.invalid',
      cargo: 'Estilista',
      marcas: [{ id: '1', nome: 'Marca' }],
    },
    activeMarca: { id: '1', nome: 'Marca' },
    logout: mocks.logout,
    setActiveMarca: mocks.setActiveMarca,
  }),
}));
vi.mock('../hooks/useWorkspace', () => ({
  useWorkspace: () => ({ brand: '1', rows: [], loading: false, error: '', reload: vi.fn() }),
}));
vi.mock('../components/ui/ThemeToggle', () => ({ ThemeToggle: () => null }));
function openManagementGroup(label: string) {
  const cadastros = [
    'Marcas',
    'Tecidos',
    'Aviamentos',
    'Características e medidas',
    'Tipos de peça',
    'Tags',
    'Campos customizados',
  ];
  const operacao = ['Custos fixos', 'Regras de precificação', 'Fluxos e etapas'];
  fireEvent.click(
    screen.getByRole('button', {
      name: cadastros.includes(label)
        ? 'Cadastros'
        : operacao.includes(label)
          ? 'Operação'
          : 'Administração',
    })
  );
}
function CurrentRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <h1>{location.pathname}</h1>
      <output aria-label="Contexto atual">{location.search}</output>
      <button onClick={() => navigate(-1)}>Voltar no histórico</button>
    </>
  );
}
function mount(path = '/dashboard?marca=1&colecao=c1') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="*" element={<CurrentRoute />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
describe('Navegação superior e continuidade do contexto', () => {
  it.each([
    ['/dashboard', 'Dashboard'],
    ['/colecoes', 'Coleções'],
    ['/pecas', 'Peças / Fichas técnicas'],
    ['/bi', 'Relatórios e BI'],
    ['/kanban', 'Kanban'],
    ['/gestao/tags', 'Tags'],
    ['/gestao/fluxos', 'Fluxos e etapas'],
  ])('abre %s diretamente e sinaliza a rota ativa', (path, label) => {
    mount(path);
    if (['/dashboard', '/bi', '/colecoes', '/pecas'].includes(path))
      fireEvent.click(screen.getByRole('button', { name: 'Relatórios' }));
    if (path.startsWith('/gestao')) {
      fireEvent.click(screen.getByRole('button', { name: 'Gestão' }));
      openManagementGroup(label);
    }
    const nav = within(screen.getByRole('navigation', { name: 'Navegação principal' }));
    expect(nav.getByRole('link', { name: label }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('heading', { name: path })).toBeDefined();
  });
  it('leva marca e coleção do dashboard ao BI e à lista e acompanha Voltar', () => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Relatórios' }));
    fireEvent.click(screen.getByRole('link', { name: 'Relatórios e BI' }));
    expect(screen.getByLabelText('Contexto atual').textContent).toBe('?marca=1&colecao=c1');
    fireEvent.click(screen.getByRole('button', { name: 'Relatórios' }));
    fireEvent.click(screen.getByRole('link', { name: 'Peças / Fichas técnicas' }));
    expect(screen.getByRole('heading', { name: '/pecas' })).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Voltar no histórico' }));
    expect(screen.getByRole('heading', { name: '/bi' })).toBeDefined();
  });
  it('oferece rotas reais nos menus suspensos e omite fornecedores e submenus duplicados', () => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Gestão' }));
    const nav = within(screen.getByRole('navigation', { name: 'Navegação principal' }));
    expect(nav.queryByText('Fornecedores')).toBeNull();
    expect(screen.queryByRole('navigation', { name: 'Submenu de Relatórios' })).toBeNull();
    for (const label of [
      'Custos fixos',
      'Regras de precificação',
      'Tipos de peça',
      'Campos customizados',
      'Tecidos',
      'Aviamentos',
      'Características e medidas',
    ]) {
      openManagementGroup(label);
      expect(nav.getByRole('link', { name: label }).getAttribute('href')).toMatch(/^\/gestao\//);
    }
  });
  it('abre e fecha a navegação móvel ao escolher uma página', () => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir navegação' }));
    expect(screen.getByRole('button', { name: 'Fechar navegação', expanded: true })).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Gestão' }));
    openManagementGroup('Tags');
    fireEvent.click(screen.getByRole('link', { name: 'Tags' }));
    expect(
      screen.getByRole('button', { name: 'Abrir navegação' }).getAttribute('aria-expanded')
    ).toBe('false');
  });
  it('envia a busca à lista mantendo o contexto', () => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Marca, coleção e busca' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Buscar modelos ou códigos' }), {
      target: { value: 'Bata' },
    });
    fireEvent.submit(screen.getByRole('search'));
    expect(screen.getByRole('heading', { name: '/pecas' })).toBeDefined();
    expect(screen.getByLabelText('Contexto atual').textContent).toContain('q=Bata');
  });
  it('Escape fecha primeiro a categoria e depois Gestão, restaurando o foco', () => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Gestão' }));
    openManagementGroup('Tags');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('link', { name: 'Tags' })).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cadastros' }));
    expect(screen.getByRole('button', { name: 'Gestão' }).getAttribute('aria-expanded')).toBe(
      'true'
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Gestão' }));
    expect(screen.getByRole('button', { name: 'Gestão' }).getAttribute('aria-expanded')).toBe(
      'false'
    );
  });
  it('setas entram e saem da categoria sem navegar nem perder o contexto', () => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Gestão' }));
    fireEvent.keyDown(screen.getByRole('button', { name: 'Operação' }), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Custos fixos' }));
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' });
    expect(screen.queryByRole('link', { name: 'Custos fixos' })).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Operação' }));
    expect(screen.getByLabelText('Contexto atual').textContent).toBe('?marca=1&colecao=c1');
  });
  it('fecha a conta ao clicar fora e mantém logout funcional', () => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Conta de Usuário de teste' }));
    expect(screen.getByRole('button', { name: 'Sair da conta' })).toBeDefined();
    fireEvent.mouseDown(screen.getByRole('heading'));
    expect(screen.queryByRole('button', { name: 'Sair da conta' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Conta de Usuário de teste' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sair da conta' }));
    expect(mocks.logout).toHaveBeenCalledOnce();
  });
});
