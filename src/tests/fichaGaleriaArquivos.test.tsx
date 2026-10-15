import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PecaFichaTecnicaView } from '../pages/Home/components/PecaFichaTecnicaView';
import {
  addFichaAnexos,
  type FichaAnexo,
  type FichaAnexoCategoria,
} from '../services/fichaAnexosStorage';
import { marca, colecao, peca } from '../../tests/manual/precificacao/fixtures';

const memory = vi.hoisted(() => ({ items: [] as FichaAnexo[] }));
vi.mock('../services/api', () => ({
  api: {
    get: vi
      .fn()
      .mockResolvedValue({ subgrupos: [], linhas: [], grades: [], griffes: [], categorias: [] }),
    post: vi.fn(),
  },
}));
vi.mock('../services/linxService', async (original) => ({
  ...(await original<typeof import('../services/linxService')>()),
  getLinxModelagens: vi.fn().mockResolvedValue([]),
  getLinxCoresMostruario: vi.fn().mockResolvedValue([]),
}));
vi.mock('../services/fichaAnexosStorage', () => ({
  listFichaAnexos: vi.fn(async (pieceKey: string) =>
    memory.items.filter((item) => item.pieceKey === pieceKey)
  ),
  addFichaAnexos: vi.fn(async (pieceKey: string, categoria: FichaAnexoCategoria, files: File[]) => {
    const records = files.map((file, index) => ({
      id: crypto.randomUUID(),
      pieceKey,
      categoria,
      nome: file.name,
      tamanho: file.size,
      tipo: file.type,
      arquivo: file,
      criadoEm: Date.now() + index,
    }));
    memory.items.push(...records);
    return records;
  }),
  removeFichaAnexo: vi.fn(async (id: string) => {
    memory.items = memory.items.filter((item) => item.id !== id);
  }),
  copiarImagemVariante: vi.fn(),
}));

beforeEach(() => {
  localStorage.clear();
  memory.items = [];
  vi.clearAllMocks();
  let counter = 0;
  vi.stubGlobal(
    'URL',
    Object.assign(URL, {
      createObjectURL: vi.fn(() => `blob:arquivo-${counter++}`),
      revokeObjectURL: vi.fn(),
    })
  );
});
afterEach(cleanup);

async function open() {
  const record = structuredClone(peca);
  record.fichaTecnica!.variantes![0]!.imagemUrl = 'data:image/png;base64,cGVjYQ==';
  const save = vi.fn();
  const view = render(
    <PecaFichaTecnicaView
      peca={record}
      colecao={colecao}
      marca={marca}
      onBack={() => {}}
      onUpdatePeca={save}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Variantes' }));
  await waitFor(() => expect(screen.queryByText('Carregando anexos…')).toBeNull());
  return { view, save };
}

describe('Galeria da variante com desenho e projeto', () => {
  it('retira a coluna lateral e mantém as cinco categorias em Gerenciar anexos', async () => {
    await open();
    const navigation = within(screen.getByRole('navigation', { name: 'Abas da ficha técnica' }));
    expect(navigation.queryByRole('button', { name: 'Imagens e arquivos' })).toBeNull();
    fireEvent.keyDown(navigation.getByRole('button', { name: 'Variantes' }), { key: 'ArrowRight' });
    expect(navigation.getByRole('button', { name: 'Modelagem' }).getAttribute('aria-pressed')).toBe(
      'true'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Geral' }));
    expect(screen.queryByLabelText('Anexos da ficha técnica')).toBeNull();
    expect(screen.queryByText('Galeria da peça')).toBeNull();
    fireEvent.click(screen.getByText('Opções'));
    fireEvent.click(screen.getByRole('button', { name: 'Gerenciar anexos' }));
    const modal = screen.getByRole('dialog', { name: 'Gerenciar anexos' });
    for (const label of [
      'Adicionar imagens de Variantes',
      'Adicionar imagens de Referência',
      'Adicionar imagens de Desenho Técnico',
      'Enviar arquivo de projeto',
      'Enviar outro arquivo',
    ])
      expect(within(modal).getByLabelText(label)).toBeDefined();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('adiciona um desenho e um projeto, alterna pela miniatura e recupera os arquivos ao reabrir', async () => {
    const { view, save } = await open();
    expect(screen.getByAltText('Variante Principal')).toBeDefined();
    fireEvent.click(screen.getByRole('tab', { name: 'Ver desenho técnico de Principal' }));
    const input = screen.getByLabelText('Adicionar desenho técnico');
    expect(input.hasAttribute('multiple')).toBe(false);
    fireEvent.change(input, {
      target: { files: [new File(['desenho'], 'desenho.png', { type: 'image/png' })] },
    });
    await screen.findByAltText('Desenho técnico — desenho.png');
    expect(
      screen
        .getByRole('tab', { name: 'Ver desenho técnico de Principal' })
        .getAttribute('aria-selected')
    ).toBe('true');
    fireEvent.click(screen.getByRole('tab', { name: 'Ver arquivo de projeto de Principal' }));
    fireEvent.change(screen.getByLabelText('Adicionar arquivo de projeto'), {
      target: { files: [new File(['%PDF'], 'projeto.pdf', { type: 'application/pdf' })] },
    });
    await screen.findByTitle('Prévia do projeto — projeto.pdf');
    expect(screen.getByRole('link', { name: 'Baixar arquivo' }).getAttribute('download')).toBe(
      'projeto.pdf'
    );
    expect(memory.items.map((item) => item.categoria)).toEqual(['desenhos', 'projeto']);
    expect(save).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole('tab', { name: 'Ver imagem da peça de Principal' }));
    expect(screen.getByAltText('Variante Principal')).toBeDefined();
    expect(screen.queryByTitle('Prévia do projeto — projeto.pdf')).toBeNull();
    view.unmount();
    await open();
    fireEvent.click(screen.getByRole('tab', { name: 'Ver desenho técnico de Principal' }));
    await screen.findByAltText('Desenho técnico — desenho.png');
    fireEvent.click(screen.getByRole('tab', { name: 'Ver arquivo de projeto de Principal' }));
    await screen.findByTitle('Prévia do projeto — projeto.pdf');
  });
  it('navega com o teclado e mostra o download para formatos de projeto sem prévia', async () => {
    memory.items.push({
      id: 'corel',
      pieceKey: `${marca.id}:${peca.id}`,
      categoria: 'projeto',
      nome: 'molde.cdr',
      tamanho: 10,
      tipo: 'application/octet-stream',
      arquivo: new Blob(['projeto']),
      criadoEm: 1,
    });
    await open();
    const image = screen.getByRole('tab', { name: 'Ver imagem da peça de Principal' });
    fireEvent.keyDown(image, { key: 'End' });
    expect(document.activeElement).toBe(
      screen.getByRole('tab', { name: 'Ver arquivo de projeto de Principal' })
    );
    expect(
      screen.getByText(
        'Este formato pode ser aberto ou baixado. A prévia não está disponível no navegador.'
      )
    ).toBeDefined();
    expect(screen.getByRole('link', { name: 'Baixar arquivo' }).getAttribute('download')).toBe(
      'molde.cdr'
    );
    fireEvent.keyDown(document.activeElement!, { key: 'Home' });
    expect(screen.getByAltText('Variante Principal')).toBeDefined();
  });
  it('mantém um desenho no painel, preserva anteriores e não troca a prévia quando o armazenamento falha', async () => {
    await open();
    fireEvent.click(screen.getByRole('tab', { name: 'Ver desenho técnico de Principal' }));
    for (const name of ['primeiro.png', 'atual.png']) {
      fireEvent.change(
        screen.getByLabelText(`${memory.items.length ? 'Trocar' : 'Adicionar'} desenho técnico`),
        { target: { files: [new File(['imagem'], name, { type: 'image/png' })] } }
      );
      await screen.findByAltText(`Desenho técnico — ${name}`);
    }
    expect(screen.queryByAltText('Desenho técnico — primeiro.png')).toBeNull();
    vi.mocked(addFichaAnexos).mockRejectedValueOnce(
      new DOMException('Quota', 'QuotaExceededError')
    );
    fireEvent.change(screen.getByLabelText('Trocar desenho técnico'), {
      target: { files: [new File(['imagem'], 'falhou.png', { type: 'image/png' })] },
    });
    await screen.findByRole('alert');
    expect(screen.getByAltText('Desenho técnico — atual.png')).toBeDefined();
    expect(memory.items).toHaveLength(2);
    fireEvent.click(screen.getByText('Opções'));
    fireEvent.click(screen.getByRole('button', { name: 'Gerenciar anexos' }));
    const modal = screen.getByRole('dialog', { name: 'Gerenciar anexos' });
    expect(within(modal).getByText('primeiro.png')).toBeDefined();
    expect(within(modal).getByText('atual.png')).toBeDefined();
  });
});
