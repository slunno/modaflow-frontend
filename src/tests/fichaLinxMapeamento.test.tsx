import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import type { PecaItem, ColecaoItem } from '../types/plm';
import type { LinxGradeDetalhe, LinxCorProduto } from '../types/fichaLinxMapeamento';
import { conferirGradeLinx, projetarMapeamentoLinx } from '../services/fichaLinxMapeamento';
import { FichaGradeLinxPanel } from '../pages/Home/components/FichaGradeLinxPanel';
import {
  getLinxGradeDetalhe,
  getLinxCoresComCodigo,
  getLinxCoresProduto,
} from '../services/linxService';
import { registrarAlteracoesFicha } from '../services/fichaAlteracoes';
import { api } from '../services/api';
import { PecaFichaTecnicaView } from '../pages/Home/components/PecaFichaTecnicaView';
import type { MarcaSummary } from '../types/auth';

vi.mock('../services/api', () => ({ api: { get: vi.fn() } }));
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.resetAllMocks();
});
function gradeTeste(): LinxGradeDetalhe {
  return {
    grade: 'TESTE',
    numeroTamanhos: 12,
    posicoes: Array.from({ length: 48 }, (_, i) => ({
      posicao: i + 1,
      tamanho: ({ 1: 'P', 3: 'M' } as Record<number, string>)[i + 1] ?? null,
    })),
  };
}
const colecao: ColecaoItem = {
  id: 'c',
  marcaId: 'm',
  griffe: 'KING&JOE',
  nome: 'Coleção teste',
  marcaNome: 'Teste',
  status: 'Em andamento',
  dataEntrega: '',
  diasAtraso: 0,
};
function pecaTeste(integrada = true): PecaItem {
  return {
    id: 'p',
    marcaId: 'm',
    colecaoId: 'c',
    codigo: 'P1',
    nome: 'Peça teste',
    tipo: 'Peça',
    status: 'Em andamento',
    etapaAtual: '01 geração de ficha',
    tema: '',
    colecaoNome: colecao.nome,
    marcaNome: 'Teste',
    estilista: '',
    tecidos: [],
    previsaoEntrega: '',
    linxOrigem: integrada
      ? { codigoProduto: 'P1', colecaoCodigo: '025', griffe: 'KING&JOE' }
      : undefined,
    fichaTecnica: {
      integracao: { grade: 'TESTE' },
      gradeLinx: gradeTeste(),
      tamanhos: ['M', 'P'],
      variantes: [{ id: 'principal', nome: 'Principal', tecidos: [], aviamentos: [] }],
    },
  };
}
const cor: LinxCorProduto = {
  produto: 'P1',
  corProduto: 'VAR001',
  descricao: 'Cor variante',
  corBasica: 'BAS002',
  descricaoBasica: 'Cor básica',
  colecaoCor: '025',
  inativa: false,
};
function associar(peca: PecaItem) {
  peca.fichaTecnica!.variantes![0]!.corProdutoLinx = {
    ...cor,
    griffe: 'KING&JOE',
    colecao: '025',
    descColecao: colecao.nome,
  };
  return peca;
}

describe('Grade, cor de mostruário e cores dos insumos', () => {
  it('não compacta vazios nem usa a ordem selecionada para atribuir Cn', () => {
    const resultado = conferirGradeLinx('TESTE', ['M', 'P'], gradeTeste());
    expect(resultado.mapeamento).toEqual([
      { tamanho: 'M', posicao: 3, campo: 'C3' },
      { tamanho: 'P', posicao: 1, campo: 'C1' },
    ]);
    expect(resultado.pendencias).toEqual([]);
    expect(resultado.avisos[0]).toContain('12');
    expect(resultado.avisos[0]).toContain('2 posições');
  });
  it('não trata número com zero à esquerda, caixa ou descrição como equivalente', () => {
    const grade = gradeTeste();
    grade.posicoes[0]!.tamanho = '02';
    expect(conferirGradeLinx('TESTE', ['2', 'm'], grade).mapeamento).toEqual([]);
    expect(conferirGradeLinx('TESTE', ['2', 'm'], grade).pendencias).toHaveLength(3);
  });
  it('sinaliza tamanhos ausentes nas duas direções sem alterar os consumos', () => {
    const peca = pecaTeste();
    const original = structuredClone(peca);
    const resultado = conferirGradeLinx('TESTE', ['P', 'XG'], gradeTeste());
    expect(resultado.pendencias.join(' ')).toContain('XG');
    expect(resultado.pendencias.join(' ')).toContain('M');
    expect(peca).toEqual(original);
  });
  it('exige consulta da grade exata e não aceita dados de outra grade', () => {
    expect(conferirGradeLinx('OUTRA', ['P'], gradeTeste()).mapeamento).toEqual([]);
    expect(conferirGradeLinx('TESTE', ['P']).pendencias[0]).toContain('Consulte');
  });
  it('rejeita grade com posições duplicadas, fora da faixa ou omitidas', () => {
    const grade = gradeTeste();
    grade.posicoes[1]!.posicao = 1;
    expect(conferirGradeLinx('TESTE', ['P'], grade).mapeamento).toEqual([]);
    grade.posicoes[1]!.posicao = 49;
    expect(conferirGradeLinx('TESTE', ['P'], grade).pendencias[0]).toContain('inválida');
    grade.posicoes.pop();
    expect(conferirGradeLinx('TESTE', ['P'], grade).pendencias[0]).toContain('inválida');
  });
  it('não mapeia nomes de tamanho repetidos nem uma grade sem nomes', () => {
    const grade = gradeTeste();
    grade.posicoes[2]!.tamanho = 'P';
    expect(conferirGradeLinx('TESTE', ['P'], grade).pendencias[0]).toContain('repete');
    grade.posicoes = grade.posicoes.map((p) => ({ ...p, tamanho: null }));
    expect(conferirGradeLinx('TESTE', [], grade).pendencias[0]).toContain('não possui');
  });
  it('usa o mostruário de Geral sem exigir ou deduzir COR_PRODUTO por variante', () => {
    const peca = pecaTeste(false);
    peca.fichaTecnica!.coresMostruario = [
      { id: 'azul', nome: 'Azul', codigo: 'AZ01', hex: '#123456', origemMostruario: 'linx' },
    ];
    peca.fichaTecnica!.variantes![0]!.corBasicaLinx = { codigo: 'BAS002', descricao: 'Cor básica' };
    const plano = projetarMapeamentoLinx(peca, colecao);
    expect(plano.coresMostruario).toEqual([{ nome: 'Azul', codigo: 'AZ01' }]);
    expect(plano.variantes[0]).not.toHaveProperty('corProduto');
    expect(plano.variantes[0]).not.toHaveProperty('corBasica');
    expect(plano.pendencias).toEqual([]);
    expect(plano.exigeReleituraNoServidor).toBe(true);
    expect(plano.somentePlanejamento).toBe(true);
  });
  it('preserva o mostruário legado no portal, sem enviar uma origem ainda não confirmada', () => {
    const peca = pecaTeste();
    peca.fichaTecnica!.corMostruario = '1 BLACK';
    const plano = projetarMapeamentoLinx(peca, colecao);
    expect(plano.coresMostruario).toEqual([]);
    expect(peca.fichaTecnica!.corMostruario).toBe('1 BLACK');
    expect(plano.pendencias).toEqual([]);
  });
  it('não usa nem apaga vínculos antigos de variantes ao preparar o mostruário', () => {
    const peca = associar(pecaTeste());
    const clone = structuredClone(peca.fichaTecnica!.variantes![0]!);
    clone.id = 'v2';
    clone.nome = 'Outra';
    peca.fichaTecnica!.variantes!.push(clone);
    peca.fichaTecnica!.variantes![0]!.corProdutoLinx!.inativa = true;
    const original = structuredClone(peca);
    const plano = projetarMapeamentoLinx(peca, colecao);
    expect(plano.coresMostruario).toEqual([]);
    expect(plano.pendencias).toEqual([]);
    expect(plano.variantes).toHaveLength(1);
    expect(peca).toEqual(original);
  });
  it('mantém as cores dos tecidos e aviamentos independentes do mostruário', () => {
    const peca = pecaTeste(false);
    peca.fichaTecnica!.coresMostruario = [{ id: 'amostra', nome: 'Bege', hex: '#ddccbb' }];
    for (const tipo of ['tecidos', 'aviamentos'] as const) {
      peca.fichaTecnica!.variantes![0]![tipo].push({
        id: tipo,
        nome: tipo,
        codigo: 'LOCAL',
        temErp: false,
        fornecedores: '',
        custo: '1',
        unidade: 'Metros',
        coresList: [
          {
            id: tipo,
            nome: tipo === 'tecidos' ? 'Azul' : 'Preto',
            codigo: tipo === 'tecidos' ? 'AZ01' : 'PR01',
            hex: '',
            origemLinx: {
              materialCodigo: 'LOCAL',
              corCodigo: tipo === 'tecidos' ? 'AZ01' : 'PR01',
              corNome: tipo === 'tecidos' ? 'Azul' : 'Preto',
            },
          },
        ],
      });
    }
    const original = structuredClone(peca);
    const plano = projetarMapeamentoLinx(peca, colecao);
    expect(plano.coresMostruario).toEqual([]);
    expect(plano.variantes[0]!.consumos.map((item) => item.coresMaterial)).toEqual([
      [{ nome: 'Azul', codigo: 'AZ01' }],
      [{ nome: 'Preto', codigo: 'PR01' }],
    ]);
    expect(peca).toEqual(original);
  });
  it('respeita a remoção de todas as cores sem reativar o campo legado', () => {
    const peca = pecaTeste();
    peca.fichaTecnica!.corMostruario = 'Cor antiga';
    peca.fichaTecnica!.coresMostruario = [];
    expect(projetarMapeamentoLinx(peca, colecao).coresMostruario).toEqual([]);
  });
  it('projeta somente consumo digitado na posição real; não cria zeros para vazios', () => {
    const peca = associar(pecaTeste());
    peca.fichaTecnica!.variantes![0]!.aviamentos.push({
      id: 'i',
      nome: 'Insumo teste',
      codigo: 'LOCAL',
      fornecedores: '',
      temErp: false,
      custo: '1',
      unidade: 'Metros',
      consumoPorTamanho: { M: { valor: '0,5' }, P: { valor: '' }, FORA: { valor: '1' } },
    });
    const consumo = projetarMapeamentoLinx(peca, colecao).variantes[0]!.consumos[0]!;
    expect(consumo.materialLinx).toBeNull();
    expect(consumo.porTamanho).toEqual([
      { tamanho: 'M', posicao: 3, campo: 'C3', valorDigitado: '0,5', naoSeAplica: false },
    ]);
    expect(peca.fichaTecnica!.variantes![0]!.aviamentos[0]!.consumoPorTamanho!.FORA!.valor).toBe(
      '1'
    );
  });
  it('registra somente alterações de vínculos no histórico local', () => {
    const antes = pecaTeste();
    const depois = associar(structuredClone(antes));
    const auditado = registrarAlteracoesFicha(antes, depois, { id: 'u', nome: 'Autor' });
    expect(
      auditado
        .historicoAlteracoes!.flatMap((e) => e.campos)
        .some((c) => c.depois.includes('VAR001'))
    ).toBe(true);
    expect(antes.fichaTecnica!.variantes![0]!.corProdutoLinx).toBeUndefined();
  });
  it('consulta rotas parametrizadas e preserva caracteres reservados', async () => {
    vi.mocked(api.get).mockResolvedValue([]);
    await getLinxGradeDetalhe('P/M');
    await getLinxCoresComCodigo('BRANCO & 001');
    await getLinxCoresProduto('P1', 'KING&JOE', '025', 'Coleção & teste');
    expect(vi.mocked(api.get).mock.calls.map((c) => c[0])).toEqual([
      '/linx/grades/detalhe?grade=P%2FM',
      '/linx/cores-basicas/codigos?search=BRANCO+%26+001',
      '/linx/colecoes/025/produtos/P1/cores?griffe=KING%26JOE&descColecao=Cole%C3%A7%C3%A3o+%26+teste',
    ]);
  });
});

describe('Interface de conferência de vínculos', () => {
  it('consulta grade sem alterar tamanhos; aplica nomes apenas pelo botão explícito', async () => {
    vi.mocked(api.get).mockResolvedValue(gradeTeste());
    const aplicar = vi.fn();
    function Harness() {
      const [value, setValue] = useState<LinxGradeDetalhe>();
      return (
        <FichaGradeLinxPanel
          grade="TESTE"
          tamanhos={['P']}
          value={value}
          onChange={setValue}
          onUsarTamanhos={aplicar}
        />
      );
    }
    render(<Harness />);
    expect(api.get).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Consultar posições da grade' }));
    const usar = await screen.findByRole('button', { name: 'Usar tamanhos desta grade' });
    expect(aplicar).not.toHaveBeenCalled();
    fireEvent.click(usar);
    expect(aplicar).toHaveBeenCalledWith(['P', 'M']);
  });
  it('não aplica consulta atrasada após desmontar painel de grade', async () => {
    let resolver!: (g: LinxGradeDetalhe) => void;
    vi.mocked(api.get).mockReturnValue(
      new Promise((r) => {
        resolver = r;
      })
    );
    const change = vi.fn();
    const view = render(
      <FichaGradeLinxPanel
        grade="TESTE"
        tamanhos={['P']}
        onChange={change}
        onUsarTamanhos={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Consultar posições da grade' }));
    view.unmount();
    resolver(gradeTeste());
    await Promise.resolve();
    await Promise.resolve();
    expect(change).not.toHaveBeenCalled();
  });
  it('erro HTTP preserva a grade salva e permite tentar novamente', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Serviço indisponível'));
    const change = vi.fn();
    render(
      <FichaGradeLinxPanel
        grade="TESTE"
        tamanhos={['M', 'P']}
        value={gradeTeste()}
        onChange={change}
        onUsarTamanhos={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Consultar posições da grade' }));
    expect((await screen.findByRole('alert')).textContent).toContain('Serviço indisponível');
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole('table')).toBeDefined();
  });
  it('salva o mostruário em Geral, preserva vínculos antigos e dispensa o painel de cores por variante', async () => {
    vi.mocked(api.get).mockImplementation(async <T,>(path: string): Promise<T> => {
      if (path === '/linx/opcoes')
        return {
          subgrupos: [],
          linhas: [],
          griffes: ['KING&JOE'],
          grades: ['TESTE'],
          categorias: [],
        } as T;
      if (path.startsWith('/linx/grades/detalhe')) return gradeTeste() as T;
      if (path === '/linx/cores-mostruario') return ['BEGE SALMAO'] as T;
      return [] as T;
    });
    const peca = associar(pecaTeste(false));
    const vinculoAntigo = structuredClone(peca.fichaTecnica!.variantes![0]!.corProdutoLinx);
    peca.fichaTecnica!.gradeLinx = gradeTeste();
    const marca: MarcaSummary = {
      id: 'm',
      nome: 'Teste',
      code: 'KJ',
      initials: 'KJ',
      colecoesCount: 0,
      pecasCount: 0,
      heroImageUrl: '',
      description: '',
      badgeTag: '',
    };
    const salvar = vi.fn();
    render(
      <PecaFichaTecnicaView
        peca={peca}
        colecao={{ ...colecao, regraFicha: 'integracao-colecao-v1' }}
        marca={marca}
        onBack={vi.fn()}
        onUpdatePeca={salvar}
      />
    );
    fireEvent.focus(screen.getByRole('combobox', { name: 'Cor de mostruário' }));
    fireEvent.click(await screen.findByRole('option', { name: 'BEGE SALMAO' }));
    fireEvent.blur(screen.getByRole('combobox', { name: 'Cor de mostruário' }));
    const automatico = salvar.mock.calls.at(-1)![0] as PecaItem;
    expect(automatico.fichaTecnica!.corMostruario).toBe('BEGE SALMAO');
    expect(automatico.fichaTecnica!.variantes).toEqual(peca.fichaTecnica!.variantes);
    fireEvent.click(screen.getByRole('button', { name: 'Variantes' }));
    expect(screen.queryByText('Cores das variantes — vínculo Linx')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Buscar cores básicas no Linx' })).toBeNull();
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    const salvo = salvar.mock.calls.at(-1)![0] as PecaItem;
    expect(salvo.fichaTecnica!.gradeLinx!.posicoes[2]).toEqual({ posicao: 3, tamanho: 'M' });
    expect(salvo.fichaTecnica!.coresMostruario).toMatchObject([{ nome: 'BEGE SALMAO' }]);
    expect(salvo.fichaTecnica!.variantes![0]!.corProdutoLinx).toEqual(vinculoAntigo);
    expect(projetarMapeamentoLinx(salvo, colecao).coresMostruario).toEqual([
      { nome: 'BEGE SALMAO', codigo: null },
    ]);
    fireEvent.click(screen.getByRole('button', { name: '+ Nova variante' }));
    fireEvent.click(screen.getByRole('button', { name: 'Duplicar variante' }));
    await screen.findByRole('tab', { name: 'Selecionar variante Variante 2' });
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    const clonado = salvar.mock.calls.at(-1)![0] as PecaItem;
    expect(clonado.fichaTecnica!.coresMostruario).toEqual(salvo.fichaTecnica!.coresMostruario);
    expect(api.get).not.toHaveBeenCalledWith(expect.stringContaining('/cores-basicas/'));
    expect(clonado.fichaTecnica!.variantes![1]!.corBasicaLinx).toBeUndefined();
    expect(clonado.fichaTecnica!.variantes![1]!.corProdutoLinx).toBeUndefined();
  });
});
