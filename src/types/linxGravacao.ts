import type { LinxGriffe } from './linx';

export interface LinxWriteIdentity {
  produto: string;
  griffe: LinxGriffe;
  colecao: string;
  descColecao: string;
  versao: string;
}
export interface LinxWritePatch {
  tabela: 'PRODUTOS' | 'PRODUTO_VERSAO_MATERIAL' | 'PRODUTO_VERSAO_MATERIAL_COR' | 'PRODUTO_CORES';
  chave: Record<string, string>;
  valores: Record<string, string | number>;
  excluir: boolean;
  descarteConfirmado: boolean;
}
export interface LinxWritePreview {
  planoId: string;
  expiraEm: string;
  identidade: LinxWriteIdentity;
  exigeConfirmacaoGlobal: boolean;
  avisos: string[];
  alteracoes: Array<{
    tabela: string;
    chave: Record<string, string>;
    campo: string;
    antes: string | number | null;
    depois: string | number | null;
    exclusao: boolean;
  }>;
}
export interface LinxWriteReceipt {
  status: 'CONFIRMADA';
  escopo: 'CAMPOS_MAPEADOS' | 'NOVA_VERSAO_COLECAO';
  integracaoId: string;
  confirmadaEm: string;
  identidade: LinxWriteIdentity;
  camposGravados: number;
  avisos: string[];
}
export interface LinxWriteCapability {
  habilitada: boolean;
  servidor: string;
  banco: string;
  escopo: string;
  mensagem: string;
}
