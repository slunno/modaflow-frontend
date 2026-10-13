import type { PecaItem } from '../types/plm';
import type { FichaInsumo } from '../types/ficha';

/** A Principal é a primeira variante, como no editor; seu nome pode ser alterado. */
export function variantePrincipalLinx(peca: PecaItem) {
  return peca.fichaTecnica?.variantes?.[0];
}

/** Sem inferir um código ERP pela descrição, pelo hex ou por um código digitado. */
export function coresMostruarioLinx(peca: PecaItem) {
  return (peca.fichaTecnica?.coresMostruario ?? [])
    .filter((cor) => cor.origemMostruario === 'linx')
    .map(({ nome, codigo }) => ({ nome, codigo: codigo ?? null }));
}

function projetarInsumo(item: FichaInsumo) {
  return {
    id: item.id,
    nome: item.nome,
    codigo: item.codigo,
    custo: item.custo,
    unidade: item.unidade,
    consumo: item.consumo,
    quantidade: item.quantidade,
    peso: item.peso,
    uso: item.uso,
    componente: item.componente,
    consumoPorTamanho: item.consumoPorTamanho
      ? Object.fromEntries(
          Object.entries(item.consumoPorTamanho).map(([tamanho, consumo]) => [
            tamanho,
            { valor: consumo.valor, naoSeAplica: consumo.naoSeAplica === true },
          ])
        )
      : undefined,
    // Referências para conferência, não autorização para atualizar preços globais.
    precoLinx: item.precoLinx,
    fornecedoresList: item.fornecedoresList?.map(({ fornecedor, codigo }) => ({
      fornecedor,
      codigo,
    })),
    coresList: item.coresList
      ?.filter((cor) => cor.origemLinx?.materialCodigo === item.codigo.trim())
      .map(({ nome, origemLinx, dadosInsumo }) => ({
        nome,
        codigo: origemLinx!.corCodigo,
        informacoes: dadosInsumo
          ? {
              custo: dadosInsumo.custo,
              unidade: dadosInsumo.unidade,
              consumo: dadosInsumo.consumo,
              peso: dadosInsumo.peso,
              quantidade: dadosInsumo.quantidade,
              fornecedorCodigo: dadosInsumo.fornecedorCodigo,
              precoLinx: dadosInsumo.precoLinx,
            }
          : undefined,
      })),
    corLinx: item.corLinx,
  };
}

/** Planejamento: nunca transporta anexos, variantes locais ou cores personalizadas. */
export function projetarFichaPrincipalLinx(peca: PecaItem) {
  const ficha = peca.fichaTecnica;
  const principal = variantePrincipalLinx(peca);
  return {
    nomeProduto: ficha?.nomeProduto,
    descricao: ficha?.descricao,
    tamanhos: ficha?.tamanhos,
    integracao: ficha?.integracao,
    modelagem: ficha?.modelagem,
    tecnica: ficha?.tecnica,
    observacoesGerais: ficha?.observacoesGerais,
    observacoesCorte: ficha?.observacoesCorte,
    observacoesModelagem: ficha?.observacoesModelagem,
    coresMostruario: coresMostruarioLinx(peca),
    variantes: principal
      ? [
          {
            id: principal.id,
            nome: principal.nome,
            tecidos: principal.tecidos.map(projetarInsumo),
            aviamentos: principal.aviamentos.map(projetarInsumo),
          },
        ]
      : [],
  };
}
