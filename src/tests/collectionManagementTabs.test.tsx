import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { PecaItem } from '../types/plm';
import type { CollectionTheme } from '../services/collectionThemes';
import { usePersistedState } from '../hooks/usePersistedState';
import { getLinxCoresCatalogo } from '../services/linxService';
import {
  CollectionThemesTab,
  CollectionPrintsTab,
  CollectionColorsTab,
} from '../pages/Home/components/CollectionManagementTabs';

vi.mock('../services/plmService', () => ({
  getInsumos: vi.fn().mockResolvedValue([]),
  createInsumo: vi.fn(),
}));
vi.mock('../services/linxService', () => ({
  getLinxCoresCatalogo: vi.fn().mockResolvedValue([]),
  getLinxCoresBasicas: vi.fn().mockResolvedValue([]),
  getLinxFornecedores: vi
    .fn()
    .mockResolvedValue([{ fornecedor: 'Fornecedor real', codigo: '0070' }]),
}));

const piece = (id: string, status: string, tema = 'Base'): PecaItem => ({
  id,
  colecaoId: 'collection-1',
  codigo: id,
  nome: id,
  tipo: 'Camisa',
  status,
  etapaAtual: '—',
  tema,
  colecaoNome: 'Coleção',
  marcaNome: 'Marca',
  estilista: '',
  tecidos: [],
  previsaoEntrega: '—',
});

function CollectionThemesHarness(props: {
  collectionId: string;
  collectionName: string;
  pieces: PecaItem[];
}) {
  const [themes, setThemes] = usePersistedState<CollectionTheme[]>(
    'modaflow_collection_themes',
    []
  );
  return (
    <CollectionThemesTab
      {...props}
      savedThemes={themes}
      onSaveTheme={(theme, previousId) =>
        setThemes((previous) => [...previous.filter((item) => item.id !== previousId), theme])
      }
    />
  );
}

describe('Abas de gestão da coleção', () => {
  beforeEach(() => localStorage.clear());

  it('sempre mostra Base e calcula progresso pelas peças do mesmo tema', () => {
    render(
      <CollectionThemesHarness
        collectionId="collection-1"
        collectionName="Coleção"
        pieces={[
          piece('A', 'Completa'),
          piece('B', 'Em andamento'),
          piece('C', 'Completa', 'Verão'),
        ]}
      />
    );
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(2);
    const baseCard = cards[0];
    if (!baseCard) throw new Error('Card Base ausente');
    expect(within(baseCard).getByText('Base')).toBeDefined();
    expect(within(baseCard).getByText('50%')).toBeDefined();
    expect(within(baseCard).getByText('1 / 2')).toBeDefined();
    expect(within(baseCard).queryByText(/Cores:/)).toBeNull();
  });

  it('salva um tema adicional com entrega e data sem criar cores para Base', () => {
    render(
      <CollectionThemesHarness collectionId="collection-1" collectionName="Coleção" pieces={[]} />
    );
    fireEvent.click(screen.getByRole('button', { name: /Tema/i }));
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Cápsula' } });
    fireEvent.change(screen.getByLabelText('Escolher ou digitar cor'), {
      target: { value: 'Azul' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Incluir cor no tema' }));
    fireEvent.change(screen.getByLabelText('Escolher ou digitar cor'), {
      target: { value: 'Verde' },
    });
    fireEvent.keyDown(screen.getByLabelText('Escolher ou digitar cor'), { key: 'Enter' });
    fireEvent.change(screen.getByLabelText('Entrega'), { target: { value: 'Lote 1' } });
    fireEvent.change(screen.getByLabelText('Data de entrega'), { target: { value: '2026-10-01' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar tema' }));
    expect(screen.getByText('Cápsula')).toBeDefined();
    expect(screen.getByText('Cores: Azul, Verde')).toBeDefined();
    expect(localStorage.getItem('modaflow_collection_themes')).toContain('Cápsula');
  });

  it('permite criar estampa com referência informada pelo usuário', () => {
    render(<CollectionPrintsTab collectionId="collection-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Estampa' }));
    fireEvent.change(screen.getByLabelText('Código de referência'), {
      target: { value: 'REF-123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(screen.getByText('REF-123')).toBeDefined();
    expect(localStorage.getItem('modaflow_collection_prints')).toContain('REF-123');
  });

  it('abre a seleção de tecidos vazia sem inserir itens fictícios', async () => {
    render(<CollectionPrintsTab collectionId="collection-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Estampa' }));
    fireEvent.click(screen.getByRole('button', { name: '+ Tecido' }));
    expect(await screen.findByText(/Nenhum tecido cadastrado para esta busca/)).toBeDefined();
    expect(screen.getByRole('button', { name: '+ Novo tecido' })).toBeDefined();
  });

  it('adiciona uma cor de tecido local à coleção com paleta e fornecedor, sem gravar na API', async () => {
    localStorage.setItem(
      'modaflow_local_insumos',
      JSON.stringify([
        {
          id: 'fabric-1',
          type: 'TECIDO',
          nome: 'Tecido',
          codigo: 'T1',
          fornecedores: '',
          custo: '',
          unidade: 'Metros',
          temErp: false,
          coresList: [{ id: 'color-1', nome: 'Azul teste', codigo: 'AZ-01', hex: '#112233' }],
        },
      ])
    );
    render(<CollectionColorsTab collectionId="collection-1" />);
    expect(screen.getByText('Nenhuma cor adicionada à coleção.')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Selecionar cor' }));
    fireEvent.click(await screen.findByRole('button', { name: /Azul teste/i }));
    fireEvent.change(screen.getByLabelText('Paleta'), { target: { value: 'Verão' } });
    fireEvent.click(screen.getByRole('button', { name: '+ Fornecedor' }));
    fireEvent.focus(screen.getByRole('combobox', { name: 'Fornecedor' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Fornecedor real — 0070' }));
    fireEvent.click(
      within(screen.getByRole('dialog', { name: 'Adicionar Cor' })).getByRole('button', {
        name: 'Adicionar cor',
      })
    );
    expect(screen.getByText('Azul teste')).toBeDefined();
    expect(screen.getByText('Código: AZ-01')).toBeDefined();
    expect(screen.getByLabelText('Amostra de Azul teste')).toBeDefined();
    const saved = JSON.parse(localStorage.getItem('modaflow_collection_colors') || '[]');
    expect(saved[0]).toMatchObject({
      collectionId: 'collection-1',
      paleta: 'Verão',
      hex: '#112233',
      fornecedoresList: [{ fornecedor: 'Fornecedor real', codigo: '0070' }],
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sem paleta' }));
    expect(screen.queryByText('Azul teste')).toBeNull();
  });

  it('permite repetir a consulta de cores e criar uma cor mesmo durante uma falha', async () => {
    vi.mocked(getLinxCoresCatalogo)
      .mockRejectedValueOnce(new Error('Indisponível'))
      .mockResolvedValueOnce(['Areia']);
    render(<CollectionColorsTab collectionId="collection-1" />);
    const retry = await screen.findByRole('button', { name: 'Tentar novamente' });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar cor' }));
    expect(screen.getByRole('dialog', { name: 'Adicionar Cor' })).toBeDefined();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(retry);
    await screen.findByRole('button', { name: 'Adicionar cor' });
    expect(await screen.findByText('Nenhuma cor adicionada à coleção.')).toBeDefined();
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Tentar novamente' })).toBeNull()
    );
  });
});
