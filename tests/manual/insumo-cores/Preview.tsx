import { useState } from 'react';
import { CriarTecidoModal } from '../../../src/pages/Gestao/modals/CriarTecidoModal';
import type { TecidoInsumoItem } from '../../../src/types/gestao';
import '../../../src/pages/Home/components/fichaSubmenus.css';

export function Preview() {
  const tipo =
    new URLSearchParams(location.search).get('tipo') === 'aviamento' ? 'aviamento' : 'tecido';
  const [aberto, setAberto] = useState(true);
  const [salvo, setSalvo] = useState<TecidoInsumoItem | null>(null);
  return (
    <main className="ficha-tecnica min-h-screen bg-surface-muted p-8 text-primary">
      <h1 className="text-xl font-semibold">Painel de cores — dados simulados</h1>
      <p className="my-4 text-sm">Código de teste: TESTE-CORES. Nada é enviado ao Linx.</p>
      <button className="rounded border border-border p-3" onClick={() => setAberto(true)}>
        Reabrir cadastro
      </button>
      {salvo && <pre className="mt-4 whitespace-pre-wrap">{JSON.stringify(salvo, null, 2)}</pre>}
      <CriarTecidoModal
        isOpen={aberto}
        editingTecido={salvo}
        tipo={tipo}
        onClose={() => setAberto(false)}
        onSave={(item) => {
          setSalvo(item);
          setAberto(false);
        }}
      />
    </main>
  );
}
