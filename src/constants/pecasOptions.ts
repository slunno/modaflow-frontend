/**
 * ============================================================================
 * MÓDULO: Opções e Constantes de Peças do PLM
 * ARQUIVO: src/constants/pecasOptions.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Constantes e opções de filtros (Etapas, Tipos de Peça, Estações, Coleções)
 *            separadas das abas para respeitar a regra react-refresh/only-export-components.
 * ============================================================================
 */

/** Lista Completa de Etapas extraída dos Prints Oficiais do PLM */
export const ETAPAS_OPTIONS = [
  '01 geração de ficha',
  '02 engenharia recebimento',
  '03 modelagem',
  '04 mini risco / consumo',
  '05 checagem de mp linx',
  '06 aguardando tecido fornecedor',
  '07 estoque de tecidos matriz',
  '08 revisão/integração + geração de op',
  '09 encaixe / risco',
  '10 corte',
  '11 estamparia',
  '12 bordado',
  '13 estoque de aviamentos',
  '14 pilotagem/costura',
  '15 cd lavanderia',
  '16 lavanderia',
  '17 acabamento',
  '18 pré-custo e sequencia operacional',
  '19 aprovação da piloto',
  'Final',
  'Inicial',
  'Integração linx',
  'Revisar ficha técnica (liberar mostruário)',
];

/** Lista Completa de Tipos de Peças (Incluindo Regata, Short, Sunga e Tricot) */
export const TIPOS_PECAS_OPTIONS = [
  'Acessórios',
  'Bata',
  'Bermuda',
  'Blazer',
  'Blusa',
  'Calça',
  'Camisa',
  'Camiseta',
  'Casaco',
  'Conjunto',
  'Cueca',
  'Jaqueta',
  'Macacão',
  'Malhão',
  'Meia',
  'Moletom',
  'Overshirt',
  'Polo',
  'Regata',
  'Short',
  'Sunga',
  'Tricot',
];

/** Lista Completa de Estações extraída dos Prints Oficiais */
export const ESTACOES_OPTIONS = [
  'Alto Inverno',
  'Alto Verão',
  'Atemporal',
  'Inverno',
  'Outono',
  'Outono/Inverno',
  'Permanente',
  'Preview Inverno',
  'Preview Outono',
  'Preview Primavera',
  'Preview Verão',
  'Primavera',
  'Primavera/Verão',
  'Verão',
];

/** Lista de Coleções de Exemplo */
export const COLECOES_OPTIONS = [
  'TESTES VERÃO 28 - K&J BLACK',
  'TESTES VERÃO 28 - KING&JOE',
  'TESTES VERÃO 28 - KING&JOE PLAY',
  'INVERNO 26 - KING&JOE PLAY COLLECTION',
  'INVERNO 26 - KING&JOE PLAY PERENES',
  'VERÃO 26 - King&Joe Play Collection',
];
