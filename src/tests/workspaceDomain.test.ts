import { describe, expect, it } from 'vitest';
import {
  deadline,
  filterProducts,
  groupProducts,
  groupStageEvents,
  productCosts,
  stageHistory,
} from '../services/workspaceDomain';
import { peca, tecido, aviamento } from '../../tests/manual/precificacao/fixtures';
import type { OperationalProduct, WorkspaceDocument, WorkspaceChange } from '../types/workspace';

const product = (): OperationalProduct => ({
  ...peca,
  id: 'p1',
  sourceKey: 'product:c:p1',
  marcaId: '1',
  colecaoId: 'c',
  responsavel: 'Ana',
  tagIds: ['t1', 't2', 't1'],
  customFields: { f: false },
  fichaTecnica: {
    variantes: [
      {
        id: 'v1',
        nome: 'Natural',
        tecidos: [{ ...tecido, custo: '40', consumo: '1,5' }],
        aviamentos: [{ ...aviamento, custo: '5', quantidade: '1' }],
        custos: {
          quantidadeProducao: '100',
          rateios: [
            {
              id: 'r',
              nome: 'Estrutura',
              valor: 500,
              unidades: 100,
              periodicidade: 'Mensal',
              revisao: 1,
            },
          ],
        },
        precificacao: {
          modo: 'markup',
          markup: '2,5',
          margemLucro: '',
          precoAprovado: '190',
          baseCusto: 'producao',
        },
      },
    ],
    terceiros: [
      {
        id: 's',
        tipo: 'Costura',
        fornecedor: '',
        codigoFornecedor: '',
        observacoes: '',
        tela: '',
        traducao: '',
        tecnicas: '',
        variantes: ['v1'],
        custosProcesso: [{ id: 'cost', valor: '10', observacao: '' }],
      },
    ],
  },
});
const row = (p = product(), id = p.id): WorkspaceDocument<OperationalProduct> => ({
  id,
  kind: 'products',
  revision: 1,
  updatedAt: '2026-10-13T10:00:00Z',
  data: p,
});
const event = (
  id: string,
  fromStage: string | null,
  toStage: string | null,
  at: string
): WorkspaceChange => ({
  id,
  documentId: 'p1',
  kind: 'products',
  at,
  author: 'Ana',
  fromStage,
  toStage,
  data: { revision: 2, operation: 'ATUALIZAR', fields: ['etapaAtual'] },
});

describe('Memória de cálculo e BI compartilhado', () => {
  it('confere 80 por unidade, 200 sugerido e lote 8000, sem duplicar serviço/rateio', () => {
    const p = product();
    const summary = productCosts(p);
    expect(summary.variants[0]!.cost.total).toBe(80);
    expect(summary.variants[0]!.price.precoFinal).toBe(200);
    expect(summary.batch).toBe(8000);
    expect(summary.weighted).toBe(80);
    expect(summary.variants[0]!.price.diferenca).toBe(-10);
    p.fichaTecnica!.variantes![0]!.custos!.outros = [
      { id: 'servico:s:cost', nome: 'Cópia antiga', custo: '10', quantidade: '1' },
    ];
    expect(productCosts(p).batch).toBe(8000);
    p.fichaTecnica!.variantes![0]!.custos!.quantidadeProducao = '200';
    expect(productCosts(p).batch).toBe(16000);
  });
  it('mantém incompletos como pendentes e distingue zero e quantidade ausente', () => {
    const p = product();
    p.fichaTecnica!.variantes![0]!.custos!.quantidadeProducao = '';
    expect(productCosts(p).batch).toBeNull();
    expect(productCosts(p).weighted).toBeNull();
    expect(productCosts(p).range).toEqual([80, 80]);
    p.fichaTecnica!.variantes![0]!.tecidos[0]!.custo = '';
    expect(productCosts(p).variants[0]!.cost.total).toBeNull();
    p.fichaTecnica!.variantes![0]!.tecidos[0]!.custo = '0';
    expect(productCosts(p).variants[0]!.cost.total).toBe(20);
  });
  it('usa todas as 135 linhas, deduplica tags por modelo e filtra booleano falso', () => {
    const rows = Array.from({ length: 135 }, (_, i) =>
      row({ ...product(), id: String(i) }, String(i))
    );
    expect(groupProducts(rows, 'colecao', 'modelos')[0]!.value).toBe(135);
    expect(groupProducts(rows, 'tag', 'modelos').map((g) => g.value)).toEqual([135, 135]);
    expect(filterProducts(rows, { tag: 't1', custom: 'f', value: 'false' })).toHaveLength(135);
    expect(groupProducts(rows, 'tag', 'custo')[0]!.value).toBe(135 * 8000);
    expect(groupProducts(rows, 'tag', 'preco')[0]!.value).toBe(200);
  });
  it('não classifica concluídos como atrasados nem inventa prazo', () => {
    const p = { ...product(), previsaoEntrega: '2020-01-01' };
    expect(deadline(p, '2026-10-13')).toBe('Atrasado');
    p.status = 'Completa';
    expect(deadline(p, '2026-10-13')).toBe('Concluído');
    expect(filterProducts([row(p)], { attention: 'Em desenvolvimento' })).toHaveLength(0);
    expect(deadline({ ...p, status: 'Em andamento', previsaoEntrega: '—' })).toBe('Sem prazo');
  });
  it('o detalhamento de atrasos contém somente os modelos que contribuíram para o valor', () => {
    const rows = [
      row({ ...product(), status: 'Em andamento', previsaoEntrega: '2000-01-01' }, 'late'),
      row({ ...product(), status: 'Completa', previsaoEntrega: '2000-01-01' }, 'done'),
    ];
    const groups = groupProducts(rows, 'colecao', 'atrasos');
    expect(groups[0]!.value).toBe(1);
    expect(groups[0]!.ids).toEqual(['late']);
  });
  it('calcula permanência apenas entre eventos observados e filtra pela data da saída', () => {
    const history = [
      event('2', 'Corte', 'Prova', '2026-10-12T12:00:00Z'),
      event('0', null, null, '2026-10-01T12:00:00Z'),
      event('1', 'Desenho', 'Corte', '2026-10-10T12:00:00Z'),
    ];
    const ids = new Set(['p1']);
    expect(stageHistory(history, ids).durations).toEqual([
      { etapa: 'Corte', days: 2, documentId: 'p1', at: '2026-10-12T12:00:00Z' },
    ]);
    expect(
      groupStageEvents(history, ids, 'permanencia', '2026-10-12', '2026-10-12')[0]!.value
    ).toBe(2);
    expect(groupStageEvents(history, ids, 'entradas', '2026-10-11', '2026-10-11')).toEqual([]);
  });
});
