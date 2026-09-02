/**
 * ============================================================================
 * MÓDULO: Componente Raiz da Aplicação
 * ARQUIVO: src/App.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Componente principal que encapsula os Provedores Globais (AuthProvider)
 *            e gerencia a exibição entre a Tela de Login e a Plataforma Principal.
 * ----------------------------------------------------------------------------
 * PADRÃO DE ADIÇÃO/ALTERAÇÃO:
 * - Para adicionar rotas com React Router Dom ou novos Provedores de Estado
 *   (ex: ThemeProvider, QueryClientProvider), envolva o `<AppContent />` neste arquivo.
 * ============================================================================
 */

import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/Login/LoginPage';
import { MainLayout } from './components/layout/MainLayout';

/**
 * Sub-componente interno que consome a autenticação para renderizar a rota adequada.
 */
const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Se o usuário não estiver autenticado, exibe a tela de login
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Se autenticado, exibe a plataforma principal com o layout completo
  return <MainLayout />;
};

/**
 * Ponto de entrada padrão da aplicação React ModaFlow PLM.
 */
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
