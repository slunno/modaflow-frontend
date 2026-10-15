import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { GestaoPage } from '../pages/Gestao/GestaoPage';
import { GESTAO_TABS, resolveGestaoTab } from '../pages/Gestao/gestaoNavigation';

vi.mock('../services/api', () => ({
  ApiError: class extends Error {},
  api: { get: vi.fn(async () => []), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'teste', nome: 'Teste', cargo: 'Administrador', marcas: [] },
    activeMarca: null,
  }),
}));
afterEach(cleanup);

function mount(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/gestao" element={<GestaoPage onOpenColecoes={() => {}} />} />
        <Route path="/gestao/:tab" element={<GestaoPage onOpenColecoes={() => {}} />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Abas de Gestão solicitadas', () => {
  it('mantém as oito abas restantes sem os cinco itens retirados do menu', () => {
    expect(GESTAO_TABS.map((tab) => tab.label)).toEqual([
      'Usuários',
      'Tecidos',
      'Aviamentos',
      'Características',
      'Precificação',
      'Tags',
      'Fluxos',
      'Campos Customizados',
    ]);
  });
  it.each(GESTAO_TABS.map((tab) => tab.id))('mantém a aba %s selecionável', (id) => {
    expect(resolveGestaoTab(id)).toBe(id);
  });
  it.each([
    undefined,
    'marcas',
    'times',
    'times-legado',
    'custos_fixos',
    'tipos_peca',
    'fornecedores',
    'inexistente',
  ])('abre Usuários em vez de mostrar a aba retirada %s', (tab) => {
    expect(resolveGestaoTab(tab)).toBe('usuarios');
  });
  it('preserva o vínculo de Características para links antigos', () => {
    expect(resolveGestaoTab('caracteristicas-legado')).toBe('caracteristicas');
  });
  it.each([
    '/gestao',
    '/gestao/marcas',
    '/gestao/times',
    '/gestao/custos_fixos',
    '/gestao/tipos_peca',
    '/gestao/fornecedores',
  ])('não apresenta os itens removidos ao abrir %s', async (path) => {
    mount(path);
    const menu = within(screen.getByRole('navigation', { name: 'Cadastros de Gestão' }));
    for (const label of ['Marcas', 'Times', 'Custos Fixos', 'Tipos de Peça', 'Fornecedores']) {
      expect(menu.queryByRole('button', { name: label })).toBeNull();
    }
    expect(menu.getAllByRole('button')).toHaveLength(8);
    const row = menu.getByRole('button', { name: 'Usuários' }).parentElement!;
    expect(row.classList.contains('justify-center')).toBe(true);
    expect(row.classList.contains('min-w-full')).toBe(true);
    expect(menu.getByRole('button', { name: 'Usuários' }).getAttribute('aria-current')).toBe(
      'page'
    );
    expect(await screen.findByRole('heading', { name: 'Usuários' })).toBeDefined();
  });
});
