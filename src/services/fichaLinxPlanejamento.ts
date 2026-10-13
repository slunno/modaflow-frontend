import type { ColecaoItem, PecaItem } from '../types/plm';
import type { LinxFichaValor } from '../types/linx';
import { getHistoricoDaPeca } from './fichaHistorico';

/** Planejamento, não um conector: nenhuma função deste módulo executa SQL ou HTTP. */
export function planejarOperacaoLinx(peca: PecaItem, colecao: ColecaoItem) {
  if (!peca.marcaId || peca.marcaId !== colecao.marcaId || peca.colecaoId !== colecao.id)
    throw new Error('A peça não pertence à marca e à coleção informadas.');
  if (!peca.codigo.trim() || peca.codigo.trim().length > 12)
    throw new Error(
      'Informe o código próprio do produto, com até 12 caracteres. O código de referência não substitui esse cadastro.'
    );
  const confirmada = getHistoricoDaPeca(peca, colecao).at(-1)?.recibo;
  const origem = peca.linxOrigem;
  const griffeOrigem = confirmada?.griffe ?? origem?.griffe;
  if (griffeOrigem && (!colecao.griffe || griffeOrigem !== colecao.griffe))
    throw new Error('A griffe do vínculo Linx não corresponde à coleção aberta.');
  if (confirmada && confirmada.descColecao.trim() !== colecao.nome.trim())
    throw new Error('O recibo confirmado não corresponde à descrição da coleção aberta.');
  const produto = confirmada?.produto ?? origem?.codigoProduto;
  const colecaoLinx = confirmada?.colecaoLinxCodigo ?? origem?.colecaoCodigo;
  if (produto && produto.trim() !== peca.codigo.trim())
    throw new Error(
      'Alterar o código de um produto integrado exige uma migração de identidade, não uma edição da ficha.'
    );
  if (
    confirmada &&
    origem &&
    (confirmada.produto.trim() !== origem.codigoProduto.trim() ||
      confirmada.colecaoLinxCodigo.trim() !== origem.colecaoCodigo.trim() ||
      confirmada.griffe !== origem.griffe)
  )
    throw new Error('O recibo confirmado diverge do vínculo original da peça.');
  const vinculada = !!(confirmada || origem);
  // É a versão confirmada/importada, nunca MAX(VERSAO_FICHA) ou uma versão do vídeo.
  const versao = confirmada?.versaoLinx ?? peca.fichaTecnica?.linxVersaoImportada;
  if (vinculada && (!versao?.trim() || !colecaoLinx?.trim()))
    throw new Error(
      'Carregue a identidade da ficha atual e da coleção no Linx antes de preparar sua atualização.'
    );
  if (vinculada && (versao!.trim().length > 5 || colecaoLinx!.trim().length > 6))
    throw new Error('A versão ou o código da coleção excedem os limites identificados no Linx.');
  const colecaoImportada = peca.fichaTecnica?.linxColecaoOrigem?.trim();
  if (colecaoImportada && colecaoImportada !== colecaoLinx?.trim())
    throw new Error('A versão importada está vinculada a outra coleção; não será atualizada.');
  return {
    operacao: vinculada
      ? ('ATUALIZAR_FICHA_ATUAL' as const)
      : ('VERIFICAR_CADASTRO_E_FICHA_COLECAO' as const),
    codigoInformadoPor: 'USUARIO' as const,
    acoesAposConsultaDoCodigo: vinculada
      ? []
      : [
          'CRIAR_PRODUTO_E_FICHA_SE_CODIGO_NOVO',
          'REUTILIZAR_CADASTRO_SE_EXISTENTE_E_VINCULAR_FICHA_DA_COLECAO',
        ],
    versaoAlvo: vinculada ? versao!.trim() : null,
    colecaoLinxCodigo: colecaoLinx?.trim() ?? null,
    politicaAtualizacao: 'ALTERACOES_EXPLICITAS' as const,
    preservarDadosNaoSolicitados: true,
    descartarApenasComSolicitacaoExplicita: true,
    gerarNovaVersaoAutomaticamente: false,
    alterarCatalogosCompartilhados: false,
    referencia: {
      codigo: peca.fichaTecnica?.codigoReferencia?.trim() || null,
      somenteReferencia: true,
      atualizarProdutoReferenciado: false,
    },
    persistenciaCodigo: 'PENDENTE_GRAVADOR_ERP' as const,
    verificacoesAntesDaGravacao: [
      'Reler produto, griffe, coleção e versão atual no ERP; o vínculo local não é prova do estado atual',
      'Reler o código global: se inexistente, criar o cadastro; se existente, preservá-lo e resolver a ficha da coleção, sem duplicar PRODUTOS',
      'Reutilizar um código/referência não autoriza alterar a ficha de outra coleção; confirmar produto, versão, coleção e griffe. Data é informação auxiliar, não chave',
      'Atualização deve rejeitar versão diferente da atual e conflito de alterações concorrentes',
      'Não substituir listas inteiras nem interpretar campos omitidos como exclusão',
      'Validar códigos de material/cor, grade, fase/setor e referências antes da transação',
    ],
  };
}

const camposPermitidos = {
  produto: new Set(['U_NOME_PRODUTO', 'DESC_PRODUTO']),
  materialDaFicha: new Set([
    'DESC_USO_MATERIAL',
    'PARTE_APLICADO_MATERIAL',
    'MATERIAL_PRINCIPAL',
    'CONSUMO_P_TAMANHO',
    'CONSUMO_FIXO',
    'LARGURA',
    'ALTURA',
    'FASE_PRODUCAO',
    'SETOR_PRODUCAO',
    ...Array.from({ length: 48 }, (_, index) => `C${index + 1}`),
  ]),
  corDaFicha: new Set(['COR_MATERIAL', 'PORCENTAGEM_CONSUMO', 'MATERIAL_PRINCIPAL']),
};

/**
 * Mescla somente os campos explicitamente solicitados em UMA linha já identificada.
 * Material/cor removidos exigem uma operação separada com a chave completa e confirmação.
 * O snapshot resultante é para conferência: não é um INSERT/UPDATE pronto para execução.
 * Tipos, limites, FKs, permissões e rowversion precisam de validação no futuro adaptador SQL.
 */
export function planejarAlteracaoDeLinha(
  tipo: keyof typeof camposPermitidos,
  atual: Record<string, LinxFichaValor>,
  solicitados: Record<string, LinxFichaValor>
) {
  const camposAlterados: string[] = [];
  for (const [campo, valor] of Object.entries(solicitados)) {
    if (!camposPermitidos[tipo].has(campo))
      throw new Error(`O campo ${campo} não possui edição mapeada para ${tipo}.`);
    if (valor === undefined || (typeof valor === 'number' && !Number.isFinite(valor)))
      throw new Error(`Valor inválido para ${campo}. Não será convertido em zero ou vazio.`);
    if (atual[campo] !== valor) camposAlterados.push(campo);
  }
  return {
    status: 'PENDENTE_MAPEAMENTO' as const,
    tipo,
    camposAlterados,
    valoresSolicitados: structuredClone(solicitados),
    antes: structuredClone(atual),
    depois: { ...structuredClone(atual), ...structuredClone(solicitados) },
  };
}
