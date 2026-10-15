import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BrandCollectionsView } from '../pages/Home/components/BrandCollectionsView';
import { CollectionActionsMenu } from '../pages/Home/components/CollectionActionsMenu';
import { COLLECTION_PORTAL_STATE_KEY } from '../services/collectionPortalState';
import { saveLocalState } from '../services/localStateStorage';
import type { MarcaSummary } from '../types/auth';
import type { ColecaoItem } from '../types/plm';

vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({ user: null, setActiveMarca: vi.fn() }) }));
vi.mock('../services/plmService', () => ({ getBrands: vi.fn().mockResolvedValue([]) }));
vi.mock('../services/linxService', async (original) => ({
  ...(await original<typeof import('../services/linxService')>()),
  getLinxColecoesValidas: vi
    .fn()
    .mockResolvedValue([{ codigo: '025', nome: 'Coleção Linx', quantidadeProdutos: 7 }]),
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
const collection: ColecaoItem = {
  id: 'colecao-local',
  marcaId: marca.id,
  nome: 'Verão local',
  marcaNome: marca.nome,
  status: 'Em andamento',
  regraFicha: 'integracao-colecao-v1',
  dataEntrega: '10/11/2026',
  diasAtraso: 0,
  pecasTotal: 3,
};
const records = [collection, { ...collection, marcaId: 'outra-marca', nome: 'Outra marca' }];

function openActions(name = collection.nome) {
  fireEvent.click(screen.getByRole('button', { name: `Opções da coleção ${name}` }));
  return within(screen.getByRole('menu', { name: `Ações da coleção ${name}` }));
}
async function renderCollections() {
  const selected = vi.fn();
  const view = render(
    <BrandCollectionsView marca={marca} onBack={() => {}} onSelectColecao={selected} />
  );
  await screen.findByRole('button', { name: 'Completas (1)' });
  return { ...view, selected };
}

describe('Ações das coleções no portal', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('modaflow_user_colecoes', JSON.stringify(records));
    localStorage.setItem(
      'modaflow_collection_pecas',
      JSON.stringify([{ id: 'p-1', colecaoId: collection.id, ficha: { nome: 'Ficha preservada' } }])
    );
    localStorage.setItem(
      'modaflow_ficha_attachments',
      JSON.stringify([{ id: 'anexo', collectionId: collection.id }])
    );
  });
  afterEach(() => vi.restoreAllMocks());

  it('abre o menu sem abrir a coleção e mantém a abertura pelo título', async () => {
    const { selected } = await renderCollections();
    const menu = openActions();
    expect(menu.getByRole('menuitem', { name: 'Arquivar' })).toBeDefined();
    expect(menu.getByRole('menuitem', { name: 'Excluir' })).toBeDefined();
    expect(selected).not.toHaveBeenCalled();
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: `Abrir coleção ${collection.nome}` }));
    expect(selected).toHaveBeenCalledExactlyOnceWith(collection);
  });

  it('arquiva, persiste ao reabrir e permite desarquivar sem alterar os dados originais', async () => {
    const originalPieces = localStorage.getItem('modaflow_collection_pecas');
    const view = await renderCollections();
    fireEvent.click(openActions().getByRole('menuitem', { name: 'Arquivar' }));
    expect(screen.getByRole('button', { name: 'Arquivadas (1)' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Em andamento (0)' })).toBeDefined();
    expect(screen.queryByRole('article', { name: `Coleção ${collection.nome}` })).toBeNull();
    expect(JSON.parse(localStorage.getItem('modaflow_user_colecoes')!)).toEqual(records);
    view.unmount();
    await renderCollections();
    fireEvent.click(screen.getByRole('button', { name: 'Arquivadas (1)' }));
    expect(screen.getByRole('article', { name: `Coleção ${collection.nome}` })).toBeDefined();
    fireEvent.click(openActions().getByRole('menuitem', { name: 'Desarquivar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Em andamento (1)' }));
    expect(screen.getByRole('article', { name: `Coleção ${collection.nome}` })).toBeDefined();
    expect(localStorage.getItem('modaflow_collection_pecas')).toBe(originalPieces);
    expect(JSON.parse(localStorage.getItem(COLLECTION_PORTAL_STATE_KEY)!)).toEqual([]);
  });

  it('desfaz o arquivamento e restaura os contadores', async () => {
    await renderCollections();
    fireEvent.click(openActions().getByRole('menuitem', { name: 'Arquivar' }));
    const undo = screen.getByRole('button', { name: 'Desfazer' });
    expect(document.activeElement).toBe(undo);
    fireEvent.click(undo);
    expect(screen.getByRole('button', { name: 'Em andamento (1)' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Arquivadas (0)' })).toBeDefined();
    expect(screen.getByRole('article', { name: `Coleção ${collection.nome}` })).toBeDefined();
  });

  it('só exclui após confirmar, preserva fichas/anexos e permite desfazer', async () => {
    const originalPieces = localStorage.getItem('modaflow_collection_pecas');
    const originalAttachments = localStorage.getItem('modaflow_ficha_attachments');
    const { selected } = await renderCollections();
    fireEvent.click(openActions().getByRole('menuitem', { name: 'Excluir' }));
    expect(selected).not.toHaveBeenCalled();
    const dialog = within(screen.getByRole('dialog', { name: 'Excluir coleção?' }));
    expect(dialog.getByText(/Nenhum dado será excluído ou alterado no Linx/)).toBeDefined();
    expect(localStorage.getItem(COLLECTION_PORTAL_STATE_KEY)).toBeNull();
    fireEvent.click(dialog.getByRole('button', { name: 'Cancelar' }));
    expect(screen.getByRole('article', { name: `Coleção ${collection.nome}` })).toBeDefined();
    fireEvent.click(openActions().getByRole('menuitem', { name: 'Excluir' }));
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Excluir coleção',
      })
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByRole('article', { name: `Coleção ${collection.nome}` })).toBeNull();
    expect(localStorage.getItem('modaflow_collection_pecas')).toBe(originalPieces);
    expect(localStorage.getItem('modaflow_ficha_attachments')).toBe(originalAttachments);
    expect(JSON.parse(localStorage.getItem('modaflow_user_colecoes')!)).toEqual(records);
    fireEvent.click(screen.getByRole('button', { name: 'Desfazer' }));
    expect(screen.getByRole('article', { name: `Coleção ${collection.nome}` })).toBeDefined();
  });

  it('mantém uma coleção Linx excluída fora da lista após nova consulta sem alterar a outra marca', async () => {
    const view = await renderCollections();
    fireEvent.click(screen.getByRole('button', { name: 'Completas (1)' }));
    fireEvent.click(openActions('Coleção Linx').getByRole('menuitem', { name: 'Excluir' }));
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Excluir coleção',
      })
    );
    expect(screen.getByRole('button', { name: 'Completas (0)' })).toBeDefined();
    view.unmount();
    const next = render(<BrandCollectionsView marca={marca} onBack={() => {}} />);
    await screen.findByRole('heading', { name: collection.nome });
    await screen.findByRole('button', { name: 'Opções da coleção Verão local' });
    expect(screen.getByRole('button', { name: 'Completas (0)' })).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Completas (0)' }));
    expect(screen.queryByRole('article', { name: 'Coleção Coleção Linx' })).toBeNull();
    expect(JSON.parse(localStorage.getItem('modaflow_user_colecoes')!)[1]).toEqual(records[1]);
    next.unmount();
  });

  it('desarquiva uma coleção Linx para Completas, não para Em andamento', async () => {
    await renderCollections();
    fireEvent.click(screen.getByRole('button', { name: 'Completas (1)' }));
    fireEvent.click(openActions('Coleção Linx').getByRole('menuitem', { name: 'Arquivar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Arquivadas (1)' }));
    fireEvent.click(openActions('Coleção Linx').getByRole('menuitem', { name: 'Desarquivar' }));
    expect(screen.getByRole('button', { name: 'Completas (1)' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Em andamento (1)' })).toBeDefined();
  });

  it('mostra erro sem retirar a coleção quando o armazenamento falha', async () => {
    await renderCollections();
    const menu = openActions();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new DOMException('Sem espaço', 'QuotaExceededError');
    });
    fireEvent.click(menu.getByRole('menuitem', { name: 'Arquivar' }));
    expect(screen.getByRole('alert').textContent).toContain('Não foi possível salvar');
    expect(screen.getByRole('article', { name: `Coleção ${collection.nome}` })).toBeDefined();
    expect(screen.queryByRole('button', { name: 'Desfazer' })).toBeNull();
  });

  it('não sobrescreve mudanças mais recentes ao desfazer', async () => {
    await renderCollections();
    fireEvent.click(openActions().getByRole('menuitem', { name: 'Arquivar' }));
    act(() =>
      saveLocalState(COLLECTION_PORTAL_STATE_KEY, [
        { marcaId: marca.id, collectionId: collection.id, archived: true, hidden: true },
      ])
    );
    fireEvent.click(screen.getByRole('button', { name: 'Desfazer' }));
    expect(screen.getByRole('alert').textContent).toContain('Não foi possível desfazer');
    expect(JSON.parse(localStorage.getItem(COLLECTION_PORTAL_STATE_KEY)!)[0].hidden).toBe(true);
  });
});

describe('Acessibilidade do menu de coleção', () => {
  it('navega com as setas, Home/End e Escape e fecha ao clicar fora', () => {
    const archive = vi.fn(),
      remove = vi.fn();
    render(
      <CollectionActionsMenu
        name="Teste"
        archived={false}
        canRestore={false}
        onArchive={archive}
        onDelete={remove}
      />
    );
    const trigger = screen.getByRole('button', { name: 'Opções da coleção Teste' });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Arquivar' }));
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Excluir' }));
    fireEvent.keyDown(document.activeElement!, { key: 'Home' });
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Arquivar' }));
    fireEvent.keyDown(document.activeElement!, { key: 'End' });
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    fireEvent.keyDown(trigger, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Excluir' }));
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('menu')).toBeNull();
    expect(archive).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });
});
