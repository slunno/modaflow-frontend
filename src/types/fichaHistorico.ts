import type { PecaItem } from './plm';
import type { LinxGriffe } from './linx';

/** Recibo que deverá vir da operação real de integração, não de Salvar rascunho. */
export interface FichaIntegracaoConfirmada {
  status: 'CONFIRMADA';
  integracaoId: string;
  confirmadaEm: string;
  produto: string;
  griffe: LinxGriffe;
  colecaoId: string;
  descColecao: string;
  colecaoLinxCodigo: string;
  versaoLinx: string;
}

export interface FichaHistoricoVersao {
  numero: number;
  marcaId: string;
  pecaId: string;
  recibo: FichaIntegracaoConfirmada;
  /** Cópia independente: alterações no rascunho não mudam a versão integrada. */
  peca: Omit<PecaItem, 'historicoIntegracoes'>;
}

/** Auditoria local de ações salvas; não representa uma versão integrada no Linx. */
export interface FichaAlteracaoEvento {
  id: string;
  tipo: 'criacao' | 'alteracao';
  secao: string;
  titulo: string;
  nomePeca: string;
  registradoEm: string;
  responsavel: { id: string | null; nome: string | null };
  campos: Array<{ campo: string; antes: string; depois: string }>;
}
