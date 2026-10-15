import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { InsumoInformacoesCores } from './InsumoInformacoesCores';
import {
  camposDaCor,
  completarInformacoesCores,
  coresComDadosLegados,
} from '../../../services/insumoInformacoesCores';
import { getLinxMaterialCadastro } from '../../../services/linxService';
import type { LinxMaterialCadastro } from '../../../types/linx';
import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { FichaInsumo } from '../../../types/ficha';
import { MaterialColorTile } from './MaterialColorTile';
import { ProductUsoField } from './ProductUsoField';
import { FichaConsumoTamanhosEditor } from './FichaConsumoTamanhosEditor';
import { LinxMaterialDetails } from './LinxMaterialDetails';
import { LinxInsumoSources, LinxInsumoDialog } from './LinxInsumoSources';
import type { LinxFichaCustos } from '../../../types/linx';
import {
  baseConsumoInsumo,
  custoConsumo,
  decimalManual,
  formatarCusto,
  COMPONENTES_FICHA,
} from '../../../services/fichaProcesso';

interface Props {
  item: FichaInsumo;
  tipo: 'tecido' | 'aviamento';
  usoKey: string;
  produto: string;
  tamanhos?: readonly string[];
  onUpdate: (changes: Partial<FichaInsumo>) => void;
  onEdit: () => void;
  onRemove: () => void;
  custosLinx?: LinxFichaCustos | null;
}
const inputClass = 'block w-full rounded-lg border border-border bg-surface px-3 py-2';

export function FichaInsumoCard({
  item,
  tipo,
  usoKey,
  produto,
  tamanhos,
  onUpdate,
  onEdit,
  onRemove,
  custosLinx,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [consultaAberta, setConsultaAberta] = useState(false);
  const [infoCoresAberta, setInfoCoresAberta] = useState(false);
  const [materialCores, setMaterialCores] = useState<LinxMaterialCadastro | null>(null);
  const [carregandoCores, setCarregandoCores] = useState(false);
  const [erroCores, setErroCores] = useState('');
  const latest = useRef({ item, onUpdate });
  useLayoutEffect(() => {
    latest.current = { item, onUpdate };
  }, [item, onUpdate]);
  const temVinculoCor = Boolean(
    item.coresList?.some((cor) => cor.origemLinx?.materialCodigo === item.codigo.trim())
  );
  useEffect(() => {
    if (!infoCoresAberta || !temVinculoCor) return;
    let ativo = true;
    setCarregandoCores(true);
    setErroCores('');
    setMaterialCores(null);
    getLinxMaterialCadastro(item.codigo)
      .then((material) => {
        if (!ativo) return;
        setMaterialCores(material);
        const atual = latest.current.item;
        const cores = completarInformacoesCores(
          coresComDadosLegados(atual),
          material,
          atual.fornecedoresList ?? [],
          atual.unidade
        );
        if (JSON.stringify(cores) !== JSON.stringify(atual.coresList))
          latest.current.onUpdate({ coresList: cores, ...camposDaCor(cores, atual.corEmEdicaoId) });
      })
      .catch(() => {
        if (ativo)
          setErroCores(
            'Não foi possível consultar os preços do fornecedor. Seus valores foram preservados e a edição manual continua disponível.'
          );
      })
      .finally(() => {
        if (ativo) setCarregandoCores(false);
      });
    return () => {
      ativo = false;
    };
  }, [infoCoresAberta, item.codigo, temVinculoCor]);
  const detailsId = useId();
  const propriedades = item.propriedades;
  const base = baseConsumoInsumo(item, tipo === 'tecido' ? 'tecidos' : 'aviamentos');
  // Usa apenas o item importado da mesma versão. Nunca vincula cor ERP pelo nome da variante.
  const fonteAtual =
    item.linxDados &&
    custosLinx &&
    (item.linxDados.dados.VERSAO_FICHA === custosLinx.versao.versao ||
      item.id.startsWith(`linx-${custosLinx.versao.versao}-`))
      ? custosLinx
      : null;
  const linhas = fonteAtual?.materiais.filter(
    (row) => row.MATERIAL === item.linxDados?.codigo && row.ITEM === item.linxDados?.item
  );
  const fornecedoresOrigem = fonteAtual?.fornecedores.filter(
    (row) =>
      row.MATERIAL === item.linxDados?.codigo &&
      linhas?.some((line) => line.COR_MATERIAL === row.COR_MATERIAL)
  );
  return (
    <article
      data-insumo-id={item.id}
      data-consumo-base={base.campo}
      className="rounded-lg border border-border bg-surface-muted/30 p-3 space-y-3"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-bold text-sm text-primary break-words">{item.nome}</h4>
          <p className="text-xs text-muted">{item.codigo || 'Sem código'}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {item.linxDados && (
            <button
              type="button"
              onClick={() => setConsultaAberta(true)}
              className="rounded border border-border px-2 py-1 text-xs font-semibold"
            >
              Ver insumo Linx
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex gap-1 items-center rounded border border-border px-2 py-1 text-xs"
          >
            <Pencil className="h-3 w-3" /> Editar
          </button>
          <button
            type="button"
            aria-label={`Remover ${item.nome}`}
            onClick={onRemove}
            className="p-1 text-red-600 dark:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {!!item.coresList?.length && (
        <>
          <button
            type="button"
            aria-expanded={infoCoresAberta}
            onClick={() => setInfoCoresAberta((aberto) => !aberto)}
            className="rounded-lg border border-border px-3 py-2 text-xs font-semibold"
          >
            Editar informações por cor
          </button>
          {infoCoresAberta && (
            <>
              {carregandoCores && (
                <p role="status" className="text-xs">
                  Consultando preços por fornecedor e cor…
                </p>
              )}
              {erroCores && (
                <p role="alert" className="text-xs">
                  {erroCores}
                </p>
              )}
              <InsumoInformacoesCores
                cores={coresComDadosLegados(item)}
                fornecedores={item.fornecedoresList ?? []}
                material={materialCores}
                unidade={item.unidade}
                tipo={tipo}
                activeId={item.corEmEdicaoId}
                onChange={(cores) =>
                  onUpdate({ coresList: cores, ...camposDaCor(cores, item.corEmEdicaoId) })
                }
                onSelect={(cor) =>
                  onUpdate({ coresList: coresComDadosLegados(item), ...camposDaCor([cor], cor.id) })
                }
                onClose={() => setInfoCoresAberta(false)}
              />
            </>
          )}
          {item.coresList.length > 1 && (
            <p className="text-xs text-muted">
              Os campos principais e o custo abaixo usam somente a cor em foco. Os valores das
              outras cores ficam no menu; não são somados nem calculados por média.
            </p>
          )}
        </>
      )}
      <p className="text-xs">
        <span className="font-semibold">
          {item.precoLinx ? 'Preço selecionado (Linx): ' : 'Preço manual (portal): '}
        </span>
        {item.custo ? `R$ ${item.custo} / ${item.unidade}` : 'Não informado'}
      </p>
      {item.precoLinx && (
        <p className="text-xs text-muted">
          Fonte: {item.precoLinx.fonte}. Valor salvo nesta ficha; editar não atualiza o catálogo
          Linx.
        </p>
      )}
      <label className="block space-y-1 text-xs">
        Finalidade do insumo — {item.nome || item.codigo}
        <input
          type="text"
          data-field="finalidade"
          placeholder="Digite a finalidade deste insumo"
          value={
            item.finalidade ??
            (item.componente === 'outro'
              ? 'Outro insumo'
              : item.componente
                ? COMPONENTES_FICHA[item.componente]
                : '')
          }
          className={inputClass}
          onChange={(event) => onUpdate({ finalidade: event.target.value })}
        />
        <span className="block text-muted">Descreva como este insumo será utilizado na peça.</span>
      </label>
      <div className="grid sm:grid-cols-2 gap-3 text-xs">
        <label className="space-y-1">
          Preço por {item.unidade || 'unidade'} (R$)
          <input
            inputMode="decimal"
            value={item.custo}
            data-field="preco"
            className={inputClass}
            onChange={(event) =>
              onUpdate({ custo: event.target.value, precoOrigem: 'manual', precoLinx: undefined })
            }
          />
        </label>
        <p className="self-center">
          Custo do consumo:{' '}
          {formatarCusto(custoConsumo(item, tipo === 'tecido' ? 'tecidos' : 'aviamentos'))}
        </p>
      </div>
      {item.custo.trim() && decimalManual(item.custo) === null && (
        <p role="alert" className="text-xs text-red-600">
          Preço inválido. Use vírgula ou ponto decimal, sem separador de milhar.
        </p>
      )}
      <details className="text-xs text-muted">
        <summary className="cursor-pointer">Detalhes do cálculo manual</summary>
        <p className="mt-2">
          Preço escolhido pelo usuário para este insumo nesta variante. Custo do consumo = preço ×
          {base.campo === 'peso'
            ? ' peso em kg'
            : tipo === 'aviamento'
              ? ' quantidade'
              : ' consumo'}{' '}
          na mesma unidade; não é o custo total Linx.
        </p>
        {base.campo === 'peso' && (
          <p className="mt-2">
            Para preço por kg, preencha Peso (Kg). A metragem de referência não substitui o peso e
            não será convertida automaticamente.
          </p>
        )}
      </details>
      {item.precoLinx && (
        <p className="text-[11px] text-muted">
          Valor escolhido do Linx: {item.precoLinx.fonte}
          {item.precoLinx.corCodigo ? ` · cor ${item.precoLinx.corCodigo}` : ''}
          {item.precoLinx.fornecedorCodigo
            ? ` · fornecedor ${item.precoLinx.fornecedorCodigo}`
            : ''}
          . Nenhuma conversão aplicada. Alterar o preço neste campo passa a ser uma definição
          manual.
        </p>
      )}
      {base.unidade === null && (
        <p role="status" className="text-xs text-muted">
          Unidade não reconhecida para o cálculo local. Selecione Metros, Kg ou Unidade ao editar o
          insumo. O valor original foi preservado; não haverá conversão automática.
        </p>
      )}
      {item.linxDados && (
        <details className="rounded-lg border border-border bg-surface p-3">
          <summary className="cursor-pointer font-semibold">Detalhes dos preços Linx</summary>
          <div className="mt-3">
            <LinxInsumoSources material={item.linxDados} linhas={linhas} />
          </div>
        </details>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <label className="space-y-1">
          {tipo === 'tecido'
            ? base.unidade === 'kg'
              ? 'Metragem de referência (opcional, sem conversão)'
              : `Consumo (${item.unidade})`
            : `Quantidade (${item.unidade})`}
          <input
            inputMode="decimal"
            value={(tipo === 'tecido' ? item.consumo : item.quantidade) ?? ''}
            data-field="consumo-geral"
            onChange={(event) =>
              onUpdate({ [tipo === 'tecido' ? 'consumo' : 'quantidade']: event.target.value })
            }
            className={inputClass}
          />
        </label>
        {tipo === 'tecido' && (
          <label className="space-y-1">
            Peso (Kg)
            <input
              inputMode="decimal"
              value={item.peso ?? ''}
              data-field="peso"
              onChange={(event) => onUpdate({ peso: event.target.value })}
              className={inputClass}
            />
          </label>
        )}
        <ProductUsoField
          storageKey={usoKey}
          produto={produto}
          tipo={tipo}
          value={item.uso ?? ''}
          onChange={(uso) => onUpdate({ uso })}
        />
        <label className="space-y-1">
          Encolhimento
          <input
            value={(tipo === 'tecido' ? propriedades?.encolhimento : item.encolhimento) ?? ''}
            onChange={(event) =>
              onUpdate(
                tipo === 'tecido'
                  ? {
                      propriedades: {
                        gramatura: '0',
                        largura: '0',
                        rendimento1: '0.00',
                        rendimento2: '0.00',
                        construcao: '',
                        ...propriedades,
                        encolhimento: event.target.value,
                      },
                    }
                  : { encolhimento: event.target.value }
              )
            }
            className={inputClass}
          />
        </label>
      </div>
      <FichaConsumoTamanhosEditor
        elastico={item.componente === 'elastico'}
        tamanhos={tamanhos}
        nomeInsumo={item.nome}
        unidade={item.unidade}
        value={item.consumoPorTamanho}
        onChange={(consumoPorTamanho) => onUpdate({ consumoPorTamanho })}
      />
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={detailsId}
        onClick={() => setExpanded((previous) => !previous)}
        className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-surface-muted"
      >
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {expanded ? 'Minimizar' : 'Expandir'}
      </button>
      <div id={detailsId} hidden={!expanded} className="space-y-4 border-t border-border pt-4">
        <dl className="text-xs space-y-2">
          <div>
            <dt className="font-semibold">Fornecedores</dt>
            <dd className="text-muted-foreground">
              {item.fornecedoresList
                ?.filter((supplier) => supplier.fornecedor)
                .map((supplier) => `${supplier.fornecedor} (${supplier.codigo})`)
                .join(', ') ||
                item.fornecedores ||
                'Não informado'}
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Composição</dt>
            <dd>
              {item.composicoesList
                ?.map((composition) => `${composition.porcentagem}% ${composition.composicao}`)
                .join(', ') || String(item.linxDados?.dados.DESC_COMPOSICAO ?? 'Não informada')}
            </dd>
          </div>
        </dl>
        {!!item.coresList?.length && (
          <div className="flex flex-wrap gap-1.5" aria-label="Cores do insumo">
            {item.coresList.map((color) => (
              <MaterialColorTile key={color.id} color={color} />
            ))}
          </div>
        )}
        {(item.imagensList?.length ? item.imagensList : item.imagemUrl ? [item.imagemUrl] : []).map(
          (image, index) => (
            <img
              key={`${index}-${image.slice(-20)}`}
              src={image}
              alt={`${item.nome} — imagem ${index + 1}`}
              className="max-h-48 max-w-full rounded-lg object-contain"
            />
          )
        )}
        {tipo === 'tecido' && propriedades && (
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="font-semibold">Gramatura (g/m²)</dt>
              <dd>{propriedades.gramatura || 'Não informada'}</dd>
            </div>
            <div>
              <dt className="font-semibold">Largura (m)</dt>
              <dd>{propriedades.largura || 'Não informada'}</dd>
            </div>
            <div>
              <dt className="font-semibold">Rendimento (m²/kg)</dt>
              <dd>{propriedades.rendimento1 || 'Não informado'}</dd>
            </div>
            <div>
              <dt className="font-semibold">Rendimento (m/kg)</dt>
              <dd>{propriedades.rendimento2 || 'Não informado'}</dd>
            </div>
            <div>
              <dt className="font-semibold">Construção</dt>
              <dd>{propriedades.construcao || 'Não informada'}</dd>
            </div>
          </dl>
        )}
        <div className="text-xs">
          <h5 className="font-semibold">Observações</h5>
          <p className="whitespace-pre-wrap">{item.observacoes || 'Não informadas'}</p>
        </div>
        {item.linxDados && <LinxMaterialDetails material={item.linxDados} />}
      </div>
      {consultaAberta && item.linxDados && (
        <LinxInsumoDialog
          material={item.linxDados}
          linhas={linhas}
          fornecedores={fornecedoresOrigem}
          onClose={() => setConsultaAberta(false)}
        />
      )}
    </article>
  );
}
