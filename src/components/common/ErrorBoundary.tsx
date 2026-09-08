/**
 * ============================================================================
 * COMPONENTE: Barreira de Erro (ErrorBoundary)
 * ARQUIVO: src/components/common/ErrorBoundary.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Class component React Error Boundary para captura graciosa de exceções
 *            de renderização com UI de recuperação e relatório amigável.
 * ============================================================================
 */

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-bg text-primary flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-surface border border-border rounded-xl shadow-xl p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-600">
              <AlertTriangle className="w-7 h-7" strokeWidth={1.5} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold font-editorial text-primary">Algo deu errado</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ocorreu uma falha inesperada na renderização da interface. Nossos sistemas
                registraram o ocorrido.
              </p>
              {this.state.error && (
                <div className="p-3 bg-surface-muted border border-border rounded-lg text-left text-[11px] font-mono text-muted-foreground overflow-x-auto max-h-32 mt-3">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 bg-primary hover:bg-neutral-800 text-white font-bold text-xs rounded-lg transition shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
              <span>Recarregar aplicação</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
