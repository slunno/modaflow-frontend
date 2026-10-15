import { useEffect, useRef, useState } from 'react';
import type { LinxFichaDetalhe, LinxFichaVersao, LinxGriffe } from '../../../types/linx';
import type { LinxGradeDetalhe } from '../../../types/fichaLinxMapeamento';
import type { LinxWriteIdentity } from '../../../types/linxGravacao';
import {
  getLinxFichaDetalhe,
  getLinxGradeDetalhe,
  getLinxFichaReferencias,
} from '../../../services/linxService';
import { Button } from '../../../components/ui/FichaPrimitives';

export function LinxReferencePicker({
  codigo,
  griffe,
  bloqueado,
  onApply,
}: {
  codigo: string;
  griffe?: LinxGriffe;
  bloqueado: boolean;
  onApply: (
    source: LinxWriteIdentity,
    ficha: LinxFichaDetalhe,
    grade: LinxGradeDetalhe
  ) => Promise<void>;
}) {
  const [options, setOptions] = useState<Array<{ versao: LinxFichaVersao; grade: string | null }>>(
    []
  );
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState('');
  const latest = useRef('');
  const key = JSON.stringify([codigo.trim(), griffe]);
  useEffect(() => {
    latest.current = key;
  }, [key]);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const search = async () => {
    if (!griffe || !codigo.trim()) return;
    const candidate = key;
    setBusy(true);
    setError('');
    setSelected('');
    setOptions([]);
    try {
      const result = await getLinxFichaReferencias(codigo.trim(), griffe);
      if (!mounted.current || latest.current !== candidate) return;
      const matches = result.filter(
        (item) =>
          item.versao.produto === codigo.trim() &&
          item.versao.colecaoCodigo &&
          item.versao.colecaoNome &&
          item.grade
      );
      setOptions(matches);
      setSearched(candidate);
      if (!matches.length)
        setError(
          'Nenhuma referência ativa com esse código, griffe, coleção e grade foi encontrada. Nenhum cadastro será inventado.'
        );
    } catch (cause) {
      if (mounted.current)
        setError(
          cause instanceof Error ? cause.message : 'Não foi possível consultar a referência.'
        );
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  const apply = async () => {
    const product = options.find(
      (item) => `${item.versao.colecaoCodigo}|${item.versao.versao}` === selected
    );
    if (
      !product?.versao.colecaoCodigo ||
      !product.versao.colecaoNome ||
      !product.grade ||
      !griffe ||
      searched !== key
    )
      return;
    const candidate = key;
    setBusy(true);
    setError('');
    try {
      const [ficha, grade] = await Promise.all([
        getLinxFichaDetalhe(
          codigo.trim(),
          product.versao.versao,
          griffe,
          product.versao.colecaoCodigo,
          product.versao.colecaoNome
        ),
        getLinxGradeDetalhe(product.grade),
      ]);
      if (!mounted.current || latest.current !== candidate) return;
      if (ficha.versao.produto !== codigo.trim())
        throw new Error('A referência recebida não corresponde ao código.');
      await onApply(
        {
          produto: codigo.trim(),
          griffe,
          colecao: product.versao.colecaoCodigo,
          descColecao: product.versao.colecaoNome,
          versao: ficha.versao.versao,
        },
        ficha,
        grade
      );
      if (mounted.current) {
        setOptions([]);
        setSelected('');
      }
    } catch (cause) {
      if (mounted.current)
        setError(cause instanceof Error ? cause.message : 'Falha ao carregar a referência.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  return (
    <section aria-label="Referência de outra coleção" className="mt-2 space-y-2 text-xs">
      <Button
        disabled={busy || bloqueado || !codigo.trim() || !griffe}
        onClick={() => void search()}
      >
        Buscar ficha de referência no Linx
      </Button>
      <p className="text-muted">
        Copia somente para este rascunho. A origem não é editada; a integração criará outra versão
        na coleção aberta.
      </p>
      {bloqueado && (
        <p>
          Para preservar os dados já preenchidos, a importação está disponível apenas com tecidos e
          aviamentos vazios.
        </p>
      )}
      {!!options.length && searched === key && (
        <>
          <label className="block">
            Coleção da referência
            <select
              className="w-full rounded-control border border-border p-2"
              value={selected}
              disabled={busy}
              onChange={(event) => setSelected(event.target.value)}
            >
              <option value="">Selecione a coleção de origem</option>
              {options.map((item) => (
                <option
                  key={`${item.versao.colecaoCodigo}|${item.versao.versao}`}
                  value={`${item.versao.colecaoCodigo}|${item.versao.versao}`}
                >
                  {item.versao.colecaoNome} ({item.versao.colecaoCodigo}) · versão{' '}
                  {item.versao.versao}
                </option>
              ))}
            </select>
          </label>
          <Button disabled={busy || !selected || bloqueado} onClick={() => void apply()}>
            Copiar referência para esta peça
          </Button>
        </>
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
