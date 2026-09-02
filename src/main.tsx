/**
 * ============================================================================
 * MÓDULO: Ponto de Entrada da Aplicação (Bootstrap)
 * ARQUIVO: src/main.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Inicializa a árvore de componentes React no DOM (`#root`) e importa
 *            os estilos globais (Tailwind CSS v4).
 * ----------------------------------------------------------------------------
 * PADRÃO DE ADIÇÃO/ALTERAÇÃO:
 * - Evite adicionar lógica pesada de estado neste arquivo. Mantenha-o enxuto,
 *   delegando configurações globais para o `App.tsx` ou arquivos em `src/contexts/`.
 * ============================================================================
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Renderiza a aplicação no elemento root do HTML com StrictMode ativo
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
