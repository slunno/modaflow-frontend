/** Contratos retornados pela integração read-only com o Linx. */
export interface LinxConnectionInfo {
  servidor: string | null;
  banco: string | null;
  bancoEsperado: string;
  bancoEsperadoConfirmado: boolean;
  credencialSomenteLeitura: boolean;
  integracaoSomenteLeitura: boolean;
  permissoesEscritaDetectadas: string[];
}

export interface LinxProdutoValido {
  linxId: number | null;
  codigo: string | null;
  codigoNormalizado: string | null;
  descricao: string | null;
  griffe: string | null;
  colecaoCodigo: string | null;
  colecaoNome: string | null;
  griffeColecao: string | null;
  dataInicioColecao: string | null;
  dataFinalColecao: string | null;
  temporada: string | null;
  grupo: string | null;
  subgrupo: string | null;
  tipo: string | null;
  periodoPcp: string | null;
  grade: string | null;
  linha: string | null;
  cartela: string | null;
  materialPrincipal: string | null;
  descricaoMaterialPrincipal: string | null;
  modelagem: string | null;
  estilista: string | null;
  modelista: string | null;
  statusProduto: string | null;
  tipoStatusProduto: string | null;
  dataCadastramento: string | null;
  dataInicioDesenvolvimento: string | null;
  custoReposicao: number | null;
  precoReposicao: number | null;
}

export interface LinxProdutosValidosPage {
  items: LinxProdutoValido[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  sourceDatabase: string;
  readOnly: boolean;
}

export interface LinxColecaoValida {
  codigo: string | null;
  nome: string | null;
  griffeProduto: string | null;
  griffeColecao: string | null;
  dataInicio: string | null;
  dataFinal: string | null;
  temporada: string | null;
  quantidadeProdutos: number;
}

export interface LinxProdutosValidosParams {
  page?: number;
  size?: number;
  search?: string;
  griffe?: 'K&J BLACK' | 'KING&JOE' | 'KING&JOE PLAY';
  colecao?: string;
  tipo?: string;
  material?: string;
}

export interface LinxColecoesValidasParams {
  search?: string;
  griffe?: 'K&J BLACK' | 'KING&JOE' | 'KING&JOE PLAY';
}
