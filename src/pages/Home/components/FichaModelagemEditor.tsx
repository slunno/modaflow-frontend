import { useId, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import type { FichaTabelaMedidas } from '../../../types/ficha';
import { FichaImageUpload } from './FichaImageUpload';
import { FichaMedidasPicker } from './FichaMedidasPicker';
import { Tooltip } from '../../../components/ui/FichaPrimitives';

const campo =
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-primary outline-none focus:border-accent-camel';

function TabelaMedidasEditor({
  tabela,
  tamanhos,
  onChange,
  onRemove,
}: {
  tabela: FichaTabelaMedidas;
  tamanhos: string[];
  onChange: (tabela: FichaTabelaMedidas) => void;
  onRemove: () => void;
}) {
  const [ordenando, setOrdenando] = useState(false);
  const id = useId();
  const colunas = [...tamanhos.filter((item) => item !== 'Tol.'), 'Tol.'];
  const mover = (index: number, direcao: -1 | 1) => {
    const medidas = [...tabela.medidasSelecionadas];
    const destino = index + direcao;
    if (destino < 0 || destino >= medidas.length) return;
    const origem = medidas[index];
    const alvo = medidas[destino];
    if (origem === undefined || alvo === undefined) return;
    medidas[index] = alvo;
    medidas[destino] = origem;
    onChange({ ...tabela, medidasSelecionadas: medidas });
  };

  return (
    <section
      aria-label={tabela.nome}
      className="space-y-3 rounded-lg border border-border bg-surface-muted/30 p-3 text-xs"
    >
      <div className="flex items-center justify-between gap-2 border-b border-border-muted pb-2">
        <h4 className="font-semibold">{tabela.nome}</h4>
        <button
          type="button"
          aria-label={`Remover tabela ${tabela.nome}`}
          onClick={onRemove}
          className="rounded p-1 text-muted hover:text-red-600"
        >
          <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      </div>
      <label className="block space-y-1 font-semibold text-muted-foreground">
        <span>Nome</span>
        <input
          className={campo}
          value={tabela.nome}
          onChange={(event) => onChange({ ...tabela, nome: event.target.value })}
        />
      </label>
      <FichaImageUpload
        label="Imagem da tabela"
        value={tabela.imagemUrl}
        onChange={(value) => onChange({ ...tabela, imagemUrl: value || undefined })}
      />
      <FichaMedidasPicker
        value={tabela.medidasSelecionadas}
        onChange={(medidasSelecionadas) => onChange({ ...tabela, medidasSelecionadas })}
      />
      {!tamanhos.length && (
        <p className="text-muted">Selecione os tamanhos na aba Geral para preencher as medidas.</p>
      )}
      <div className="max-h-[65vh] overflow-auto rounded-lg border border-border bg-surface">
        <div className="flex justify-end border-b border-border-muted p-1.5">
          <Tooltip text="Ativa as setas para mover as medidas para cima ou para baixo. Nenhum valor é recalculado.">
            <button
              type="button"
              disabled={tabela.medidasSelecionadas.length < 2}
              aria-expanded={ordenando}
              aria-controls={`${id}-valores`}
              onClick={() => setOrdenando((previous) => !previous)}
              className="rounded border border-border px-2 py-1 text-xs disabled:opacity-40"
            >
              {ordenando ? 'Concluir ordem' : 'Ordenar'}
            </button>
          </Tooltip>
        </div>
        <table id={`${id}-valores`} className="w-full text-left text-xs">
          <caption className="sr-only">Medidas por tamanho — {tabela.nome}</caption>
          <thead className="sticky top-0 z-10 bg-surface-muted">
            <tr className="border-b border-border bg-surface-muted text-muted-foreground">
              <th scope="col" className="min-w-36 px-3 py-2">
                Medida
              </th>
              {colunas.map((tamanho) => (
                <th key={tamanho} scope="col" className="min-w-20 px-2 py-2 text-center">
                  <span title={tamanho === 'Tol.' ? 'Tolerância' : undefined}>{tamanho}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-muted">
            {tabela.medidasSelecionadas.map((medida, index) => (
              <tr key={medida}>
                <th scope="row" className="px-3 py-2 font-medium">
                  <div className="flex items-center justify-between gap-2">
                    <span>{medida}</span>
                    {ordenando && (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          aria-label={`Mover ${medida} para cima`}
                          disabled={index === 0}
                          onClick={() => mover(index, -1)}
                          className="rounded border border-border p-1 disabled:opacity-30"
                        >
                          <ArrowUp aria-hidden="true" className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Mover ${medida} para baixo`}
                          disabled={index === tabela.medidasSelecionadas.length - 1}
                          onClick={() => mover(index, 1)}
                          className="rounded border border-border p-1 disabled:opacity-30"
                        >
                          <ArrowDown aria-hidden="true" className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </th>
                {colunas.map((tamanho) => (
                  <td key={tamanho} className="px-1.5 py-1.5">
                    <input
                      type="text"
                      inputMode="decimal"
                      aria-label={`${medida} — ${tamanho === 'Tol.' ? 'Tolerância' : tamanho}`}
                      placeholder="—"
                      value={tabela.valoresMedidas[medida]?.[tamanho] ?? ''}
                      onChange={(event) =>
                        onChange({
                          ...tabela,
                          valoresMedidas: {
                            ...tabela.valoresMedidas,
                            [medida]: {
                              ...tabela.valoresMedidas[medida],
                              [tamanho]: event.target.value,
                            },
                          },
                        })
                      }
                      className="w-full min-w-16 rounded border border-border bg-surface-muted px-2 py-1.5 text-center outline-none focus:border-accent-camel"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function FichaModelagemEditor({
  codigo,
  observacoes,
  tabelas,
  tamanhos,
  onObservacoesChange,
  onTabelasChange,
  onSave,
  savingDisabled,
  autoSave = false,
}: {
  codigo?: string;
  observacoes: string;
  tabelas: FichaTabelaMedidas[];
  tamanhos: string[];
  onObservacoesChange: (value: string) => void;
  onTabelasChange: (value: FichaTabelaMedidas[]) => void;
  onSave: () => void;
  savingDisabled: boolean;
  autoSave?: boolean;
}) {
  const id = useId();
  return (
    <div className="space-y-3 animate-in fade-in duration-200">
      <section className="rounded-card border border-border bg-surface p-5">
        <h3 className="mb-3 font-semibold">Modelagem</h3>
        <p className="text-xs text-muted">Código / característica registrada na ficha</p>
        <p className="mt-2 font-semibold">{codigo || 'Código de modelagem a definir'}</p>
      </section>
      <section className="space-y-3 rounded-lg border border-border bg-surface p-4">
        <div className="flex items-center justify-between border-b border-border-muted pb-2">
          <h3 className="font-semibold">Observações de Modelagem</h3>
        </div>
        <textarea
          aria-label="Observações de Modelagem"
          rows={3}
          value={observacoes}
          onChange={(event) => onObservacoesChange(event.target.value)}
          className={`${campo} bg-surface-muted`}
        />
      </section>
      <section
        aria-labelledby={`${id}-titulo`}
        className="space-y-3 rounded-lg border border-border bg-surface p-4"
      >
        <div className="flex items-center justify-between gap-2 border-b border-border-muted pb-2">
          <h3 id={`${id}-titulo`} className="font-semibold">
            Tabelas de tamanhos e medidas
          </h3>
          <button
            type="button"
            onClick={() =>
              onTabelasChange([
                ...tabelas,
                {
                  id: crypto.randomUUID(),
                  nome: `Tabela - ${tabelas.length + 1}`,
                  medidasSelecionadas: [],
                  valoresMedidas: {},
                },
              ])
            }
            className="flex items-center gap-1 rounded-lg bg-accent-camel px-3 py-1.5 font-semibold text-on-camel"
          >
            <Plus aria-hidden="true" className="h-3.5 w-3.5" /> Nova tabela
          </button>
        </div>
        {tabelas.map((tabela) => (
          <TabelaMedidasEditor
            key={tabela.id}
            tabela={tabela}
            tamanhos={[...new Set(tamanhos)]}
            onChange={(updated) =>
              onTabelasChange(tabelas.map((item) => (item.id === tabela.id ? updated : item)))
            }
            onRemove={() => onTabelasChange(tabelas.filter((item) => item.id !== tabela.id))}
          />
        ))}
        {!tabelas.length && (
          <p className="text-muted">Clique em Nova tabela para adicionar medidas.</p>
        )}
        <p className="text-muted">
          {autoSave
            ? 'Modelagem e medidas são salvas automaticamente neste navegador.'
            : 'Use Salvar para guardar as tabelas neste navegador.'}
        </p>
      </section>
      {!autoSave && (
        <div className="ficha-save-footer fixed inset-x-0 bottom-0 z-40 flex items-center justify-end gap-4 border-t border-border bg-surface/95 px-6 py-3 shadow-lg backdrop-blur-md">
          <p className="text-xs text-muted">
            Modelagem e medidas: rascunho local, não enviado ao Linx
          </p>
          <button
            type="button"
            onClick={onSave}
            disabled={savingDisabled}
            className="min-h-10 rounded-control border border-border bg-surface px-5 py-2 text-sm font-semibold disabled:opacity-50"
          >
            Salvar
          </button>
        </div>
      )}
    </div>
  );
}
