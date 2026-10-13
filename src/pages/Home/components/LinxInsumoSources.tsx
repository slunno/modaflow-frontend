import { useEffect, useId, useRef, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import type { LinxFichaMaterial, LinxFichaValor } from '../../../types/linx';
import { LinxMaterialDetails } from './LinxMaterialDetails';

type Row = Record<string, LinxFichaValor>;
interface Props {
  material: LinxFichaMaterial;
  linhas?: Row[];
  fornecedores?: Row[];
}

const value = (field: LinxFichaValor | undefined) =>
  field == null || field === '' ? 'Não informado' : String(field);
const money = (field: LinxFichaValor | undefined) =>
  typeof field === 'number' && Number.isFinite(field)
    ? field.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 5,
        maximumFractionDigits: 5,
      })
    : 'Não informado';

function colorRows(material: LinxFichaMaterial, linhas: Row[] = []): Row[] {
  if (!linhas.length) return material.cores;
  const unique = new Map<string, Row>();
  for (const line of linhas) {
    const key = `${line.COR_PRODUTO}:${line.COR_MATERIAL}`;
    if (!unique.has(key))
      unique.set(key, {
        COR_PRODUTO: line.COR_PRODUTO ?? null,
        COR_MATERIAL: line.COR_MATERIAL ?? null,
        DESC_COR_MATERIAL: line.DESC_COR_MATERIAL ?? null,
        CUSTO_A_VISTA: line.PRECO_COR_A_VISTA ?? null,
        CUSTO_REPOSICAO: line.PRECO_COR_REPOSICAO ?? null,
      });
  }
  return [...unique.values()];
}

/** Valores de origem permanecem separados do preço manual do rascunho. */
export function LinxInsumoSources({ material, linhas, fornecedores = [] }: Props) {
  const cores = colorRows(material, linhas);
  const fonte = linhas?.[0];
  const geralVista = fonte ? fonte.PRECO_MATERIAL_A_VISTA : material.dados.CUSTO_A_VISTA;
  const geralReposicao = fonte ? fonte.PRECO_MATERIAL_REPOSICAO : material.dados.CUSTO_REPOSICAO;
  return (
    <section
      aria-label={`Origem dos preços de ${material.nome ?? material.codigo}`}
      className="rounded-lg border border-border bg-surface p-3 space-y-3 text-xs"
    >
      <h5 className="font-semibold text-primary">Preços de origem — Linx</h5>
      <p className="text-muted">
        {fonte
          ? 'Preços consultados no cadastro atual, não snapshot da integração.'
          : 'Dados de origem preservados na ficha; a atualização dos preços ainda não foi confirmada nesta consulta.'}{' '}
        Nenhum desses valores substitui automaticamente o preço manual do portal.
      </p>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <dt className="font-semibold">Preço geral do material</dt>
          <dd>
            À vista: {money(geralVista)} · Reposição: {money(geralReposicao)}
          </dd>
          <dd className="text-muted">MATERIAIS.CUSTO_A_VISTA / CUSTO_REPOSICAO</dd>
        </div>
        <div>
          <dt className="font-semibold">Unidades e conversão</dt>
          <dd>
            Estoque: {value(fonte ? fonte.UNID_ESTOQUE : material.dados.UNID_ESTOQUE)} · Ficha:{' '}
            {value(fonte ? fonte.UNID_FICHA_TEC : material.dados.UNID_FICHA_TEC)}
          </dd>
          <dd>Fator: {value(fonte ? fonte.FATOR_CONVERSAO : material.dados.FATOR_CONVERSAO)}</dd>
        </div>
      </dl>
      {cores.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <caption className="text-left font-semibold mb-2">
              Preços por material + cor — MATERIAIS_CORES
            </caption>
            <thead>
              <tr className="border-b border-border">
                <th className="p-2" scope="col">
                  Cor da peça (ERP)
                </th>
                <th className="p-2" scope="col">
                  Cor do material
                </th>
                <th className="p-2" scope="col">
                  À vista
                </th>
                <th className="p-2" scope="col">
                  Reposição
                </th>
              </tr>
            </thead>
            <tbody>
              {cores.map((cor, index) => (
                <tr
                  key={`${cor.COR_PRODUTO}:${cor.COR_MATERIAL}:${index}`}
                  className="border-b border-border"
                >
                  <td className="p-2">{value(cor.COR_PRODUTO)}</td>
                  <td className="p-2">
                    {value(cor.DESC_COR_MATERIAL)} ({value(cor.COR_MATERIAL)})
                  </td>
                  <td className="p-2 whitespace-nowrap">{money(cor.CUSTO_A_VISTA)}</td>
                  <td className="p-2 whitespace-nowrap">{money(cor.CUSTO_REPOSICAO)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-muted">
          Nenhum preço por cor retornado. Não foi utilizado o preço geral como substituto.
        </p>
      )}
      <details>
        <summary className="cursor-pointer font-semibold">Como o Linx usa esses valores</summary>
        <p className="mt-2">
          Para insumos não semiacabados elegíveis na formação de preço, a view analisada usa Cn ×
          MATERIAIS_CORES.CUSTO_A_VISTA ÷ MATERIAIS.FATOR_CONVERSAO × PORCENTAGEM_CONSUMO ÷ 100.
        </p>
        <p className="mt-2 text-muted">
          Regra comprovada nas posições 1 a 9. Preço geral e preço do fornecedor são fontes
          separadas, não usados automaticamente nessa expressão. Tamanhos ausentes, campos nulos,
          fator zero e semiacabados não recebem cálculo presumido.
        </p>
      </details>
      {!!fornecedores.length && (
        <details>
          <summary className="cursor-pointer font-semibold">
            Preços por fornecedor ({fornecedores.length})
          </summary>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left">
              <caption className="text-left text-muted mb-2">
                MATERIAIS_FORNECEDOR.CUSTO_REPOSICAO — sem fornecedor escolhido automaticamente
              </caption>
              <thead>
                <tr>
                  <th className="p-2" scope="col">
                    Fornecedor
                  </th>
                  <th className="p-2" scope="col">
                    Cor
                  </th>
                  <th className="p-2" scope="col">
                    Custo cadastrado
                  </th>
                  <th className="p-2" scope="col">
                    Unidade / fator
                  </th>
                </tr>
              </thead>
              <tbody>
                {fornecedores.map((row, index) => (
                  <tr
                    key={`${row.FORNECEDOR}:${row.COR_MATERIAL}:${index}`}
                    className="border-t border-border"
                  >
                    <td className="p-2">
                      {value(row.FORNECEDOR)} · {value(row.COD_FORNECEDOR)}
                    </td>
                    <td className="p-2">{value(row.COR_MATERIAL)}</td>
                    <td className="p-2 whitespace-nowrap">{money(row.CUSTO_FORNECEDOR)}</td>
                    <td className="p-2">
                      {value(row.UNIDADE)} / {value(row.FATOR_CONVERSAO_FORNECEDOR)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </section>
  );
}

/** Ficha de consulta do insumo, independente do editor de dados manuais. */
export function LinxInsumoDialog({
  material,
  linhas,
  fornecedores,
  onClose,
}: Props & { onClose: () => void }) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, []);
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
    }
    if (event.key !== 'Tab') return;
    const elements = [
      ...(dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]),summary,input,select,textarea,a[href],[tabindex="0"]'
      ) ?? []),
    ].filter((element) => element.getClientRects().length > 0);
    const first = elements[0];
    const last = elements.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center"
      onKeyDown={onKeyDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-surface text-primary p-5 space-y-4 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id={titleId} className="font-bold">
              Insumo Linx — {material.nome ?? material.codigo}
            </h3>
            <p className="text-xs text-muted">
              Material {material.codigo} · Item {material.item} · {material.grupo}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar consulta do insumo"
            className="rounded-lg border border-border p-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-muted">
          Somente visualização. Valores originais não são alterados pelas edições locais do nome,
          código, preço ou consumo.
        </p>
        <LinxInsumoSources material={material} linhas={linhas} fornecedores={fornecedores} />
        <section className="rounded-lg border border-border p-3 text-xs">
          <h4 className="font-semibold mb-3">Cadastro e propriedades</h4>
          <dl className="grid sm:grid-cols-2 gap-3">
            {[
              'PRODUTO',
              'VERSAO_FICHA',
              'BANCO_ORIGEM',
              'DESC_COMPOSICAO',
              'FABRICANTE',
              'REF_FABRICANTE',
              'COMPRIMENTO',
              'LARGURA_MATERIAL',
              'U_RENDIMENTO',
              'DESC_USO_MATERIAL',
              'DESC_FASE_PRODUCAO',
              'DESC_SETOR_PRODUCAO',
              'OBS_MATERIAL',
            ].map((key) => (
              <div key={key}>
                <dt className="font-semibold text-muted">{key}</dt>
                <dd className="break-words whitespace-pre-wrap">{value(material.dados[key])}</dd>
              </div>
            ))}
          </dl>
        </section>
        <LinxMaterialDetails material={material} />
      </div>
    </div>
  );
}
