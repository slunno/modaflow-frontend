import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { BrandCollectionsView } from '../pages/Home/components/BrandCollectionsView';
import type { MarcaSummary } from '../types/auth';
import type { ColecaoItem } from '../types/plm';
import { getLinxColecoesValidas } from '../services/linxService';

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: null, setActiveMarca: vi.fn() }),
}));
vi.mock('../services/plmService', () => ({ getBrands: vi.fn().mockResolvedValue([]) }));
vi.mock('../services/linxService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/linxService')>()),
  getLinxColecoesValidas: vi
    .fn()
    .mockResolvedValue([
      { codigo: '025', nome: 'Coleção importada', quantidadeProdutos: 7, dataFinal: '2025-12-31' },
    ]),
}));
vi.mock('../pages/Home/components/CollectionDetailView', () => ({
  CollectionDetailView: () => null,
}));

const marca: MarcaSummary = {
  id: 'brand-1',
  nome: 'King & Joe',
  code: 'KJ',
  initials: 'KJ',
  colecoesCount: 0,
  pecasCount: 0,
  heroImageUrl: '',
  description: '',
  badgeTag: '',
};

describe('Nova base somente para próximas coleções do portal', () => {
  beforeEach(() => localStorage.clear());

  it.each([
    { nome: 'King & Joe', code: 'KJ', griffe: 'KING&JOE' },
    { nome: 'K&J Black', code: 'KJB', griffe: 'K&J BLACK' },
    { nome: 'King & Joe Play', code: 'KJP', griffe: 'KING&JOE PLAY' },
  ])('mostra as coleções importadas de $nome em Completas', async (brand) => {
    render(<BrandCollectionsView marca={{ ...marca, ...brand }} onBack={() => {}} />);
    const imported = await screen.findByRole('button', { name: 'Completas (1)' });
    expect(screen.queryByRole('button', { name: /^Todas/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Sem classificação/ })).toBeNull();
    expect(vi.mocked(getLinxColecoesValidas)).toHaveBeenLastCalledWith({ griffe: [brand.griffe] });
    fireEvent.click(imported);
    expect(screen.getByRole('heading', { name: 'Coleção importada' })).toBeDefined();
    expect(screen.getByText('Não informado')).toBeDefined();
    expect(screen.queryByText('Concluído em')).toBeNull();
  });

  it('inclui os registros locais sem classificação em Completas e preserva os outros status', async () => {
    const base: ColecaoItem = {
      id: 'local-finalizada',
      marcaId: marca.id,
      nome: 'Finalizada local',
      marcaNome: marca.nome,
      status: 'Não categorizada',
      dataEntrega: '',
      diasAtraso: 0,
    };
    const registros: ColecaoItem[] = [
      base,
      { ...base, id: 'local-nova', nome: 'Nova local', status: 'Em andamento' },
      { ...base, id: 'local-arquivada', nome: 'Arquivada local', status: 'Arquivadas' },
      { ...base, id: 'outra-marca', nome: 'Outra marca', marcaId: 'outra-marca' },
    ];
    localStorage.setItem('modaflow_user_colecoes', JSON.stringify(registros));
    const onSelectColecao = vi.fn();
    render(
      <BrandCollectionsView marca={marca} onBack={() => {}} onSelectColecao={onSelectColecao} />
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Completas (2)' }));
    expect(screen.getByRole('heading', { name: 'Finalizada local' })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Coleção importada' })).toBeDefined();
    expect(screen.queryByRole('heading', { name: 'Outra marca' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Em andamento (1)' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Arquivadas (1)' })).toBeDefined();
    fireEvent.click(screen.getByRole('heading', { name: 'Finalizada local' }));
    expect(onSelectColecao).toHaveBeenCalledWith({ ...base, status: 'Completas' });
    expect(JSON.parse(localStorage.getItem('modaflow_user_colecoes')!)).toEqual(registros);
  });

  it('marca somente a nova coleção como elegível ao histórico, preservando as anteriores', async () => {
    const anterior: ColecaoItem = {
      id: 'antiga',
      marcaId: marca.id,
      nome: 'Coleção local anterior',
      marcaNome: marca.nome,
      status: 'Em andamento',
      dataEntrega: '',
      diasAtraso: 0,
    };
    localStorage.setItem('modaflow_user_colecoes', JSON.stringify([anterior]));
    render(<BrandCollectionsView marca={marca} onBack={() => {}} />);
    await screen.findByRole('button', { name: 'Completas (1)' });
    fireEvent.click(screen.getByRole('button', { name: 'Coleção +' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByPlaceholderText(/VERÃO 28/), {
      target: { value: 'Coleção nova teste' },
    });
    fireEvent.submit(dialog.querySelector('form')!);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    const stored: ColecaoItem[] = JSON.parse(localStorage.getItem('modaflow_user_colecoes')!);
    const nova = stored.find((item) => item.nome === 'Coleção nova teste');
    expect(nova).toMatchObject({
      marcaId: marca.id,
      griffe: 'KING&JOE',
      status: 'Em andamento',
      regraFicha: 'integracao-colecao-v1',
    });
    expect(Number.isFinite(Date.parse(nova!.criadaEm!))).toBe(true);
    expect(stored.find((item) => item.id === anterior.id)).toEqual(anterior);
  });

  it('cria com a data selecionada no calendário e sem referência de imagem', async () => {
    render(<BrandCollectionsView marca={marca} onBack={() => {}} />);
    await screen.findByRole('button', { name: 'Completas (1)' });
    fireEvent.click(screen.getByRole('button', { name: 'Coleção +' }));
    const dialog = within(screen.getByRole('dialog'));
    expect(dialog.queryByText(/URL da Imagem/i)).toBeNull();
    fireEvent.change(dialog.getByRole('textbox', { name: /Nome da coleção/i }), {
      target: { value: 'Inverno de teste' },
    });
    fireEvent.change(dialog.getByRole('combobox', { name: 'Temporada' }), {
      target: { value: 'Inverno' },
    });
    fireEvent.change(dialog.getByRole('textbox', { name: 'Ano' }), { target: { value: '2028' } });
    fireEvent.change(dialog.getByRole('textbox', { name: /Descrição/ }), {
      target: { value: 'Descrição de teste' },
    });
    fireEvent.click(dialog.getByRole('button', { name: /^Data de entrega/ }));
    fireEvent.change(dialog.getByRole('combobox', { name: 'Ano da entrega' }), {
      target: { value: '2028' },
    });
    fireEvent.change(dialog.getByRole('combobox', { name: 'Mês da entrega' }), {
      target: { value: '1' },
    });
    fireEvent.click(dialog.getByRole('button', { name: 'terça-feira, 29 de fevereiro de 2028' }));
    fireEvent.click(dialog.getByRole('button', { name: 'Criar Coleção' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    const stored: ColecaoItem[] = JSON.parse(localStorage.getItem('modaflow_user_colecoes')!);
    expect(stored[0]).toMatchObject({
      nome: 'Inverno de teste',
      ano: '2028',
      temporada: 'Inverno',
      descricao: 'Descrição de teste',
      dataEntrega: '29/02/2028',
      status: 'Em andamento',
    });
    expect(stored[0]).not.toHaveProperty('imagemReferencia');
    expect(stored[0]?.diasParaEntrega).toEqual(expect.any(Number));
  });

  it('fecha somente o calendário no primeiro Escape e restaura o foco ao fechar o modal', async () => {
    render(<BrandCollectionsView marca={marca} onBack={() => {}} />);
    await screen.findByRole('button', { name: 'Completas (1)' });
    const open = screen.getByRole('button', { name: 'Coleção +' });
    open.focus();
    fireEvent.click(open);
    const dialog = within(screen.getByRole('dialog'));
    expect(document.activeElement).toBe(dialog.getByRole('textbox', { name: /Nome da coleção/i }));
    fireEvent.click(dialog.getByRole('button', { name: /^Data de entrega/ }));
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.queryByRole('grid')).toBeNull();
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(open);
    expect(localStorage.getItem('modaflow_user_colecoes')).toBeNull();
  });

  it('mantém o foco no modal e não altera coleções existentes ao cancelar', async () => {
    const anterior: ColecaoItem = {
      id: 'com-imagem',
      marcaId: marca.id,
      nome: 'Coleção anterior',
      marcaNome: marca.nome,
      status: 'Em andamento',
      dataEntrega: '20/12/2026',
      diasAtraso: 0,
      imagemReferencia: 'https://example.com/imagem-existente.jpg',
    };
    localStorage.setItem('modaflow_user_colecoes', JSON.stringify([anterior]));
    render(<BrandCollectionsView marca={marca} onBack={() => {}} />);
    await screen.findByRole('button', { name: 'Completas (1)' });
    fireEvent.click(screen.getByRole('button', { name: 'Coleção +' }));
    const dialog = within(screen.getByRole('dialog'));
    const close = dialog.getByRole('button', { name: 'Fechar modal' });
    const submit = dialog.getByRole('button', { name: 'Criar Coleção' });
    close.focus();
    fireEvent.keyDown(close, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(submit);
    fireEvent.keyDown(submit, { key: 'Tab' });
    expect(document.activeElement).toBe(close);
    fireEvent.change(dialog.getByRole('textbox', { name: /Nome da coleção/i }), {
      target: { value: 'Rascunho não criado' },
    });
    fireEvent.click(dialog.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(JSON.parse(localStorage.getItem('modaflow_user_colecoes')!)).toEqual([anterior]);
    expect(document.body.style.overflow).not.toBe('hidden');
    fireEvent.click(screen.getByRole('button', { name: 'Coleção +' }));
    expect(
      (screen.getByRole('textbox', { name: /Nome da coleção/i }) as HTMLInputElement).value
    ).toBe('Rascunho não criado');
  });
});
