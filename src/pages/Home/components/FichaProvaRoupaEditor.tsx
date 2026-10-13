import type { FichaProvaRoupa } from '../../../types/ficha';
import type { Dispatch, SetStateAction } from 'react';
import { FichaImageUpload } from './FichaImageUpload';

export function FichaProvaRoupaEditor({
  value,
  onChange,
}: {
  value: FichaProvaRoupa;
  onChange: Dispatch<SetStateAction<FichaProvaRoupa>>;
}) {
  return (
    <section
      aria-label="Prova de roupa"
      className="rounded-xl border border-border bg-surface p-6 space-y-5"
    >
      <h3 className="font-bold">Prova de roupa</h3>
      <div className="akr-form-grid">
        <label className="akr-field">
          Responsável pela prova
          <input
            value={value.responsavel ?? ''}
            onChange={(e) => onChange((previous) => ({ ...previous, responsavel: e.target.value }))}
          />
        </label>
        <label className="akr-field">
          Resultado da prova
          <select
            value={value.resultado ?? 'aguardando'}
            onChange={(e) =>
              onChange((previous) => ({
                ...previous,
                resultado: e.target.value as FichaProvaRoupa['resultado'],
              }))
            }
          >
            <option value="aguardando">Aguardando aprovação</option>
            <option value="aprovada">Aprovada</option>
            <option value="ajustes">Requer ajustes</option>
            <option value="reprovada">Reprovada</option>
          </select>
        </label>
      </div>
      <label className="akr-field">
        Pendências da prova
        <textarea
          value={value.pendencias ?? ''}
          onChange={(e) => onChange((previous) => ({ ...previous, pendencias: e.target.value }))}
        />
      </label>
      <label className="block text-xs font-semibold">
        Data da prova
        <input
          type="date"
          value={value.data}
          onChange={(event) => {
            const data = event.target.value;
            onChange((previous) => ({ ...previous, data }));
          }}
          className="block mt-1 rounded-lg border border-border bg-surface-muted px-3 py-2"
        />
      </label>
      <label className="block text-xs font-semibold">
        Observações da prova
        <textarea
          value={value.observacoes}
          rows={4}
          onChange={(event) => {
            const observacoes = event.target.value;
            onChange((previous) => ({ ...previous, observacoes }));
          }}
          className="block w-full mt-1 rounded-lg border border-border bg-surface-muted px-3 py-2"
        />
      </label>
      <div className="grid sm:grid-cols-2 gap-4">
        {value.fotos.map((foto) => (
          <FichaImageUpload
            key={foto.id}
            label={`Foto de experimentação — ${foto.nome}`}
            value={foto.imagemUrl}
            onChange={(url, fileName) =>
              onChange((previous) => ({
                ...previous,
                fotos: url
                  ? previous.fotos.map((item) =>
                      item.id === foto.id
                        ? { ...item, imagemUrl: url, nome: fileName ?? item.nome }
                        : item
                    )
                  : previous.fotos.filter((item) => item.id !== foto.id),
              }))
            }
          />
        ))}
        <FichaImageUpload
          label="Adicionar foto de experimentação"
          onChange={(url, fileName) => {
            if (url)
              onChange((previous) => ({
                ...previous,
                fotos: [
                  ...previous.fotos,
                  {
                    id: crypto.randomUUID(),
                    nome: fileName ?? 'Foto de experimentação',
                    imagemUrl: url,
                  },
                ],
              }));
          }}
        />
      </div>
      <p className="text-xs text-muted">
        Clique ou arraste uma foto de até 2 MB. O salvamento automático guarda a data, as
        observações e as fotos na ficha. Confira o estado do salvamento no cabeçalho.
      </p>
    </section>
  );
}
