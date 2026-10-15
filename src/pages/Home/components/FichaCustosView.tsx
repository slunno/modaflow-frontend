import { Fragment, useId } from 'react';
import type {
  FichaCustosConfiguracao,
  FichaOutroCusto,
  FichaVariante,
  FichaTerceiro,
} from '../../../types/ficha';
import type { LinxFichaCustos } from '../../../types/linx';
import { LinxFichaCustosPanel } from './LinxFichaCustosPanel';
import { calcularCustosFicha } from '../../../services/fichaCustos';
import { decimalManual, formatarCusto } from '../../../services/fichaProcesso';
import { chaveCustoLinx } from '../../../services/linxCustos';

interface Props {
  processos?: FichaTerceiro[];
  variante: FichaVariante;
  variantes: FichaVariante[];
  onEditInsumos: (tab: 'tecidos' | 'aviamentos') => void;
  onChange?: (value: FichaCustosConfiguracao) => void;
  linxDados?: LinxFichaCustos | null;
  loadingLinx?: boolean;
  errorLinx?: string;
  onReloadLinx?: () => void;
  temEdicoesLocais?: boolean;
  colecaoAtual?: { codigo: string; nome: string };
}
const numero = (value: number | null) =>
  value === null
    ? 'Não informado'
    : new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 6 }).format(value);
const nomes: Record<string, string> = {
  TECIDO: 'Tecidos',
  AVIAMENTOS: 'Aviamentos',
  EMBALAGEM: 'Embalagens',
};
const inputClass =
  'w-full rounded border border-border bg-surface-muted px-2 py-1.5 text-[11px] outline-none focus:border-accent-camel';

export function FichaCustosView({
  variante,
  variantes,
  onEditInsumos,
  onChange,
  linxDados = null,
  loadingLinx = false,
  errorLinx = '',
  onReloadLinx,
  temEdicoesLocais,
  colecaoAtual,
  processos = [],
}: Props) {
  const id = useId();
  const resumo = calcularCustosFicha(variante, linxDados, processos);
  const configuracao = variante.custos ?? {};
  const atualizar = (patch: Partial<FichaCustosConfiguracao>) =>
    onChange?.({ ...configuracao, ...patch });
  const outros: FichaOutroCusto[] = resumo.outros.map(
    ({ id, nome, custo, quantidade, totalLinx, origem }) => ({
      id,
      nome,
      custo,
      quantidade,
      totalLinx,
      origem,
    })
  );
  const editarOutro = (itemId: string, patch: Partial<FichaOutroCusto>) =>
    atualizar({
      outros: outros.map((item) =>
        item.id === itemId
          ? patch.custo !== undefined || patch.quantidade !== undefined
            ? { ...item, ...patch, origem: 'local', totalLinx: undefined }
            : { ...item, ...patch }
          : item
      ),
    });
  const custosVariantes = variantes.map((item) => ({
    variante: item,
    resumo: calcularCustosFicha(item, linxDados, processos),
  }));
  const medias = (['subtotalTecidos', 'subtotalAviamentos', 'totalOutros', 'total'] as const).map(
    (campo) =>
      custosVariantes.length &&
      custosVariantes.every(
        ({ resumo }) => !resumo.erro && resumo[campo] !== null && resumo.quantidade !== null
      )
        ? custosVariantes.reduce(
            (acc, { resumo }) => acc + (resumo[campo] ?? 0) * resumo.quantidade!,
            0
          ) / custosVariantes.reduce((acc, { resumo }) => acc + resumo.quantidade!, 0)
        : null
  );
  const grupos = [...new Set(resumo.linhas.map((linha) => linha.grupo))];
  const quantidade = resumo.quantidade;
  const percentual = (valor: number | null) =>
    valor !== null && resumo.total !== null && resumo.total > 0
      ? `${Math.round((valor / resumo.total) * 100)}%`
      : '—';
  const totalGrupo = (grupo: string) => {
    const linhas = resumo.linhas.filter((linha) => linha.grupo === grupo);
    return linhas.some((linha) => linha.total === null)
      ? null
      : linhas.reduce((acc, linha) => acc + (linha.total ?? 0), 0);
  };
  return (
    <div className="space-y-3 text-[11px]">
      <section className="rounded-lg border border-border bg-surface p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h3 className="text-xs font-semibold">Custo de produção</h3>
          {onReloadLinx && (
            <button
              type="button"
              onClick={onReloadLinx}
              disabled={loadingLinx}
              className="rounded border border-border px-2 py-1 disabled:opacity-50"
            >
              Atualizar
            </button>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label htmlFor={`${id}-quantidade`}>
            Quantidade a ser produzida
            <input
              id={`${id}-quantidade`}
              className={`${inputClass} mt-1`}
              inputMode="numeric"
              value={configuracao.quantidadeProducao ?? ''}
              aria-invalid={quantidade === null}
              onChange={(e) => atualizar({ quantidadeProducao: e.target.value })}
            />
          </label>
          {(linxDados || loadingLinx || errorLinx) && (
            <div>
              <label htmlFor={`${id}-fonte`} className="block">
                Base dos custos
              </label>
              <select
                id={`${id}-fonte`}
                className={`${inputClass} mt-1`}
                value={resumo.fonte}
                onChange={(e) => atualizar({ fonte: e.target.value as 'linx' | 'portal' })}
              >
                <option value="linx">Linx — cadastro atual</option>
                <option value="portal">Portal — valores manuais</option>
              </select>
            </div>
          )}
          {resumo.fonte === 'linx' && (
            <>
              <div>
                <label htmlFor={`${id}-cor`} className="block">
                  Cor
                </label>
                <select
                  id={`${id}-cor`}
                  className={`${inputClass} mt-1`}
                  value={resumo.cor}
                  onChange={(e) => atualizar({ corProduto: e.target.value, posicao: undefined })}
                >
                  <option value="">Selecione a cor</option>
                  {resumo.cores.map((cor) => {
                    const nome = linxDados?.materiais.find(
                      (row) => chaveCustoLinx(row.COR_PRODUTO) === cor
                    )?.DESC_COR_PRODUTO;
                    return (
                      <option key={cor} value={cor}>
                        {nome ? `${cor} — ${nome}` : cor}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label htmlFor={`${id}-tamanho`} className="block">
                  Tamanho
                </label>
                <select
                  id={`${id}-tamanho`}
                  className={`${inputClass} mt-1`}
                  value={resumo.posicao ?? ''}
                  onChange={(e) =>
                    atualizar({ posicao: e.target.value ? Number(e.target.value) : undefined })
                  }
                >
                  <option value="">Selecione o tamanho</option>
                  {resumo.tamanhos.map(([posicao, nome]) => (
                    <option key={posicao} value={posicao}>
                      {nome}
                    </option>
                  ))}
                </select>
              </div>
              {resumo.rotas.length > 1 && (
                <div>
                  <label htmlFor={`${id}-rota`} className="block">
                    Rota de produção
                  </label>
                  <select
                    id={`${id}-rota`}
                    className={`${inputClass} mt-1`}
                    value={resumo.rota}
                    onChange={(e) => atualizar({ rota: e.target.value, outros: undefined })}
                  >
                    <option value="">Selecione a rota</option>
                    {resumo.rotas.map((rota) => (
                      <option key={rota} value={rota}>
                        {rota}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
        </div>
        {quantidade === null && (
          <p role="alert" className="text-red-600">
            Informe uma quantidade inteira maior que zero.
          </p>
        )}
        {loadingLinx && (
          <p role="status" className="text-muted">
            Consultando custos do Linx…
          </p>
        )}
        {errorLinx && (
          <p role="alert" className="text-red-600">
            {errorLinx}
          </p>
        )}
        {resumo.erro && !loadingLinx && (
          <p role="status" className="text-muted">
            {resumo.erro}
          </p>
        )}
      </section>

      <section className="rounded-lg border border-border bg-surface p-4">
        <h3 className="border-b border-border pb-2 text-xs font-semibold">Outros custos</h3>
        <div className="overflow-x-auto">
          <table aria-label="Outros custos" className="w-full text-left">
            <thead>
              <tr className="text-muted">
                <th scope="col" className="py-2 pr-2 font-medium">
                  Custo un.
                </th>
                <th scope="col" className="py-2 pr-2 font-medium">
                  Quantidade
                </th>
                <th scope="col" className="py-2 pr-2 font-medium">
                  Nome
                </th>
                <th scope="col" className="py-2 pr-2 text-right font-medium">
                  Total
                </th>
                <th>
                  <span className="sr-only">Remover</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {resumo.outros.map((item) => (
                <tr key={item.id}>
                  <td className="w-24 py-1 pr-2">
                    <input
                      aria-label={`Custo de ${item.nome || 'outro custo'}`}
                      disabled={/^(servico|rateio):/.test(item.id)}
                      className={inputClass}
                      inputMode="decimal"
                      value={item.custo}
                      onChange={(e) => editarOutro(item.id, { custo: e.target.value })}
                    />
                  </td>
                  <td className="w-20 py-1 pr-2">
                    <input
                      aria-label={`Quantidade de ${item.nome || 'outro custo'}`}
                      disabled={/^(servico|rateio):/.test(item.id)}
                      className={inputClass}
                      inputMode="decimal"
                      value={item.quantidade}
                      onChange={(e) => editarOutro(item.id, { quantidade: e.target.value })}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <input
                      aria-label={`Nome de ${item.nome || 'outro custo'}`}
                      disabled={/^(servico|rateio):/.test(item.id)}
                      className={inputClass}
                      value={item.nome}
                      onChange={(e) => editarOutro(item.id, { nome: e.target.value })}
                    />
                  </td>
                  <td className="py-1 pr-2 text-right whitespace-nowrap">
                    {formatarCusto(item.total)}
                  </td>
                  <td>
                    <button
                      type="button"
                      aria-label={`Remover ${item.nome || 'outro custo'}`}
                      disabled={/^(servico|rateio):/.test(item.id)}
                      className="px-1 text-muted"
                      onClick={() =>
                        atualizar({ outros: outros.filter((row) => row.id !== item.id) })
                      }
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {configuracao.outros !== undefined && (
          <p className="mt-2 text-muted">
            Ajustes locais de outros custos. Salve o rascunho para mantê-los.
          </p>
        )}
        {!outros.length && <p className="py-2 text-muted">Nenhum outro custo informado.</p>}
        <button
          type="button"
          className="mt-2 text-accent-camel hover:underline"
          onClick={() =>
            atualizar({
              outros: [
                ...outros,
                { id: crypto.randomUUID(), nome: '', custo: '', quantidade: '1', origem: 'local' },
              ],
            })
          }
        >
          + Outro custo
        </button>
      </section>

      <section
        aria-label="Custos da variante no portal"
        className="rounded-lg border border-border bg-surface p-4"
      >
        <h3 className="border-b border-border pb-2 text-xs font-semibold">Resumo</h3>
        <div className="overflow-x-auto">
          <table aria-label={`Resumo dos custos — ${variante.nome}`} className="w-full text-left">
            <thead>
              <tr className="text-muted">
                {[
                  'Insumo / processo',
                  'Consumo',
                  'Preço por unidade do insumo',
                  'Custo por unidade produzida',
                  `Consumo de ${quantidade ?? '—'} pçs`,
                  `Custo de ${quantidade ?? '—'} pçs`,
                ].map((nome, i) => (
                  <th
                    key={i}
                    scope="col"
                    className={`py-2 pr-3 font-medium ${i > 1 ? 'text-right' : ''}`}
                  >
                    {nome}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {outros.length > 0 && (
                <>
                  <tr>
                    <th scope="colgroup" colSpan={3} className="border-b-2 border-border pt-3 pb-1">
                      Outros{' '}
                      <span className="font-normal text-muted">
                        {percentual(resumo.totalOutros)}
                      </span>
                    </th>
                    <td className="text-right">{formatarCusto(resumo.totalOutros)}</td>
                    <td>—</td>
                    <td className="border-b-2 border-border pt-3 pb-1 text-right font-medium">
                      {quantidade === null
                        ? 'Quantidade não informada'
                        : formatarCusto(
                            resumo.totalOutros !== null && quantidade !== null
                              ? resumo.totalOutros * quantidade
                              : null
                          )}
                    </td>
                  </tr>
                  {resumo.outros.map((item) => (
                    <tr key={item.id} className="border-b border-border">
                      <th scope="row" className="py-1.5 pr-3 font-normal">
                        {item.nome || 'Outro custo'}{' '}
                        <span className="text-muted">{percentual(item.total)}</span>
                      </th>
                      <td className="py-1.5 pr-3">{item.quantidade}</td>
                      <td className="py-1.5 pr-3 text-right">
                        {formatarCusto(decimalManual(item.custo))}
                      </td>
                      <td className="py-1.5 pr-3 text-right">{formatarCusto(item.total)}</td>
                      <td className="py-1.5 pr-3 text-right">—</td>
                      <td className="py-1.5 text-right whitespace-nowrap">
                        {formatarCusto(
                          item.total !== null && quantidade !== null
                            ? item.total * quantidade
                            : null
                        )}
                      </td>
                    </tr>
                  ))}
                </>
              )}
              {grupos.map((grupo) => (
                <Fragment key={grupo}>
                  <tr>
                    <th
                      scope="row"
                      aria-label={`Subtotal de ${(nomes[grupo] ?? grupo).toLowerCase()}`}
                      colSpan={3}
                      className="border-b-2 border-border pt-3 pb-1"
                    >
                      <div className="flex items-center gap-3">
                        <span>
                          {nomes[grupo] ?? grupo}{' '}
                          <span className="font-normal text-muted">
                            {percentual(totalGrupo(grupo))}
                          </span>
                        </span>
                        {resumo.fonte === 'portal' && (
                          <button
                            type="button"
                            onClick={() =>
                              onEditInsumos(grupo === 'TECIDO' ? 'tecidos' : 'aviamentos')
                            }
                            className="font-normal text-accent-camel hover:underline"
                          >
                            Editar {grupo === 'TECIDO' ? 'tecidos' : 'aviamentos'}
                          </button>
                        )}
                      </div>
                    </th>
                    <td className="text-right">{formatarCusto(totalGrupo(grupo))}</td>
                    <td>—</td>
                    <td className="border-b-2 border-border pt-3 pb-1 text-right font-medium">
                      {quantidade === null
                        ? 'Quantidade não informada'
                        : formatarCusto(
                            totalGrupo(grupo) !== null && quantidade !== null
                              ? totalGrupo(grupo)! * quantidade
                              : null
                          )}
                    </td>
                  </tr>
                  {resumo.linhas
                    .filter((linha) => linha.grupo === grupo)
                    .map((linha) => (
                      <tr
                        key={linha.id}
                        className="border-b border-border"
                        title={linha.observacao}
                      >
                        <th scope="row" className="py-1.5 pr-3 font-normal">
                          {linha.nome}
                          {linha.excluido && (
                            <span className="block text-muted">Fora da formação do preço</span>
                          )}
                        </th>
                        <td className="py-1.5 pr-3 whitespace-nowrap">
                          {linha.consumoTexto ?? `${numero(linha.consumo)} ${linha.unidade}`}
                        </td>
                        <td className="py-1.5 pr-3 text-right whitespace-nowrap">
                          {formatarCusto(linha.preco)}
                        </td>
                        <td className="py-1.5 pr-3 text-right whitespace-nowrap">
                          {formatarCusto(linha.total)}
                        </td>
                        <td className="py-1.5 pr-3 text-right whitespace-nowrap">
                          {numero(
                            linha.consumo !== null && quantidade !== null
                              ? linha.consumo * quantidade
                              : null
                          )}{' '}
                          {linha.unidade}
                        </td>
                        <td className="py-1.5 text-right whitespace-nowrap">
                          {formatarCusto(
                            linha.total !== null && quantidade !== null
                              ? linha.total * quantidade
                              : null
                          )}
                        </td>
                      </tr>
                    ))}
                </Fragment>
              ))}
              {!resumo.linhas.length && (
                <tr>
                  <td colSpan={6} className="py-3 text-muted">
                    Nenhum insumo disponível nesta seleção.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" colSpan={3} className="pt-3 font-semibold">
                  Total
                </th>
                <td className="pt-3 text-right font-semibold whitespace-nowrap">
                  {formatarCusto(resumo.total)}
                </td>
                <td>—</td>
                <td className="pt-3 text-right font-semibold whitespace-nowrap">
                  {quantidade === null
                    ? 'Quantidade não informada'
                    : formatarCusto(resumo.totalProducao)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        {resumo.pendentes > 0 && (
          <p role="status" className="mt-2 text-muted">
            {resumo.pendentes} custo(s) pendente(s). Confira os dados antes de usar o total.
          </p>
        )}
      </section>

      <section className="rounded-lg border border-border bg-surface p-4">
        <h3 className="border-b border-border pb-2 text-xs font-semibold">Custo por variante</h3>
        <div className="overflow-x-auto">
          <table aria-label="Custo por variante" className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted">
                {['Variante', 'Tecidos', 'Aviamentos / embalagens', 'Outros custos', 'Total'].map(
                  (title, i) => (
                    <th
                      key={title}
                      scope="col"
                      className={`py-2 pr-3 font-medium ${i ? 'text-right' : ''}`}
                    >
                      {title}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {custosVariantes.map(({ variante: item, resumo: custo }, i) => {
                return (
                  <tr
                    key={item.id}
                    className={`border-b border-border ${item.id === variante.id ? 'bg-surface-muted' : ''}`}
                  >
                    <th scope="row" className="py-2 pr-3 font-normal">
                      {item.nome.trim() || `Variante ${i + 1}`}
                    </th>
                    {[
                      custo.subtotalTecidos,
                      custo.subtotalAviamentos,
                      custo.totalOutros,
                      custo.total,
                    ].map((valor, j) => (
                      <td key={j} className="py-2 pr-3 text-right whitespace-nowrap">
                        {formatarCusto(custo.erro ? null : valor)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-border">
                <th scope="row" className="py-2 pr-3 font-medium">
                  Média ponderada pelas unidades planejadas
                </th>
                {medias.map((valor, i) => (
                  <td key={i} className="py-2 pr-3 text-right whitespace-nowrap">
                    {formatarCusto(valor)}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
      {(linxDados || loadingLinx || errorLinx) && (
        <details className="rounded-lg border border-border bg-surface p-3">
          <summary className="cursor-pointer text-muted">Detalhes da integração</summary>
          <div className="mt-3">
            <LinxFichaCustosPanel
              dados={linxDados}
              loading={loadingLinx}
              error={errorLinx}
              onReload={onReloadLinx ?? (() => {})}
              temEdicoesLocais={temEdicoesLocais}
              colecaoAtual={colecaoAtual}
            />
          </div>
        </details>
      )}
    </div>
  );
}
