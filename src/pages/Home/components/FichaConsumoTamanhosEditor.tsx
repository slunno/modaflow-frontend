import { useId, useState } from 'react';
import {
  atualizarConsumoPorTamanho,
  listarConsumosPorTamanho,
  type ConsumosPorTamanho,
} from '../../../services/fichaConsumoTamanhos';

interface Props {
  tamanhos?: readonly string[];
  nomeInsumo: string;
  unidade: string;
  value?: ConsumosPorTamanho;
  elastico?: boolean;
  onChange: (value: ConsumosPorTamanho) => void;
}

const SEM_TAMANHOS: readonly string[] = [];

export function FichaConsumoTamanhosEditor({
  tamanhos = SEM_TAMANHOS,
  nomeInsumo,
  unidade,
  value,
  elastico = false,
  onChange,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const editorId = useId();
  const linhas = listarConsumosPorTamanho(tamanhos, value);
  const foraGrade = linhas.filter((linha) => linha.foraGrade).length;

  return (
    <section className="rounded-lg border border-border text-xs">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={editorId}
        aria-label={`Consumo por tamanho de ${nomeInsumo}`}
        onClick={() => setExpanded((previous) => !previous)}
        className="flex w-full flex-wrap items-center justify-between gap-2 px-3 py-2 text-left font-semibold hover:bg-surface-muted"
      >
        <span>Consumo por tamanho</span>
        <span className="text-muted font-normal">
          {expanded ? 'Recolher' : 'Preencher / consultar'}
          {foraGrade > 0 ? ` · ${foraGrade} fora da grade` : ''}
        </span>
      </button>
      <div id={editorId} hidden={!expanded} className="space-y-3 border-t border-border p-3">
        <p className="text-muted">
          Grade da aba Geral, apenas para este insumo nesta variante. Unidade do insumo:{' '}
          {unidade || 'não informada'}. Os valores são manuais, sem conversão de unidade ou cálculo
          automático de consumo.
        </p>
        <p className="text-muted">
          {elastico
            ? 'Elástico: preencha cada tamanho. Consumo vazio impede a entrega; zero exige confirmação explícita de não uso na conferência de entrega.'
            : 'Vazio ou zero não significa “Não se aplica”. Essa opção é uma decisão explícita por tamanho e preserva o valor anterior ao ser marcada ou desmarcada.'}
        </p>
        {linhas.length === 0 ? (
          <p role="status">
            Selecione os tamanhos na aba Geral para preencher o consumo por tamanho.
          </p>
        ) : (
          <fieldset>
            <legend className="sr-only">Consumo por tamanho de {nomeInsumo}</legend>
            <div className="overflow-x-auto">
              <table className="w-full min-w-80 text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className="py-2 pr-3">
                      Tamanho
                    </th>
                    <th scope="col" className="py-2 pr-3">
                      Consumo manual
                    </th>
                    <th scope="col" className="py-2">
                      Aplicabilidade
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.map(({ tamanho, consumo, foraGrade: foraDaGrade }, index) => {
                    const inputId = `${editorId}-valor-${index}`;
                    const checkboxId = `${editorId}-aplica-${index}`;
                    const tamanhoLabel = tamanho || '(sem tamanho)';
                    return (
                      <tr key={tamanho} className="border-b border-border last:border-0">
                        <th scope="row" className="py-2 pr-3 font-medium">
                          {tamanhoLabel}
                          {foraDaGrade ? (
                            <span className="block text-muted font-normal">
                              Fora da grade atual
                            </span>
                          ) : null}
                        </th>
                        <td className="py-2 pr-3">
                          <label htmlFor={inputId} className="sr-only">
                            Consumo tamanho {tamanhoLabel} — {nomeInsumo}
                          </label>
                          <input
                            id={inputId}
                            inputMode="decimal"
                            value={consumo?.valor ?? ''}
                            disabled={!elastico && consumo?.naoSeAplica === true}
                            onChange={(event) =>
                              onChange(
                                atualizarConsumoPorTamanho(value, tamanho, {
                                  valor: event.target.value,
                                  ...(elastico ? { naoSeAplica: false } : {}),
                                })
                              )
                            }
                            className="block w-full rounded-lg border border-border bg-surface px-3 py-2 disabled:opacity-60"
                          />
                        </td>
                        <td className="py-2">
                          {elastico ? (
                            <span>
                              {consumo?.naoSeAplica
                                ? 'Revise a dispensa anterior: digite o consumo ou zero.'
                                : 'Zero deve ser confirmado na entrega.'}
                            </span>
                          ) : (
                            <label htmlFor={checkboxId} className="inline-flex items-center gap-2">
                              <input
                                id={checkboxId}
                                type="checkbox"
                                checked={consumo?.naoSeAplica === true}
                                aria-label={`Não se aplica ao tamanho ${tamanhoLabel} — ${nomeInsumo}`}
                                onChange={(event) =>
                                  onChange(
                                    atualizarConsumoPorTamanho(value, tamanho, {
                                      naoSeAplica: event.target.checked,
                                    })
                                  )
                                }
                              />
                              Não se aplica
                            </label>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </fieldset>
        )}
        {foraGrade > 0 ? (
          <p className="text-muted">
            Tamanhos removidos da grade continuam disponíveis acima, com seus valores preservados.
          </p>
        ) : null}
        <p className="text-muted">
          Este preenchimento será salvo no rascunho da ficha. Para elástico, cada tamanho é
          conferido antes da entrega. O mapeamento dos tamanhos para C1…C48 do Linx ainda precisa de
          definição; a ordem da grade não é usada para gerar esse vínculo. Estes valores não
          recalculam custos nem atualizam o ERP.
        </p>
      </div>
    </section>
  );
}
