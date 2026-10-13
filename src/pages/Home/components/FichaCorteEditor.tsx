import type { FichaCorte } from '../../../types/ficha';
import type { TecidoCorItem } from '../../../types/gestao';
import { getCorteCorKey, sincronizarTabelaCorte } from '../../../services/fichaCorte';

interface Props {
  value: FichaCorte | undefined;
  tamanhos: string[];
  cores: TecidoCorItem[];
  onChange: (value: FichaCorte) => void;
  onSave: () => void;
  savingDisabled?: boolean;
  autoSave?: boolean;
}

export function FichaCorteEditor({
  value,
  tamanhos,
  cores,
  onChange,
  onSave,
  savingDisabled,
  autoSave = false,
}: Props) {
  const podeIniciar = tamanhos.length > 0 && cores.length > 0;
  const orientacao =
    !tamanhos.length && !cores.length
      ? 'Selecione os tamanhos e a cor de mostruário na aba Geral para preencher a tabela de corte.'
      : !tamanhos.length
        ? 'Selecione pelo menos um tamanho na aba Geral para preencher a tabela de corte.'
        : 'Selecione pelo menos uma cor de mostruário na aba Geral para preencher a tabela de corte.';
  const alterarQuantidade = (linhaIndex: number, tamanho: string, quantidade: string) => {
    if (!value || !/^\d*$/.test(quantidade) || Number(quantidade) > Number.MAX_SAFE_INTEGER) return;
    onChange({
      ...value,
      linhas: value.linhas.map((linha, index) =>
        index === linhaIndex
          ? { ...linha, quantidades: { ...linha.quantidades, [tamanho]: quantidade } }
          : linha
      ),
    });
  };

  return (
    <section className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-6">
      <div className="flex items-center justify-between border-b border-border-muted pb-3">
        <h3 className="text-sm font-bold font-editorial text-primary">Corte</h3>
        {!autoSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={!value || !podeIniciar || savingDisabled}
            className="px-4 py-2 rounded-lg border border-border bg-surface-muted hover:bg-border-muted text-xs font-bold text-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Atualizar
          </button>
        )}
      </div>
      <div className="rounded-xl border border-border bg-surface-muted/50 p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-muted pb-3">
          <h4 className="text-xs font-bold text-primary uppercase">
            Tabela de quantidade de peças
          </h4>
          {!value && (
            <button
              type="button"
              onClick={() => onChange(sincronizarTabelaCorte(undefined, tamanhos, cores))}
              disabled={!podeIniciar}
              className="px-4 py-1.5 rounded-lg bg-accent-camel hover:bg-accent-camel/90 text-on-camel font-bold text-xs shadow-2xs transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Iniciar
            </button>
          )}
        </div>
        {!podeIniciar && <p className="text-xs text-muted-foreground">{orientacao}</p>}
        {value && podeIniciar && (
          <div className="overflow-x-auto rounded-lg border border-border bg-surface p-1">
            <table
              aria-label="Tabela de quantidade de peças"
              className="w-full border-separate border-spacing-2 text-xs"
            >
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="min-w-36 text-left font-semibold text-muted-foreground"
                  >
                    Cor de mostruário
                  </th>
                  {value.tamanhos.map((tamanho) => (
                    <th key={tamanho} scope="col" className="min-w-16 font-semibold text-primary">
                      <span className="block rounded border border-border bg-surface-muted px-3 py-2 text-left">
                        {tamanho}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {value.linhas.map((linha, linhaIndex) => (
                  <tr key={getCorteCorKey(linha.cor)}>
                    <th scope="row" className="text-left font-medium text-primary">
                      <span className="block rounded border border-border bg-surface-muted px-3 py-2">
                        {linha.cor.nome}
                        {linha.cor.codigo && (
                          <span className="ml-1 text-muted-foreground">({linha.cor.codigo})</span>
                        )}
                      </span>
                    </th>
                    {value.tamanhos.map((tamanho) => (
                      <td key={tamanho}>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          aria-label={`Quantidade de ${linha.cor.nome} no tamanho ${tamanho}`}
                          value={linha.quantidades[tamanho] ?? ''}
                          onChange={(event) =>
                            alterarQuantidade(linhaIndex, tamanho, event.target.value)
                          }
                          className="w-full min-w-16 rounded border border-border bg-surface px-3 py-2 text-primary outline-none focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
