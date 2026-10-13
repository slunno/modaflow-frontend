import { getLocalStateSnapshot, parseLocalState, saveLocalState } from './localStateStorage';

export const MEDIDAS_MODELAGEM_KEY = 'modaflow_modelagem_medidas_v1';
export const MEDIDAS_MODELAGEM_INICIAIS = ['BARRA', 'CINTURA', 'OMBRO A OMBRO', 'QUADRIL', 'TORAX'];

export const normalizarMedida = (nome: string) =>
  nome.trim().replace(/\s+/g, ' ').toLocaleUpperCase('pt-BR');

const identidadeMedida = (nome: string) =>
  normalizarMedida(nome)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export function lerMedidasModelagem(
  snapshot = getLocalStateSnapshot(MEDIDAS_MODELAGEM_KEY)
): string[] {
  const saved = parseLocalState<unknown>(snapshot, MEDIDAS_MODELAGEM_INICIAIS);
  if (!Array.isArray(saved)) return MEDIDAS_MODELAGEM_INICIAIS;
  const nomes = saved.filter((item): item is string => typeof item === 'string');
  const seen = new Set<string>();
  return nomes.map(normalizarMedida).filter((nome) => {
    const key = identidadeMedida(nome);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function cadastrarMedidaModelagem(nome: string): string {
  const value = normalizarMedida(nome);
  if (!value) throw new Error('Informe o nome da medida.');
  const catalogo = lerMedidasModelagem();
  const existente = catalogo.find((item) => identidadeMedida(item) === identidadeMedida(value));
  if (existente) return existente;
  saveLocalState(MEDIDAS_MODELAGEM_KEY, [...catalogo, value]);
  return value;
}

/** Remove do catálogo sem apagar valores de tabelas já salvas. */
export function removerMedidaModelagem(nome: string): void {
  saveLocalState(
    MEDIDAS_MODELAGEM_KEY,
    lerMedidasModelagem().filter((item) => identidadeMedida(item) !== identidadeMedida(nome))
  );
}
