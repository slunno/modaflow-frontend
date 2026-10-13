import type {
  InsumoInformacoesCor,
  TecidoCorItem,
  TecidoFornecedorItem,
  TecidoInsumoItem,
} from '../types/gestao';
import type { LinxMaterialCadastro } from '../types/linx';
import { precoAutomaticoDoFornecedor } from './insumoLinxVinculos';

export function corAtivaInsumo(item: TecidoInsumoItem) {
  return (
    item.coresList?.find((cor) => cor.id === item.corEmEdicaoId) ??
    item.coresList?.find(
      (cor) =>
        cor.origemLinx?.corCodigo === item.corLinx?.corCodigo &&
        cor.origemLinx?.materialCodigo === item.codigo.trim()
    ) ??
    (item.coresList?.length === 1 ? item.coresList[0] : undefined)
  );
}

/** Migra somente a cor em foco, nunca replica preço/consumo legado para todas as cores. */
export function coresComDadosLegados(item: TecidoInsumoItem): TecidoCorItem[] {
  const ativa =
    corAtivaInsumo(item) ?? (item.coresList?.length === 1 ? item.coresList[0] : undefined);
  return (item.coresList ?? []).map((cor) =>
    cor.dadosInsumo || cor.id !== ativa?.id
      ? cor
      : {
          ...cor,
          dadosInsumo: {
            custo: item.custo,
            unidade: item.unidade,
            consumo: item.consumo,
            peso: item.peso,
            quantidade: item.quantidade,
            precoLinx: item.precoLinx,
            precoManual: !item.precoLinx && !!item.custo.trim(),
            fornecedorCodigo: item.precoLinx?.fornecedorCodigo,
            fornecedorNome: item.fornecedoresList?.find(
              (fornecedor) => fornecedor.codigo === item.precoLinx?.fornecedorCodigo
            )?.fornecedor,
          },
        }
  );
}

export function fornecedoresDaCor(
  cor: TecidoCorItem,
  material: LinxMaterialCadastro | null,
  fornecedores: TecidoFornecedorItem[]
) {
  const origem = cor.origemLinx;
  if (!origem) return fornecedores.filter((fornecedor) => fornecedor.codigo);
  return fornecedores.filter(
    (fornecedor) =>
      material?.codigo === origem.materialCodigo &&
      material.fornecedores?.some(
        (linha) =>
          linha.CODIGO_COR === origem.corCodigo && linha.CODIGO_FORNECEDOR === fornecedor.codigo
      )
  );
}

export function escolherFornecedorDaCor(
  cor: TecidoCorItem,
  material: LinxMaterialCadastro | null,
  fornecedor: TecidoFornecedorItem | undefined,
  unidade: string
): TecidoCorItem {
  if (!cor.origemLinx)
    return {
      ...cor,
      dadosInsumo: {
        custo: '',
        ...cor.dadosInsumo,
        unidade,
        fornecedorCodigo: fornecedor?.codigo,
        fornecedorNome: fornecedor?.fornecedor,
        precoLinx: undefined,
        precoManual: cor.dadosInsumo?.precoManual ?? false,
      },
    };
  const preco =
    material && cor.origemLinx?.materialCodigo === material.codigo && fornecedor
      ? precoAutomaticoDoFornecedor(material, cor.origemLinx.corCodigo, fornecedor.codigo, unidade)
      : null;
  return {
    ...cor,
    dadosInsumo: {
      ...cor.dadosInsumo,
      unidade,
      custo: preco?.valor ?? '',
      precoLinx: preco ?? undefined,
      precoManual: false,
      fornecedorCodigo: fornecedor?.codigo,
      fornecedorNome: fornecedor?.fornecedor,
    },
  };
}

/** Preenche vínculos inequívocos. Valores manuais e quantidades nunca são substituídos. */
export function completarInformacoesCores(
  cores: TecidoCorItem[],
  material: LinxMaterialCadastro | null,
  fornecedores: TecidoFornecedorItem[],
  unidade: string
) {
  return cores.map((cor) => {
    let resultado = { ...cor, dadosInsumo: { custo: '', unidade, ...cor.dadosInsumo } };
    const opcoes = fornecedoresDaCor(cor, material, fornecedores);
    const escolhida = opcoes.find(
      (fornecedor) => fornecedor.codigo === resultado.dadosInsumo.fornecedorCodigo
    );
    if (resultado.dadosInsumo.fornecedorCodigo && material && !escolhida && cor.origemLinx) {
      resultado = {
        ...resultado,
        dadosInsumo: {
          ...resultado.dadosInsumo,
          fornecedorCodigo: undefined,
          fornecedorNome: undefined,
          ...(resultado.dadosInsumo.precoLinx ? { custo: '', precoLinx: undefined } : {}),
        },
      };
    }
    const fornecedor = escolhida ?? (opcoes.length === 1 ? opcoes[0] : undefined);
    if (!fornecedor) return resultado;
    const dados = resultado.dadosInsumo;
    if (
      dados.precoLinx &&
      dados.precoLinx.fonte !== 'MATERIAIS_FORNECEDOR.CUSTO_REPOSICAO' &&
      !dados.precoManual
    )
      return escolherFornecedorDaCor(resultado, material, fornecedor, dados.unidade);
    if (dados.precoManual || dados.custo.trim())
      return {
        ...resultado,
        dadosInsumo: {
          ...dados,
          fornecedorCodigo: fornecedor.codigo,
          fornecedorNome: fornecedor.fornecedor,
        },
      };
    return escolherFornecedorDaCor(resultado, material, fornecedor, dados.unidade);
  });
}

/** Os campos antigos representam uma única cor em foco, nunca soma/média de várias cores. */
export function camposDaCor(cores: TecidoCorItem[], id: string | null | undefined) {
  const cor = cores.find((item) => item.id === id);
  const dados = cor?.dadosInsumo;
  return dados
    ? {
        custo: dados.custo,
        unidade: dados.unidade,
        precoLinx: dados.precoLinx,
        consumo: dados.consumo ?? '',
        peso: dados.peso ?? '',
        quantidade: dados.quantidade ?? '',
        corLinx: cor.origemLinx,
        corEmEdicaoId: cor.id,
      }
    : {};
}

export function itemNoContextoDaCor<T extends TecidoInsumoItem>(item: T): T {
  const ativa = corAtivaInsumo(item);
  if (!ativa && (item.coresList?.length ?? 0) > 1 && item.coresList?.some((cor) => cor.dadosInsumo))
    return { ...item, custo: '', consumo: '', peso: '', quantidade: '' };
  return ativa?.dadosInsumo ? { ...item, ...camposDaCor(item.coresList ?? [], ativa.id) } : item;
}

export function mesclarCamposDaCor(item: TecidoInsumoItem, changes: Partial<TecidoInsumoItem>) {
  const ativa = corAtivaInsumo(item);
  if (
    !ativa ||
    changes.coresList ||
    !['custo', 'consumo', 'peso', 'quantidade', 'unidade'].some((campo) =>
      Object.hasOwn(changes, campo)
    )
  )
    return { ...item, ...changes };
  const dados: InsumoInformacoesCor = {
    custo: item.custo,
    unidade: item.unidade,
    ...ativa.dadosInsumo,
  };
  for (const campo of ['custo', 'consumo', 'peso', 'quantidade', 'unidade'] as const)
    if (changes[campo] !== undefined) dados[campo] = changes[campo];
  if (changes.custo !== undefined) {
    dados.precoLinx = undefined;
    dados.precoManual = true;
  }
  return {
    ...item,
    ...changes,
    coresList: item.coresList?.map((cor) =>
      cor.id === ativa.id ? { ...cor, dadosInsumo: dados } : cor
    ),
  };
}
