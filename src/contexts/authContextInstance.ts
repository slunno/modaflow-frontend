/**
 * ============================================================================
 * INSTÂNCIA: AuthContext
 * ARQUIVO: src/contexts/authContextInstance.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Instância do React Context separada do AuthProvider para respeitar
 *            a regra react-refresh/only-export-components e garantir HMR limpo.
 * ============================================================================
 */

import { createContext } from 'react';
import type { AuthContextType } from '../types/auth';

/** Contexto React de Autenticação */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
