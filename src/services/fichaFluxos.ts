export const FLUXOS = ['Direto', 'OP CM', 'Perene', 'Piloto'];

export const ETAPAS_FLUXO = [
  '01 geração de ficha',
  '02 engenharia recebimento',
  '03 modelagem',
  '04 mini risco / consumo',
  '05 checagem de MP Linx',
  '06 aguardando tecido fornecedor',
  '07 estoque de tecidos matriz',
  '08 revisão/integração + geração de OP',
  '09 encaixe / risco',
  '10 corte',
  '11 estamparia',
  '12 bordado',
  '13 estoque de aviamentos',
  '14 pilotagem/costura',
  '15 CD lavanderia',
  '16 lavanderia',
  '17 acabamento',
  '18 pré-custo e sequência operacional',
  '19 aprovação da piloto',
  '20 Final',
  '21 Inicial',
  '22 Integração Linx',
  '23 Revisar ficha técnica / liberar mostruário',
];

export const ETAPA_INICIAL_FICHA = ETAPAS_FLUXO[0]!;

const CODIGOS_ETAPAS = [
  'GERACAO_FICHA',
  'ENGENHARIA_RECEBIMENTO',
  'MODELAGEM',
  'MINI_RISCO_CONSUMO',
  'CHECAGEM_MP_LINX',
  'AGUARDANDO_TECIDO_FORNECEDOR',
  'ESTOQUE_TECIDOS_MATRIZ',
  'REVISAO_INTEGRACAO_GERACAO_OP',
  'ENCAIXE_RISCO',
  'CORTE',
  'ESTAMPARIA',
  'BORDADO',
  'ESTOQUE_AVIAMENTOS',
  'PILOTAGEM_COSTURA',
  'CD_LAVANDERIA',
  'LAVANDERIA',
  'ACABAMENTO',
  'PRE_CUSTO_SEQUENCIA_OPERACIONAL',
  'APROVACAO_PILOTO_CM',
  'FINAL',
];

const normalizar = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

/** O avanço termina em 20; as etapas administrativas 22/23 continuam no seletor manual. */
export function proximaEtapaNumerica(etapa?: string): string | null {
  const atual = etapa?.trim() ?? '';
  if (!atual || atual === '—' || normalizar(atual) === 'inicial') return ETAPAS_FLUXO[0]!;
  const numero = atual.match(/^(\d{1,2})(?:\s|$)/)?.[1];
  if (numero) {
    const ordem = Number(numero);
    if (ordem === 21) return ETAPAS_FLUXO[0]!;
    return ordem >= 1 && ordem < 20 ? ETAPAS_FLUXO[ordem]! : null;
  }
  const ordem = CODIGOS_ETAPAS.findIndex(
    (codigo, index) =>
      normalizar(codigo) === normalizar(atual) ||
      normalizar(ETAPAS_FLUXO[index]!.replace(/^\d+\s/, '')) === normalizar(atual)
  );
  return ordem >= 0 && ordem < 19 ? ETAPAS_FLUXO[ordem + 1]! : null;
}
