import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { CollectionDetailView } from '../pages/Home/components/CollectionDetailView';
import { PecaFichaTecnicaView } from '../pages/Home/components/PecaFichaTecnicaView';
import type { MarcaSummary } from '../types/auth';
import type { ColecaoItem, PecaItem } from '../types/plm';
import type { TecidoCorItem } from '../types/gestao';
import { usePersistedState } from '../hooks/usePersistedState';
import { LOCAL_PECAS_KEY } from '../services/localPecasStorage';
import { getPecaFichaValues } from '../services/pecaFichaSelectors';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    get: vi
      .fn()
      .mockResolvedValue({ subgrupos: [], linhas: [], griffes: [], grades: [], categorias: [] }),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));
vi.mock('../services/linxService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/linxService')>()),
  resolveLinxGriffe: vi.fn().mockReturnValue(null),
  getLinxModelagens: vi.fn().mockResolvedValue([]),
  getLinxCoresMostruario: vi.fn().mockResolvedValue(['1 BLACK', '2 BRANCO']),
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
  marcaNome: marca.nome,
  status: 'Em andamento',
  dataEntrega: '',
  diasAtraso: 0,
};
const black: TecidoCorItem = { id: 'linx-cor-1 BLACK', nome: '1 BLACK', hex: '' };
const peca: PecaItem = {
  id: 'piece-1',
  colecaoId: colecao.id,
  marcaId: marca.id,
  nome: 'Calça',
  tipo: 'Calça',
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
const readPieces = (): PecaItem[] =>
  JSON.parse(localStorage.getItem('modaflow_collection_pecas') || '[]');
function mountFicha(item = peca, onUpdatePeca = vi.fn()) {
  return render(
    <PecaFichaTecnicaView
      peca={item}
      colecao={colecao}
      marca={marca}
      onBack={() => {}}
      onUpdatePeca={onUpdatePeca}
    />
  );
}
const quantity = (tamanho: string, cor = '1 BLACK') =>
  screen.getByRole('textbox', {
    name: `Quantidade de ${cor} no tamanho ${tamanho}`,
  }) as HTMLInputElement;

function SharedPieceValues() {
  const [pieces] = usePersistedState<PecaItem[]>(LOCAL_PECAS_KEY, []);
  const item = pieces.find((piece) => piece.id === peca.id && piece.colecaoId === colecao.id);
  return (
    <output aria-label="Dados compartilhados">
      {item
        ? `${getPecaFichaValues(item, 'Tamanhos').join(', ')} / ${getPecaFichaValues(item, 'Cores').join(', ')}`
        : ''}
    </output>
  );
}

describe('Tabela de quantidades da aba Corte', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('salva seleções e quantidades automaticamente, comunica outros consumidores e restaura ao reabrir sem enviar dados à API', async () => {
    const otherCollection = {
      ...peca,
      colecaoId: 'outra-colecao',
      fichaTecnica: { tamanhos: ['PP'] },
    };
    localStorage.setItem(LOCAL_PECAS_KEY, JSON.stringify([peca, otherCollection]));
    const view = render(
      <>
        <SharedPieceValues />
        <CollectionDetailView
          marca={marca}
          colecao={colecao}
          onBackToBrand={() => {}}
          onBackToHome={() => {}}
        />
      </>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ficha técnica' }));
    fireEvent.change(screen.getByLabelText('Nome do Produto'), {
      target: { value: 'Rascunho ainda não salvo' },
    });
    fireEvent.click(screen.getByRole('combobox', { name: 'Tamanhos' }));
    for (const size of ['G', '03', '04'])
      fireEvent.click(screen.getByRole('button', { name: size }));
    expect(readPieces()[0]?.fichaTecnica?.tamanhos).toEqual(['G', '03', '04']);
    expect(readPieces()[0]?.nome).toBe('Calça');
    expect(readPieces()[0]?.fichaTecnica?.nomeProduto).toBeUndefined();
    expect(screen.getByLabelText('Dados compartilhados').textContent).toBe('G, 03, 04 / ');
    fireEvent.click(screen.getByRole('button', { name: 'Corte' }));
    expect(
      screen.getByText(
        'Selecione pelo menos uma cor de mostruário na aba Geral para preencher a tabela de corte.'
      )
    ).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Geral' }));
    fireEvent.focus(screen.getByRole('combobox', { name: 'Cor de mostruário' }));
    fireEvent.click(await screen.findByRole('option', { name: '1 BLACK' }));
    fireEvent.blur(screen.getByRole('combobox', { name: 'Cor de mostruário' }));
    expect(screen.getByLabelText('Dados compartilhados').textContent).toBe('G, 03, 04 / 1 BLACK');
    fireEvent.click(screen.getByRole('button', { name: 'Corte' }));
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar' }));
    expect(readPieces()[0]?.fichaTecnica?.corte?.tamanhos).toEqual(['G', '03', '04']);
    fireEvent.change(quantity('03'), { target: { value: '6' } });
    expect(readPieces()[0]?.fichaTecnica?.corte?.linhas[0]?.quantidades['03']).toBe('6');
    expect(readPieces()[1]).toEqual(otherCollection);
    view.unmount();
    render(
      <CollectionDetailView
        marca={marca}
        colecao={colecao}
        onBackToBrand={() => {}}
        onBackToHome={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ficha técnica' }));
    expect((screen.getByLabelText('Nome do Produto') as HTMLInputElement).value).toBe(
      'Rascunho ainda não salvo'
    );
    expect(screen.queryByRole('dialog', { name: 'Selecionar tamanhos' })).toBeNull();
    expect(screen.getByRole('combobox', { name: 'Tamanhos' }).textContent).toContain(
      '3 tamanhos selecionados'
    );
    fireEvent.click(screen.getByRole('combobox', { name: 'Tamanhos' }));
    for (const size of ['G', '03', '04'])
      expect(screen.getByRole('button', { name: size, pressed: true })).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Corte' }));
    expect(quantity('03').value).toBe('6');
    for (const method of [api.post, api.put, api.patch, api.delete])
      expect(method).not.toHaveBeenCalled();
  });

  it('persiste seleção em grupo, desmarcação e limpeza da grade', () => {
    localStorage.setItem(LOCAL_PECAS_KEY, JSON.stringify([peca]));
    render(
      <CollectionDetailView
        marca={marca}
        colecao={colecao}
        onBackToBrand={() => {}}
        onBackToHome={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ficha técnica' }));
    fireEvent.click(screen.getByRole('combobox', { name: 'Tamanhos' }));
    fireEvent.click(screen.getAllByRole('button', { name: /Selecionar grupo/ })[0]!);
    expect(readPieces()[0]?.fichaTecnica?.tamanhos).toEqual([
      'PP',
      'P',
      'M',
      'G',
      'GG',
      'XG',
      'XXG',
      'Único',
      '38',
      '40',
      '42',
      '44',
      '46',
      '48',
      '50',
    ]);
    fireEvent.click(screen.getByRole('button', { name: 'M' }));
    expect(readPieces()[0]?.fichaTecnica?.tamanhos).not.toContain('M');
    fireEvent.click(screen.getByRole('button', { name: 'Limpar seleção' }));
    expect(readPieces()[0]?.fichaTecnica?.tamanhos).toEqual([]);
  });

  it('usa a grade e a cor de Geral, inicia a tabela, salva automaticamente e restaura as quantidades ao reabrir', async () => {
    const untouched = { ...peca, id: 'piece-2' };
    localStorage.setItem('modaflow_collection_pecas', JSON.stringify([peca, untouched]));
    render(
      <CollectionDetailView
        marca={marca}
        colecao={colecao}
        onBackToBrand={() => {}}
        onBackToHome={() => {}}
      />
    );
    fireEvent.click(screen.getAllByRole('button', { name: 'Ficha técnica' })[0]!);
    fireEvent.click(screen.getByRole('button', { name: 'Corte' }));
    expect((screen.getByRole('button', { name: 'Iniciar' }) as HTMLButtonElement).disabled).toBe(
      true
    );
    expect(screen.queryByRole('table', { name: 'Tabela de quantidade de peças' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Geral' }));
    fireEvent.click(screen.getByRole('combobox', { name: 'Tamanhos' }));
    const tamanhos = ['38', '40', '42', '44', '46', '48', '50'];
    for (const tamanho of tamanhos) fireEvent.click(screen.getByRole('button', { name: tamanho }));
    fireEvent.focus(screen.getByRole('combobox', { name: 'Cor de mostruário' }));
    fireEvent.click(await screen.findByRole('option', { name: '1 BLACK' }));
    fireEvent.blur(screen.getByRole('combobox', { name: 'Cor de mostruário' }));
    fireEvent.click(screen.getByRole('button', { name: 'Corte' }));
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar' }));
    const table = within(screen.getByRole('table', { name: 'Tabela de quantidade de peças' }));
    expect(table.getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
      'Cor de mostruário',
      ...tamanhos,
    ]);
    expect(table.getByRole('rowheader', { name: '1 BLACK' })).toBeDefined();
    fireEvent.change(quantity('38'), { target: { value: '12' } });
    fireEvent.change(quantity('40'), { target: { value: '0' } });
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    const saved = readPieces()[0]!;
    expect(saved.fichaTecnica?.corte).toMatchObject({
      tamanhos,
      linhas: [{ cor: { nome: '1 BLACK' }, quantidades: { '38': '12', '40': '0', '42': '' } }],
    });
    expect(readPieces()[1]).toEqual(untouched);
    expect(
      saved.historicoAlteracoes
        ?.filter((event) => event.secao === 'Corte')
        .flatMap((event) => event.campos)
    ).toContainEqual({
      campo: 'Quantidade — 1 BLACK / 38',
      antes: 'Vazio',
      depois: '12',
    });
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Ficha técnica' })[0]!);
    fireEvent.click(screen.getByRole('button', { name: 'Corte' }));
    expect(screen.queryByRole('button', { name: 'Iniciar' })).toBeNull();
    expect(quantity('38').value).toBe('12');
    expect(quantity('40').value).toBe('0');
  });

  it('acompanha mudanças de tamanhos e cores sem misturar ou apagar as quantidades que continuam na grade', async () => {
    const original: PecaItem = {
      ...peca,
      fichaTecnica: {
        tamanhos: ['38', '40'],
        coresMostruario: [black],
        corte: {
          tamanhos: ['38', '40'],
          linhas: [{ cor: black, quantidades: { '38': '5', '40': '7' } }],
        },
      },
    };
    const save = vi.fn();
    mountFicha(original, save);
    fireEvent.click(screen.getByRole('combobox', { name: 'Tamanhos' }));
    fireEvent.click(screen.getByRole('button', { name: '40' }));
    fireEvent.click(screen.getByRole('button', { name: '42' }));
    fireEvent.focus(screen.getByRole('combobox', { name: 'Cor de mostruário' }));
    fireEvent.click(await screen.findByRole('option', { name: '2 BRANCO' }));
    fireEvent.blur(screen.getByRole('combobox', { name: 'Cor de mostruário' }));
    fireEvent.click(screen.getByRole('button', { name: 'Corte' }));
    expect(quantity('38').value).toBe('5');
    expect(quantity('42').value).toBe('');
    expect(quantity('38', '2 BRANCO').value).toBe('');
    expect(screen.queryByRole('columnheader', { name: '40' })).toBeNull();
    fireEvent.change(quantity('42', '2 BRANCO'), { target: { value: '9' } });
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    const saved = save.mock.calls.at(-1)![0] as PecaItem;
    expect(saved.fichaTecnica?.corte).toMatchObject({
      tamanhos: ['38', '42'],
      linhas: [
        { cor: { nome: '1 BLACK' }, quantidades: { '38': '5', '42': '' } },
        { cor: { nome: '2 BRANCO' }, quantidades: { '38': '', '42': '9' } },
      ],
    });
    expect(saved.fichaTecnica?.corte?.linhas[0]?.quantidades['40']).toBeUndefined();
    expect(original.fichaTecnica?.corte?.linhas[0]?.quantidades['40']).toBe('7');
  });

  it('aceita quantidades inteiras, zero e vazio, e impede números negativos, decimais ou texto', () => {
    const save = vi.fn();
    mountFicha({ ...peca, fichaTecnica: { tamanhos: ['M'], coresMostruario: [black] } }, save);
    fireEvent.click(screen.getByRole('button', { name: 'Corte' }));
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar' }));
    fireEvent.change(quantity('M'), { target: { value: '12' } });
    for (const invalid of ['-1', '1.5', '1,5', 'abc', '9007199254740992']) {
      fireEvent.change(quantity('M'), { target: { value: invalid } });
      expect(quantity('M').value).toBe('12');
    }
    fireEvent.change(quantity('M'), { target: { value: '0' } });
    expect(quantity('M').value).toBe('0');
    fireEvent.change(quantity('M'), { target: { value: '' } });
    expect(quantity('M').value).toBe('');
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    expect(
      (save.mock.calls.at(-1)![0] as PecaItem).fichaTecnica?.corte?.linhas[0]?.quantidades.M
    ).toBe('');
  });

  it('usa a cor de mostruário de fichas antigas e mantém as edições abertas se o salvamento falhar', () => {
    const save = vi.fn(() => {
      throw new Error('Falha de armazenamento');
    });
    mountFicha({ ...peca, fichaTecnica: { tamanhos: ['38'], corMostruario: '1 BLACK' } }, save);
    fireEvent.click(screen.getByRole('button', { name: 'Corte' }));
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar' }));
    fireEvent.change(quantity('38'), { target: { value: '4' } });
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    expect(screen.getByText(/Não foi possível salvar no navegador/)).toBeDefined();
    expect(quantity('38').value).toBe('4');
  });

  it('informa falha de armazenamento sem confirmar salvamento e permite tentar novamente sem perder a seleção', () => {
    localStorage.setItem(LOCAL_PECAS_KEY, JSON.stringify([peca]));
    render(
      <CollectionDetailView
        marca={marca}
        colecao={colecao}
        onBackToBrand={() => {}}
        onBackToHome={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ficha técnica' }));
    fireEvent.click(screen.getByRole('combobox', { name: 'Tamanhos' }));
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Sem espaço', 'QuotaExceededError');
    });
    fireEvent.click(screen.getByRole('button', { name: 'G' }));
    expect(readPieces()[0]?.fichaTecnica?.tamanhos).toBeUndefined();
    expect(screen.getByText(/Não foi possível salvar automaticamente no navegador/)).toBeDefined();
    expect(screen.getByRole('button', { name: 'G', pressed: true })).toBeDefined();
    write.mockRestore();
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    expect(readPieces()[0]?.fichaTecnica?.tamanhos).toEqual(['G']);
    expect(screen.getByText('Alterações salvas automaticamente neste navegador.')).toBeDefined();
  });
});
