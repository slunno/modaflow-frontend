import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CollectionDetailView } from '../pages/Home/components/CollectionDetailView';
import type { MarcaSummary } from '../types/auth';
import type { ColecaoItem, PecaItem } from '../types/plm';

vi.mock('../services/api', () => ({
  api: {
    get: vi
      .fn()
      .mockResolvedValue({ subgrupos: [], linhas: [], griffes: [], grades: [], categorias: [] }),
  },
}));
vi.mock('../services/linxService', () => ({
  getLinxSubgrupos: vi.fn().mockResolvedValue(['Bata', 'Overshirt']),
  resolveLinxGriffe: vi.fn().mockReturnValue(null),
  getLinxProdutosDaColecao: vi.fn().mockResolvedValue([]),
  getLinxCoresCatalogo: vi.fn().mockResolvedValue([]),
  getLinxCoresMostruario: vi
    .fn()
    .mockResolvedValue(Array.from({ length: 65 }, (_, index) => `Cor ${index + 1}`)),
  getLinxModelagens: vi.fn().mockResolvedValue([]),
}));
const marca: MarcaSummary = {
  id: 'brand-1',
  nome: 'Marca',
  code: 'KJ',
  initials: 'KJ',
  colecoesCount: 0,
  pecasCount: 0,
  heroImageUrl: '',
  description: '',
  badgeTag: '',
};
const colecao: ColecaoItem = {
  id: 'collection-1',
  nome: 'Coleção',
  marcaNome: 'Marca',
  status: 'Em andamento',
  dataEntrega: '',
  diasAtraso: 0,
};

describe('Identificação manual e mostruário da ficha', () => {
  beforeEach(() => localStorage.clear());
  it('cria duas Batas sem códigos fictícios e edita somente a ficha escolhida', async () => {
    render(
      <CollectionDetailView
        marca={marca}
        colecao={colecao}
        onBackToBrand={() => {}}
        onBackToHome={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Peças \+/ }));
    expect(await screen.findByRole('option', { name: 'Selecione uma peça' })).toBeDefined();
    await screen.findByRole('option', { name: 'Bata' });
    fireEvent.change(screen.getByLabelText('Quantidade'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Nome da peça'), { target: { value: 'Bata' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    const created: PecaItem[] = JSON.parse(
      localStorage.getItem('modaflow_collection_pecas') || '[]'
    );
    expect(created).toHaveLength(2);
    expect(created.map((piece) => piece.etapaAtual)).toEqual([
      '01 geração de ficha',
      '01 geração de ficha',
    ]);
    expect(created.map((piece) => [piece.nome, piece.codigo])).toEqual([
      ['Bata', ''],
      ['Bata', ''],
    ]);
    expect(created[0]?.id).not.toEqual(created[1]?.id);
    expect(created[0]?.historicoAlteracoes?.[0]).toMatchObject({
      titulo: 'Peça criada',
      nomePeca: 'Bata',
    });
    fireEvent.click(screen.getAllByRole('button', { name: 'Ficha técnica' })[1]!);
    expect((screen.getByLabelText('Nome do Produto') as HTMLInputElement).value).toBe('');
    expect(screen.queryByLabelText('Código de Referência')).toBeNull();
    expect((screen.getByLabelText('Categoria') as HTMLInputElement).value).toBe('');
    fireEvent.change(screen.getByLabelText('Nome do Produto'), {
      target: { value: 'Bata criada por mim' },
    });
    fireEvent.change(screen.getByLabelText('Categoria'), {
      target: { value: 'BATA DE TESTE' },
    });
    fireEvent.change(screen.getByLabelText('Código do produto'), {
      target: { value: 'NOVO-01' },
    });
    fireEvent.focus(screen.getByRole('combobox', { name: 'Cor de mostruário' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Cor 65' }));
    fireEvent.click(screen.getByRole('option', { name: 'Cor 1' }));
    fireEvent.blur(screen.getByRole('combobox', { name: 'Cor de mostruário' }));
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    const saved: PecaItem[] = JSON.parse(localStorage.getItem('modaflow_collection_pecas') || '[]');
    expect(saved[0]).toMatchObject({ nome: 'Bata', codigo: '' });
    expect(saved[1]?.codigo).toBe('NOVO-01');
    expect(saved[1]?.fichaTecnica).toMatchObject({
      nomeProduto: 'Bata criada por mim',
      integracao: { categoria: 'BATA DE TESTE' },
      coresMostruario: [{ nome: 'Cor 65' }, { nome: 'Cor 1' }],
    });
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Ficha técnica' })[1]!);
    await waitFor(() =>
      expect((screen.getByLabelText('Nome do Produto') as HTMLInputElement).value).toBe(
        'Bata criada por mim'
      )
    );
    expect(screen.queryByLabelText('Código de Referência')).toBeNull();
    expect((screen.getByLabelText('Categoria') as HTMLInputElement).value).toBe('BATA DE TESTE');
    expect((screen.getByLabelText('Código do produto') as HTMLInputElement).value).toBe('NOVO-01');
  });
});
