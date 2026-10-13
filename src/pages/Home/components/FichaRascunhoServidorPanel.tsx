import { useId, useState } from 'react';
import { ApiError } from '../../../services/api';
import {
  consultarHistoricoRascunhoServidor,
  consultarRascunhoServidor,
  fichaServerDraftEnabled,
  salvarRascunhoServidor,
  type EventoRascunhoServidor,
  type IdentidadeRascunho,
  type SnapshotRascunhoServidor,
} from '../../../services/fichaRascunhoServidor';
import type { PecaItem } from '../../../types/plm';

interface Props {
  identity: IdentidadeRascunho;
  peca: PecaItem;
  disabled?: boolean;
}

interface HistoricoConsultado {
  eventos: EventoRascunhoServidor[];
  cursor?: string;
  temMais: boolean;
}

const HISTORICO_POR_PAGINA = 50;

/** Não busca automaticamente nem importa conteúdo central para o formulário local. */
export function FichaRascunhoServidorPanel(props: Props) {
  if (!fichaServerDraftEnabled()) return null;
  return (
    <RascunhoServidorHabilitado
      key={`${props.identity.marcaId}:${props.identity.colecaoId}:${props.identity.pecaId}`}
      {...props}
    />
  );
}

function RascunhoServidorHabilitado({ identity, peca, disabled = false }: Props) {
  const [snapshot, setSnapshot] = useState<SnapshotRascunhoServidor | null>(null);
  const [consultado, setConsultado] = useState(false);
  const [confirmado, setConfirmado] = useState(false);
  const [conflito, setConflito] = useState(false);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState('');
  const [status, setStatus] = useState('');
  const [historico, setHistorico] = useState<HistoricoConsultado | null>(null);
  const confirmacaoId = useId();

  const tratarErro = (error: unknown) => {
    if (error instanceof ApiError && error.status === 409) {
      setConflito(true);
      setConfirmado(false);
      setErro(
        'Conflito de revisão: outra edição modificou o rascunho central, ou ele foi removido. Nada foi sobrescrito. Consulte novamente e compare os dados antes de tentar salvar. Seu rascunho e anexos locais foram preservados.'
      );
    } else {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível acessar o rascunho central. Os dados locais foram preservados.'
      );
    }
  };

  const consultar = async () => {
    if (busy || disabled) return;
    setBusy(true);
    setErro('');
    setStatus('');
    setConfirmado(false);
    try {
      const result = await consultarRascunhoServidor(identity);
      setSnapshot(result);
      setConsultado(true);
      setConflito(false);
      setHistorico(null);
      setStatus(
        result
          ? 'Rascunho central consultado. Nenhum campo ou anexo local foi alterado.'
          : 'Ainda não existe rascunho central para esta peça. Você pode criar um pelo botão abaixo.'
      );
    } catch (error) {
      setConsultado(false);
      tratarErro(error);
    } finally {
      setBusy(false);
    }
  };

  const salvar = async () => {
    if (busy || disabled || !consultado || conflito || (snapshot && !confirmado)) return;
    setBusy(true);
    setErro('');
    setStatus('');
    try {
      const result = await salvarRascunhoServidor(identity, peca, snapshot?.revisao ?? null);
      setSnapshot(result);
      setConsultado(false);
      setConfirmado(false);
      setHistorico(null);
      setStatus(
        'Os dados presentes no momento do clique foram salvos no servidor. Anexos continuam somente neste navegador. Isso não integra nem confirma envio ao Linx e não substitui o salvamento local. Consulte novamente antes de salvar outra alteração central.'
      );
    } catch (error) {
      setConsultado(false);
      setConfirmado(false);
      tratarErro(error);
    } finally {
      setBusy(false);
    }
  };

  const consultarHistorico = async (carregarMais = false) => {
    if (busy || disabled || (carregarMais && (!historico?.temMais || !historico.cursor))) return;
    const cursor = carregarMais ? historico?.cursor : undefined;
    setBusy(true);
    setErro('');
    setStatus('');
    try {
      const pagina = await consultarHistoricoRascunhoServidor(identity, {
        limit: HISTORICO_POR_PAGINA,
        ...(cursor ? { afterEventoId: cursor } : {}),
      });
      const ultimoEventoId = pagina.at(-1)?.eventoId;
      setHistorico((previous) => {
        const eventos = carregarMais ? [...(previous?.eventos ?? [])] : [];
        const ids = new Set(eventos.map((evento) => evento.eventoId));
        for (const evento of pagina) {
          if (ids.has(evento.eventoId)) continue;
          ids.add(evento.eventoId);
          eventos.push(evento);
        }
        return {
          eventos,
          cursor: ultimoEventoId ?? cursor,
          temMais: pagina.length === HISTORICO_POR_PAGINA && !!ultimoEventoId,
        };
      });
    } catch (error) {
      tratarErro(error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      aria-label="Rascunho central opcional"
      className="rounded-xl border border-border bg-surface p-4 space-y-3 text-xs"
    >
      <h3 className="font-bold">Rascunho no servidor — opcional</h3>
      <p className="text-muted">
        Apenas os dados cadastrais são enviados. Imagens, fotos e arquivos continuam somente neste
        navegador, mesmo quando seus nomes e IDs constam no rascunho. Esta opção não integra no Linx
        nem aplica o conteúdo central ao formulário aberto.
      </p>
      <p className="text-muted">
        Consulte primeiro. Se já houver dados centrais, compare o conteúdo abaixo antes de confirmar
        sua substituição pelos dados atuais desta tela. Continue usando “Salvar rascunho” para
        manter seus dados e anexos locais antes de sair.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || disabled}
          onClick={consultar}
          className="rounded-lg border border-border px-3 py-2 font-semibold"
        >
          Consultar rascunho do servidor
        </button>
        <button
          type="button"
          disabled={busy || disabled || !consultado || conflito || (!!snapshot && !confirmado)}
          onClick={salvar}
          className="rounded-lg bg-accent-camel px-3 py-2 font-bold text-on-camel disabled:opacity-60"
        >
          Salvar rascunho no servidor
        </button>
        <button
          type="button"
          disabled={busy || disabled}
          onClick={() => consultarHistorico()}
          className="rounded-lg border border-border px-3 py-2 font-semibold"
        >
          Consultar histórico central
        </button>
      </div>
      {busy ? <p role="status">Aguardando confirmação do servidor…</p> : null}
      {erro ? (
        <p role="alert" className="text-red-600 dark:text-red-400">
          {erro}
        </p>
      ) : null}
      {status ? <p role="status">{status}</p> : null}
      {snapshot ? (
        <div className="space-y-3">
          <p>
            Revisão central exibida: <code className="break-all">{snapshot.revisao}</code>
          </p>
          <p>
            Última alteração: {snapshot.atualizadoPor.nome} — {snapshot.atualizadoEm}
          </p>
          <details className="rounded-lg border border-border p-3">
            <summary className="cursor-pointer font-semibold">
              Ver dados centrais consultados (somente leitura)
            </summary>
            <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words">
              {JSON.stringify(snapshot.conteudo, null, 2)}
            </pre>
          </details>
          <label htmlFor={confirmacaoId} className="inline-flex items-start gap-2">
            <input
              id={confirmacaoId}
              type="checkbox"
              checked={confirmado}
              disabled={busy || disabled || conflito || !consultado}
              onChange={(event) => setConfirmado(event.target.checked)}
            />
            Confirmo salvar os dados atuais desta tela sobre a revisão central consultada, sem
            enviar anexos.
          </label>
        </div>
      ) : null}
      {historico !== null ? (
        <div className="space-y-2">
          <h4 className="font-semibold">Histórico central — até 50 eventos por página</h4>
          <p className="text-muted">
            Eventos do mais antigo para o mais recente. {historico.eventos.length} evento(s)
            consultado(s). As próximas páginas são buscadas apenas ao clicar em “Carregar mais
            eventos”.
          </p>
          {historico.eventos.length === 0 ? (
            <p>Nenhum evento central encontrado.</p>
          ) : (
            <ol className="space-y-2">
              {historico.eventos.map((evento) => (
                <li key={evento.eventoId} className="rounded-lg border border-border p-3">
                  <p className="font-semibold">
                    {evento.operation === 'CRIAR'
                      ? 'Rascunho central criado'
                      : 'Rascunho central atualizado'}
                  </p>
                  <p>
                    {evento.depois.atualizadoPor.nome} — {evento.depois.atualizadoEm}
                  </p>
                  <details className="mt-2">
                    <summary className="cursor-pointer">Antes × depois (dados, sem anexos)</summary>
                    <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-words">
                      {JSON.stringify(
                        { antes: evento.antes?.conteudo ?? null, depois: evento.depois.conteudo },
                        null,
                        2
                      )}
                    </pre>
                  </details>
                </li>
              ))}
            </ol>
          )}
          {historico.temMais ? (
            <button
              type="button"
              disabled={busy || disabled}
              onClick={() => consultarHistorico(true)}
              className="rounded-lg border border-border px-3 py-2 font-semibold disabled:opacity-60"
            >
              Carregar mais eventos
            </button>
          ) : (
            <p className="text-muted">Não há mais eventos nesta consulta.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
