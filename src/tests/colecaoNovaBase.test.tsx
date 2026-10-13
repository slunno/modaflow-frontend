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
});
