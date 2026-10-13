import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { getUsuariosApi } from '../services/authService';
import { mapUsuarioDtoToRecord } from '../services/contractMappers';
import type { UserRecord } from '../types/gestao';

export function useWorkspacePeople() {
  const { activeMarca } = useAuth();
  const brand = activeMarca?.id;
  const [people, setPeople] = useState<UserRecord[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let current = true;
    setPeople([]);
    setError('');
    getUsuariosApi()
      .then((rows) => {
        if (current)
          setPeople(
            rows
              .map(mapUsuarioDtoToRecord)
              .filter(
                (p) =>
                  p.status === 'Ativo' &&
                  p.acesso === 'Permitido' &&
                  p.brandRoles.some((r) => r.marcaId === brand && r.cargo !== 'Nenhum')
              )
          );
      })
      .catch((e) => {
        if (current)
          setError(e instanceof Error ? e.message : 'Falha ao consultar usuários da marca.');
      });
    return () => {
      current = false;
    };
  }, [brand]);
  return { people, error };
}
