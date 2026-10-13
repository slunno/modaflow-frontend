import { api } from './api';
import type { MarcaSummary } from '../types/auth';
import type {
  LinxColecaoValida,
  LinxColecoesValidasParams,
  LinxConnectionInfo,
  LinxGriffe,
  LinxProdutoValido,
  LinxProdutosValidosPage,
  LinxProdutosValidosParams,
  LinxFichaVersao,
  LinxFichaDetalhe,
  LinxFichaResumo,
  LinxFichaCustos,
  LinxMaterialCadastro,
} from '../types/linx';

const GRIFFE_LINX_POR_MARCA: Record<string, LinxGriffe> = {
  KJ: 'KING&JOE',
  KING_JOE: 'KING&JOE',
  KJB: 'K&J BLACK',
  KJ_BLACK: 'K&J BLACK',
  KJP: 'KING&JOE PLAY',
  KING_JOE_PLAY: 'KING&JOE PLAY',
};

/** Resolve a grife oficial do Linx a partir do cadastro da marca no portal. */
export function resolveLinxGriffe(marca: Pick<MarcaSummary, 'code' | 'nome'>): LinxGriffe | null {
  const byCode = GRIFFE_LINX_POR_MARCA[marca.code?.toUpperCase()];
  if (byCode) return byCode;

  const normalizedName = marca.nome.toUpperCase().replace(/\s+/g, ' ').trim();
  if (normalizedName === 'K&J BLACK') return 'K&J BLACK';
  if (normalizedName === 'KING & JOE' || normalizedName === 'KING&JOE') return 'KING&JOE';
  if (normalizedName === 'KING & JOE PLAY' || normalizedName === 'KING&JOE PLAY') {
    return 'KING&JOE PLAY';
  }
  return null;
}

function withQuery(
  path: string,
  params: Record<string, string | number | string[] | undefined>
): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.filter(Boolean).forEach((item) => query.append(key, item));
    } else if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  });
  const suffix = query.toString();
  return suffix ? `${path}?${suffix}` : path;
}

/** Confirma que o backend está conectado ao HOMOLOGACAO_COBRANCA. */
export function getLinxConnectionInfo(): Promise<LinxConnectionInfo> {
  return api.get<LinxConnectionInfo>('/linx/conexao');
}

/** Lista os subgrupos ativos do grupo ROUPAS cadastrados no Linx. */
export function getLinxSubgrupos(): Promise<string[]> {
  return api.get<string[]>('/linx/subgrupos');
}

export function getLinxCoresMostruario(): Promise<string[]> {
  return api.get<string[]>('/linx/cores-mostruario');
}

export function getLinxModelagens(): Promise<string[]> {
  return api.get<string[]>('/linx/modelagens');
}

export interface LinxFornecedor {
  fornecedor: string;
  codigo: string;
}

export function getLinxFornecedores(search = ''): Promise<LinxFornecedor[]> {
  return api.get<LinxFornecedor[]>(withQuery('/linx/fornecedores', { search }));
}

/** Busca o cadastro Linx pelo código exato, sem substituir composição informada no portal. */
export function getLinxMaterialCadastro(codigo: string): Promise<LinxMaterialCadastro> {
  return api.get<LinxMaterialCadastro>(withQuery('/linx/materiais/cadastro', { codigo }));
}

export function getLinxCoresBasicas(search = ''): Promise<string[]> {
  return api.get<string[]>(withQuery('/linx/cores-basicas', { search }));
}

export function getLinxCoresCatalogo(): Promise<string[]> {
  return api.get<string[]>('/linx/cores-catalogo');
}

export function getLinxGradeDetalhe(grade: string) {
  return api.get<import('../types/fichaLinxMapeamento').LinxGradeDetalhe>(
    withQuery('/linx/grades/detalhe', { grade })
  );
}
export function getLinxCoresComCodigo(search = '') {
  return api.get<import('../types/fichaLinxMapeamento').LinxCorCodigo[]>(
    withQuery('/linx/cores-basicas/codigos', { search })
  );
}
export function getLinxCoresProduto(
  produto: string,
  griffe: LinxGriffe,
  colecao: string,
  descColecao: string
) {
  return api.get<import('../types/fichaLinxMapeamento').LinxCorProduto[]>(
    withQuery(
      `/linx/colecoes/${encodeURIComponent(colecao)}/produtos/${encodeURIComponent(produto)}/cores`,
      { griffe, descColecao }
    )
  );
}

/** Busca os produtos oficiais do Linx que possuem uma coleção válida. */
export function getLinxProdutosValidos(
  params: LinxProdutosValidosParams = {}
): Promise<LinxProdutosValidosPage> {
  return api.get<LinxProdutosValidosPage>(
    withQuery('/linx/produtos-validos', {
      page: params.page ?? 0,
      size: params.size ?? 50,
      search: params.search,
      griffe: params.griffe,
      colecao: params.colecao,
      tipo: params.tipo,
      material: params.material,
      etapa: params.etapa,
      statusPeca: params.statusPeca,
      statusColecao: params.statusColecao,
    })
  );
}

/** Busca as coleções que contêm pelo menos um produto elegível. */
export function getLinxColecoesValidas(
  params: LinxColecoesValidasParams = {}
): Promise<LinxColecaoValida[]> {
  return api.get<LinxColecaoValida[]>(
    withQuery('/linx/colecoes-validas', {
      search: params.search,
      griffe: params.griffe,
    })
  );
}

/** Busca somente as roupas ativas vinculadas ao código e à grife da coleção. */
export function getLinxProdutosDaColecao(
  codigoColecao: string,
  griffe: LinxGriffe
): Promise<LinxProdutoValido[]> {
  const codigo = encodeURIComponent(codigoColecao.trim());
  return api.get<LinxProdutoValido[]>(withQuery(`/linx/colecoes/${codigo}/produtos`, { griffe }));
}

export function getLinxFichaVersoes(
  produto: string,
  griffe: LinxGriffe,
  colecao: string,
  descColecao: string
): Promise<LinxFichaVersao[]> {
  return api.get(
    withQuery(`/linx/produtos/${encodeURIComponent(produto)}/fichas`, {
      griffe,
      colecao,
      descColecao,
    })
  );
}
export function getLinxFichaDetalhe(
  produto: string,
  versao: string,
  griffe: LinxGriffe,
  colecao: string,
  descColecao: string
): Promise<LinxFichaDetalhe> {
  return api.get(
    withQuery(
      `/linx/produtos/${encodeURIComponent(produto)}/fichas/${encodeURIComponent(versao)}`,
      { griffe, colecao, descColecao }
    )
  );
}
export function getLinxFichasResumo(
  colecao: string,
  griffe: LinxGriffe,
  descColecao: string,
  legado = false
): Promise<LinxFichaResumo[]> {
  return api.get(
    withQuery(`/linx/colecoes/${encodeURIComponent(colecao)}/fichas-resumo`, {
      griffe,
      descColecao,
      legado: String(legado),
    })
  );
}

/** Base antiga: uma única ficha atual, com a identidade da coleção validada no backend. */
export function getLinxFichaAtual(
  produto: string,
  griffe: LinxGriffe,
  colecao: string,
  descColecao: string
): Promise<LinxFichaDetalhe> {
  return api.get(
    withQuery(
      `/linx/colecoes/${encodeURIComponent(colecao)}/produtos/${encodeURIComponent(produto)}/ficha-atual`,
      { griffe, descColecao }
    )
  );
}

/** Consulta por identidade da ficha; valores de origem não gravam nem recalculam o ERP. */
export function getLinxFichaCustos(
  produto: string,
  versao: string,
  griffe: LinxGriffe,
  colecao: string,
  descColecao: string,
  legado = false
): Promise<LinxFichaCustos> {
  return api
    .get<LinxFichaCustos>(
      withQuery(
        `/linx/produtos/${encodeURIComponent(produto)}/fichas/${encodeURIComponent(versao)}/custos/v2`,
        { griffe, colecao, descColecao, legado: String(legado) }
      )
    )
    .then((dados) => {
      if (
        dados?.versaoIntegracao !== 'custos-v2' ||
        !dados?.versao?.produto ||
        !dados.versao.versao ||
        !Array.isArray(dados.materiais) ||
        !Array.isArray(dados.fornecedores) ||
        !Array.isArray(dados.tamanhos) ||
        !Array.isArray(dados.diagnostico) ||
        !Array.isArray(dados.operacoes) ||
        !Array.isArray(dados.outrosCustos) ||
        !Array.isArray(dados.precosProduto) ||
        !Array.isArray(dados.avisos)
      ) {
        throw new Error(
          'Resposta de custos incompatível. Atualize o backend para disponibilizar a consulta Linx.'
        );
      }
      if (
        dados.versao.produto.trim() !== produto.trim() ||
        dados.versao.versao.trim() !== versao.trim()
      ) {
        throw new Error(
          'Os custos retornados não pertencem à peça e versão solicitadas. Nenhum rascunho foi substituído.'
        );
      }
      return dados;
    });
}

export const linxService = {
  getConnectionInfo: getLinxConnectionInfo,
  getSubgrupos: getLinxSubgrupos,
  getCoresCatalogo: getLinxCoresCatalogo,
  getProdutosValidos: getLinxProdutosValidos,
  getColecoesValidas: getLinxColecoesValidas,
  getProdutosDaColecao: getLinxProdutosDaColecao,
};
