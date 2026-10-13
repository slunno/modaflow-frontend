import type { FichaOutroCusto, FichaVariante, FichaTerceiro } from '../types/ficha';
import type { LinxFichaCustos } from '../types/linx';
import { baseConsumoInsumo, custoConsumo, decimalManual } from './fichaProcesso';
import { chaveCustoLinx, numeroCustoLinx, posicaoCustoLinx, situacaoCustoLinx } from './linxCustos';
import { itemNoContextoDaCor } from './insumoInformacoesCores';

export interface FichaCustoLinha {
  id: string;
  nome: string;
  grupo: string;
  unidade: string;
  consumo: number | null;
  consumoTexto?: string;
  preco: number | null;
  total: number | null;
  excluido: boolean;
  observacao?: string;
}
const soma = (valores: Array<number | null>): number | null => {
  if (valores.some((valor) => valor === null)) return null;
  const total = valores.reduce<number>((acc, valor) => acc + (valor ?? 0), 0);
  return Number.isFinite(total) ? total : null;
};
export function fonteCustosVariante(variante: FichaVariante, dados?: LinxFichaCustos | null) {
  return (
    variante.custos?.fonte ??
    (dados &&
    ![...variante.tecidos, ...variante.aviamentos].some((item) =>
      itemNoContextoDaCor(item).custo?.trim()
    )
      ? 'linx'
      : 'portal')
  );
}

/** Uma seleção por cor/tamanho, nunca soma posições ou cores diferentes. */
export function calcularCustosFicha(
  variante: FichaVariante,
  dados?: LinxFichaCustos | null,
  processos: FichaTerceiro[] = []
) {
  const fonte = fonteCustosVariante(variante, dados);
  const cores = [
    ...new Set(
      (dados?.materiais ?? []).map((row) => chaveCustoLinx(row.COR_PRODUTO)).filter(Boolean)
    ),
  ];
  const vinculada = variante.corProdutoLinx?.corProduto;
  const cor = variante.custos?.corProduto ?? vinculada ?? (cores.length === 1 ? cores[0]! : '');
  const tamanhos = [
    ...new Map(
      (dados?.materiais ?? [])
        .filter((row) => chaveCustoLinx(row.COR_PRODUTO) === cor && chaveCustoLinx(row.TAMANHO))
        .map((row) => [posicaoCustoLinx(row), chaveCustoLinx(row.TAMANHO)] as const)
    ),
  ]
    .filter((entry): entry is [number, string] => entry[0] !== null)
    .sort((a, b) => a[0] - b[0]);
  const posicao = variante.custos?.posicao ?? tamanhos[0]?.[0] ?? null;
  const rotas = [
    ...new Set(
      (dados?.operacoes ?? []).map((row) => chaveCustoLinx(row.ROTA_PRODUCAO)).filter(Boolean)
    ),
  ];
  const rota = variante.custos?.rota ?? (rotas.length === 1 ? rotas[0]! : '');
  let erro = '';
  let linhas: FichaCustoLinha[];
  if (fonte === 'linx') {
    if (!dados) erro = 'Aguardando consulta dos custos do Linx.';
    else if (!cor || !cores.includes(cor))
      erro = 'Selecione a cor do produto para calcular os custos.';
    else if (posicao === null || !tamanhos.some(([i]) => i === posicao))
      erro = 'Selecione um tamanho válido para calcular os custos.';
    linhas = erro
      ? []
      : (dados?.materiais ?? [])
          .filter(
            (row) =>
              (chaveCustoLinx(row.COR_PRODUTO) === cor || !chaveCustoLinx(row.COR_PRODUTO)) &&
              posicaoCustoLinx(row) === posicao
          )
          .map((row) => {
            const consumo = numeroCustoLinx(row.CONSUMO);
            const percentual = numeroCustoLinx(row.PORCENTAGEM_CONSUMO);
            const fator = numeroCustoLinx(row.FATOR_CONVERSAO);
            const preco = numeroCustoLinx(row.PRECO_COR_A_VISTA);
            const excluido = row.STATUS_CALCULO === 'FORA_FORMACAO_PRECO';
            return {
              id: [row.ITEM, row.MATERIAL, row.COR_MATERIAL].map(chaveCustoLinx).join(':'),
              nome: chaveCustoLinx(row.DESC_MATERIAL) || chaveCustoLinx(row.MATERIAL),
              grupo: chaveCustoLinx(row.GRUPO) || 'OUTROS INSUMOS',
              unidade: chaveCustoLinx(row.UNID_FICHA_TEC),
              consumo:
                consumo !== null && percentual !== null ? (consumo * percentual) / 100 : null,
              preco: preco !== null && fator !== null && fator > 0 ? preco / fator : null,
              total: excluido
                ? 0
                : row.STATUS_CALCULO === 'CALCULADO'
                  ? numeroCustoLinx(row.CUSTO_CONSUMO_LINX)
                  : null,
              excluido,
              observacao:
                excluido || row.STATUS_CALCULO !== 'CALCULADO'
                  ? situacaoCustoLinx(row.STATUS_CALCULO)
                  : undefined,
            };
          });
  } else {
    linhas = (['tecidos', 'aviamentos'] as const).flatMap((tipo) =>
      variante[tipo].map((item) => {
        item = itemNoContextoDaCor(item);
        const base = baseConsumoInsumo(item, tipo);
        return {
          id: item.id,
          nome: item.nome || 'Insumo sem nome',
          grupo: item.linxDados?.grupo || (tipo === 'tecidos' ? 'TECIDO' : 'AVIAMENTOS'),
          unidade: item.unidade,
          consumo: base.unidade !== null ? decimalManual(base.valor ?? '') : null,
          consumoTexto:
            base.unidade !== null && base.valor?.trim()
              ? `${base.campo === 'peso' ? 'Peso: ' : ''}${base.valor} ${item.unidade}`
              : undefined,
          preco: decimalManual(item.custo),
          total: custoConsumo(item, tipo),
          excluido: false,
        };
      })
    );
  }
  const erroInsumos = erro;
  const outrosOrigem: FichaOutroCusto[] = [];
  if (fonte === 'linx' && dados) {
    if (rotas.length > 1 && !rotas.includes(rota))
      erro ||= 'Selecione a rota de produção para incluir as operações.';
    const vistos = new Set<string>();
    for (const row of dados.operacoes.filter(
      (r) => !rotas.length || chaveCustoLinx(r.ROTA_PRODUCAO) === rota
    )) {
      const nome =
        chaveCustoLinx(row.DESC_FASE_PRODUCAO) || chaveCustoLinx(row.FASE_PRODUCAO) || 'Operação';
      const custo = numeroCustoLinx(row.CUSTO_SUGERIDO);
      const key = `${nome}:${custo}`;
      // Regra de operações confirmada na view: DISTINCT fase/valor, sem multiplicação por tempo.
      if (vistos.has(key) || custo === 0) continue;
      vistos.add(key);
      outrosOrigem.push({
        id: `operacao:${key}`,
        nome,
        custo: custo === null ? '' : String(custo),
        quantidade: '1',
        totalLinx: custo,
        origem: 'linx',
      });
    }
    dados.outrosCustos.forEach((row, i) =>
      outrosOrigem.push({
        id: `extra:${chaveCustoLinx(row.SEQUENCIA)}:${chaveCustoLinx(row.COD_OPERACAO_EXTRA)}:${i}`,
        nome:
          chaveCustoLinx(row.OPERACAO_EXTRA) || chaveCustoLinx(row.NOME_CATALOGO) || 'Outro custo',
        custo: numeroCustoLinx(row.CUSTO_OPERACAO)?.toString() ?? '',
        quantidade: numeroCustoLinx(row.QTDADE)?.toString() ?? '',
        totalLinx: numeroCustoLinx(row.CUSTO_TOTAL),
        origem: 'linx',
      })
    );
  }
  const outros = (variante.custos?.outros ?? outrosOrigem).filter(
    (item) => !item.id.startsWith('servico:') && !item.id.startsWith('rateio:')
  );
  const outrosCalculados = outros.map((item) => {
    const custo = decimalManual(item.custo),
      quantidade = decimalManual(item.quantidade);
    return {
      ...item,
      total:
        item.origem === 'linx' && 'totalLinx' in item
          ? (item.totalLinx ?? null)
          : custo !== null && quantidade !== null
            ? custo * quantidade
            : null,
    };
  });
  for (const processo of processos.filter((p) => p.variantes.includes(variante.id))) {
    const custos = processo.custosProcesso?.length
      ? processo.custosProcesso
      : [{ id: 'pendente', valor: '', observacao: '' }];
    for (const item of custos)
      outrosCalculados.push({
        id: `servico:${processo.id}:${item.id}`,
        nome: `Processo: ${processo.tipo} ${item.observacao}`.trim(),
        custo: item.valor,
        quantidade: '1',
        total: decimalManual(item.valor),
      });
  }
  for (const rateio of variante.custos?.rateios ?? [])
    outrosCalculados.push({
      id: `rateio:${rateio.id}`,
      nome: `Rateio: ${rateio.nome} (${rateio.periodicidade}; ${rateio.valor} ÷ ${rateio.unidades})`,
      custo: String(rateio.valor / rateio.unidades),
      quantidade: '1',
      total:
        Number.isFinite(rateio.valor) &&
        rateio.valor >= 0 &&
        Number.isFinite(rateio.unidades) &&
        rateio.unidades > 0
          ? rateio.valor / rateio.unidades
          : null,
    });
  const subtotalTecidos = soma(linhas.filter((r) => r.grupo === 'TECIDO').map((r) => r.total));
  const subtotalAviamentos = soma(linhas.filter((r) => r.grupo !== 'TECIDO').map((r) => r.total));
  const totalInsumos = !erroInsumos && linhas.length ? soma(linhas.map((r) => r.total)) : null;
  const totalOutros = soma(outrosCalculados.map((r) => r.total));
  const total =
    !erro && (linhas.length || outrosCalculados.length)
      ? soma([totalInsumos ?? (linhas.length ? null : 0), totalOutros])
      : null;
  const quantidade = decimalManual(variante.custos?.quantidadeProducao ?? '');
  const quantidadeValida = quantidade !== null && Number.isInteger(quantidade) && quantidade > 0;
  return {
    fonte,
    cores,
    cor,
    tamanhos,
    posicao,
    rotas,
    rota,
    linhas,
    outros: outrosCalculados,
    subtotalTecidos,
    subtotalAviamentos,
    totalInsumos,
    totalOutros,
    total,
    erro,
    pendentes:
      linhas.filter((r) => r.total === null).length +
      outrosCalculados.filter((r) => r.total === null).length,
    quantidade: quantidadeValida ? quantidade : null,
    totalProducao:
      quantidadeValida && total !== null && Number.isFinite(total * quantidade)
        ? total * quantidade
        : null,
  };
}
