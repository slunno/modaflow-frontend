import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PecaFichaTecnicaView } from '../pages/Home/components/PecaFichaTecnicaView';
import { getLinxFichaAtual } from '../services/linxService';
import { registrarIntegracaoConfirmada, getHistoricoDaPeca } from '../services/fichaHistorico';
import { getPecaFichaValues } from '../services/pecaFichaSelectors';
import type { PecaItem, ColecaoItem } from '../types/plm';
import type { LinxFichaDetalhe } from '../types/linx';
import type { FichaIntegracaoConfirmada } from '../types/fichaHistorico';
import type { FichaInsumo } from '../types/ficha';
import type { MarcaSummary } from '../types/auth';

vi.mock('../services/api', () => ({
  api: {
    get: vi
      .fn()
      .mockResolvedValue({ subgrupos: [], linhas: [], grades: [], griffes: [], categorias: [] }),
  },
}));
vi.mock('../services/linxService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/linxService')>()),
  getLinxModelagens: vi.fn().mockResolvedValue([]),
  getLinxFichaAtual: vi.fn(),
}));
vi.mock('../pages/Home/components/MostruarioColorsPicker', () => ({
  MostruarioColorsPicker: () => null,
}));
vi.mock('../pages/Home/components/FichaInsumosEditor', () => ({
  FichaInsumosEditor: ({
    items,
    onChange,
  }: {
    items: FichaInsumo[];
    onChange: (value: FichaInsumo[]) => void;
  }) => (
    <section aria-label="Insumos do menu">
      {items.map((item) => (
        <p key={item.id}>
          {item.nome} · {item.uso}
        </p>
      ))}
      <button
        onClick={() =>
          onChange([
            {
              id: 'manual',
              nome: 'Insumo manual',
              codigo: 'MAN',
              temErp: false,
              custo: '',
              fornecedores: '',
              unidade: 'M',
            },
          ])
        }
      >
        Editar insumo de teste
      </button>
    </section>
  ),
}));

const marca: MarcaSummary = {
  id: 'm',
  nome: 'King & Joe',
  code: 'KJ',
  initials: 'KJ',
  colecoesCount: 0,
  pecasCount: 0,
  heroImageUrl: '',
  description: '',
  badgeTag: '',
};
const colecao: ColecaoItem = {
  id: 'col-verao',
  marcaId: 'm',
  nome: 'Verão teste',
  marcaNome: marca.nome,
  status: 'Completas',
  dataEntrega: '',
  diasAtraso: 0,
  regraFicha: 'legado',
};
const peca: PecaItem = {
  id: 'p1',
  marcaId: 'm',
  colecaoId: colecao.id,
  codigo: 'TESTE',
  nome: 'Peça teste',
  tipo: 'Camisa',
  status: 'Completa',
  etapaAtual: '',
  tema: '',
  colecaoNome: colecao.nome,
  marcaNome: marca.nome,
  estilista: '',
  tecidos: [],
  previsaoEntrega: '',
  linxOrigem: { codigoProduto: 'TESTE', colecaoCodigo: '025', griffe: 'KING&JOE' },
  fichaTecnica: { nomeProduto: 'Peça teste', codigoReferencia: 'TESTE' },
};
const ficha: LinxFichaDetalhe = {
  versao: {
    produto: 'TESTE',
    versao: '00001',
    descricao: null,
    dataCriacao: null,
    responsavel: null,
    status: null,
    colecaoCodigo: null,
    colecaoNome: null,
  },
  materiais: [
    {
      codigo: '0101',
      nome: 'Tecido real de teste',
      grupo: 'TECIDO',
      item: '1',
      dados: { DESC_USO_MATERIAL: 'Uso original', UNID_FICHA_TEC: 'KG' },
      cores: [],
    },
    {
      codigo: '0201',
      nome: 'Aviamento real de teste',
      grupo: 'AVIAMENTOS',
      item: '2',
      dados: { UNID_FICHA_TEC: 'UN' },
      cores: [],
    },
  ],
};

describe('Carregamento da ficha atual nos menus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getLinxFichaAtual).mockResolvedValue(structuredClone(ficha));
  });
  const mount = (item = peca, collection = colecao, onUpdatePeca = vi.fn()) =>
    render(
      <PecaFichaTecnicaView
        peca={item}
        colecao={collection}
        marca={marca}
        onBack={() => {}}
        onUpdatePeca={onUpdatePeca}
      />
    );
  it('carrega tecidos e aviamentos automaticamente nos próprios menus usando a coleção aberta', async () => {
    const save = vi.fn();
    mount(peca, colecao, save);
    fireEvent.click(screen.getByRole('button', { name: 'Tecidos' }));
    expect(await screen.findByText('Tecido real de teste · Uso original')).toBeDefined();
    expect(getLinxFichaAtual).toHaveBeenCalledWith('TESTE', 'KING&JOE', '025', colecao.nome);
    fireEvent.click(screen.getByRole('button', { name: 'Aviamentos' }));
    expect(await screen.findByText('Aviamento real de teste ·')).toBeDefined();
    expect(screen.queryByRole('combobox', { name: 'Versão para visualizar' })).toBeNull();
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    expect(save.mock.calls[0]?.[0].fichaTecnica.variantes[0].tecidos).toHaveLength(1);
    expect(save.mock.calls[0]?.[0].fichaTecnica.variantes[0].aviamentos).toHaveLength(1);
    expect(save.mock.calls[0]?.[0].historicoIntegracoes).toBeUndefined();
    expect(save.mock.calls[0]?.[0].historicoAlteracoes).toEqual([]);
  });
  it('não sobrescreve os insumos de um rascunho salvo, mesmo que esteja vazio', () => {
    mount({
      ...peca,
      fichaTecnica: {
        variantes: [{ id: 'principal', nome: 'Principal', tecidos: [], aviamentos: [] }],
      },
    });
    expect(getLinxFichaAtual).not.toHaveBeenCalled();
  });
  it('resposta atrasada não apaga a edição de um insumo', async () => {
    let resolve!: (value: LinxFichaDetalhe) => void;
    vi.mocked(getLinxFichaAtual).mockReturnValue(
      new Promise((done) => {
        resolve = done;
      })
    );
    mount();
    await screen.findByText('Carregando tecidos e aviamentos…');
    fireEvent.click(screen.getByRole('button', { name: 'Tecidos' }));
    fireEvent.click(screen.getByRole('button', { name: 'Editar insumo de teste' }));
    await act(async () => resolve(ficha));
    expect(screen.getByText('Insumo manual ·')).toBeDefined();
    expect(screen.queryByText('Tecido real de teste · Uso original')).toBeNull();
  });
  it('nova coleção não busca fichas antigas do código no Linx', async () => {
    mount(peca, { ...colecao, regraFicha: 'integracao-colecao-v1' });
    fireEvent.click(screen.getByRole('button', { name: 'Histórico' }));
    expect(screen.getByText(/Nenhuma integração confirmada nesta coleção/)).toBeDefined();
    await waitFor(() => expect(getLinxFichaAtual).not.toHaveBeenCalled());
  });
});

describe('Histórico preparado para integração confirmada', () => {
  const nova = {
    ...colecao,
    griffe: 'KING&JOE' as const,
    regraFicha: 'integracao-colecao-v1' as const,
  };
  const recibo: FichaIntegracaoConfirmada = {
    status: 'CONFIRMADA',
    integracaoId: 'integracao-1',
    confirmadaEm: '2026-10-02T12:00:00Z',
    produto: peca.codigo,
    griffe: 'KING&JOE',
    colecaoId: nova.id,
    descColecao: nova.nome,
    colecaoLinxCodigo: '025',
    versaoLinx: '00001',
  };
  it('primeira integração preserva um snapshot e edição local não cria nem altera versões', () => {
    const saved = registrarIntegracaoConfirmada(peca, nova, recibo);
    saved.fichaTecnica!.nomeProduto = 'Nome alterado no rascunho';
    expect(saved.historicoIntegracoes).toHaveLength(1);
    expect(saved.historicoIntegracoes![0]!.peca.fichaTecnica!.nomeProduto).toBe('Peça teste');
    expect(registrarIntegracaoConfirmada(saved, nova, recibo)).toBe(saved);
    expect(
      registrarIntegracaoConfirmada(saved, nova, {
        ...recibo,
        integracaoId: 'novo-recibo-mesma-versao',
      })
    ).toBe(saved);
  });
  it('reintegração confirmada adiciona outra versão sem apagar a primeira', () => {
    const saved = registrarIntegracaoConfirmada(peca, nova, recibo);
    const changed = { ...saved, fichaTecnica: { ...saved.fichaTecnica, nomeProduto: 'Novo nome' } };
    const next = registrarIntegracaoConfirmada(changed, nova, {
      ...recibo,
      integracaoId: 'integracao-2',
      versaoLinx: '00002',
    });
    expect(next.historicoIntegracoes?.map((item) => item.numero)).toEqual([1, 2]);
    expect(next.historicoIntegracoes?.map((item) => item.peca.fichaTecnica?.nomeProduto)).toEqual([
      'Peça teste',
      'Novo nome',
    ]);
  });
  it('peça nova usa a griffe oficial da coleção e não o nome de exibição da marca', () => {
    const local = {
      ...peca,
      linxOrigem: undefined,
      fichaTecnica: { ...peca.fichaTecnica, integracao: { griffe: 'KING & JOE' } },
    };
    const saved = registrarIntegracaoConfirmada(local, nova, recibo);
    expect(saved.historicoIntegracoes).toHaveLength(1);
    expect(saved.historicoIntegracoes![0]!.recibo.griffe).toBe('KING&JOE');
    expect(() =>
      registrarIntegracaoConfirmada(peca, { ...nova, griffe: 'K&J BLACK' }, recibo)
    ).toThrow(/griffe/);
  });
  it('mesmo código em inverno não herda verão e recibo com outra coleção/griffe é rejeitado', () => {
    const saved = registrarIntegracaoConfirmada(peca, nova, recibo);
    const inverno = { ...nova, id: 'col-inverno', nome: 'Inverno teste' };
    expect(getHistoricoDaPeca({ ...saved, colecaoId: inverno.id }, inverno)).toEqual([]);
    expect(() =>
      registrarIntegracaoConfirmada(peca, nova, { ...recibo, colecaoId: inverno.id })
    ).toThrow(/não corresponde/);
    expect(() =>
      registrarIntegracaoConfirmada(peca, nova, { ...recibo, griffe: 'K&J BLACK' })
    ).toThrow(/griffe/);
    expect(() => registrarIntegracaoConfirmada(peca, colecao, recibo)).toThrow(/base antiga/);
  });
  it('miniaturas e filtros leem a própria ficha e todas as variantes, não outras peças', () => {
    const item = {
      ...peca,
      fichaTecnica: {
        ...peca.fichaTecnica,
        descricao: 'Descrição manual',
        tamanhos: ['P', 'G'],
        integracao: { linha: 'Linha escolhida' },
        variantes: [
          {
            id: 'principal',
            nome: 'Principal',
            tecidos: [
              {
                id: 'i1',
                nome: 'Tecido A',
                codigo: '01',
                temErp: false,
                custo: '',
                fornecedores: 'Fornecedor A',
                unidade: 'M',
              },
            ],
            aviamentos: [],
          },
          {
            id: 'outra',
            nome: 'Outra',
            tecidos: [
              {
                id: 'i2',
                nome: 'Tecido B',
                codigo: '02',
                temErp: false,
                custo: '',
                fornecedores: '',
                unidade: 'M',
              },
            ],
            aviamentos: [],
          },
        ],
      },
    };
    expect(getPecaFichaValues(item, 'Tecidos')).toEqual(['Tecido A (01)', 'Tecido B (02)']);
    expect(getPecaFichaValues(item, 'Tamanhos')).toEqual(['P', 'G']);
    expect(getPecaFichaValues(item, 'LINHA')).toEqual(['Linha escolhida']);
    expect(getPecaFichaValues(item, 'Fornecedor de Tecido')).toEqual(['Fornecedor A']);
    expect(getPecaFichaValues(peca, 'Tecidos')).toEqual([]);
  });
});
