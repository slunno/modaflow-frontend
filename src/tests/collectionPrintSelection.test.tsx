import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { CollectionDetailView } from '../pages/Home/components/CollectionDetailView';
import { getPecaFichaValues } from '../services/pecaFichaSelectors';
import { saveLocalState } from '../services/localStateStorage';
import type { MarcaSummary } from '../types/auth';
import type { ColecaoItem, CollectionPrintItem, PecaItem } from '../types/plm';

vi.mock('../services/api', () => ({
  api: {
    get: vi
      .fn()
      .mockResolvedValue({ subgrupos: [], linhas: [], griffes: [], grades: [], categorias: [] }),
  },
}));
vi.mock('../services/linxService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/linxService')>()),
  resolveLinxGriffe: vi.fn().mockReturnValue(null),
  getLinxModelagens: vi.fn().mockResolvedValue([]),
  getLinxCoresMostruario: vi.fn().mockResolvedValue([]),
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
const piece: PecaItem = {
  id: 'piece-1',
  colecaoId: colecao.id,
  marcaId: marca.id,
  nome: 'Bata',
  tipo: 'Bata',
  codigo: '',
  tema: 'Base',
  status: 'Em andamento',
  etapaAtual: '—',
  colecaoNome: colecao.nome,
  marcaNome: marca.nome,
  estilista: '',
  tecidos: [],
  previsaoEntrega: '—',
};
const print = (id: string, reference: string, collectionId = colecao.id): CollectionPrintItem => ({
  id,
  collectionId,
  reference,
  type: 'Digital',
  notes: '',
  fabrics: [],
});
const readPieces = (): PecaItem[] =>
  JSON.parse(localStorage.getItem('modaflow_collection_pecas') || '[]');

function mount(pieces: PecaItem[] = [piece]) {
  localStorage.setItem('modaflow_collection_pecas', JSON.stringify(pieces));
  return render(
    <CollectionDetailView
      marca={marca}
      colecao={colecao}
      onBackToBrand={() => {}}
      onBackToHome={() => {}}
    />
  );
}
function openFicha() {
  fireEvent.click(screen.getAllByRole('button', { name: 'Ficha técnica' })[0]!);
  return screen.getByRole('combobox', { name: 'Estampa' }) as HTMLSelectElement;
}

describe('Estampa da ficha ligada ao cadastro da coleção', () => {
  beforeEach(() => localStorage.clear());

  it('mantém a seleção da ficha ao editar o código e a imagem de uma estampa cadastrada', async () => {
    localStorage.setItem(
      'modaflow_collection_prints',
      JSON.stringify([
        {
          ...print('selected-print', 'REF-ANTIGA'),
          image: 'data:image/png;base64,b2xk',
        },
      ])
    );
    mount([{ ...piece, fichaTecnica: { estampaId: 'selected-print', estampa: 'REF-ANTIGA' } }]);
    fireEvent.click(screen.getByRole('button', { name: 'Estampas' }));
    fireEvent.click(screen.getByRole('button', { name: 'Editar estampa REF-ANTIGA' }));
    fireEvent.change(screen.getByLabelText('Código de referência'), {
      target: { value: 'REF-NOVA' },
    });
    fireEvent.change(screen.getByLabelText('Arquivo de imagem da estampa'), {
      target: { files: [new File(['nova imagem'], 'nova.png', { type: 'image/png' })] },
    });
    await waitFor(() => expect(screen.queryByRole('status')).toBeNull());
    const updatedImage = screen.getByRole('img', { name: 'Prévia da estampa' }).getAttribute('src');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    fireEvent.click(screen.getByRole('button', { name: 'Peças' }));
    const selection = openFicha();
    expect(selection.value).toBe('selected-print');
    expect(selection.selectedOptions[0]?.textContent).toBe('REF-NOVA · Digital');
    fireEvent.click(screen.getByRole('button', { name: 'Variantes' }));
    expect(screen.getByRole('img', { name: 'Estampa REF-NOVA' }).getAttribute('src')).toBe(
      updatedImage
    );
    expect(readPieces()[0]?.fichaTecnica?.estampaId).toBe('selected-print');
  });

  it('oferece a estampa criada no submenu, salva seu vínculo só na peça editada e o restaura ao reabrir', () => {
    localStorage.setItem(
      'modaflow_collection_prints',
      JSON.stringify([print('other', 'OUTRA', 'collection-2')])
    );
    const untouched = { ...piece, id: 'piece-2' };
    mount([piece, untouched]);
    fireEvent.click(screen.getByRole('button', { name: 'Estampas' }));
    fireEvent.click(screen.getByRole('button', { name: 'Estampa' }));
    fireEvent.change(screen.getByLabelText('Código de referência'), {
      target: { value: 'REF-101' },
    });
    fireEvent.change(screen.getByLabelText('Tipo de estampa'), {
      target: { value: 'Localizada' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    const prints: CollectionPrintItem[] = JSON.parse(
      localStorage.getItem('modaflow_collection_prints') || '[]'
    );
    const created = prints.find((item) => item.reference === 'REF-101')!;
    fireEvent.click(screen.getByRole('button', { name: 'Peças' }));
    const select = openFicha();
    expect(Array.from(select.options, (option) => option.textContent)).toEqual([
      'Selecione uma estampa',
      'REF-101 · Localizada',
    ]);
    fireEvent.change(select, { target: { value: created.id } });
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    const saved = readPieces()[0]!;
    expect(saved.fichaTecnica).toMatchObject({ estampa: 'REF-101', estampaId: created.id });
    expect(readPieces()[1]).toEqual(untouched);
    expect(getPecaFichaValues(saved, 'Estampas')).toEqual(['REF-101']);
    expect(saved.historicoAlteracoes?.at(-1)?.campos).toEqual([
      expect.objectContaining({ campo: 'Estampa', depois: 'REF-101' }),
    ]);
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(openFicha().value).toBe(created.id);
  });

  it('orienta a cadastrar estampas quando a coleção não tem nenhuma e exclui outras coleções', () => {
    localStorage.setItem(
      'modaflow_collection_prints',
      JSON.stringify([print('other', 'OUTRA', 'collection-2')])
    );
    mount();
    const select = openFicha();
    expect(Array.from(select.options, (option) => option.value)).toEqual(['']);
    expect(
      screen.getByText('Cadastre estampas no submenu Estampas da coleção para selecioná-las aqui.')
    ).toBeDefined();
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    expect(readPieces()[0]?.fichaTecnica?.estampa).toBeUndefined();
    expect(readPieces()[0]?.fichaTecnica?.estampaId).toBeUndefined();
    fireEvent.click(screen.getByRole('button', { name: 'Variantes' }));
    expect(screen.queryByRole('region', { name: 'Estampa selecionada' })).toBeNull();
    act(() =>
      saveLocalState('modaflow_collection_prints', [
        print('other', 'OUTRA', 'collection-2'),
        print('current', 'NOVA'),
      ])
    );
    expect(screen.getByRole('region', { name: 'Estampa selecionada' })).toBeDefined();
    act(() =>
      saveLocalState('modaflow_collection_prints', [print('other', 'OUTRA', 'collection-2')])
    );
    expect(screen.queryByRole('region', { name: 'Estampa selecionada' })).toBeNull();
  });

  it('preserva o texto de uma ficha antiga e permite remover a estampa salva', () => {
    mount([{ ...piece, fichaTecnica: { estampa: 'Estampa antiga' } }]);
    const select = openFicha();
    expect(select.selectedOptions[0]?.textContent).toBe('Estampa antiga (valor salvo)');
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    expect(readPieces()[0]?.fichaTecnica?.estampa).toBe('Estampa antiga');
    fireEvent.change(select, { target: { value: '' } });
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    expect(readPieces()[0]?.fichaTecnica?.estampa).toBe('');
    expect(readPieces()[0]?.fichaTecnica?.estampaId).toBeUndefined();
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(openFicha().value).toBe('');
  });

  it('distingue estampas com a mesma referência pelo ID do cadastro', () => {
    localStorage.setItem(
      'modaflow_collection_prints',
      JSON.stringify([
        print('first', 'REF-101'),
        { ...print('second', 'REF-101'), type: 'Localizada' },
      ])
    );
    mount();
    fireEvent.change(openFicha(), { target: { value: 'second' } });
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    expect(readPieces()[0]?.fichaTecnica).toMatchObject({
      estampa: 'REF-101',
      estampaId: 'second',
    });
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    const select = openFicha();
    expect(select.value).toBe('second');
    expect(select.selectedOptions[0]?.textContent).toBe('REF-101 · Localizada');
  });

  it('apresenta a imagem da estampa por ID, mantém a seleção entre variantes e permite trocar em Geral', () => {
    const firstImage = 'data:image/png;base64,primeira';
    const secondImage = 'data:image/png;base64,segunda';
    localStorage.setItem(
      'modaflow_collection_prints',
      JSON.stringify([
        { ...print('first', 'REF-101'), image: firstImage },
        { ...print('second', 'REF-101'), image: secondImage, type: 'Localizada' },
      ])
    );
    mount([
      {
        ...piece,
        fichaTecnica: {
          variantes: [
            { id: 'principal', nome: 'Principal', tecidos: [], aviamentos: [] },
            { id: 'azul', nome: 'Azul', tecidos: [], aviamentos: [] },
          ],
        },
      },
    ]);
    fireEvent.change(openFicha(), { target: { value: 'second' } });
    fireEvent.click(screen.getByRole('button', { name: 'Variantes' }));
    const card = screen.getByRole('region', { name: 'Estampa selecionada' });
    const trims = screen.getByRole('region', { name: 'Aviamentos — Principal' });
    expect(trims.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(card).getByRole('img', { name: 'Estampa REF-101' }).getAttribute('src')).toBe(
      secondImage
    );
    expect(within(card).getByText('Localizada')).toBeDefined();
    expect(screen.queryByLabelText(/Nome da variante/)).toBeNull();
    fireEvent.click(screen.getByRole('tab', { name: 'Selecionar variante Azul' }));
    expect(screen.getByRole('img', { name: 'Estampa REF-101' }).getAttribute('src')).toBe(
      secondImage
    );
    const expand = screen.getByRole('button', { name: 'Ampliar estampa REF-101' });
    expand.focus();
    fireEvent.click(expand);
    expect(screen.getByRole('dialog', { name: 'Estampa — REF-101' })).toBeDefined();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(expand);
    fireEvent.click(screen.getByRole('button', { name: 'Alterar estampa' }));
    const select = screen.getByRole('combobox', { name: 'Estampa' });
    expect(document.activeElement).toBe(select);
    fireEvent.change(select, { target: { value: 'first' } });
    fireEvent.click(screen.getByRole('button', { name: 'Variantes' }));
    expect(screen.getByRole('img', { name: 'Estampa REF-101' }).getAttribute('src')).toBe(
      firstImage
    );
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    expect(readPieces()[0]?.fichaTecnica?.estampaId).toBe('first');
  });

  it('atualiza a imagem pelo cadastro compartilhado sem alterar a estampa selecionada na peça', () => {
    const selectedPrint = { ...print('chosen', 'REF-202'), image: 'data:image/png;base64,antes' };
    localStorage.setItem('modaflow_collection_prints', JSON.stringify([selectedPrint]));
    mount([
      { ...piece, fichaTecnica: { estampaId: selectedPrint.id, estampa: selectedPrint.reference } },
    ]);
    openFicha();
    fireEvent.click(screen.getByRole('button', { name: 'Variantes' }));
    act(() =>
      saveLocalState('modaflow_collection_prints', [
        { ...selectedPrint, image: 'data:image/png;base64,depois' },
      ])
    );
    expect(screen.getByRole('img', { name: 'Estampa REF-202' }).getAttribute('src')).toBe(
      'data:image/png;base64,depois'
    );
    expect(readPieces()[0]?.fichaTecnica?.estampaId).toBe(selectedPrint.id);
  });

  it('trata ausência, cadastro sem imagem e falha de carregamento sem perder a referência', () => {
    localStorage.setItem(
      'modaflow_collection_prints',
      JSON.stringify([
        print('empty', 'SEM-IMAGEM'),
        { ...print('broken', 'COM-IMAGEM'), image: 'imagem-inexistente.png' },
      ])
    );
    mount();
    openFicha();
    fireEvent.click(screen.getByRole('button', { name: 'Variantes' }));
    expect(screen.getByText('Nenhuma estampa selecionada')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Selecionar estampa' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Estampa' }), {
      target: { value: 'empty' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Variantes' }));
    expect(screen.getByText('SEM-IMAGEM')).toBeDefined();
    expect(
      screen.getByText('Adicione uma imagem no cadastro de Estampas da coleção.')
    ).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Alterar estampa' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Estampa' }), {
      target: { value: 'broken' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Variantes' }));
    fireEvent.error(screen.getByRole('img', { name: 'Estampa COM-IMAGEM' }));
    expect(screen.getByText('Imagem da estampa indisponível')).toBeDefined();
    expect(screen.getByText('COM-IMAGEM')).toBeDefined();
    expect(screen.queryByRole('button', { name: 'Ampliar estampa COM-IMAGEM' })).toBeNull();
  });
});
