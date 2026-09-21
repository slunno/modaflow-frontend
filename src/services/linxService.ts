import { api } from './api';
import type {
  LinxColecaoValida,
  LinxColecoesValidasParams,
  LinxConnectionInfo,
  LinxProdutosValidosPage,
  LinxProdutosValidosParams,
} from '../types/linx';

function withQuery(path: string, params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
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

export const linxService = {
  getConnectionInfo: getLinxConnectionInfo,
  getSubgrupos: getLinxSubgrupos,
  getProdutosValidos: getLinxProdutosValidos,
  getColecoesValidas: getLinxColecoesValidas,
};
