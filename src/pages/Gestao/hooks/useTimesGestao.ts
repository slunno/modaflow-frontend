/**
 * ============================================================================
 * HOOK: useTimesGestao
 * ARQUIVO: src/pages/Gestao/hooks/useTimesGestao.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Encapsula o estado e operações da aba de Times.
 * ============================================================================
 */

import { useState } from 'react';
import { usePersistedState } from '../../../hooks/usePersistedState';
import { INITIAL_TEAMS } from '../../../types/gestao';
import type { TeamItem } from '../../../types/gestao';

export function useTimesGestao() {
  const [teamsList, setTeamsList] = usePersistedState<TeamItem[]>(
    'modaflow_teams_data',
    INITIAL_TEAMS
  );
  const [teamFilterMarca, setTeamFilterMarca] = useState('');
  const [openMenuTeamId, setOpenMenuTeamId] = useState<string | null>(null);

  const addTeam = (team: TeamItem) => {
    setTeamsList((prev) => [...prev, team]);
  };

  const updateTeam = (team: TeamItem) => {
    setTeamsList((prev) => prev.map((t) => (t.id === team.id ? team : t)));
  };

  return {
    teamsList,
    setTeamsList,
    teamFilterMarca,
    setTeamFilterMarca,
    openMenuTeamId,
    setOpenMenuTeamId,
    addTeam,
    updateTeam,
  };
}
