import type { LinxGriffe } from './linx';

/** Identidades consultadas; descrições não são códigos de integração. */
export interface LinxCorCodigo {
  codigo: string;
  descricao: string;
}
export interface LinxGradeDetalhe {
  grade: string;
  numeroTamanhos: number;
  posicoes: Array<{ posicao: number; tamanho: string | null }>;
}
export interface LinxCorProduto {
  produto: string;
  corProduto: string;
  descricao: string;
  corBasica: string | null;
  descricaoBasica: string | null;
  colecaoCor: string | null;
  inativa: boolean;
}
export interface FichaCorProdutoLinx extends LinxCorProduto {
  griffe: LinxGriffe;
  colecao: string;
  descColecao: string;
}
