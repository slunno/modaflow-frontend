import type { GestaoSubTab } from '../../types/gestao';

export const GESTAO_TABS: ReadonlyArray<{ id: GestaoSubTab; label: string }> = [
  { id: 'usuarios', label: 'Usuários' },
  { id: 'tecidos', label: 'Tecidos' },
  { id: 'aviamentos', label: 'Aviamentos' },
  { id: 'caracteristicas', label: 'Características' },
  { id: 'precificacao', label: 'Precificação' },
  { id: 'tags', label: 'Tags' },
  { id: 'fluxos', label: 'Fluxos' },
  { id: 'campos_custom', label: 'Campos Customizados' },
];

/** Links antigos de abas retiradas do menu abrem a primeira aba disponível. */
export function resolveGestaoTab(tab: string | undefined): GestaoSubTab {
  const requested = tab === 'caracteristicas-legado' ? 'caracteristicas' : tab;
  return GESTAO_TABS.find((item) => item.id === requested)?.id ?? 'usuarios';
}
