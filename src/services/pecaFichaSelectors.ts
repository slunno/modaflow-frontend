import type { PecaItem } from '../types/plm';
import { getPecaInsumoLabels } from './linxFichaMappers';
import { formatCurrencyValue } from './contractMappers';

const unique = (values: (string | undefined | null)[]) => [
  ...new Set(
    values
      .map((value) => value?.trim())
      .filter((value): value is string => !!value && value !== '—')
  ),
];

/** Uma única origem de valores para a miniatura e os filtros da coleção. */
export function getPecaFichaValues(peca: PecaItem, field: string): string[] {
  const ficha = peca.fichaTecnica;
  const insumos = (tipo: 'tecidos' | 'aviamentos') =>
    ficha?.variantes?.flatMap((item) => item[tipo]) ?? [];
  const simples: Record<string, string | undefined> = {
    Status: peca.status,
    Código: peca.codigo,
    Etapas: peca.etapaAtual,
    Previsão: peca.previsaoEntrega,
    'Data de entrega': peca.previsaoEntrega,
    'Resp. da etapa': peca.responsavel,
    Responsável: peca.responsavel,
    Estilista: peca.estilista,
    Modelista: peca.modelista,
    TEMA: peca.tema,
    Fluxo: peca.fluxo,
    Descrição: ficha?.descricao,
    Modelagem: ficha?.modelagem,
    Técnica: ficha?.tecnica,
    Estampas: ficha?.estampa,
    'Nome do Produto': ficha?.nomeProduto,
    'Observações de Corte': ficha?.observacoesCorte,
    'Observações Gerais': ficha?.observacoesGerais,
    'Observações Modelagem': ficha?.observacoesModelagem,
    Simbologia: ficha?.simbologiaDescricao,
    Linha: ficha?.integracao?.linha ?? peca.linxCadastro?.linha ?? undefined,
    Grade: ficha?.integracao?.grade ?? peca.linxCadastro?.grade ?? undefined,
    Griffe: ficha?.integracao?.griffe ?? peca.linxOrigem?.griffe ?? peca.marcaNome,
    'Sub-grupo': ficha?.integracao?.subgrupo ?? peca.linxCadastro?.subgrupo ?? peca.tipo,
    Categoria: ficha?.integracao?.categoria,
    Subcategoria: ficha?.integracao?.subcategoria,
    'Tipo de matéria-prima': ficha?.integracao?.tipoMateriaPrima,
  };
  if (field === 'Tipo de peça') return unique([peca.tipo]);
  if (field === 'Tecidos' || field === 'TECIDO') return getPecaInsumoLabels(peca, 'tecidos');
  if (field === 'Aviamentos') return getPecaInsumoLabels(peca, 'aviamentos');
  if (field === 'Custo') return peca.custo == null ? [] : [formatCurrencyValue(peca.custo)];
  if (field === 'Preço') return peca.preco == null ? [] : [formatCurrencyValue(peca.preco)];
  if (field === 'LINHA') return unique([simples.Linha]);
  if (field === 'SUBCATEGORIA') return unique([simples.Subcategoria]);
  if (field === 'Tamanhos') return unique(ficha?.tamanhos ?? []);
  if (field === 'Medidas') return unique(ficha?.tabelasMedidas?.map((item) => item.nome) ?? []);
  if (field === 'Variantes') return unique(ficha?.variantes?.map((item) => item.nome) ?? []);
  if (field === 'Cores')
    return unique(
      ficha?.coresMostruario?.map(
        (item) => `${item.nome}${item.codigo ? ` (${item.codigo})` : ''}`
      ) ?? [ficha?.corMostruario]
    );
  if (field === 'Pantone') return unique(ficha?.coresMostruario?.map((item) => item.pantone) ?? []);
  if (field === 'Fornec. de Tecido' || field === 'Fornecedor de Tecido')
    return unique(
      insumos('tecidos').flatMap(
        (item) =>
          item.fornecedoresList?.map((supplier) => supplier.fornecedor) ?? [item.fornecedores]
      )
    );
  if (field === 'Fornec. de Aviamento' || field === 'Fornecedor de Aviamento')
    return unique(
      insumos('aviamentos').flatMap(
        (item) =>
          item.fornecedoresList?.map((supplier) => supplier.fornecedor) ?? [item.fornecedores]
      )
    );
  if (field === 'Fornec. de Terc.' || field === 'Fornecedor de Terceiros')
    return unique(ficha?.terceiros?.map((item) => item.fornecedor) ?? []);
  if (field === 'Terceiros') return unique(ficha?.terceiros?.map((item) => item.tipo) ?? []);
  if (field === 'Observações do terceiro')
    return unique(
      ficha?.terceiros?.flatMap((item) => [
        item.observacoes,
        ...(item.observacoesList?.map((obs) => `${obs.titulo}: ${obs.descricao}`) ?? []),
      ]) ?? []
    );
  if (field === 'Tela' || field === 'Tradução')
    return unique(
      ficha?.terceiros?.map((item) => (field === 'Tela' ? item.tela : item.traducao)) ?? []
    );
  return unique([simples[field]]);
}

export const CAMPOS_FICHA_CONECTADOS = new Set([
  'Status',
  'Código',
  'Etapas',
  'Previsão',
  'Resp. da etapa',
  'Responsável',
  'Estilista',
  'Modelista',
  'Tipo de peça',
  'Custo',
  'Preço',
  'Cores',
  'Pantone',
  'Estampas',
  'Variantes',
  'Descrição',
  'Modelagem',
  'Medidas',
  'Tamanhos',
  'Técnica',
  'Tecidos',
  'Aviamentos',
  'Fornec. de Tecido',
  'Fornec. de Aviamento',
  'Fornec. de Terc.',
  'Fornecedor de Tecido',
  'Fornecedor de Aviamento',
  'Fornecedor de Terceiros',
  'Terceiros',
  'LINHA',
  'SUBCATEGORIA',
  'TECIDO',
  'TEMA',
  'Categoria',
  'Grade',
  'Griffe',
  'Linha',
  'Nome do Produto',
  'Observações de Corte',
  'Observações Gerais',
  'Observações Modelagem',
  'Simbologia',
  'Sub-grupo',
  'Subcategoria',
  'Tipo de matéria-prima',
  'Data de entrega',
  'Observações do terceiro',
  'Tela',
  'Tradução',
]);
