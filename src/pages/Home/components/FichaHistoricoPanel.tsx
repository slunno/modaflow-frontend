import { useState } from 'react';
import type { ColecaoItem, PecaItem } from '../../../types/plm';
import { getHistoricoDaPeca } from '../../../services/fichaHistorico';
import { getPecaFichaValues } from '../../../services/pecaFichaSelectors';
import { LinxMaterialDetails } from './LinxMaterialDetails';
import { FichaAlteracoesPanel } from './FichaAlteracoesPanel';

export function FichaHistoricoPanel({ peca, colecao }: { peca: PecaItem; colecao: ColecaoItem }) {
  const [selected, setSelected] = useState('');
  const history = getHistoricoDaPeca(peca, colecao);
  const snapshot = history.find((item) => item.recibo.integracaoId === selected) ?? history.at(-1);
  const [tab, setTab] = useState<'geral' | 'tecidos' | 'aviamentos'>('geral');
  return (
    <div className="space-y-5">
      <FichaAlteracoesPanel peca={peca} />
      <section
        aria-label="Histórico por coleção"
        className="bg-surface p-5 rounded-xl border border-border space-y-4 text-xs"
      >
        <h3 className="font-bold text-sm">Versões integradas nesta coleção</h3>
        {colecao.regraFicha !== 'integracao-colecao-v1' ? (
          <p>Esta coleção pertence à base antiga. O histórico anterior do Linx não é consultado.</p>
        ) : !history.length ? (
          <p>
            Nenhuma integração confirmada nesta coleção. Salvar ou editar o rascunho não cria
            versões. O envio ao Linx ainda não está habilitado no projeto.
          </p>
        ) : (
          <>
            <p className="text-muted">
              {colecao.nome} · {snapshot?.recibo.griffe}. Versões integradas são somente leitura; o
              rascunho principal permanece independente.
            </p>
            <label className="block font-semibold">
              Versão integrada
              <select
                value={snapshot?.recibo.integracaoId ?? ''}
                onChange={(event) => setSelected(event.target.value)}
                className="block w-full rounded-lg border border-border bg-surface-muted p-2 mt-1"
              >
                {[...history].reverse().map((item) => (
                  <option key={item.recibo.integracaoId} value={item.recibo.integracaoId}>
                    Versão {item.numero} · Linx {item.recibo.versaoLinx} ·{' '}
                    {item.recibo.confirmadaEm}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex gap-2">
              {(['geral', 'tecidos', 'aviamentos'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={tab === item}
                  onClick={() => setTab(item)}
                  className={`rounded-lg border border-border p-2 capitalize ${tab === item ? 'bg-accent-camel text-on-camel' : ''}`}
                >
                  {item}
                </button>
              ))}
            </div>
            {snapshot &&
              (tab === 'geral' ? (
                <dl className="grid sm:grid-cols-2 gap-3">
                  {[
                    'Nome do Produto',
                    'Código',
                    'Descrição',
                    'Tamanhos',
                    'Técnica',
                    'Modelagem',
                    'Cores',
                    'Observações Gerais',
                    'Observações de Corte',
                    'Observações Modelagem',
                  ].map((field) => (
                    <div key={field}>
                      <dt className="text-muted">{field}</dt>
                      <dd>{getPecaFichaValues(snapshot.peca, field).join(', ') || '—'}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                snapshot.peca.fichaTecnica?.variantes?.map((variante) => (
                  <section key={variante.id} className="space-y-3">
                    <h4 className="font-bold">{variante.nome}</h4>
                    {!variante[tab].length && <p>Nenhum insumo.</p>}
                    {variante[tab].map((item) => (
                      <article
                        key={item.id}
                        className="rounded-lg border border-border p-3 space-y-2"
                      >
                        <h5 className="font-semibold">
                          {item.nome} ({item.codigo})
                        </h5>
                        <p>
                          Uso: {item.uso || '—'} · Unidade: {item.unidade || '—'}
                        </p>
                        {item.linxDados && <LinxMaterialDetails material={item.linxDados} />}
                      </article>
                    ))}
                  </section>
                ))
              ))}
          </>
        )}
      </section>
    </div>
  );
}
