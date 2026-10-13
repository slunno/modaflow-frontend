import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import { PecaFichaTecnicaView } from '../pages/Home/components/PecaFichaTecnicaView';
import { LinxFornecedorPicker } from '../pages/Home/components/LinxFornecedorPicker';
import { api } from '../services/api';
import type { MarcaSummary } from '../types/auth';
import type { ColecaoItem, PecaItem } from '../types/plm';
import type { FichaInsumo } from '../types/ficha';

vi.mock('../services/api', () => ({
  api: {
    get: vi
      .fn()
      .mockResolvedValue({ subgrupos: [], linhas: [], griffes: [], grades: [], categorias: [] }),
    post: vi.fn(),
    put: vi.fn(),
  },
}));
vi.mock('../services/linxService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/linxService')>()),
  getLinxModelagens: vi.fn().mockResolvedValue([]),
  getLinxCoresMostruario: vi.fn().mockResolvedValue([]),
  getLinxFornecedores: vi
    .fn()
    .mockResolvedValue([{ fornecedor: 'Lavanderia real', codigo: '0099' }]),
}));

const marca: MarcaSummary = {
  id: 'marca',
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
  id: 'colecao',
  nome: 'Coleção',
  marcaNome: marca.nome,
  status: 'Em andamento',
  dataEntrega: '',
  diasAtraso: 0,
};
const peca: PecaItem = {
  id: 'peca',
  nome: 'Bata',
  codigo: '',
  tipo: 'Bata',
  status: 'Em andamento',
  etapaAtual: '',
  tema: 'Base',
  colecaoNome: colecao.nome,
  marcaNome: marca.nome,
  estilista: '',
  tecidos: [],
  previsaoEntrega: '',
  fichaTecnica: {
    variantes: [
      { id: 'principal', nome: 'Principal', tecidos: [], aviamentos: [] },
      { id: 'azul', nome: 'Azul', tecidos: [], aviamentos: [] },
    ],
    terceiros: [
      {
        id: 'terceiro',
        tipo: 'Lavanderia',
        fornecedor: 'Fornecedor anterior',
        codigoFornecedor: '0010',
        observacoes: 'Observação antiga preservada.',
        tela: '',
        traducao: '',
        tecnicas: '',
        variantes: ['azul'],
      },
    ],
  },
};

describe('Terceiros na ficha técnica', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('mantém o campo de código nos outros cadastros de fornecedores', () => {
    render(<LinxFornecedorPicker value={{ fornecedor: '', codigo: '' }} onChange={() => {}} />);
    expect(screen.getByRole('combobox', { name: 'Código do fornecedor' })).toBeDefined();
  });

  it('conecta Custos aos insumos da variante selecionada e apresenta seus totais locais', async () => {
    const tecido: FichaInsumo = {
      id: 'linho',
      nome: 'Linho',
      codigo: 'T1',
      custo: '12.50',
      unidade: 'Metros',
      consumo: '2',
      temErp: false,
      fornecedores: '',
    };
    const aviamento: FichaInsumo = {
      id: 'botao',
      nome: 'Botão',
      codigo: 'A1',
      custo: '0.30',
      unidade: 'Unidade',
      quantidade: '3',
      temErp: false,
      fornecedores: '',
    };
    const pecaComInsumos: PecaItem = {
      ...peca,
      fichaTecnica: {
        ...peca.fichaTecnica,
        variantes: [
          { id: 'principal', nome: 'Principal', tecidos: [tecido], aviamentos: [aviamento] },
          {
            id: 'azul',
            nome: 'Azul',
            tecidos: [{ ...tecido, id: 'jeans', nome: 'Jeans azul', consumo: '1.2' }],
            aviamentos: [],
          },
        ],
      },
    };
    render(
      <PecaFichaTecnicaView
        peca={pecaComInsumos}
        marca={marca}
        colecao={colecao}
        onBack={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Custos' }));
    expect(screen.getByText('Linho')).toBeDefined();
    expect(screen.getByText('Botão')).toBeDefined();
    const resumo = within(screen.getByRole('table', { name: 'Resumo dos custos — Principal' }));
    const linhaLinho = within(resumo.getByRole('row', { name: /Linho/ }));
    expect(linhaLinho.getAllByText('2 Metros')).toHaveLength(1);
    expect(linhaLinho.getByText('Não informado Metros')).toBeDefined();
    expect(linhaLinho.getByText(/R\$\s*12,5000/)).toBeDefined();
    expect(linhaLinho.getByText(/R\$\s*25,0000/)).toBeDefined();
    const linhaBotao = within(resumo.getByRole('row', { name: /Botão/ }));
    expect(linhaBotao.getAllByText('3 Unidade')).toHaveLength(1);
    expect(linhaBotao.getByText('Não informado Unidade')).toBeDefined();
    expect(linhaBotao.getByText(/R\$\s*0,9000/)).toBeDefined();
    expect(resumo.getByText(/R\$\s*25,9000/)).toBeDefined();
    const comparativo = within(screen.getByRole('table', { name: 'Custo por variante' }));
    expect(
      within(comparativo.getByRole('row', { name: /Azul/ })).getAllByText(/R\$\s*15,0000/)
    ).toHaveLength(1);
    // A Lavanderia vinculada à variante Azul ainda não tem custo: o total deve permanecer pendente.
    expect(
      within(comparativo.getByRole('row', { name: /Azul/ })).getAllByText('Não informado')
    ).toHaveLength(2);
    expect(screen.queryByText('Jeans azul')).toBeNull();
    expect(screen.queryByText('Lavanderia')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Editar tecidos' }));
    fireEvent.change(screen.getByLabelText('Consumo (Metros)'), { target: { value: '2.5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Custos' }));
    expect(screen.getAllByText(/2[.,]5 Metros/)).toHaveLength(1);
    fireEvent.change(screen.getByLabelText('Variante dos custos'), { target: { value: 'azul' } });
    expect(screen.getByText('Jeans azul')).toBeDefined();
    expect(screen.getAllByText(/1[.,]2 Metros/)).toHaveLength(1);
    expect(screen.queryByText('Linho')).toBeNull();
    expect(screen.queryByText('Botão')).toBeNull();
    expect(screen.queryByRole('rowheader', { name: /Subtotal de aviamentos/ })).toBeNull();

    fireEvent.change(screen.getByLabelText('Variante dos custos'), {
      target: { value: 'principal' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Editar tecidos' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remover Linho' }));
    fireEvent.click(screen.getByRole('button', { name: 'Custos' }));
    expect(screen.queryByText('Linho')).toBeNull();
    expect(screen.queryByRole('rowheader', { name: /Subtotal de tecidos/ })).toBeNull();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Custos' })).toBeDefined());
    expect(api.post).not.toHaveBeenCalled();
    expect(api.put).not.toHaveBeenCalled();
  });

  it('edita fornecedor, observações e variantes reais e salva os vínculos por ID sem escrever na API', async () => {
    const onUpdatePeca = vi.fn();
    const view = render(
      <PecaFichaTecnicaView
        peca={peca}
        marca={marca}
        colecao={colecao}
        onBack={() => {}}
        onUpdatePeca={onUpdatePeca}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Terceiros' }));
    const tipos = document.querySelectorAll('datalist option');
    expect(Array.from(tipos, (option) => option.getAttribute('value'))).toEqual([
      'Acabamento',
      'Amaciado',
      'Bord',
      'Bordado',
      'Estamaparia',
      'Estampa',
      'Estamparia',
      'Lavanderia',
      'Lavanderia + silk',
      'Lumen',
      'Silk',
      'Silk interno',
      'Sublimação',
      'Vay vay',
    ]);
    expect(screen.queryByRole('combobox', { name: 'Código do fornecedor' })).toBeNull();
    expect(screen.getByText('Uso em variantes (2)')).toBeDefined();
    expect((screen.getByRole('checkbox', { name: 'Azul' }) as HTMLInputElement).checked).toBe(true);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Principal' }));
    fireEvent.focus(screen.getByRole('combobox', { name: 'Fornecedor' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Lavanderia real — 0099' }));
    fireEvent.click(screen.getByRole('button', { name: 'Observação +' }));
    fireEvent.click(screen.getByRole('button', { name: 'Observação +' }));
    const observacoes = screen.getAllByRole('group', { name: /Observação \d/ });
    expect(observacoes).toHaveLength(2);
    fireEvent.change(within(observacoes[0]!).getByLabelText('Título'), {
      target: { value: 'Lavagem' },
    });
    fireEvent.change(within(observacoes[0]!).getByLabelText('Descrição'), {
      target: { value: 'Usar lavagem leve.' },
    });
    fireEvent.change(within(observacoes[1]!).getByLabelText('Título'), {
      target: { value: 'Embalagem' },
    });
    fireEvent.change(within(observacoes[1]!).getByLabelText('Descrição'), {
      target: { value: 'Separar por variante.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Remover observação 1' }));
    expect(screen.getAllByRole('group', { name: /Observação \d/ })).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: 'Variantes' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Selecionar variante Azul' }));
    fireEvent.click(screen.getByRole('button', { name: 'Renomear variante' }));
    fireEvent.change(screen.getByLabelText(/Nome da variante/), {
      target: { value: 'Marinho' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Concluir' }));
    fireEvent.click(screen.getByRole('button', { name: '+ Nova variante' }));
    fireEvent.click(screen.getByRole('button', { name: 'Nova variante' }));
    fireEvent.click(screen.getByRole('button', { name: 'Renomear variante' }));
    fireEvent.change(screen.getByLabelText(/Nome da variante/), {
      target: { value: 'Branca' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Concluir' }));
    fireEvent.click(screen.getByRole('button', { name: 'Terceiros' }));
    expect(screen.getByText('Uso em variantes (3)')).toBeDefined();
    expect(screen.queryByRole('checkbox', { name: 'Azul' })).toBeNull();
    expect((screen.getByRole('checkbox', { name: 'Marinho' }) as HTMLInputElement).checked).toBe(
      true
    );
    fireEvent.click(screen.getByRole('checkbox', { name: 'Branca' }));

    fireEvent.click(screen.getByRole('button', { name: 'Variantes' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Selecionar variante Marinho' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remover variante' }));
    fireEvent.click(screen.getByRole('button', { name: 'Terceiros' }));
    expect(screen.getByText('Uso em variantes (2)')).toBeDefined();
    expect(screen.queryByRole('checkbox', { name: 'Marinho' })).toBeNull();
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    const saved = onUpdatePeca.mock.calls.at(-1)![0] as PecaItem;
    expect(saved.fichaTecnica?.terceiros?.[0]).toMatchObject({
      fornecedor: 'Lavanderia real',
      codigoFornecedor: '0099',
      observacoes: 'Observação antiga preservada.',
      variantes: ['principal', saved.fichaTecnica?.variantes?.[1]?.id],
      observacoesList: [{ titulo: 'Embalagem', descricao: 'Separar por variante.' }],
    });
    expect(api.post).not.toHaveBeenCalled();
    expect(api.put).not.toHaveBeenCalled();
    view.unmount();
    render(<PecaFichaTecnicaView peca={saved} marca={marca} colecao={colecao} onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Terceiros' }));
    expect((screen.getByLabelText('Título') as HTMLInputElement).value).toBe('Embalagem');
    expect((screen.getByRole('checkbox', { name: 'Branca' }) as HTMLInputElement).checked).toBe(
      true
    );
  });
});
