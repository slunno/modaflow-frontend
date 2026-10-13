import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { CollectionColorsTab } from '../pages/Home/components/CollectionManagementTabs';
import type { TecidoCorItem } from '../types/gestao';

vi.mock('../services/plmService', () => ({
  getInsumos: vi.fn().mockResolvedValue([]),
  createInsumo: vi.fn(),
}));
vi.mock('../services/linxService', () => ({
  getLinxCoresCatalogo: vi.fn().mockResolvedValue([]),
  getLinxCoresBasicas: vi.fn().mockResolvedValue([]),
  getLinxFornecedores: vi.fn().mockResolvedValue([]),
}));

type CollectionColor = TecidoCorItem & { collectionId: string; paleta: string };
const blue: TecidoCorItem = {
  id: 'catalog-blue',
  nome: 'Cor #588dce',
  hex: '#588dce',
  pantone: '16-4036',
};
const storedColor: CollectionColor = {
  ...blue,
  id: 'collection-blue',
  collectionId: 'collection-1',
  paleta: 'Verão',
  fornecedoresList: [{ id: 'supplier-1', fornecedor: 'Fornecedor azul', codigo: '0070' }],
};
const readColors = () =>
  JSON.parse(localStorage.getItem('modaflow_collection_colors') ?? '[]') as CollectionColor[];

describe('Identificação das cores da coleção', () => {
  beforeEach(() => localStorage.clear());

  it('identifica a tonalidade escolhida por nome e código, atualiza a prévia e permite buscar pelo código', async () => {
    localStorage.setItem('modaflow_colors', JSON.stringify([blue]));
    render(<CollectionColorsTab collectionId="collection-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect((screen.getByLabelText('Nome da cor *') as HTMLInputElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Selecionar cor' }));
    fireEvent.click(await screen.findByRole('button', { name: /Cor #588dce/ }));
    expect((screen.getByLabelText('Nome da cor *') as HTMLInputElement).value).toBe(blue.nome);
    fireEvent.change(screen.getByLabelText('Nome da cor *'), {
      target: { value: ' Azul céu ' },
    });
    fireEvent.change(screen.getByLabelText('Código da cor (opcional)'), {
      target: { value: ' 001023 ' },
    });
    fireEvent.change(screen.getByLabelText('Paleta'), { target: { value: 'Verão' } });
    const dialog = screen.getByRole('dialog', { name: 'Adicionar Cor' });
    expect(within(dialog).getByRole('heading', { name: 'Azul céu' })).toBeDefined();
    expect(within(dialog).getByText('Código: 001023 · Pantone: 16-4036')).toBeDefined();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Adicionar cor' }));
    expect(readColors()).toHaveLength(1);
    expect(readColors()[0]).toMatchObject({
      nome: 'Azul céu',
      codigo: '001023',
      hex: blue.hex,
      pantone: blue.pantone,
      paleta: 'Verão',
      collectionId: 'collection-1',
    });
    fireEvent.change(screen.getByLabelText('Buscar cores'), { target: { value: '001023' } });
    expect(screen.getByRole('heading', { name: 'Azul céu' })).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    expect((screen.getByLabelText('Nome da cor *') as HTMLInputElement).value).toBe('Azul céu');
    expect((screen.getByLabelText('Código da cor (opcional)') as HTMLInputElement).value).toBe(
      '001023'
    );
  });

  it('descarta edições ao fechar e salva a nova identificação sem duplicar o cadastro ou alterar outra coleção', async () => {
    const otherColor = { ...storedColor, id: 'other-color', collectionId: 'collection-2' };
    localStorage.setItem('modaflow_collection_colors', JSON.stringify([storedColor, otherColor]));
    localStorage.setItem('modaflow_colors', JSON.stringify([blue]));
    await act(async () => {
      render(<CollectionColorsTab collectionId="collection-1" />);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    fireEvent.change(screen.getByLabelText('Nome da cor *'), { target: { value: 'Rascunho' } });
    fireEvent.change(screen.getByLabelText('Código da cor (opcional)'), {
      target: { value: 'R1' },
    });
    fireEvent.click(screen.getByText('Fechar', { selector: 'button' }));
    expect(readColors()).toEqual([storedColor, otherColor]);
    expect(JSON.parse(localStorage.getItem('modaflow_colors') ?? '[]')).toEqual([blue]);
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    expect((screen.getByLabelText('Nome da cor *') as HTMLInputElement).value).toBe(blue.nome);
    fireEvent.change(screen.getByLabelText('Nome da cor *'), { target: { value: 'Azul céu' } });
    fireEvent.change(screen.getByLabelText('Código da cor (opcional)'), {
      target: { value: 'AZ-01' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar cor' }));
    expect(readColors()).toHaveLength(2);
    expect(readColors().find((color) => color.id === storedColor.id)).toEqual({
      ...storedColor,
      nome: 'Azul céu',
      codigo: 'AZ-01',
    });
    expect(readColors().find((color) => color.id === otherColor.id)).toEqual(otherColor);
    expect(JSON.parse(localStorage.getItem('modaflow_colors') ?? '[]')).toEqual([
      {
        ...blue,
        nome: 'Azul céu',
        codigo: 'AZ-01',
        fornecedoresList: storedColor.fornecedoresList,
      },
    ]);
  });

  it('exige um nome preenchido, permite retirar o código e limpa os campos para uma nova cor', async () => {
    localStorage.setItem(
      'modaflow_collection_colors',
      JSON.stringify([{ ...storedColor, codigo: 'AZ-01' }])
    );
    await act(async () => {
      render(<CollectionColorsTab collectionId="collection-1" />);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    const dialog = screen.getByRole('dialog', { name: 'Editar Cor' });
    fireEvent.change(screen.getByLabelText('Nome da cor *'), { target: { value: '   ' } });
    const save = within(dialog).getByRole('button', { name: 'Salvar cor' }) as HTMLButtonElement;
    expect(save.disabled).toBe(true);
    fireEvent.submit(save.closest('form')!);
    expect(readColors()[0]?.nome).toBe(blue.nome);
    fireEvent.change(screen.getByLabelText('Nome da cor *'), { target: { value: 'Azul céu' } });
    fireEvent.change(screen.getByLabelText('Código da cor (opcional)'), { target: { value: '' } });
    fireEvent.click(save);
    expect(readColors()[0]?.codigo).toBeUndefined();
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect((screen.getByLabelText('Nome da cor *') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Código da cor (opcional)') as HTMLInputElement).value).toBe('');
  });
});
