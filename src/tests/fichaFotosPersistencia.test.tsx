import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CollectionDetailView } from '../pages/Home/components/CollectionDetailView';
import { PecaFichaTecnicaView } from '../pages/Home/components/PecaFichaTecnicaView';
import { PecaImagem } from '../pages/Home/components/PecaImagem';
import {
  addFichaAnexos,
  getFichaImagem,
  type FichaAnexo,
  type FichaAnexoCategoria,
} from '../services/fichaAnexosStorage';
import { LOCAL_PECAS_KEY, savePecaLocal } from '../services/localPecasStorage';
import type { PecaItem } from '../types/plm';
import { marca, colecao, peca } from '../../tests/manual/precificacao/fixtures';

const memory = vi.hoisted(() => ({ files: [] as FichaAnexo[] }));
vi.mock('../services/api', () => ({ api: { get: vi.fn().mockResolvedValue([]), post: vi.fn() } }));
vi.mock('../services/linxService', async (original) => ({
  ...(await original<typeof import('../services/linxService')>()),
  getLinxModelagens: vi.fn().mockResolvedValue([]),
  getLinxCoresMostruario: vi.fn().mockResolvedValue([]),
}));
vi.mock('../services/fichaAnexosStorage', async (original) => ({
  ...(await original<typeof import('../services/fichaAnexosStorage')>()),
  listFichaAnexos: vi.fn(async (key: string) =>
    memory.files.filter((file) => file.pieceKey === key)
  ),
  getFichaImagem: vi.fn(
    async (key: string, id?: string, excluded: string[] = []) =>
      memory.files.find(
        (file) => file.pieceKey === key && (!id || file.id === id) && !excluded.includes(file.id)
      )?.arquivo ?? null
  ),
  removeFichaAnexo: vi.fn(async (id: string) => {
    memory.files = memory.files.filter((file) => file.id !== id);
  }),
  addFichaAnexos: vi.fn(async (pieceKey: string, categoria: FichaAnexoCategoria, files: File[]) => {
    const saved = files.map((file) => ({
      id: crypto.randomUUID(),
      pieceKey,
      categoria,
      nome: file.name,
      tamanho: file.size,
      tipo: file.type,
      arquivo: file,
      criadoEm: Date.now(),
    }));
    memory.files.push(...saved);
    return saved;
  }),
}));

beforeEach(() => {
  localStorage.clear();
  memory.files = [];
  vi.clearAllMocks();
  vi.stubGlobal(
    'URL',
    Object.assign(URL, {
      createObjectURL: vi.fn((file: File) => `blob:${file.name}`),
      revokeObjectURL: vi.fn(),
    })
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
const stored = () => (JSON.parse(localStorage.getItem(LOCAL_PECAS_KEY)!) as PecaItem[])[0]!;
const photo = (name: string) => new File(['foto'], name, { type: 'image/png' });
const openCollection = () =>
  render(
    <CollectionDetailView
      marca={marca}
      colecao={colecao}
      onBackToBrand={() => {}}
      onBackToHome={() => {}}
    />
  );
async function openVariants() {
  fireEvent.click(screen.getByRole('button', { name: 'Variantes' }));
  await waitFor(() => expect(screen.queryByText('Carregando anexos…')).toBeNull());
}
async function upload(name: string, file: File) {
  fireEvent.click(screen.getByText('Trocar imagem', { exact: true }));
  fireEvent.change(screen.getByLabelText(`Imagem da peça — ${name}`, { selector: 'input' }), {
    target: { files: [file] },
  });
  await screen.findByText('Imagem salva.', { exact: true });
  await waitFor(() =>
    expect(screen.getByAltText(`Variante ${name}`).getAttribute('src')).toBe(`blob:${file.name}`)
  );
}

describe('Fotos persistidas da peça e das variantes', () => {
  it('salva arquivos sem base64, reabre as duas fotos e usa só a Principal na coleção', async () => {
    savePecaLocal(structuredClone(peca));
    const view = openCollection();
    fireEvent.click(screen.getByRole('button', { name: /Ficha técnica/ }));
    await openVariants();
    const largePhoto = new File([new Uint8Array(3 * 1024 * 1024)], 'principal.png', {
      type: 'image/png',
    });
    await upload('Principal', largePhoto);
    const firstId = stored().fichaTecnica!.variantes![0]!.imagemAnexoId;
    expect(firstId).toBeTruthy();
    expect(stored().fichaTecnica!.variantes![0]!.imagemUrl).toBeUndefined();
    expect(localStorage.getItem(LOCAL_PECAS_KEY)!.length).toBeLessThan(20000);
    fireEvent.click(screen.getByRole('tab', { name: 'Selecionar variante Outra' }));
    await upload('Outra', photo('outra.png'));
    const variants = stored().fichaTecnica!.variantes!;
    expect(variants[0]!.imagemAnexoId).toBe(firstId);
    expect(variants[1]!.imagemAnexoId).not.toBe(firstId);
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    await waitFor(() =>
      expect(screen.getByAltText(peca.nome).getAttribute('src')).toBe('blob:principal.png')
    );
    view.unmount();
    openCollection();
    await waitFor(() =>
      expect(screen.getByAltText(peca.nome).getAttribute('src')).toBe('blob:principal.png')
    );
    fireEvent.click(screen.getByRole('button', { name: /Ficha técnica/ }));
    await openVariants();
    expect((await screen.findByAltText('Variante Principal')).getAttribute('src')).toBe(
      'blob:principal.png'
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Selecionar variante Outra' }));
    expect(screen.getByAltText('Variante Outra').getAttribute('src')).toBe('blob:outra.png');
  });

  it('preserva a foto anterior quando o arquivo ou o vínculo não pode ser salvo', async () => {
    const item = structuredClone(peca);
    item.fichaTecnica!.variantes![0]!.imagemUrl = 'data:image/png;base64,anterior';
    const save = vi.fn(savePecaLocal);
    render(
      <PecaFichaTecnicaView
        peca={item}
        marca={marca}
        colecao={colecao}
        onBack={() => {}}
        onUpdatePeca={save}
      />
    );
    await openVariants();
    fireEvent.click(screen.getByText('Trocar imagem', { exact: true }));
    vi.mocked(addFichaAnexos).mockRejectedValueOnce(
      new DOMException('Quota', 'QuotaExceededError')
    );
    const input = screen.getByLabelText('Imagem da peça — Principal', { selector: 'input' });
    fireEvent.change(input, { target: { files: [photo('falhou.png')] } });
    await screen.findAllByText(/Verifique o espaço disponível/);
    expect(screen.getByAltText('Variante Principal').getAttribute('src')).toBe(
      item.fichaTecnica!.variantes![0]!.imagemUrl
    );
    expect(save).not.toHaveBeenCalled();
    save.mockImplementationOnce(() => {
      throw new Error('Falha ao gravar ficha');
    });
    fireEvent.change(input, { target: { files: [photo('sem-vinculo.png')] } });
    await screen.findAllByText('Falha ao gravar ficha');
    expect(memory.files).toHaveLength(0);
    expect(screen.queryByText('Imagem salva.', { exact: true })).toBeNull();
    expect(screen.getByAltText('Variante Principal').getAttribute('src')).toBe(
      item.fichaTecnica!.variantes![0]!.imagemUrl
    );
  });

  it('só confirma a prévia depois de salvar os metadados e mantém a saída bloqueada enquanto grava', async () => {
    let finish!: () => void;
    const save = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        })
    );
    render(
      <PecaFichaTecnicaView
        peca={structuredClone(peca)}
        marca={marca}
        colecao={colecao}
        onBack={() => {}}
        onUpdatePeca={save}
      />
    );
    await openVariants();
    fireEvent.click(screen.getByText('Trocar imagem', { exact: true }));
    fireEvent.change(screen.getByLabelText('Imagem da peça — Principal', { selector: 'input' }), {
      target: { files: [photo('aguarde.png')] },
    });
    await waitFor(() => expect(save).toHaveBeenCalledOnce());
    expect(screen.queryByAltText('Variante Principal')).toBeNull();
    expect(screen.getByRole('button', { name: 'Voltar' }).hasAttribute('disabled')).toBe(true);
    await act(async () => {
      finish();
    });
    await screen.findByText('Imagem salva.', { exact: true });
    expect(screen.getByAltText('Variante Principal').getAttribute('src')).toBe('blob:aguarde.png');
  });

  it('remove a foto sem fazer reaparecer o croqui antigo ou a foto de outra variante', async () => {
    const item = structuredClone(peca);
    item.imagemCroquiUrl = 'data:image/png;base64,antiga';
    savePecaLocal(item);
    openCollection();
    fireEvent.click(screen.getByRole('button', { name: /Ficha técnica/ }));
    await openVariants();
    fireEvent.click(screen.getByText('Trocar imagem', { exact: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Remover imagem' }));
    await waitFor(() => expect(stored().fichaTecnica!.variantes![0]!.imagemRemovida).toBe(true));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Voltar' }).hasAttribute('disabled')).toBe(false)
    );
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    await screen.findByRole('button', { name: /Ficha técnica/ });
    expect(screen.queryByAltText(peca.nome)).toBeNull();
  });

  it('mantém fotos antigas e revoga URLs temporárias quando a capa muda', async () => {
    const item = structuredClone(peca);
    item.imagemCroquiUrl = 'https://example.invalid/legado.png';
    const view = render(<PecaImagem peca={item} fallback={<span>Sem imagem</span>} />);
    expect(screen.getByAltText(peca.nome).getAttribute('src')).toBe(item.imagemCroquiUrl);
    expect(getFichaImagem).not.toHaveBeenCalled();
    const [saved] = await addFichaAnexos(`${marca.id}:${peca.id}`, 'variantes', [
      photo('atual.png'),
    ]);
    item.fichaTecnica!.variantes![0]!.imagemAnexoId = saved!.id;
    view.rerender(<PecaImagem peca={item} fallback={<span>Sem imagem</span>} />);
    await waitFor(() =>
      expect(screen.getByAltText(peca.nome).getAttribute('src')).toBe('blob:atual.png')
    );
    expect(getFichaImagem).toHaveBeenLastCalledWith(`${marca.id}:${peca.id}`, saved!.id, []);
    view.unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:atual.png');
  });

  it('não usa a foto da segunda variante como capa quando a Principal está vazia', async () => {
    savePecaLocal(structuredClone(peca));
    const view = openCollection();
    fireEvent.click(screen.getByRole('button', { name: /Ficha técnica/ }));
    await openVariants();
    fireEvent.click(screen.getByRole('tab', { name: 'Selecionar variante Outra' }));
    await upload('Outra', photo('somente-outra.png'));
    fireEvent.click(screen.getByRole('tab', { name: 'Selecionar variante Principal' }));
    expect(screen.queryByAltText('Variante Principal')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    await screen.findByRole('button', { name: /Ficha técnica/ });
    expect(screen.queryByAltText(peca.nome)).toBeNull();
    view.unmount();
    openCollection();
    fireEvent.click(screen.getByRole('button', { name: /Ficha técnica/ }));
    await openVariants();
    expect(screen.queryByAltText('Variante Principal')).toBeNull();
    fireEvent.click(screen.getByRole('tab', { name: 'Selecionar variante Outra' }));
    expect((await screen.findByAltText('Variante Outra')).getAttribute('src')).toBe(
      'blob:somente-outra.png'
    );
  });
});
