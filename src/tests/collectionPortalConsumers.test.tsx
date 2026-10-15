import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LegacyImportNotice } from '../pages/Workspace/LegacyImportNotice';
import { MarcasTab } from '../pages/Gestao/tabs/MarcasTab';
import { COLLECTION_PORTAL_STATE_KEY } from '../services/collectionPortalState';
import { saveWorkspace } from '../services/workspaceService';
import type { MarcaSummary } from '../types/auth';
import type { ColecaoItem } from '../types/plm';

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ activeMarca: { id: 'brand-1', nome: 'King & Joe' } }),
}));
vi.mock('../services/workspaceService', () => ({
  listWorkspace: vi.fn().mockResolvedValue([]),
  saveWorkspace: vi.fn().mockImplementation(async (_kind, data) => ({ id: data.id, data })),
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
const collection: ColecaoItem = {
  id: 'visible',
  marcaId: marca.id,
  nome: 'Coleção preservada',
  marcaNome: marca.nome,
  status: 'Em andamento',
  dataEntrega: '',
  diasAtraso: 0,
};

describe('Coleções arquivadas/excluídas nos consumidores locais', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('não oferece compartilhar uma coleção excluída nem suas fichas, mas mantém os originais', () => {
    const records = JSON.stringify([collection]);
    const pieces = JSON.stringify([{ id: 'p1', marcaId: marca.id, colecaoId: collection.id }]);
    localStorage.setItem('modaflow_user_colecoes', records);
    localStorage.setItem('modaflow_collection_pecas', pieces);
    localStorage.setItem(
      COLLECTION_PORTAL_STATE_KEY,
      JSON.stringify([{ marcaId: marca.id, collectionId: collection.id, hidden: true }])
    );
    const { container } = render(<LegacyImportNotice onImported={() => {}} />);
    expect(container.textContent).toBe('');
    expect(saveWorkspace).not.toHaveBeenCalled();
    expect(localStorage.getItem('modaflow_user_colecoes')).toBe(records);
    expect(localStorage.getItem('modaflow_collection_pecas')).toBe(pieces);
  });

  it('preserva Arquivadas ao compartilhar e não recria coleções excluídas a partir das peças', async () => {
    localStorage.setItem(
      'modaflow_user_colecoes',
      JSON.stringify([collection, { ...collection, id: 'hidden' }])
    );
    localStorage.setItem(
      'modaflow_collection_pecas',
      JSON.stringify([
        { id: 'p1', marcaId: marca.id, colecaoId: collection.id },
        { id: 'p2', marcaId: marca.id, colecaoId: 'hidden' },
      ])
    );
    localStorage.setItem(
      COLLECTION_PORTAL_STATE_KEY,
      JSON.stringify([
        { marcaId: marca.id, collectionId: collection.id, archived: true },
        { marcaId: marca.id, collectionId: 'hidden', hidden: true },
      ])
    );
    render(<LegacyImportNotice onImported={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Compartilhar rascunhos' }));
    await waitFor(() => expect(saveWorkspace).toHaveBeenCalledTimes(2));
    expect(saveWorkspace).toHaveBeenNthCalledWith(
      1,
      'collections',
      expect.objectContaining({ id: 'visible', status: 'Arquivadas' }),
      marca.id
    );
    expect(saveWorkspace).toHaveBeenNthCalledWith(
      2,
      'products',
      expect.objectContaining({ id: 'p1' }),
      marca.id
    );
  });

  it('não inclui coleções excluídas nos totais da marca', () => {
    localStorage.setItem(
      'modaflow_user_colecoes',
      JSON.stringify([collection, { ...collection, id: 'hidden' }])
    );
    localStorage.setItem(
      COLLECTION_PORTAL_STATE_KEY,
      JSON.stringify([{ marcaId: marca.id, collectionId: 'hidden', hidden: true }])
    );
    render(
      <MarcasTab
        marcas={[marca]}
        searchMarca=""
        setSearchMarca={() => {}}
        openMenuMarcaId={null}
        setOpenMenuMarcaId={() => {}}
        onOpenColecoes={() => {}}
        onOpenCriarMarca={() => {}}
        onOpenEditarMarca={() => {}}
        onOpenEditarUsuarios={() => {}}
        onOpenAtualizarTimes={() => {}}
      />
    );
    expect(screen.getByRole('cell', { name: '1' })).toBeDefined();
    expect(screen.queryByRole('cell', { name: '2' })).toBeNull();
  });
});
