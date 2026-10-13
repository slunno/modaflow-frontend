import type { LinxFichaVersao } from '../../../types/linx';

interface Props {
  produto: string;
  loading: boolean;
  error: string;
  versao: LinxFichaVersao | null;
  temRascunho: boolean;
}

/** No legado, não consulta nem exibe o histórico anterior ao ModaFlow. */
export function LinxFichaPanel({ produto, loading, error, versao, temRascunho }: Props) {
  return (
    <section
      aria-label="Ficha atual do Linx"
      className="rounded-xl border border-border bg-surface p-4 space-y-2 text-xs"
    >
      <h2 className="font-bold text-sm">Ficha atual do Linx — {produto}</h2>
      <p className="text-muted">
        Coleção da base antiga. O histórico anterior do Linx não é carregado. Tecidos e aviamentos
        aparecem diretamente em seus menus.
      </p>
      {loading && <p role="status">Carregando tecidos e aviamentos…</p>}
      {error && (
        <p role="alert" className="text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
      {versao && (
        <p>
          Ficha {versao.versao}
          {versao.dataCriacao
            ? ` · ${versao.dataCriacao.slice(0, 10).split('-').reverse().join('/')}`
            : ''}
          {versao.responsavel ? ` · ${versao.responsavel}` : ''}
        </p>
      )}
      {temRascunho && <p className="text-muted">Os insumos do rascunho salvo foram preservados.</p>}
      <p className="text-muted">
        Consulta somente leitura; alterações no portal não são enviadas ao SQL.
      </p>
    </section>
  );
}
