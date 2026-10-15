import type { PecaItem } from '../../../types/plm';
import { useState } from 'react';

export function FichaAlteracoesPanel({ peca }: { peca: PecaItem }) {
  const events = peca.historicoAlteracoes ?? [];
  const [field, setField] = useState('');
  const [user, setUser] = useState('');
  const fields = [...new Set(events.flatMap((event) => event.campos.map((item) => item.campo)))];
  const users = [
    ...new Set(
      events.map((event) => event.responsavel.nome).filter((name): name is string => !!name)
    ),
  ];
  const filtered = events.filter(
    (event) =>
      (!user || event.responsavel.nome === user) &&
      (!field || event.campos.some((item) => item.campo === field))
  );
  return (
    <section
      aria-label="Histórico de alterações locais"
      className="rounded-xl border border-border bg-surface p-5 space-y-4 text-xs"
    >
      <h3 className="text-sm font-bold">Histórico de alterações</h3>
      <p className="text-muted">
        Ações salvas no portal. Apenas os campos modificados são mostrados; estes registros não
        criam versões no Linx.
      </p>
      {!!events.length && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            Filtrar por campo
            <select
              className="block w-full rounded-control border border-border bg-surface-muted p-2"
              value={field}
              onChange={(event) => setField(event.target.value)}
            >
              <option value="">Todos os campos</option>
              {fields.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            Filtrar por responsável
            <select
              className="block w-full rounded-control border border-border bg-surface-muted p-2"
              value={user}
              onChange={(event) => setUser(event.target.value)}
            >
              <option value="">Todos os responsáveis</option>
              {users.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
        </div>
      )}
      {!events.length ? (
        <p>
          Nenhuma alteração local registrada. A data e o autor de criações anteriores a este recurso
          não serão presumidos.
        </p>
      ) : (
        <ol className="space-y-4 border-l-2 border-accent-camel/30 pl-4">
          {[...filtered].reverse().map((event) => (
            <li
              key={event.id}
              className="relative rounded-card border border-border p-4 space-y-3 before:absolute before:-left-[23px] before:top-6 before:h-3 before:w-3 before:rounded-full before:bg-accent-camel"
            >
              <h4 className="font-bold">{event.titulo}</h4>
              {event.tipo === 'criacao' && <p>Peça: {event.nomePeca}</p>}
              <p className="text-muted">
                <time dateTime={event.registradoEm}>
                  {new Intl.DateTimeFormat('pt-BR', {
                    dateStyle: 'short',
                    timeStyle: 'medium',
                    timeZone: 'America/Sao_Paulo',
                  }).format(new Date(event.registradoEm))}
                </time>
                {' · '}
                {event.responsavel.nome || 'Usuário não identificado'}
              </p>
              {!!event.campos.length && (
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed text-left">
                    <caption className="sr-only">Antes e depois — {event.titulo}</caption>
                    <thead>
                      <tr className="border-b border-border">
                        <th scope="col" className="p-2">
                          Campo
                        </th>
                        <th scope="col" className="p-2">
                          Antes
                        </th>
                        <th scope="col" className="p-2">
                          Depois
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {event.campos
                        .filter((item) => !field || item.campo === field)
                        .map((campo, index) => (
                          <tr
                            key={index}
                            className="border-b border-border last:border-0 align-top"
                          >
                            <th scope="row" className="p-2 font-medium break-words">
                              {campo.campo}
                            </th>
                            <td className="p-2 whitespace-pre-wrap break-words text-muted">
                              {campo.antes}
                            </td>
                            <td className="p-2 whitespace-pre-wrap break-words">{campo.depois}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
      {!!events.length && !filtered.length && (
        <p role="status">Nenhuma alteração corresponde aos filtros.</p>
      )}
    </section>
  );
}
