export type ComponenteObrigatorio = 'ziper' | 'etiqueta' | 'elastico' | 'entretela';
export interface FichaConfirmacao {
  registradoEm: string;
  responsavel: { id: string | number | null; nome: string | null };
  /** Retrato dos insumos e da grade desta variante; decisões antigas não liberam dados novos. */
  assinaturaInsumos?: string;
}
export interface FichaDecisaoAplicabilidade extends FichaConfirmacao {
  aplicavel: boolean;
}
export interface FichaConferencia {
  gradeCompleta?: boolean;
  componentesPorVariante?: Record<
    string,
    Partial<Record<ComponenteObrigatorio, FichaDecisaoAplicabilidade>>
  >;
}
export interface FichaProcesso {
  revisao: string;
  concluida?: {
    revisao: string;
    registradoEm: string;
    responsavel: { id: string | number | null; nome: string | null };
    anexosAssinatura?: string;
  };
  integracaoPreparada?: { revisao: string; registradoEm: string; status: 'PENDENTE_MAPEAMENTO' };
}
export interface FichaPendencia {
  campo: string;
  mensagem: string;
  aba: 'geral' | 'tecidos' | 'aviamentos';
  varianteId?: string;
}
