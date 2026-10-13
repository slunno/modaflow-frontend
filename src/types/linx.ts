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
  griffe?: LinxGriffe[];
  colecao?: string[];
  tipo?: string[];
  material?: string;
  etapa?: string[];
  statusPeca?: LinxStatusPecaFiltro[];
  statusColecao?: LinxStatusColecaoFiltro[];
}

export interface LinxColecoesValidasParams {
  search?: string;
  griffe?: LinxGriffe[];
}

export type LinxGriffe = 'K&J BLACK' | 'KING&JOE' | 'KING&JOE PLAY';
export type LinxStatusPecaFiltro = 'EM_ANDAMENTO' | 'COMPLETA' | 'A_DESENHAR';
export type LinxStatusColecaoFiltro = 'EM_ANDAMENTO' | 'CONCLUIDO' | 'ARQUIVADO';

export type LinxFichaValor = string | number | boolean | null;
export interface LinxMaterialCorCadastro {
  MATERIAL: string;
  CODIGO_COR: string;
  NOME_COR: string | null;
  GRAMATURA: number | string | null;
  TEC_ENCOLHIMENTO_CORTE_X: number | string | null;
  TEC_ENCOLHIMENTO_CORTE_Y: number | string | null;
  TEC_ENCOLHIMENTO_ACABAMENTO_X: number | string | null;
  TEC_ENCOLHIMENTO_ACABAMENTO_Y: number | string | null;
  TEC_ENCOLHIMENTO_LAVAGEM_X: number | string | null;
  TEC_ENCOLHIMENTO_LAVAGEM_Y: number | string | null;
  CUSTO_A_VISTA?: number | string | null;
  CUSTO_REPOSICAO?: number | string | null;
}
/** Uma linha por vínculo material/cor/fornecedor ativo, sem conversões de preço. */
export interface LinxMaterialFornecedorCadastro {
  CODIGO_COR: string;
  NOME_COR: string | null;
  FORNECEDOR: string;
  CODIGO_FORNECEDOR: string;
  UNIDADE: string | null;
  FATOR_CONVERSAO_FORNECEDOR: number | string | null;
  CUSTO_REPOSICAO: number | string | null;
  FONTE: 'MATERIAIS_FORNECEDOR.CUSTO_REPOSICAO';
}
export interface LinxMaterialCadastro {
  codigo: string;
  nome: string | null;
  grupo: string | null;
  unidadeEstoque: string | null;
  unidadeFichaTecnica: string | null;
  /** Dimensões varchar no Linx; não presumir unidade nem converter textos não numéricos. */
  largura: number | string | null;
  comprimento: number | string | null;
  altura: number | string | null;
  rendimento: number | null;
  /** Propriedades por cor: devem ser associadas apenas depois da escolha da cor. */
  cores: LinxMaterialCorCadastro[];
  custoAVista?: number | string | null;
  custoReposicao?: number | string | null;
  fornecedores?: LinxMaterialFornecedorCadastro[];
}
export interface LinxFichaVersao {
  produto: string;
  versao: string;
  descricao: string | null;
  dataCriacao: string | null;
  responsavel: string | null;
  status: string | null;
  colecaoCodigo: string | null;
  colecaoNome: string | null;
}
export interface LinxFichaMaterial {
  codigo: string;
  nome: string | null;
  grupo: string;
  item: string;
  dados: Record<string, LinxFichaValor>;
  cores: Array<Record<string, LinxFichaValor>>;
}
export interface LinxFichaDetalhe {
  versao: LinxFichaVersao;
  materiais: LinxFichaMaterial[];
}
export interface LinxFichaResumo {
  produto: string;
  versao: string;
  tecidos: string[];
  aviamentos: string[];
}

/** Valores originais e resultados SQL de custos; não representam totais do portal. */
export interface LinxFichaCustos {
  versaoIntegracao?: string;
  versao: LinxFichaVersao;
  bancoOrigem: string;
  tamanhos: Array<Record<string, LinxFichaValor>>;
  materiais: Array<Record<string, LinxFichaValor>>;
  fornecedores: Array<Record<string, LinxFichaValor>>;
  operacoes: Array<Record<string, LinxFichaValor>>;
  outrosCustos: Array<Record<string, LinxFichaValor>>;
  precosProduto: Array<Record<string, LinxFichaValor>>;
  diagnostico: Array<Record<string, LinxFichaValor>>;
  avisos: string[];
}
