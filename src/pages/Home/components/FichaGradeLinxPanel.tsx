import { useEffect, useRef, useState } from 'react';
import type { LinxGradeDetalhe } from '../../../types/fichaLinxMapeamento';
import { getLinxGradeDetalhe } from '../../../services/linxService';
import { conferirGradeLinx } from '../../../services/fichaLinxMapeamento';

interface Props {
  grade: string;
  tamanhos: string[];
  value?: LinxGradeDetalhe;
  onChange: (detalhe: LinxGradeDetalhe) => void;
  onUsarTamanhos: (tamanhos: string[]) => void;
}

/** Consulta por ação explícita; nunca troca os tamanhos digitados ao receber HTTP. */
export function FichaGradeLinxPanel({ grade, tamanhos, value, onChange, onUsarTamanhos }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const detalhe = value?.grade === grade.trim() ? value : undefined;
  const resultado = conferirGradeLinx(grade, tamanhos, detalhe);
  const gradeValida = !resultado.pendencias.some((p) => p.includes('inválida'));
  const posicoes =
    gradeValida && Array.isArray(detalhe?.posicoes)
      ? detalhe.posicoes.filter((p) => p.tamanho !== null).toSorted((a, b) => a.posicao - b.posicao)
      : [];
  const podeUsar =
    !!posicoes.length &&
    !resultado.pendencias.some((p) => p.includes('inválida') || p.includes('repete'));
  const consultar = async () => {
    if (loading || !grade.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await getLinxGradeDetalhe(grade);
      if (!data || data.grade !== grade.trim() || !Array.isArray(data.posicoes))
        throw new Error('A resposta não corresponde à grade solicitada.');
      if (conferirGradeLinx(grade, [], data).pendencias.some((p) => p.includes('inválida')))
        throw new Error('Resposta de grade inválida; nenhuma posição será utilizada.');
      if (mounted.current) onChange(data);
    } catch (cause) {
      if (mounted.current)
        setError(
          cause instanceof Error ? cause.message : 'Não foi possível consultar a grade Linx.'
        );
    } finally {
      if (mounted.current) setLoading(false);
    }
  };
  return (
    <section
      aria-label="Conferência da grade Linx"
      className="rounded-lg border border-border p-4 space-y-3 text-xs"
    >
      <h4 className="font-semibold">Posições da grade no Linx</h4>
      <p className="text-muted">
        Consulta somente leitura. Os campos C1…C48 seguem as posições do cadastro, não a ordem de
        seleção do portal. Seus consumos permanecem preservados.
      </p>
      <p className="text-muted">
        Salve a grade consultada pelo botão Atualizar/Salvar da ficha. Este retrato local precisará
        ser validado novamente no ERP antes da integração.
      </p>
      <button
        type="button"
        disabled={loading || !grade.trim()}
        onClick={consultar}
        className="rounded-lg border border-border px-3 py-2 disabled:opacity-50"
      >
        {loading ? 'Consultando grade…' : 'Consultar posições da grade'}
      </button>
      {error && (
        <p role="alert" className="text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {resultado.avisos.map((aviso) => (
        <p key={aviso} className="text-muted">
          {aviso}
        </p>
      ))}
      {resultado.pendencias.length > 0 && (
        <ul className="list-disc pl-4">
          {resultado.pendencias.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
      {posicoes.length > 0 && (
        <>
          <div className="max-h-52 overflow-auto">
            <table className="w-full text-left">
              <caption className="sr-only">Tamanhos e campos de consumo da grade {grade}</caption>
              <thead>
                <tr>
                  <th>Tamanho Linx</th>
                  <th>Campo</th>
                  <th>Selecionado no portal</th>
                </tr>
              </thead>
              <tbody>
                {posicoes.map((p) => (
                  <tr key={p.posicao} className="border-t border-border">
                    <td className="py-1">{p.tamanho}</td>
                    <td>C{p.posicao}</td>
                    <td>{tamanhos.includes(p.tamanho!) ? 'Sim' : 'Não'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            disabled={!podeUsar || loading}
            onClick={() => onUsarTamanhos(posicoes.map((p) => p.tamanho!))}
            className="rounded-lg bg-accent-camel px-3 py-2 font-semibold text-on-camel disabled:opacity-50"
          >
            Usar tamanhos desta grade
          </button>
          <p className="text-muted">
            Este botão substitui somente a seleção de tamanhos. Valores de insumos fora da nova
            grade não são apagados; a confirmação de grade precisa ser refeita.
          </p>
        </>
      )}
    </section>
  );
}
