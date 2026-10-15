import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { FichaCustosView } from '../../../src/pages/Home/components/FichaCustosView';
import { FichaPrecificacaoEditor } from '../../../src/pages/Home/components/FichaPrecificacaoEditor';
import type { FichaVariante } from '../../../src/types/ficha';
import type { LinxFichaCustos } from '../../../src/types/linx';
import snapshot from './linx-validacao.json';
import '../../../src/index.css';
const dados = snapshot as LinxFichaCustos;
const storageKey = 'modaflow-preview-custos-v2';
const inicial: FichaVariante[] = [
  { id: 'principal', nome: 'Principal', tecidos: [], aviamentos: [] },
  { id: 'segunda', nome: 'Variante 2', tecidos: [], aviamentos: [], custos: { posicao: 2 } },
];
export function Preview() {
  const [variantes, setVariantes] = useState<FichaVariante[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? 'null') ?? inicial;
    } catch {
      return inicial;
    }
  });
  const [varianteId, setVarianteId] = useState('principal');
  const [aba, setAba] = useState('custos');
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(variantes));
  }, [variantes]);
  const variante = variantes.find((item) => item.id === varianteId)!;
  return (
    <main className="mx-auto max-w-4xl space-y-3 p-6 text-primary">
      <h1 className="text-sm font-semibold">Ficha AC01701J — Custos</h1>
      <p className="text-[11px] text-muted">
        Validação visual com dados consultados no Linx em 07/10/2026. Ajustes deste preview ficam no
        navegador.
      </p>
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface p-3 text-xs">
        <label>
          Variante dos custos{' '}
          <select
            className="ml-2 rounded border border-border p-1"
            value={variante.id}
            onChange={(e) => setVarianteId(e.target.value)}
          >
            {variantes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nome}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => setAba('custos')}
          className="rounded border border-border px-2 py-1"
        >
          Custos
        </button>
        <button
          type="button"
          onClick={() => setAba('precificacao')}
          className="rounded border border-border px-2 py-1"
        >
          Precificação
        </button>
      </div>
      {aba === 'custos' ? (
        <FichaCustosView
          variante={variante}
          variantes={variantes}
          linxDados={dados}
          onEditInsumos={() => {}}
          onChange={(custos) =>
            setVariantes((prev) =>
              prev.map((item) => (item.id === variante.id ? { ...item, custos } : item))
            )
          }
        />
      ) : (
        <FichaPrecificacaoEditor
          variante={variante}
          custosLinx={dados}
          onChange={(precificacao) =>
            setVariantes((prev) =>
              prev.map((item) => (item.id === variante.id ? { ...item, precificacao } : item))
            )
          }
        />
      )}
    </main>
  );
}
createRoot(document.getElementById('root')!).render(<Preview />);
