import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FichaAnexosPanel } from '../pages/Home/components/FichaAnexosPanel';
import {
  addFichaAnexos,
  type FichaAnexo,
  type FichaAnexoCategoria,
} from '../services/fichaAnexosStorage';

const memory = vi.hoisted(() => ({ items: [] as FichaAnexo[] }));
vi.mock('../services/fichaAnexosStorage', () => ({
  listFichaAnexos: vi.fn(async (pieceKey: string) =>
    memory.items.filter((item) => item.pieceKey === pieceKey)
  ),
  addFichaAnexos: vi.fn(async (pieceKey: string, categoria: FichaAnexoCategoria, files: File[]) => {
    const items = files.map((file) => ({
      id: crypto.randomUUID(),
      pieceKey,
      categoria,
      nome: file.name,
      tamanho: file.size,
      tipo: file.type,
      arquivo: file,
      criadoEm: Date.now(),
    }));
    memory.items.push(...items);
    return items;
  }),
  removeFichaAnexo: vi.fn(async (id: string) => {
    memory.items = memory.items.filter((item) => item.id !== id);
  }),
}));

describe('Anexos locais da ficha', () => {
  beforeEach(() => {
    memory.items = [];
    vi.clearAllMocks();
    vi.stubGlobal(
      'URL',
      Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:teste'), revokeObjectURL: vi.fn() })
    );
  });
  it('mantém um novo bloco para envio em todos os grupos e recupera os anexos ao reabrir a mesma peça', async () => {
    const first = render(<FichaAnexosPanel pieceKey="peca-teste" />);
    await waitFor(() => expect(screen.queryByText('Carregando anexos…')).toBeNull());
    const groups = [
      ['Adicionar imagens de Variantes', 'variante-teste.png', 'image/png'],
      ['Adicionar imagens de Referência', 'referencia-teste.png', 'image/png'],
      ['Adicionar imagens de Desenho Técnico', 'desenho-teste.png', 'image/png'],
      ['Enviar arquivo de projeto', 'projeto-teste.pdf', 'application/pdf'],
      ['Enviar outro arquivo', 'outro-teste.txt', 'text/plain'],
    ];
    for (const [label, name, type] of groups) {
      fireEvent.change(screen.getByLabelText(label!), {
        target: { files: [new File(['test'], name!, { type })] },
      });
      await screen.findByText(name!);
      expect(screen.getAllByLabelText(label!)).toHaveLength(1);
    }
    fireEvent.drop(screen.getByLabelText('Adicionar imagens de Variantes').parentElement!, {
      dataTransfer: { files: [new File(['test2'], 'variante-dois.png', { type: 'image/png' })] },
    });
    await screen.findByAltText('variante-dois.png');
    expect(screen.getByAltText('variante-teste.png')).toBeDefined();
    first.unmount();
    const reopened = render(<FichaAnexosPanel pieceKey="peca-teste" />);
    await screen.findByText('variante-dois.png');
    fireEvent.click(screen.getByRole('button', { name: 'Remover anexo variante-teste.png' }));
    await waitFor(() => expect(screen.queryByText('variante-teste.png')).toBeNull());
    expect(screen.getByText('variante-dois.png')).toBeDefined();
    reopened.unmount();
    render(<FichaAnexosPanel pieceKey="outra-peca" />);
    await waitFor(() => expect(screen.queryByText('Carregando anexos…')).toBeNull());
    expect(screen.queryByText('variante-dois.png')).toBeNull();
  });
  it('informa falha de armazenamento sem inserir uma prévia não salva', async () => {
    vi.mocked(addFichaAnexos).mockRejectedValueOnce(
      new DOMException('Quota', 'QuotaExceededError')
    );
    render(<FichaAnexosPanel pieceKey="peca-teste" />);
    await waitFor(() => expect(screen.queryByText('Carregando anexos…')).toBeNull());
    fireEvent.change(screen.getByLabelText('Adicionar imagens de Referência'), {
      target: { files: [new File(['test'], 'nao-salvo.png', { type: 'image/png' })] },
    });
    expect((await screen.findByRole('alert')).textContent).toContain('Não foi possível salvar');
    expect(screen.queryByText('nao-salvo.png')).toBeNull();
  });
});
