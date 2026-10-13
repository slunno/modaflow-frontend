import type { PecaItem } from '../types/plm';
import type { FichaAnexo } from './fichaAnexosStorage';
import { projetarFichaPrincipalLinx } from './fichaPrincipalLinx';

function ordenar(valor: unknown): unknown {
  if (Array.isArray(valor)) return valor.map(ordenar);
  if (valor && typeof valor === 'object') {
    return Object.fromEntries(
      Object.entries(valor)
        .filter(([, item]) => item !== undefined)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([chave, item]) => [chave, ordenar(item)])
    );
  }
  return valor;
}

/** Compara dados editáveis; trilha, consultas e preparação não confirmam envio. */
export function conteudoAlteracoesLinx(peca: PecaItem, anexos: FichaAnexo[] | string): string {
  const {
    historicoAlteracoes,
    historicoIntegracoes,
    linxFichaResumo,
    fichaTecnica,
    imagemCroquiUrl,
    tecidos,
    aviamentos,
    ...dados
  } = peca;
  void historicoAlteracoes;
  void historicoIntegracoes;
  void linxFichaResumo;
  void fichaTecnica;
  void imagemCroquiUrl;
  // Rótulos agregados dos filtros podem incluir insumos das variantes locais.
  void tecidos;
  void aviamentos;
  void anexos;
  return JSON.stringify(
    ordenar({
      ...dados,
      fichaTecnica: projetarFichaPrincipalLinx(peca),
    })
  );
}

export async function resumoAlteracoesLinx(conteudo: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(conteudo));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
