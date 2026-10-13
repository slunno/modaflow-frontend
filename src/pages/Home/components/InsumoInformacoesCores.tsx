import { useId, useRef } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { getMaterialColorAppearance } from './materialColorAppearance';
import type {
  TecidoCorItem,
  TecidoFornecedorItem,
  InsumoInformacoesCor,
} from '../../../types/gestao';
import type { LinxMaterialCadastro } from '../../../types/linx';
import {
  escolherFornecedorDaCor,
  fornecedoresDaCor,
} from '../../../services/insumoInformacoesCores';
import {
  decimalManual,
  formatarCusto,
  normalizarUnidadeInsumo,
} from '../../../services/fichaProcesso';

interface Props {
  cores: TecidoCorItem[];
  fornecedores: TecidoFornecedorItem[];
  material: LinxMaterialCadastro | null;
  unidade: string;
  tipo: 'tecido' | 'aviamento';
  layout?: 'inline' | 'panel';
  activeId?: string | null;
  onChange: (cores: TecidoCorItem[]) => void;
  onSelect: (cor: TecidoCorItem) => void;
  onClose: () => void;
}
export function InsumoInformacoesCores({
  cores,
  fornecedores,
  material,
  unidade,
  tipo,
  layout = 'inline',
  activeId,
  onChange,
  onSelect,
  onClose,
}: Props) {
  const id = useId();
  const tabsRef = useRef(new Map<string, HTMLButtonElement>());
  const corVisivel = cores.find((cor) => cor.id === activeId) ?? cores[0];
  const coresVisiveis = layout === 'panel' ? (corVisivel ? [corVisivel] : []) : cores;
  const corTabId = (cor: TecidoCorItem) => `${id}-cor-${encodeURIComponent(cor.id)}`;
  const alterar = (cor: TecidoCorItem, changes: Partial<InsumoInformacoesCor>) =>
    onChange(
      cores.map((item) =>
        item.id === cor.id
          ? {
              ...item,
              dadosInsumo: { custo: '', unidade, ...item.dadosInsumo, ...changes },
            }
          : item
      )
    );
  return (
    <section
      aria-label="Informações por cor"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          onClose();
        }
      }}
      className={
        layout === 'panel'
          ? 'insumo-cores-editor flex min-h-0 flex-1 flex-col'
          : 'insumo-cores-editor mt-3 space-y-3 rounded-lg border border-border bg-surface-muted/30 p-3'
      }
    >
      <div
        className={`flex shrink-0 items-center justify-between gap-3 ${
          layout === 'panel' ? 'border-b border-border px-4 py-3' : ''
        }`}
      >
        {layout === 'panel' && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Voltar ao insumo"
            className="insumo-cores-back min-h-hit items-center gap-1 rounded-control p-1 text-accent-camel"
          >
            <ArrowLeft aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
          </button>
        )}
        <h5 className="flex-1 text-lg font-semibold">
          Informações por cor{' '}
          {layout === 'panel' && (
            <span className="ml-1 text-xs font-normal text-muted">({cores.length})</span>
          )}
        </h5>
        <button
          type="button"
          aria-label="Fechar informações por cor"
          onClick={onClose}
          className={
            layout === 'panel'
              ? 'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-muted hover:text-primary'
              : 'text-xs underline'
          }
        >
          {layout === 'panel' ? (
            <X aria-hidden="true" className="h-4 w-4" />
          ) : (
            'Fechar informações por cor'
          )}
        </button>
      </div>
      {layout === 'panel' && !!cores.length && (
        <div
          role="tablist"
          aria-label="Cores do insumo"
          className="flex max-h-36 shrink-0 flex-wrap gap-1.5 overflow-y-auto border-b border-border p-3"
        >
          {cores.map((cor) => (
            <button
              key={cor.id}
              ref={(node) => {
                if (node) tabsRef.current.set(cor.id, node);
                else tabsRef.current.delete(cor.id);
              }}
              id={`${corTabId(cor)}-tab`}
              type="button"
              role="tab"
              aria-label={`Editar dados da cor ${cor.nome}${cor.codigo ? ` (${cor.codigo})` : ''}`}
              aria-selected={cor.id === corVisivel?.id}
              aria-controls={`${corTabId(cor)}-panel`}
              tabIndex={cor.id === corVisivel?.id ? 0 : -1}
              onClick={() => onSelect(cor)}
              onKeyDown={(event) => {
                if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
                event.preventDefault();
                const index = cores.findIndex((item) => item.id === cor.id);
                const next =
                  event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? cores.length - 1
                      : (index + (event.key === 'ArrowRight' ? 1 : -1) + cores.length) %
                        cores.length;
                const proxima = cores[next];
                if (proxima) {
                  onSelect(proxima);
                  tabsRef.current.get(proxima.id)?.focus();
                }
              }}
              className={`inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-control border px-2.5 py-1.5 text-left text-xs transition ${cor.id === corVisivel?.id ? 'border-accent-camel bg-accent-camel/10 font-semibold text-accent-camel' : 'border-border bg-surface text-muted hover:border-accent-camel/40'}`}
            >
              <span
                aria-hidden="true"
                className="material-color-swatch"
                style={{ backgroundColor: getMaterialColorAppearance(cor).background }}
              />
              <span className="break-words">{cor.nome}</span>
              {cor.codigo && <span className="ml-1 text-[11px] text-muted">{cor.codigo}</span>}
            </button>
          ))}
        </div>
      )}
      <div
        className={
          layout === 'panel' ? 'min-h-0 min-w-0 flex-1 space-y-3 overflow-y-auto p-4' : 'space-y-3'
        }
      >
        <p className="text-[11px] text-muted">
          Preço por fornecedor/cor. Consumo informado por você. Preenchimento opcional.
        </p>
        {layout === 'panel' && (
          <p role="status" className={cores.length ? 'sr-only' : 'text-xs text-muted'}>
            {cores.length
              ? `${cores.length} cor(es) selecionada(s). A lista acompanha as alterações no formulário.`
              : 'Nenhuma cor selecionada. Adicione uma cor no formulário do insumo.'}
          </p>
        )}
        {layout === 'panel' &&
          cores
            .filter((cor) => cor.id !== corVisivel?.id)
            .map((cor) => (
              <div
                key={cor.id}
                id={`${corTabId(cor)}-panel`}
                role="tabpanel"
                aria-labelledby={`${corTabId(cor)}-tab`}
                hidden
              />
            ))}
        {coresVisiveis.map((cor, indice) => {
          const dados = cor.dadosInsumo ?? { custo: '', unidade };
          const opcoes = fornecedoresDaCor(cor, material, fornecedores);
          const normalizada = normalizarUnidadeInsumo(dados.unidade);
          const quantidade = decimalManual(
            tipo === 'aviamento'
              ? dados.quantidade
              : normalizada === 'kg'
                ? dados.peso
                : dados.consumo
          );
          const preco = decimalManual(dados.custo);
          return (
            <fieldset
              key={cor.id}
              role={layout === 'panel' ? 'tabpanel' : undefined}
              id={layout === 'panel' ? `${corTabId(cor)}-panel` : undefined}
              aria-labelledby={layout === 'panel' ? `${corTabId(cor)}-tab` : undefined}
              className={
                layout === 'panel'
                  ? 'min-w-0 w-full text-xs space-y-2.5'
                  : 'min-w-0 rounded-lg border border-border p-3 text-xs space-y-3'
              }
            >
              <legend className="px-1 font-semibold">
                {cor.nome}
                {cor.codigo ? ` (${cor.codigo})` : ''}
              </legend>
              <label className="block">
                {layout === 'panel' ? 'Fornecedor' : `Fornecedor — ${cor.nome}`}
                <select
                  aria-label={`Fornecedor da cor ${cor.nome}`}
                  value={dados.fornecedorCodigo ?? ''}
                  disabled={!material && !!cor.origemLinx}
                  className="mt-1 w-full rounded border border-border bg-surface p-2"
                  onChange={(event) => {
                    const escolhido = escolherFornecedorDaCor(
                      cor,
                      material,
                      opcoes.find((opcao) => opcao.codigo === event.target.value),
                      dados.unidade
                    );
                    onChange(cores.map((item) => (item.id === cor.id ? escolhido : item)));
                  }}
                >
                  <option value="">
                    {opcoes.length > 1
                      ? 'Escolha o fornecedor desta cor'
                      : 'Selecione um fornecedor'}
                  </option>
                  {dados.fornecedorCodigo &&
                    !opcoes.some((opcao) => opcao.codigo === dados.fornecedorCodigo) && (
                      <option value={dados.fornecedorCodigo}>
                        {dados.fornecedorNome || dados.fornecedorCodigo}{' '}
                        {material ? '(revisar vínculo)' : '(salvo)'}
                      </option>
                    )}
                  {opcoes.map((opcao) => (
                    <option key={opcao.codigo} value={opcao.codigo}>
                      {opcao.fornecedor} — {opcao.codigo}
                    </option>
                  ))}
                </select>
              </label>
              <div
                className={`grid gap-2.5 ${layout === 'panel' ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}
              >
                <label>
                  {layout === 'panel' ? 'Preço (R$)' : `Preço — ${cor.nome}`}
                  <input
                    aria-label={`Preço da cor ${cor.nome}`}
                    inputMode="decimal"
                    value={dados.custo}
                    className="mt-1 w-full rounded border border-border bg-surface p-2"
                    onChange={(event) =>
                      alterar(cor, {
                        custo: event.target.value,
                        precoLinx: undefined,
                        precoManual: true,
                      })
                    }
                  />
                </label>
                <label>
                  {layout === 'panel' ? 'Unidade' : `Unidade — ${cor.nome}`}
                  <select
                    aria-label={`Unidade da cor ${cor.nome}`}
                    value={dados.unidade}
                    className="mt-1 w-full rounded border border-border bg-surface p-2"
                    onChange={(event) => {
                      const novaUnidade = event.target.value;
                      if (dados.precoManual) alterar(cor, { unidade: novaUnidade });
                      else {
                        const selecionado = escolherFornecedorDaCor(
                          cor,
                          material,
                          opcoes.find((opcao) => opcao.codigo === dados.fornecedorCodigo),
                          novaUnidade
                        );
                        onChange(cores.map((item) => (item.id === cor.id ? selecionado : item)));
                      }
                    }}
                  >
                    {[
                      'Metros',
                      'Kg',
                      'Unidade',
                      ...(!['Metros', 'Kg', 'Unidade'].includes(dados.unidade)
                        ? [dados.unidade]
                        : []),
                    ].map((valor) => (
                      <option key={valor} value={valor}>
                        {valor || 'Não informada'}
                      </option>
                    ))}
                  </select>
                </label>
                {tipo === 'tecido' ? (
                  <>
                    <label>
                      {layout === 'panel'
                        ? 'Consumo / metragem'
                        : `Consumo / metragem — ${cor.nome}`}
                      <input
                        aria-label={`Consumo da cor ${cor.nome}`}
                        inputMode="decimal"
                        value={dados.consumo ?? ''}
                        className="mt-1 w-full rounded border border-border bg-surface p-2"
                        onChange={(event) => alterar(cor, { consumo: event.target.value })}
                      />
                    </label>
                    <label>
                      {layout === 'panel' ? 'Peso (kg)' : `Peso (Kg) — ${cor.nome}`}
                      <input
                        aria-label={`Peso da cor ${cor.nome}`}
                        inputMode="decimal"
                        value={dados.peso ?? ''}
                        className="mt-1 w-full rounded border border-border bg-surface p-2"
                        onChange={(event) => alterar(cor, { peso: event.target.value })}
                      />
                    </label>
                  </>
                ) : (
                  <label>
                    {layout === 'panel' ? 'Quantidade' : `Quantidade — ${cor.nome}`}
                    <input
                      aria-label={`Quantidade da cor ${cor.nome}`}
                      inputMode="decimal"
                      value={dados.quantidade ?? ''}
                      className="mt-1 w-full rounded border border-border bg-surface p-2"
                      onChange={(event) => alterar(cor, { quantidade: event.target.value })}
                    />
                  </label>
                )}
              </div>
              {dados.custo.trim() && preco === null && (
                <p role="alert">
                  Preço inválido. Use vírgula ou ponto decimal, sem separador de milhar.
                </p>
              )}
              <details className="text-[11px] text-muted">
                <summary className="cursor-pointer py-1 font-medium">Origem do preço</summary>
                <p className="break-all pt-1">
                  Fonte: {dados.precoLinx?.fonte ?? 'Preço manual / a preencher'}
                  {dados.precoLinx ? ` · fornecedor ${dados.precoLinx.fornecedorCodigo}` : ''}.
                </p>
                {!!cor.origemLinx && !dados.precoLinx && !dados.precoManual && (
                  <p className="text-muted">
                    Selecione um fornecedor. Se não houver preço válido na mesma unidade, preencha
                    manualmente; nenhuma conversão ou outra fonte será aplicada.
                  </p>
                )}
              </details>
              <p className="rounded-lg border border-border bg-surface px-2.5 py-2 font-medium">
                Custo do consumo:{' '}
                {formatarCusto(
                  preco !== null && quantidade !== null && normalizada ? preco * quantidade : null
                )}
                .
              </p>
              <details>
                <summary className="cursor-pointer font-medium text-muted">Observações</summary>
                <label htmlFor={`${id}-${indice}-observacoes`} className="block">
                  {layout === 'panel' ? 'Observações' : `Observações — ${cor.nome}`}
                  <textarea
                    id={`${id}-${indice}-observacoes`}
                    aria-label={`Observações da cor ${cor.nome}`}
                    rows={2}
                    value={dados.observacoes ?? ''}
                    className="mt-1 w-full rounded border border-border bg-surface p-2"
                    onChange={(event) => alterar(cor, { observacoes: event.target.value })}
                  />
                </label>
              </details>
              {(layout === 'inline' || cor.id !== activeId) && (
                <button
                  type="button"
                  aria-pressed={cor.id === activeId}
                  onClick={() => onSelect(cor)}
                  className="rounded border border-border px-3 py-2"
                >
                  {cor.id === activeId
                    ? 'Cor em foco nos campos principais'
                    : 'Usar esta cor nos campos principais'}
                </button>
              )}
            </fieldset>
          );
        })}
      </div>
      {layout === 'panel' && (
        <div className="flex shrink-0 justify-end border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-control bg-action px-4 py-1.5 text-xs font-semibold text-action-foreground hover:bg-action-hover"
          >
            Concluir
          </button>
        </div>
      )}
    </section>
  );
}
