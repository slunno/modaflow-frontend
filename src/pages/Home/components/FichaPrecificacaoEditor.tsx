import { useId } from 'react';
import type { FichaPrecificacao, FichaVariante, FichaTerceiro } from '../../../types/ficha';
import {
  formatarPercentualPrecificacao,
  precificacaoVariante,
} from '../../../services/fichaPrecificacao';
import type { LinxFichaCustos } from '../../../types/linx';
import { formatarCusto } from '../../../services/fichaProcesso';

interface Props {
  processos?: FichaTerceiro[];
  variante: FichaVariante;
  custosLinx?: LinxFichaCustos | null;
  loadingLinx?: boolean;
  errorLinx?: string;
  onChange: (value: FichaPrecificacao) => void;
}

export function FichaPrecificacaoEditor({
  variante,
  onChange,
  custosLinx,
  loadingLinx,
  errorLinx,
  processos = [],
}: Props) {
  const id = useId();
  const { value, integrado, custo, resultado } = precificacaoVariante(
    variante,
    custosLinx,
    processos
  );
  const inputClass =
    'w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-primary outline-none focus:border-accent-camel';
  const labelFator = value.modo === 'markup' ? 'Defina o markup' : 'Defina a margem de lucro (%)';
  const dinheiro = (valor: number | null) => (valor === null ? '—' : formatarCusto(valor));

  return (
    <section
      aria-label={`Precificação — ${variante.nome || 'Variante sem nome'}`}
      className="rounded-xl border border-border bg-surface p-6 shadow-2xs space-y-5"
    >
      <h3 className="border-b border-border-muted pb-3 text-sm font-bold font-editorial text-primary">
        Precificação
      </h3>
      <div className="max-w-sm space-y-1 text-xs">
        <label htmlFor={`${id}-base`} className="block font-semibold">
          Base do cálculo
        </label>
        <select
          id={`${id}-base`}
          className={inputClass}
          value={value.baseCusto ?? 'insumos'}
          onChange={(e) =>
            onChange({ ...value, baseCusto: e.target.value as 'insumos' | 'producao' })
          }
        >
          <option value="insumos">Tecidos, aviamentos e embalagens</option>
          <option value="producao">Custo de produção completo, com outros custos</option>
        </select>
      </div>
      <fieldset className="space-y-3 text-xs">
        <legend className="font-semibold">Selecione o tipo de cálculo:</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name={`${id}-modo`}
              checked={value.modo === 'markup'}
              onChange={() => onChange({ ...value, modo: 'markup' })}
              className="accent-accent-camel"
            />
            Com base no markup
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name={`${id}-modo`}
              checked={value.modo === 'margem'}
              onChange={() => onChange({ ...value, modo: 'margem' })}
              className="accent-accent-camel"
            />
            Com base na margem de lucro
          </label>
        </div>
      </fieldset>
      <div className="max-w-xs space-y-2 text-xs">
        <label htmlFor={`${id}-fator`} className="block font-semibold">
          {labelFator}
        </label>
        <input
          id={`${id}-fator`}
          inputMode="decimal"
          value={value.modo === 'markup' ? value.markup : value.margemLucro}
          onChange={(event) =>
            onChange({
              ...value,
              [value.modo === 'markup' ? 'markup' : 'margemLucro']: event.target.value,
            })
          }
          aria-invalid={!!resultado.erroCalculo}
          aria-describedby={`${id}-formula${resultado.erroCalculo ? ` ${id}-erro-fator` : ''}`}
          className={inputClass}
        />
        <p id={`${id}-formula`} className="text-muted">
          {value.modo === 'markup'
            ? 'Preço final = custo × markup.'
            : 'Preço final = custo ÷ (1 − margem de lucro ÷ 100).'}
        </p>
        {resultado.erroCalculo && (
          <p id={`${id}-erro-fator`} role="alert" className="text-red-600 dark:text-red-400">
            {resultado.erroCalculo}
          </p>
        )}
      </div>
      <p className="text-xs text-muted">
        {value.baseCusto === 'producao'
          ? 'Custo de produção por peça'
          : 'Custo dos tecidos e aviamentos'}{' '}
        de {variante.nome || 'Variante sem nome'}.
        {value.baseCusto === 'producao'
          ? ' Inclui os outros custos da aba Custos.'
          : ' Preço × consumo ou quantidade.'}
      </p>
      {loadingLinx && (
        <p role="status" className="text-xs text-muted">
          Consultando custos do Linx…
        </p>
      )}
      {errorLinx && (
        <p role="alert" className="text-xs text-red-600">
          {errorLinx}
        </p>
      )}
      {integrado.fonte === 'linx' && (
        <p className="text-xs text-muted">
          Base Linx: cor {integrado.cor || 'não selecionada'}, tamanho{' '}
          {integrado.tamanhos.find(([i]) => i === integrado.posicao)?.[1] || 'não selecionado'}.
          Ajuste a seleção na aba Custos.
        </p>
      )}
      {custo.total === null && !loadingLinx && (
        <p
          role="status"
          className="rounded-lg border border-border bg-surface-muted p-3 text-xs text-muted-foreground"
        >
          {integrado.fonte === 'linx'
            ? integrado.erro || `Há ${custo.pendentes} insumo(s) sem custo confirmado no Linx.`
            : !custo.itens
              ? 'Adicione tecidos ou aviamentos à variante para calcular a precificação.'
              : `Preencha preço, consumo/quantidade e unidade dos insumos pendentes (${custo.pendentes}) nas abas Tecidos e Aviamentos para calcular o custo completo.`}
        </p>
      )}
      <div className="overflow-x-auto">
        <table
          className="w-full text-left text-xs"
          aria-label={`Precificação — ${variante.nome || 'Variante sem nome'}`}
        >
          <thead>
            <tr className="text-muted">
              <th scope="col" className="pb-3 pr-3">
                <span className="sr-only">Descrição</span>
              </th>
              <th scope="col" className="pb-3 px-3 text-right">
                %
              </th>
              <th scope="col" className="pb-3 pl-3 text-right">
                R$
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b-2 border-border">
              <th colSpan={3} scope="colgroup" className="py-2 font-semibold">
                Custos
              </th>
            </tr>
            <tr className="border-b border-border">
              <th scope="row" className="py-3 pr-3 font-normal text-muted">
                Custo
              </th>
              <td className="py-3 px-3 text-right tabular-nums">
                {formatarPercentualPrecificacao(resultado.custoPercentual)}
              </td>
              <td className="py-3 pl-3 text-right tabular-nums">{dinheiro(custo.total)}</td>
            </tr>
            <tr className="border-b-2 border-border">
              <th colSpan={3} scope="colgroup" className="py-2 font-semibold">
                Lucro e Preço final
              </th>
            </tr>
            <tr className="border-b border-border">
              <th scope="row" className="py-3 pr-3 font-normal text-muted">
                Preço final
              </th>
              <td className="py-3 px-3 text-right">—</td>
              <td className="py-3 pl-3 text-right font-semibold tabular-nums">
                {dinheiro(resultado.precoFinal)}
              </td>
            </tr>
            <tr className="border-b border-border">
              <th scope="row" className="py-3 pr-3 font-normal text-muted">
                <label htmlFor={`${id}-aprovado`}>Preço aprovado</label>
              </th>
              <td className="py-3 px-3 text-right">—</td>
              <td className="py-3 pl-3">
                <input
                  id={`${id}-aprovado`}
                  inputMode="decimal"
                  value={value.precoAprovado}
                  onChange={(event) => onChange({ ...value, precoAprovado: event.target.value })}
                  aria-invalid={!!resultado.erroPrecoAprovado}
                  aria-describedby={resultado.erroPrecoAprovado ? `${id}-erro-aprovado` : undefined}
                  placeholder="Informe o preço aprovado"
                  className={`${inputClass} min-w-40 text-right`}
                />
              </td>
            </tr>
            <tr>
              <th scope="row" className="py-3 pr-3 font-normal text-muted">
                Final vs. Aprovado
              </th>
              <td className="py-3 px-3 text-right tabular-nums">
                {formatarPercentualPrecificacao(resultado.diferencaPercentual)}
              </td>
              <td className="py-3 pl-3 text-right tabular-nums">{dinheiro(resultado.diferenca)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {resultado.erroPrecoAprovado && (
        <p
          id={`${id}-erro-aprovado`}
          role="alert"
          className="text-xs text-red-600 dark:text-red-400"
        >
          {resultado.erroPrecoAprovado}
        </p>
      )}
      <label className="block space-y-2 text-xs font-semibold">
        Justificativa do preço aprovado
        <textarea
          className={inputClass}
          value={value.justificativa ?? ''}
          onChange={(event) => onChange({ ...value, justificativa: event.target.value })}
          placeholder="Registre o motivo de alterações em relação ao preço sugerido"
        />
      </label>
      <p className="text-xs text-muted">
        Margem estimada sobre o preço sugerido:{' '}
        {resultado.precoFinal !== null && resultado.precoFinal > 0 && custo.total !== null
          ? formatarPercentualPrecificacao(
              ((resultado.precoFinal - custo.total) / resultado.precoFinal) * 100
            )
          : '—'}
        . Considera somente os componentes da base de custo selecionada; tributos e despesas
        comerciais só entram se cadastrados nessa base.
      </p>
      <p className="text-[11px] text-muted">
        Final vs. Aprovado = preço aprovado − preço final. O percentual usa o preço final como base.
      </p>
    </section>
  );
}
