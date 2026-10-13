import { useContext } from 'react';
import { AuthContext } from '../../../contexts/authContextInstance';
import { StatusBadge } from '../../../components/ui/FichaPrimitives';
import type { FichaVariante } from '../../../types/ficha';
import type { FichaConferencia } from '../../../types/fichaProcesso';
import type { PecaItem } from '../../../types/plm';
import {
  COMPONENTES_FICHA,
  assinaturaConferenciaVariante,
  confirmacaoAtual,
  conferirFicha,
  criarConfirmacao,
  decimalManual,
} from '../../../services/fichaProcesso';

interface Props {
  peca: PecaItem;
  onChange: (conferencia: FichaConferencia) => void;
  onVariantesChange?: (variantes: FichaVariante[]) => void;
  onCorrigir: (
    aba: 'geral' | 'tecidos' | 'aviamentos',
    varianteId?: string,
    campo?: string
  ) => void;
  resumido?: boolean;
}
export function FichaConferenciaPanel({
  peca,
  onChange,
  onVariantesChange,
  onCorrigir,
  resumido = false,
}: Props) {
  const autor = useContext(AuthContext)?.user;
  const conferencia = peca.fichaTecnica?.conferencia ?? {};
  const variantes = peca.fichaTecnica?.variantes ?? [];
  const tamanhos = peca.fichaTecnica?.tamanhos ?? [];
  const pendencias = conferirFicha(peca);
  const listaPendencias = (
    <ul className="space-y-2">
      {pendencias.map((item, index) => (
        <li
          key={`${item.campo}-${item.varianteId}-${index}`}
          className="rounded-control border border-status-pending/20 bg-status-pending/5 p-3"
        >
          <StatusBadge status="pending" />
          {item.mensagem}{' '}
          <button
            type="button"
            className="underline"
            onClick={() => onCorrigir(item.aba, item.varianteId, item.campo)}
          >
            Abrir {item.aba}
          </button>
        </li>
      ))}
    </ul>
  );
  return (
    <section
      aria-label="Conferência antes da entrega"
      className="rounded-xl border border-border bg-surface p-5 space-y-4"
    >
      <h2 className="font-bold">Conferência antes da entrega</h2>
      <div className="flex flex-wrap gap-3">
        <StatusBadge status="complete" label="Preenchido" />
        <StatusBadge status="pending" />
        <StatusBadge status="na" />
        <p className="self-center text-xs text-muted">
          Não se aplica exige confirmação explícita, com responsável e data.
        </p>
      </div>
      <p className="text-xs text-muted">
        {resumido
          ? 'Confirme a grade e os itens aplicáveis para entregar à engenharia.'
          : 'O rascunho salva automaticamente, inclusive com campos incompletos. A entrega manual exige a conferência abaixo.'}
      </p>
      <label className="flex gap-2 items-start text-sm">
        <StatusBadge
          status={conferencia.gradeCompleta && tamanhos.length ? 'complete' : 'pending'}
          compact
        />
        <input
          type="checkbox"
          aria-label="Confirmei em Geral todos os tamanhos da grade, não somente o piloto"
          checked={conferencia.gradeCompleta === true}
          onChange={(event) => onChange({ ...conferencia, gradeCompleta: event.target.checked })}
        />
        {resumido
          ? 'Grade completa conferida'
          : 'Confirmei em Geral todos os tamanhos da grade, não somente o piloto'}
      </label>
      <p className="text-xs">
        {resumido ? 'Tamanhos: ' : 'Tamanhos compartilhados com toda a ficha: '}
        {tamanhos.join(', ') || 'Não selecionados'}.
        {!resumido &&
          ' A composição da grade ainda é confirmada pelo usuário, não comparada automaticamente com o catálogo Linx.'}
      </p>
      {!autor?.id && (
        <p role="status" className="text-xs">
          Entre com seu usuário para registrar confirmações com nome, data e hora.
        </p>
      )}
      {variantes.map((variante) => {
        const assinatura = assinaturaConferenciaVariante(variante, tamanhos);
        const itens = [...variante.tecidos, ...variante.aviamentos];
        const decisoes = conferencia.componentesPorVariante?.[variante.id] ?? {};
        const registrosAtuais = Object.entries(decisoes).filter(([, registro]) =>
          confirmacaoAtual(registro, assinatura)
        );
        return (
          <fieldset
            key={variante.id}
            className="rounded-lg border border-border p-3 space-y-3 text-xs"
          >
            <legend className="px-1 font-bold">
              {variante.nome}
              {!resumido && ' — conferência independente'}
            </legend>
            <div className={resumido ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-3'}>
              {Object.entries(COMPONENTES_FICHA).map(([key, nome]) => {
                const componente = key as keyof typeof COMPONENTES_FICHA;
                const presentes = itens.filter((item) => item.componente === componente);
                const decisao = decisoes[componente];
                const atual = confirmacaoAtual(decisao, assinatura);
                return (
                  <div
                    key={componente}
                    className="space-y-2 rounded-control border border-border p-3"
                  >
                    <StatusBadge
                      status={
                        presentes.length && decisao?.aplicavel !== false
                          ? 'complete'
                          : atual && decisao?.aplicavel === false && !presentes.length
                            ? 'na'
                            : 'pending'
                      }
                      label={
                        presentes.length && decisao?.aplicavel !== false ? 'Preenchido' : undefined
                      }
                    />
                    {presentes.length && decisao?.aplicavel !== false ? (
                      <p>
                        {nome}: encontrado —{' '}
                        {presentes.map((item) => item.nome || item.codigo).join(', ')}
                      </p>
                    ) : (
                      <label className="block space-y-1">
                        {resumido ? nome : `${nome} se aplica à variante ${variante.nome}?`}
                        <select
                          aria-label={`${nome} se aplica à variante ${variante.nome}?`}
                          value={atual ? (decisao?.aplicavel ? 'sim' : 'nao') : ''}
                          disabled={!autor?.id}
                          className="block w-full rounded-lg border border-border bg-surface px-3 py-2"
                          onChange={(event) => {
                            const proximas = { ...decisoes };
                            if (!event.target.value) delete proximas[componente];
                            else
                              proximas[componente] = {
                                ...criarConfirmacao(assinatura, {
                                  id: autor!.id,
                                  nome: autor!.nome,
                                }),
                                aplicavel: event.target.value === 'sim',
                              };
                            onChange({
                              ...conferencia,
                              componentesPorVariante: {
                                ...conferencia.componentesPorVariante,
                                [variante.id]: proximas,
                              },
                            });
                          }}
                        >
                          <option value="">
                            {resumido ? 'Selecione' : 'Não confirmado / preciso revisar'}
                          </option>
                          <option value="sim">
                            {resumido
                              ? 'Sim — precisa do item'
                              : 'Sim — cadastrar ou revisar o insumo'}
                          </option>
                          <option value="nao" disabled={presentes.length > 0}>
                            {resumido ? 'Não se aplica' : 'Não — este item não se aplica'}
                          </option>
                        </select>
                      </label>
                    )}
                    {decisao && !atual && (!presentes.length || decisao.aplicavel === false) && (
                      <p className="text-muted">
                        Confirmação anterior não vale para os insumos e a grade atuais. Confirme
                        novamente.
                      </p>
                    )}
                    {!resumido && decisao && atual && (
                      <p className="text-muted">
                        Confirmado por {decisao.responsavel.nome} em{' '}
                        {new Date(decisao.registradoEm).toLocaleString('pt-BR')}.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            {resumido && registrosAtuais.length > 0 && (
              <details className="text-muted space-y-1">
                <summary className="cursor-pointer">Ver confirmações</summary>
                {registrosAtuais.map(([componente, registro]) => (
                  <p key={componente}>
                    {COMPONENTES_FICHA[componente as keyof typeof COMPONENTES_FICHA]}:{' '}
                    {registro.aplicavel ? 'Sim' : 'Não se aplica'} — {registro.responsavel.nome},{' '}
                    {new Date(registro.registradoEm).toLocaleString('pt-BR')}.
                  </p>
                ))}
              </details>
            )}
            {(['tecidos', 'aviamentos'] as const).flatMap((tipo) =>
              variante[tipo]
                .filter((item) => item.componente === 'elastico')
                .map((item) => (
                  <div key={`${tipo}-${item.id}`} className="border-t border-border pt-3 space-y-2">
                    <p className="font-semibold">Elástico: {item.nome || item.codigo}</p>
                    {tamanhos.map((tamanho) => {
                      const consumo = item.consumoPorTamanho?.[tamanho];
                      const valor = decimalManual(consumo?.valor);
                      if (valor !== 0 || consumo?.naoSeAplica)
                        return resumido ? null : (
                          <p key={tamanho}>
                            {tamanho}:{' '}
                            {valor === null || consumo?.naoSeAplica
                              ? 'consumo precisa ser preenchido/revisado'
                              : `consumo ${consumo!.valor} ${item.unidade}`}
                          </p>
                        );
                      const atual = confirmacaoAtual(consumo?.confirmacaoZero, assinatura);
                      return (
                        <div key={tamanho} className="space-y-1">
                          <label className="flex gap-2 items-start">
                            <input
                              type="checkbox"
                              checked={atual}
                              disabled={!autor?.id || !onVariantesChange}
                              onChange={(event) => {
                                const confirmacaoZero = event.target.checked
                                  ? criarConfirmacao(assinatura, {
                                      id: autor!.id,
                                      nome: autor!.nome,
                                    })
                                  : undefined;
                                onVariantesChange?.(
                                  variantes.map((entry) =>
                                    entry.id !== variante.id
                                      ? entry
                                      : {
                                          ...entry,
                                          [tipo]: entry[tipo].map((insumo) =>
                                            insumo.id !== item.id
                                              ? insumo
                                              : {
                                                  ...insumo,
                                                  consumoPorTamanho: {
                                                    ...insumo.consumoPorTamanho,
                                                    [tamanho]: { ...consumo!, confirmacaoZero },
                                                  },
                                                }
                                          ),
                                        }
                                  )
                                );
                              }}
                            />
                            Confirmo que {item.nome || item.codigo} NÃO é usado no tamanho {tamanho}{' '}
                            da variante {variante.nome} (consumo zero)
                          </label>
                          {atual && (
                            <p className="text-muted">
                              Confirmado por {consumo!.confirmacaoZero!.responsavel.nome} em{' '}
                              {new Date(consumo!.confirmacaoZero!.registradoEm).toLocaleString(
                                'pt-BR'
                              )}
                              .
                            </p>
                          )}
                        </div>
                      );
                    })}
                    <button
                      type="button"
                      className="underline"
                      onClick={() => onCorrigir(tipo, variante.id)}
                    >
                      Preencher consumo por tamanho em {tipo}
                    </button>
                  </div>
                ))
            )}
          </fieldset>
        );
      })}
      {pendencias.length ? (
        <div role="status" className="space-y-2 text-xs">
          {resumido ? (
            <details>
              <summary className="cursor-pointer font-semibold">
                Ver {pendencias.length} pendência(s) para entrega
              </summary>
              {listaPendencias}
            </details>
          ) : (
            <>
              <p className="font-semibold">{pendencias.length} pendência(s) para entrega</p>
              {listaPendencias}
            </>
          )}
        </div>
      ) : (
        <p role="status" className="text-sm">
          {resumido
            ? 'Pronto para confirmar o avanço.'
            : 'Conferência local preenchida. O backend também valida no momento da entrega.'}
        </p>
      )}
    </section>
  );
}
