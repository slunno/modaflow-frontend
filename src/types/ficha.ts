import type { TecidoCorItem, TecidoInsumoItem } from './gestao';
import type { LinxFichaMaterial } from './linx';
import type { ComponenteObrigatorio, FichaConfirmacao } from './fichaProcesso';
import type { FichaCorProdutoLinx, LinxCorCodigo } from './fichaLinxMapeamento';

/** Tabela de modelagem mantida no rascunho local da ficha, sem integração ao Linx. */
export interface FichaTabelaMedidas {
  id: string;
  nome: string;
  imagemUrl?: string;
  medidasSelecionadas: string[];
  valoresMedidas: Record<string, Record<string, string>>;
}

export interface FichaPrecificacao {
  modo: 'markup' | 'margem';
  baseCusto?: 'insumos' | 'producao';
  markup: string;
  margemLucro: string;
  precoAprovado: string;
  justificativa?: string;
  regraId?: string;
  regraRevisao?: number;
}

export interface FichaOutroCusto {
  id: string;
  nome: string;
  custo: string;
  quantidade: string;
  /** Total original do Linx enquanto a linha não for editada. */
  totalLinx?: number | null;
  origem?: 'linx' | 'local';
}

export interface FichaCustosConfiguracao {
  fonte?: 'linx' | 'portal';
  corProduto?: string;
  posicao?: number;
  rota?: string;
  quantidadeProducao?: string;
  outros?: FichaOutroCusto[];
  rateios?: Array<{
    id: string;
    nome: string;
    valor: number;
    unidades: number;
    periodicidade: string;
    revisao: number;
  }>;
}

export interface FichaCorte {
  tamanhos: string[];
  linhas: Array<{
    cor: Pick<TecidoCorItem, 'id' | 'nome' | 'codigo'>;
    quantidades: Record<string, string>;
  }>;
}

export interface FichaInsumo extends TecidoInsumoItem {
  consumo?: string;
  quantidade?: string;
  peso?: string;
  uso?: string;
  /** Descrição livre da finalidade, mantida no portal. */
  finalidade?: string;
  /** Aviamentos não possuem o bloco de propriedades do tecido. */
  encolhimento?: string;
  linxDados?: LinxFichaMaterial;
  /** Classificação explícita: não inferir de nome, grupo ou texto de Uso. */
  componente?: ComponenteObrigatorio | 'outro';
  consumoPorTamanho?: Record<
    string,
    {
      valor: string;
      naoSeAplica?: boolean;
      /** Somente um zero digitado e confirmado explicitamente pode dispensar elástico neste tamanho. */
      confirmacaoZero?: FichaConfirmacao;
    }
  >;
  precoOrigem?: 'manual';
}

export interface FichaVariante {
  id: string;
  nome: string;
  tecidos: FichaInsumo[];
  aviamentos: FichaInsumo[];
  /** Escolhas explícitas locais; devem ser relidas/validadas no ERP antes de qualquer gravação. */
  corProdutoLinx?: FichaCorProdutoLinx;
  corBasicaLinx?: LinxCorCodigo;
  /** Parâmetros de precificação local desta variante, sem vínculo com preço do ERP. */
  precificacao?: FichaPrecificacao;
  /** Seleção e ajustes de custos armazenados somente no portal. */
  custos?: FichaCustosConfiguracao;
  imagemUrl?: string;
  imagemNome?: string;
  /** Anexo local independente usado como imagem da peça nesta variante. */
  imagemAnexoId?: string;
  imagemRemovida?: boolean;
}

export interface FichaProvaRoupa {
  data: string;
  observacoes: string;
  responsavel?: string;
  pendencias?: string;
  resultado?: 'aguardando' | 'aprovada' | 'ajustes' | 'reprovada';
  fotos: Array<{ id: string; nome: string; imagemUrl: string }>;
}

export interface FichaTerceiroObservacao {
  id: string;
  titulo: string;
  descricao: string;
}

export interface FichaTerceiroCusto {
  id: string;
  valor: string;
  observacao: string;
}

export interface FichaTerceiroImagem {
  id: string;
  nome: string;
  imagemUrl: string;
}

export interface FichaTerceiro {
  id: string;
  tipo: string;
  fornecedor: string;
  codigoFornecedor: string;
  observacoes: string;
  tela: string;
  traducao: string;
  tecnicas: string;
  variantes: string[];
  custosProcesso?: FichaTerceiroCusto[];
  observacoesList?: FichaTerceiroObservacao[];
  imagens?: FichaTerceiroImagem[];
  /** Imagem de fichas antigas: exibida até ser substituída ou removida pelo usuário. */
  imagemUrl?: string;
}
