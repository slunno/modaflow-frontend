import type { InsumoPrecoLinx, TecidoFornecedorItem } from '../types/gestao';
import type { LinxMaterialCadastro } from '../types/linx';
import { decimalManual } from './fichaProcesso';

export function unidadeLinxNormalizada(unidade: string): string {
  const codigo = unidade.trim().toLocaleUpperCase('pt-BR');
  if (['KG', 'KGS', 'QUILOGRAMA', 'QUILOGRAMAS'].includes(codigo)) return 'Kg';
  if (['M', 'MT', 'MTS', 'METRO', 'METROS'].includes(codigo)) return 'Metros';
  if (['UN', 'UND', 'UNID', 'UNIDADE', 'UNIDADES', 'PC', 'PCS'].includes(codigo)) return 'Unidade';
  return codigo;
}

export function fornecedoresDoMaterial(
  material: LinxMaterialCadastro,
  corCodigo: string | readonly string[] = ''
) {
  const cores = new Set(typeof corCodigo === 'string' ? (corCodigo ? [corCodigo] : []) : corCodigo);
  const unicos = new Map<string, { fornecedor: string; codigo: string }>();
  for (const vinculo of material.fornecedores ?? []) {
    if (cores.size && !cores.has(vinculo.CODIGO_COR)) continue;
    unicos.set(vinculo.CODIGO_FORNECEDOR, {
      fornecedor: vinculo.FORNECEDOR,
      codigo: vinculo.CODIGO_FORNECEDOR,
    });
  }
  return [...unicos.values()];
}

export function coresDosFornecedores(
  material: LinxMaterialCadastro,
  fornecedores: TecidoFornecedorItem[]
) {
  const codigos = new Set(fornecedores.map((item) => item.codigo).filter(Boolean));
  if (!codigos.size) return material.cores;
  const cores = new Set(
    (material.fornecedores ?? [])
      .filter((vinculo) => codigos.has(vinculo.CODIGO_FORNECEDOR))
      .map((vinculo) => vinculo.CODIGO_COR)
  );
  return material.cores.filter((cor) => cores.has(cor.CODIGO_COR));
}

export interface PrecoMaterialLinx extends InsumoPrecoLinx {
  id: string;
  descricao: string;
}

/** Fonte da automação por cor neste formulário, sem fallback nem conversão de unidade. */
export function precoAutomaticoDaCor(
  material: LinxMaterialCadastro,
  corCodigo: string,
  unidade: string
): InsumoPrecoLinx | null {
  const cor = material.cores.find((item) => item.CODIGO_COR === corCodigo);
  const valor = decimalManual(cor?.CUSTO_A_VISTA == null ? '' : String(cor.CUSTO_A_VISTA));
  const unidadeOrigem = material.unidadeEstoque?.trim() ?? '';
  if (
    !cor ||
    valor === null ||
    valor < 0 ||
    !unidadeOrigem ||
    unidadeLinxNormalizada(unidadeOrigem) !== unidadeLinxNormalizada(unidade)
  )
    return null;
  return {
    materialCodigo: material.codigo,
    corCodigo: cor.CODIGO_COR,
    fonte: 'MATERIAIS_CORES.CUSTO_A_VISTA',
    valor: String(cor.CUSTO_A_VISTA).trim(),
    unidade: unidadeOrigem,
  };
}

/** Regra aprovada: preço da relação fornecedor + material + cor, sem fallback/conversão. */
export function precoAutomaticoDoFornecedor(
  material: LinxMaterialCadastro,
  corCodigo: string,
  fornecedorCodigo: string,
  unidade: string
): InsumoPrecoLinx | null {
  const linhas = (material.fornecedores ?? []).filter(
    (linha) => linha.CODIGO_COR === corCodigo && linha.CODIGO_FORNECEDOR === fornecedorCodigo
  );
  if (linhas.length !== 1 || !material.cores.some((cor) => cor.CODIGO_COR === corCodigo))
    return null;
  const linha = linhas[0]!;
  const valor = decimalManual(linha.CUSTO_REPOSICAO == null ? '' : String(linha.CUSTO_REPOSICAO));
  if (
    valor === null ||
    !linha.UNIDADE?.trim() ||
    unidadeLinxNormalizada(linha.UNIDADE) !== unidadeLinxNormalizada(unidade)
  )
    return null;
  return {
    materialCodigo: material.codigo,
    corCodigo,
    fornecedorCodigo,
    fonte: 'MATERIAIS_FORNECEDOR.CUSTO_REPOSICAO',
    valor: String(linha.CUSTO_REPOSICAO).trim(),
    unidade: linha.UNIDADE.trim(),
    fatorConversaoFornecedor: linha.FATOR_CONVERSAO_FORNECEDOR,
  };
}

/** Não define prioridade, média, conversão nem escolhe o primeiro valor. */
export function precosDoMaterial(
  material: LinxMaterialCadastro,
  corCodigo: string,
  fornecedores: TecidoFornecedorItem[]
): PrecoMaterialLinx[] {
  const precos: PrecoMaterialLinx[] = [];
  const adicionar = (
    fonte: InsumoPrecoLinx['fonte'],
    valor: number | string | null | undefined,
    unidade: string | null,
    descricao: string,
    vinculo: Partial<InsumoPrecoLinx> = {}
  ) => {
    const numero = decimalManual(valor == null ? '' : String(valor));
    if (numero === null || numero < 0) return;
    const preco = {
      materialCodigo: material.codigo,
      fonte,
      valor: String(valor).trim(),
      unidade: unidade?.trim() ?? '',
      descricao,
      ...vinculo,
    };
    precos.push({
      ...preco,
      id: JSON.stringify([
        fonte,
        preco.corCodigo,
        preco.fornecedorCodigo,
        preco.valor,
        preco.unidade,
      ]),
    });
  };
  adicionar(
    'MATERIAIS.CUSTO_A_VISTA',
    material.custoAVista,
    material.unidadeEstoque,
    'Material · custo à vista'
  );
  adicionar(
    'MATERIAIS.CUSTO_REPOSICAO',
    material.custoReposicao,
    material.unidadeEstoque,
    'Material · custo de reposição'
  );
  const cores = coresDosFornecedores(material, fornecedores).filter(
    (cor) => !corCodigo || cor.CODIGO_COR === corCodigo
  );
  for (const cor of cores) {
    const descricao = `Cor ${cor.NOME_COR || cor.CODIGO_COR} (${cor.CODIGO_COR})`;
    adicionar(
      'MATERIAIS_CORES.CUSTO_A_VISTA',
      cor.CUSTO_A_VISTA,
      material.unidadeEstoque,
      `${descricao} · custo à vista`,
      { corCodigo: cor.CODIGO_COR }
    );
    adicionar(
      'MATERIAIS_CORES.CUSTO_REPOSICAO',
      cor.CUSTO_REPOSICAO,
      material.unidadeEstoque,
      `${descricao} · custo de reposição`,
      { corCodigo: cor.CODIGO_COR }
    );
  }
  const codigos = new Set(fornecedores.map((item) => item.codigo).filter(Boolean));
  for (const vinculo of material.fornecedores ?? []) {
    if (corCodigo && vinculo.CODIGO_COR !== corCodigo) continue;
    if (codigos.size && !codigos.has(vinculo.CODIGO_FORNECEDOR)) continue;
    adicionar(
      'MATERIAIS_FORNECEDOR.CUSTO_REPOSICAO',
      vinculo.CUSTO_REPOSICAO,
      vinculo.UNIDADE,
      `${vinculo.FORNECEDOR} (${vinculo.CODIGO_FORNECEDOR}) · cor ${vinculo.NOME_COR || vinculo.CODIGO_COR} (${vinculo.CODIGO_COR})`,
      {
        corCodigo: vinculo.CODIGO_COR,
        fornecedorCodigo: vinculo.CODIGO_FORNECEDOR,
        fatorConversaoFornecedor: vinculo.FATOR_CONVERSAO_FORNECEDOR,
      }
    );
  }
  return precos;
}
