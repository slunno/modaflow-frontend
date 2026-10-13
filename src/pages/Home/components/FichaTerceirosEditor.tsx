import type { FichaTerceiro, FichaVariante } from '../../../types/ficha';
import type { Dispatch, SetStateAction } from 'react';
import { LinxFornecedorPicker } from './LinxFornecedorPicker';
import { FichaImageUpload } from './FichaImageUpload';
import { ProductTerceiroField } from './ProductTerceiroField';
import { decimalManual } from '../../../services/fichaProcesso';

const TIPOS = [
  'Acabamento',
  'Amaciado',
  'Bord',
  'Bordado',
  'Estamaparia',
  'Estampa',
  'Estamparia',
  'Lavanderia',
  'Lavanderia + silk',
  'Lumen',
  'Silk',
  'Silk interno',
  'Sublimação',
  'Vay vay',
];
const fieldClass =
  'block w-full mt-1 rounded-lg border border-border bg-surface-muted px-3 py-2 text-primary';

interface Props {
  items: FichaTerceiro[];
  variantes: FichaVariante[];
  produto: string;
  onChange: Dispatch<SetStateAction<FichaTerceiro[]>>;
}

export function FichaTerceirosEditor({ items, variantes, produto, onChange }: Props) {
  const update = (
    id: string,
    changes: Partial<FichaTerceiro> | ((item: FichaTerceiro) => Partial<FichaTerceiro>)
  ) =>
    onChange((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, ...(typeof changes === 'function' ? changes(item) : changes) }
          : item
      )
    );
  return (
    <section className="rounded-xl border border-border bg-surface p-6 space-y-4">
      <div className="flex justify-between items-center gap-3">
        <h3 className="font-bold">Detalhes de produção</h3>
        <button
          type="button"
          className="rounded-lg bg-accent-camel px-4 py-2 text-on-camel text-xs font-bold"
          onClick={() =>
            onChange([
              ...items,
              {
                id: crypto.randomUUID(),
                tipo: '',
                fornecedor: '',
                codigoFornecedor: '',
                observacoes: '',
                tela: '',
                traducao: '',
                tecnicas: '',
                variantes: [],
                custosProcesso: [],
                observacoesList: [],
                imagens: [],
              },
            ])
          }
        >
          + Detalhe
        </button>
      </div>
      {!items.length && (
        <p className="text-sm text-muted">
          Adicione um detalhe para preencher os dados do terceiro.
        </p>
      )}
      {items.map((item, index) => (
        <article
          key={item.id}
          aria-label={`Detalhe ${index + 1}`}
          className="rounded-xl border border-border p-4 space-y-4 text-xs"
        >
          <div className="flex justify-between">
            <h4 className="font-bold">
              {index + 1}. {item.tipo || 'Detalhe'}
            </h4>
            <button
              type="button"
              onClick={() => onChange(items.filter((entry) => entry.id !== item.id))}
              className="text-red-600 dark:text-red-400"
            >
              Remover detalhe
            </button>
          </div>
          <label className="block">
            Tipo
            <input
              list={`tipos-${item.id}`}
              value={item.tipo}
              onChange={(event) => update(item.id, { tipo: event.target.value })}
              placeholder="Escolha ou digite o tipo"
              className={fieldClass}
            />
            <datalist id={`tipos-${item.id}`}>
              {TIPOS.map((tipo) => (
                <option key={tipo} value={tipo} />
              ))}
            </datalist>
          </label>
          <LinxFornecedorPicker
            showCode={false}
            value={{ fornecedor: item.fornecedor, codigo: item.codigoFornecedor }}
            onChange={(supplier) =>
              update(item.id, {
                fornecedor: supplier.fornecedor,
                codigoFornecedor: supplier.codigo,
              })
            }
          />
          <label className="block">
            Observações do terceiro
            <textarea
              value={item.observacoes}
              onChange={(event) => update(item.id, { observacoes: event.target.value })}
              rows={3}
              className={fieldClass}
            />
          </label>
          <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-border pt-3">
            <legend className="font-bold">Complementos — Estampa</legend>
            <ProductTerceiroField
              produto={produto}
              campo="tela"
              value={item.tela}
              onChange={(tela) => update(item.id, { tela })}
            />
            <label>
              Tradução
              <textarea
                rows={3}
                placeholder="Digite a tradução..."
                value={item.traducao}
                onChange={(event) => update(item.id, { traducao: event.target.value })}
                className={fieldClass}
              />
            </label>
          </fieldset>
          <section
            aria-label="Custos do processo"
            className="space-y-3 border-t border-border pt-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h5 className="font-bold">Custos do processo</h5>
              <button
                type="button"
                className="rounded-lg border border-border px-3 py-2 font-semibold hover:bg-surface-muted"
                onClick={() =>
                  update(item.id, {
                    custosProcesso: [
                      ...(item.custosProcesso ?? []),
                      {
                        id: crypto.randomUUID(),
                        valor: '',
                        observacao: '',
                      },
                    ],
                  })
                }
              >
                Custo +
              </button>
            </div>
            {!item.custosProcesso?.length && (
              <p className="text-muted">
                Adicione os custos e descreva cada cobrança deste processo.
              </p>
            )}
            {(item.custosProcesso ?? []).map((custo, costIndex) => {
              const invalido = !!custo.valor.trim() && decimalManual(custo.valor) === null;
              return (
                <fieldset key={custo.id} className="rounded-lg border border-border p-3">
                  <legend className="px-1 font-semibold">Custo {costIndex + 1}</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-[minmax(100px,1fr)_3fr_auto] gap-3 items-start">
                    <div>
                      <label>
                        Custo (R$)
                        <input
                          inputMode="decimal"
                          placeholder="0,00"
                          aria-invalid={invalido}
                          aria-describedby={
                            invalido ? `custo-${item.id}-${custo.id}-erro` : undefined
                          }
                          value={custo.valor}
                          className={fieldClass}
                          onChange={(event) =>
                            update(item.id, {
                              custosProcesso: item.custosProcesso?.map((entry) =>
                                entry.id === custo.id
                                  ? { ...entry, valor: event.target.value }
                                  : entry
                              ),
                            })
                          }
                        />
                      </label>
                      {invalido && (
                        <p
                          id={`custo-${item.id}-${custo.id}-erro`}
                          role="alert"
                          className="mt-1 text-red-600 dark:text-red-400"
                        >
                          Informe um custo igual ou maior que zero, como 12,50.
                        </p>
                      )}
                    </div>
                    <label>
                      Observação do custo
                      <textarea
                        rows={3}
                        placeholder="Descreva o custo"
                        value={custo.observacao}
                        className={fieldClass}
                        onChange={(event) =>
                          update(item.id, {
                            custosProcesso: item.custosProcesso?.map((entry) =>
                              entry.id === custo.id
                                ? { ...entry, observacao: event.target.value }
                                : entry
                            ),
                          })
                        }
                      />
                    </label>
                    <button
                      type="button"
                      aria-label={`Remover custo ${costIndex + 1}`}
                      className="sm:mt-5 rounded p-2 text-red-600 dark:text-red-400"
                      onClick={() =>
                        update(item.id, {
                          custosProcesso: item.custosProcesso?.filter(
                            (entry) => entry.id !== custo.id
                          ),
                        })
                      }
                    >
                      ×
                    </button>
                  </div>
                </fieldset>
              );
            })}
          </section>
          <fieldset className="border-t border-border pt-3">
            <legend className="font-bold mb-2">Uso em variantes ({variantes.length})</legend>
            <div className="flex flex-wrap gap-3">
              {variantes.map((variant, variantIndex) => (
                <label key={variant.id} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={item.variantes.includes(variant.id)}
                    onChange={(event) =>
                      update(item.id, {
                        variantes: event.target.checked
                          ? [...item.variantes, variant.id]
                          : item.variantes.filter((id) => id !== variant.id),
                      })
                    }
                  />
                  {variant.nome.trim() || `Variante ${variantIndex + 1}`}
                </label>
              ))}
              {!variantes.length && (
                <p className="text-muted">
                  Adicione uma variante na aba Variantes para vinculá-la.
                </p>
              )}
            </div>
            <p className="mt-2 text-muted">
              {item.variantes.filter((id) => variantes.some((variant) => variant.id === id)).length
                ? `Processo aplicado a ${item.variantes.filter((id) => variantes.some((variant) => variant.id === id)).length} de ${variantes.length} variantes.`
                : 'Selecione as variantes em que este processo será aplicado.'}
            </p>
          </fieldset>
          <div className="border-t border-border pt-3">
            <ProductTerceiroField
              produto={produto}
              campo="tecnica"
              value={item.tecnicas}
              onChange={(tecnicas) => update(item.id, { tecnicas })}
            />
          </div>
          <section aria-label="Observações" className="space-y-3 border-t border-border pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h5 className="font-bold">Observações</h5>
              <button
                type="button"
                className="rounded-lg border border-border px-3 py-2 font-semibold hover:bg-surface-muted"
                onClick={() =>
                  update(item.id, {
                    observacoesList: [
                      ...(item.observacoesList ?? []),
                      { id: crypto.randomUUID(), titulo: '', descricao: '' },
                    ],
                  })
                }
              >
                Observação +
              </button>
            </div>
            {!item.observacoesList?.length && (
              <p className="text-muted">Adicione observações com título e descrição.</p>
            )}
            {(item.observacoesList ?? []).map((observacao, observationIndex) => (
              <fieldset
                key={observacao.id}
                className="rounded-lg border border-border p-3 space-y-3"
              >
                <legend className="px-1 font-semibold">Observação {observationIndex + 1}</legend>
                <label className="block">
                  Título
                  <input
                    value={observacao.titulo}
                    className={fieldClass}
                    onChange={(event) =>
                      update(item.id, {
                        observacoesList: item.observacoesList?.map((entry) =>
                          entry.id === observacao.id
                            ? { ...entry, titulo: event.target.value }
                            : entry
                        ),
                      })
                    }
                  />
                </label>
                <label className="block">
                  Descrição
                  <textarea
                    rows={3}
                    value={observacao.descricao}
                    className={fieldClass}
                    onChange={(event) =>
                      update(item.id, {
                        observacoesList: item.observacoesList?.map((entry) =>
                          entry.id === observacao.id
                            ? { ...entry, descricao: event.target.value }
                            : entry
                        ),
                      })
                    }
                  />
                </label>
                <button
                  type="button"
                  aria-label={`Remover observação ${observationIndex + 1}`}
                  className="text-red-600 dark:text-red-400"
                  onClick={() =>
                    update(item.id, {
                      observacoesList: item.observacoesList?.filter(
                        (entry) => entry.id !== observacao.id
                      ),
                    })
                  }
                >
                  Remover observação
                </button>
              </fieldset>
            ))}
          </section>
          <section
            aria-label="Imagens do processo"
            className="space-y-3 border-t border-border pt-4"
          >
            <h5 className="font-bold">Imagens</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {item.imagemUrl && (
                <FichaImageUpload
                  label="Imagem do detalhe"
                  value={item.imagemUrl}
                  onChange={(value) => update(item.id, { imagemUrl: value ?? undefined })}
                />
              )}
              {(item.imagens ?? []).map((imagem) => (
                <FichaImageUpload
                  key={imagem.id}
                  label={`Imagem — ${imagem.nome}`}
                  value={imagem.imagemUrl}
                  onChange={(url, nome) =>
                    update(item.id, (current) => ({
                      imagens: url
                        ? current.imagens?.map((entry) =>
                            entry.id === imagem.id
                              ? { ...entry, imagemUrl: url, nome: nome ?? entry.nome }
                              : entry
                          )
                        : current.imagens?.filter((entry) => entry.id !== imagem.id),
                    }))
                  }
                />
              ))}
              <FichaImageUpload
                label="Adicionar imagem do processo"
                onChange={(url, nome) => {
                  if (url) {
                    const imagem = {
                      id: crypto.randomUUID(),
                      nome: nome ?? 'Imagem do processo',
                      imagemUrl: url,
                    };
                    update(item.id, (current) => ({
                      imagens: [...(current.imagens ?? []), imagem],
                    }));
                  }
                }}
              />
            </div>
            <p className="text-muted">
              Imagens de até 2 MB cada. O salvamento automático guarda os dados e as imagens deste
              processo neste navegador.
            </p>
          </section>
        </article>
      ))}
    </section>
  );
}
