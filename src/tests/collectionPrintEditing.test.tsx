import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { CollectionPrintsTab } from '../pages/Home/components/CollectionManagementTabs';
import type { CollectionPrintItem } from '../types/plm';

const original: CollectionPrintItem = {
  id: 'print-1',
  collectionId: 'collection-1',
  image: 'data:image/png;base64,b2xk',
  reference: 'REF-101',
  type: 'Digital',
  notes: 'Observação original',
  fabrics: [{ id: 'fabric-1', name: 'Linho', code: 'LIN' }],
};
const untouched = { ...original, id: 'print-2', reference: 'REF-102' };
const otherCollection = { ...original, id: 'print-3', collectionId: 'collection-2' };
const readPrints = (): CollectionPrintItem[] =>
  JSON.parse(localStorage.getItem('modaflow_collection_prints') ?? '[]');
function mount() {
  localStorage.setItem(
    'modaflow_collection_prints',
    JSON.stringify([original, untouched, otherCollection])
  );
  return render(<CollectionPrintsTab collectionId="collection-1" />);
}
const upload = (file: File) =>
  fireEvent.change(screen.getByLabelText('Arquivo de imagem da estampa'), {
    target: { files: [file] },
  });

describe('Edição das estampas da coleção', () => {
  beforeEach(() => localStorage.clear());

  it('edita o cadastro com dados preenchidos, troca a imagem e preserva ID e demais registros', async () => {
    mount();
    expect(screen.getAllByRole('button', { name: /Editar estampa/ })).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Editar estampa REF-101' }));
    const dialog = screen.getByRole('dialog', { name: 'Editar estampa' });
    expect((within(dialog).getByLabelText('Código de referência') as HTMLInputElement).value).toBe(
      'REF-101'
    );
    expect((within(dialog).getByLabelText('Tipo de estampa') as HTMLSelectElement).value).toBe(
      'Digital'
    );
    expect((within(dialog).getByLabelText('Observações') as HTMLTextAreaElement).value).toBe(
      original.notes
    );
    fireEvent.change(screen.getByLabelText('Código de referência'), {
      target: { value: 'REF-201' },
    });
    fireEvent.change(screen.getByLabelText('Tipo de estampa'), { target: { value: 'Rotativa' } });
    fireEvent.change(screen.getByLabelText('Observações'), {
      target: { value: 'Nova observação' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Remover Linho' }));
    upload(new File(['nova imagem'], 'estampa.png', { type: 'image/png' }));
    expect(
      (screen.getByRole('button', { name: 'Salvar alterações' }) as HTMLButtonElement).disabled
    ).toBe(true);
    await waitFor(() => expect(screen.queryByRole('status')).toBeNull());
    const newImage = screen.getByRole('img', { name: 'Prévia da estampa' }).getAttribute('src');
    expect(newImage).toMatch(/^data:image\/png;base64,/);
    expect(newImage).not.toBe(original.image);
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    expect(readPrints()).toEqual([
      {
        ...original,
        reference: 'REF-201',
        type: 'Rotativa',
        notes: 'Nova observação',
        fabrics: [],
        image: newImage,
      },
      untouched,
      otherCollection,
    ]);
    fireEvent.click(screen.getByRole('button', { name: 'Editar estampa REF-201' }));
    expect(screen.getByRole('img', { name: 'Prévia da estampa' }).getAttribute('src')).toBe(
      newImage
    );
    expect((screen.getByLabelText('Código de referência') as HTMLInputElement).value).toBe(
      'REF-201'
    );
  });

  it('cancela a edição sem gravar e inicia uma estampa nova com os campos limpos', () => {
    mount();
    const card = screen.getByRole('button', { name: 'Editar estampa REF-101' });
    card.focus();
    fireEvent.click(card);
    fireEvent.change(screen.getByLabelText('Código de referência'), {
      target: { value: 'NÃO SALVAR' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Remover imagem' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remover Linho' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(card);
    expect(readPrints()).toEqual([original, untouched, otherCollection]);
    fireEvent.click(screen.getByRole('button', { name: 'Estampa' }));
    expect(screen.getByRole('dialog', { name: 'Criar estampa' })).toBeDefined();
    expect((screen.getByLabelText('Código de referência') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Tipo de estampa') as HTMLSelectElement).value).toBe(
      'Sublimação listras'
    );
    expect((screen.getByLabelText('Observações') as HTMLTextAreaElement).value).toBe('');
    expect(screen.queryByRole('img', { name: 'Prévia da estampa' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Adicionar imagem' })).toBeDefined();
    fireEvent.change(screen.getByLabelText('Código de referência'), { target: { value: 'NOVA' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(readPrints()).toHaveLength(4);
    expect(readPrints()[0]?.id).not.toBe(original.id);
    expect(readPrints().slice(1)).toEqual([original, untouched, otherCollection]);
  });

  it('valida o arquivo, aceita arrastar uma imagem e permite remover a imagem salva', async () => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Editar estampa REF-101' }));
    upload(new File(['texto'], 'arquivo.txt', { type: 'text/plain' }));
    expect(screen.getByRole('alert').textContent).toBe('Selecione um arquivo de imagem.');
    upload(new File([new Uint8Array(1_000_001)], 'grande.png', { type: 'image/png' }));
    expect(screen.getByRole('alert').textContent).toBe('A imagem deve ter até 1 MB.');
    expect(screen.getByRole('img', { name: 'Prévia da estampa' }).getAttribute('src')).toBe(
      original.image
    );
    fireEvent.drop(
      screen.getByRole('region', { name: 'Imagem da estampa' }).querySelector('div')!,
      { dataTransfer: { files: [new File(['arrastada'], 'estampa.jpg', { type: 'image/jpeg' })] } }
    );
    await waitFor(() => expect(screen.queryByRole('status')).toBeNull());
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('img', { name: 'Prévia da estampa' }).getAttribute('src')).toMatch(
      /^data:image\/jpeg;base64,/
    );
    fireEvent.click(screen.getByRole('button', { name: 'Remover imagem' }));
    expect(screen.getByRole('button', { name: 'Adicionar imagem' })).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    expect(readPrints()[0]?.image).toBeUndefined();
    expect(readPrints()[0]?.id).toBe(original.id);
    expect(readPrints().slice(1)).toEqual([untouched, otherCollection]);
  });

  it('abre o editor pelo card sem imagem e mantém o cadastro ao cancelar', async () => {
    localStorage.setItem(
      'modaflow_collection_prints',
      JSON.stringify([{ ...original, image: undefined }])
    );
    render(<CollectionPrintsTab collectionId="collection-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar imagem à estampa REF-101' }));
    const dialog = screen.getByRole('dialog', { name: 'Editar estampa' });
    await waitFor(() =>
      expect(document.activeElement).toBe(
        within(dialog).getByRole('button', { name: 'Adicionar imagem' })
      )
    );
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
    expect(readPrints()).toEqual([{ ...original, image: undefined }]);
  });
});
