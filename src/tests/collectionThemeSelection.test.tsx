import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { CollectionDetailView } from '../pages/Home/components/CollectionDetailView';
import type { MarcaSummary } from '../types/auth';
import type { ColecaoItem, PecaItem } from '../types/plm';
import type { CollectionTheme } from '../services/collectionThemes';

vi.mock('../services/linxService', () => ({
  getLinxSubgrupos: vi.fn().mockResolvedValue(['Bata', 'Overshirt']),
  resolveLinxGriffe: vi.fn().mockReturnValue(null),
  getLinxProdutosDaColecao: vi.fn().mockResolvedValue([]),
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
const view = () => (
  <CollectionDetailView
    marca={marca}
    colecao={colecao}
    onBackToBrand={() => {}}
    onBackToHome={() => {}}
  />
);
const theme = (id: string, name: string, collectionId = colecao.id): CollectionTheme => ({
  id,
  collectionId,
  name,
  colors: [],
  delivery: '',
  deliveryDate: '',
});
const readPieces = (): PecaItem[] =>
  JSON.parse(localStorage.getItem('modaflow_collection_pecas') || '[]');

async function openPieceDialog(buttonName: RegExp = /Peças \+/) {
  fireEvent.click(screen.getByRole('button', { name: buttonName }));
  const dialog = within(screen.getByRole('dialog', { name: 'Adicionar peças' }));
  await dialog.findByRole('option', { name: 'Bata' });
  return dialog;
}

describe('Seleção de tema ao adicionar peças à coleção', () => {
  beforeEach(() => localStorage.clear());

  it('liga o tema criado na aba Temas ao lote de peças, atualiza os totais e mantém a escolha salva', async () => {
    localStorage.setItem(
      'modaflow_collection_themes',
      JSON.stringify([theme('other', 'Outra coleção', 'collection-2')])
    );
    const { unmount } = render(view());
    fireEvent.click(screen.getByRole('button', { name: 'Temas' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tema' }));
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Ametista' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar tema' }));
    fireEvent.click(screen.getByRole('button', { name: 'Peças' }));

    const dialog = await openPieceDialog();
    const select = dialog.getByRole('combobox', { name: 'Tema' }) as HTMLSelectElement;
    expect(select.value).toBe('Base');
    expect(Array.from(select.options, (option) => option.textContent)).toEqual([
      'Base',
      'Ametista',
    ]);
    fireEvent.change(select, { target: { value: 'Ametista' } });
    fireEvent.change(dialog.getByLabelText('Quantidade'), { target: { value: '2' } });
    fireEvent.change(dialog.getByLabelText('Nome da peça'), { target: { value: 'Bata' } });
    fireEvent.click(dialog.getByRole('button', { name: 'Adicionar' }));

    expect(readPieces()).toHaveLength(2);
    expect(readPieces().map((piece) => [piece.colecaoId, piece.tema])).toEqual([
      ['collection-1', 'Ametista'],
      ['collection-1', 'Ametista'],
    ]);
    expect(screen.getAllByText('Ametista')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Temas' }));
    const cards = screen.getAllByRole('article');
    expect(within(cards[0]!).getByText('0 / 0')).toBeDefined();
    expect(within(cards[1]!).getByText('Ametista')).toBeDefined();
    expect(within(cards[1]!).getByText('0 / 2')).toBeDefined();

    unmount();
    render(view());
    expect(screen.getAllByText('Ametista')).toHaveLength(2);
    const reopened = await openPieceDialog();
    expect((reopened.getByLabelText('Tema') as HTMLSelectElement).value).toBe('Base');
    expect(reopened.getByRole('option', { name: 'Ametista' })).toBeDefined();
    expect(reopened.queryByRole('option', { name: 'Outra coleção' })).toBeNull();
  });

  it('mantém Base como padrão quando a coleção ainda não tem temas cadastrados', async () => {
    render(view());
    const dialog = await openPieceDialog(/Adicionar Peça/);
    const select = dialog.getByRole('combobox', { name: 'Tema' }) as HTMLSelectElement;
    expect(Array.from(select.options, (option) => option.value)).toEqual(['Base']);
    fireEvent.change(dialog.getByLabelText('Nome da peça'), { target: { value: 'Bata' } });
    fireEvent.click(dialog.getByRole('button', { name: 'Adicionar' }));
    expect(readPieces()[0]).toMatchObject({ nome: 'Bata', tema: 'Base' });
  });

  it('oferece os temas já usados nas peças sem duplicar nomes e reinicia em Base ao reabrir o modal', async () => {
    localStorage.setItem('modaflow_collection_themes', JSON.stringify([theme('summer', 'Verão')]));
    const piece: PecaItem = {
      id: 'existing',
      colecaoId: colecao.id,
      marcaId: marca.id,
      nome: 'Bata',
      tipo: 'Bata',
      codigo: '',
      tema: 'verão',
      status: 'Em andamento',
      etapaAtual: '—',
      colecaoNome: colecao.nome,
      marcaNome: marca.nome,
      estilista: '',
      tecidos: [],
      previsaoEntrega: '—',
    };
    localStorage.setItem(
      'modaflow_collection_pecas',
      JSON.stringify([
        piece,
        { ...piece, id: 'imported', tema: 'Urbano' },
        { ...piece, id: 'other', colecaoId: 'collection-2', tema: 'Praia' },
      ])
    );
    render(view());
    const dialog = await openPieceDialog();
    const select = dialog.getByRole('combobox', { name: 'Tema' }) as HTMLSelectElement;
    expect(Array.from(select.options, (option) => option.value)).toEqual([
      'Base',
      'Verão',
      'Urbano',
    ]);
    fireEvent.change(select, { target: { value: 'Urbano' } });
    fireEvent.click(dialog.getByRole('button', { name: 'Cancelar' }));
    const reopened = await openPieceDialog();
    expect((reopened.getByLabelText('Tema') as HTMLSelectElement).value).toBe('Base');
  });
});
