/**
 * ============================================================================
 * HOOK: useAuth
 * ARQUIVO: src/hooks/useAuth.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Custom Hook para consumir o AuthContext. Separado do AuthProvider
 *            para respeitar a regra react-refresh/only-export-components e garantir
 *            Hot Module Replacement (HMR) sem perdas de estado.
 * ============================================================================
 */

import { useContext } from 'react';
import { AuthContext } from '../contexts/authContextInstance';
import type { AuthContextType } from '../types/auth';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
