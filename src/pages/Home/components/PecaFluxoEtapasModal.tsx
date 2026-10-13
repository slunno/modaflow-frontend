import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';
import type { UserRecord } from '../../../types/gestao';
import type { PecaItem } from '../../../types/plm';
import { exigeConferencia, validarConferenciaServidor } from '../../../services/fichaProcesso';
import { FichaConferenciaPanel } from './FichaConferenciaPanel';
import type { FichaConferencia } from '../../../types/fichaProcesso';
import type { FichaVariante } from '../../../types/ficha';
import { ETAPAS_FLUXO, FLUXOS } from '../../../services/fichaFluxos';

interface PecaFluxoEtapasModalProps {
  peca: PecaItem;
  etapaDestino?: string;
  etapasDisponiveis?: string[];
  marcaId: string;
  marcaNome: string;
  usuarios: UserRecord[];
  usuariosCarregando?: boolean;
  erroUsuarios?: string;
  onTentarCarregarUsuarios?: () => void;
  onClose: () => void;
  onSave: (peca: PecaItem) => void | Promise<void>;
  onCorrigir?: (
    aba?: 'geral' | 'tecidos' | 'aviamentos',
    varianteId?: string,
    candidata?: PecaItem
  ) => void;
  onConferenciaChange?: (conferencia: FichaConferencia) => void;
  onVariantesChange?: (variantes: FichaVariante[]) => void;
}

const toDateInput = (value?: string) => {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = value?.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : '';
};

const toDisplayDate = (value: string) => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : '—';
};

export const PecaFluxoEtapasModal: React.FC<PecaFluxoEtapasModalProps> = ({
  peca,
  etapaDestino,
  etapasDisponiveis,
  marcaId,
  marcaNome,
  usuarios,
  usuariosCarregando = false,
  erroUsuarios = '',
  onTentarCarregarUsuarios,
  onClose,
  onSave,
  onCorrigir,
  onConferenciaChange,
  onVariantesChange,
}) => {
  const [fluxo, setFluxo] = useState(peca.fluxo || '');
  const [etapa, setEtapa] = useState(
    etapaDestino ?? (peca.etapaAtual === '—' ? '' : peca.etapaAtual)
  );
  const [responsavel, setResponsavel] = useState(peca.responsavel || '');
  const [dataEstimada, setDataEstimada] = useState(toDateInput(peca.previsaoEntrega));
  const [observacoes, setObservacoes] = useState(peca.observacaoEtapa || '');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [conferencia, setConferencia] = useState(peca.fichaTecnica?.conferencia ?? {});
  const [variantes, setVariantes] = useState(peca.fichaTecnica?.variantes ?? []);
  const candidata: PecaItem = {
    ...peca,
    fichaTecnica: { ...peca.fichaTecnica, conferencia, variantes },
  };
  const dialogRef = useRef<HTMLFormElement>(null);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    const anterior = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>('button, select, input')?.focus();
    return () => {
      mountedRef.current = false;
      anterior?.focus();
    };
  }, []);

  const responsaveisElegiveis = useMemo(
    () =>
      usuarios.filter((usuario) => {
        if (usuario.status !== 'Ativo' || usuario.acesso !== 'Permitido') return false;
        return usuario.brandRoles.some(
          (role) =>
            (role.marcaId === marcaId || role.marcaNome === marcaNome) && role.cargo !== 'Nenhum'
        );
      }),
    [marcaId, marcaNome, usuarios]
  );
  const corrigir = (aba?: 'geral' | 'tecidos' | 'aviamentos', varianteId?: string) => {
    try {
      onCorrigir?.(aba, varianteId, candidata);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível guardar a conferência.');
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      if (exigeConferencia(peca.etapaAtual, etapa || '—')) {
        if (!responsaveisElegiveis.some((usuario) => usuario.nome === responsavel))
          throw new Error('Selecione um responsável ativo e com acesso à marca antes de entregar.');
        await validarConferenciaServidor(candidata, marcaId);
      }
      if (!mountedRef.current) return;
      await onSave({
        ...candidata,
        fluxo: fluxo || undefined,
        etapaAtual: etapa || '—',
        responsavel: responsavel || undefined,
        responsavelId: responsaveisElegiveis.find((u) => u.nome === responsavel)?.id,
        previsaoEntrega: dataEstimada ? toDisplayDate(dataEstimada) : '—',
        observacaoEtapa: observacoes.trim() || undefined,
      });
      onClose();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível salvar a movimentação.');
    } finally {
      if (mountedRef.current) setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/60 p-4 backdrop-blur-xs">
      <form
        onSubmit={handleSave}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={etapaDestino ? 'Avançar etapa' : 'Fluxos de etapas'}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && !salvando) onClose();
          if (event.key !== 'Tab') return;
          const controles = Array.from(
            dialogRef.current?.querySelectorAll<HTMLElement>(
              'button:not(:disabled), select:not(:disabled), input:not(:disabled), textarea:not(:disabled)'
            ) ?? []
          );
          const primeiro = controles[0];
          const ultimo = controles[controles.length - 1];
          if (event.shiftKey && document.activeElement === primeiro) {
            event.preventDefault();
            ultimo?.focus();
          } else if (!event.shiftKey && document.activeElement === ultimo) {
            event.preventDefault();
            primeiro?.focus();
          }
        }}
        className={`w-full ${etapaDestino ? 'max-w-3xl' : 'max-w-5xl'} max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-surface shadow-xl animate-in fade-in zoom-in-95 duration-200`}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-bold text-primary">
            {etapaDestino ? 'Avançar etapa' : 'Fluxos de etapas'}
          </h2>
          <button
            type="button"
            aria-label="Fechar fluxos de etapas"
            disabled={salvando}
            onClick={onClose}
            className="text-muted hover:text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div
          className={
            etapaDestino ? 'p-6 pb-4' : 'grid grid-cols-1 gap-6 p-6 md:grid-cols-[150px_1fr]'
          }
        >
          {!etapaDestino && (
            <aside className="border-b border-border-muted pb-4 md:border-r md:border-b-0 md:pb-0 md:pr-5">
              <div className="flex items-center gap-2 text-sm font-bold text-primary">
                <CheckCircle2 className="h-4 w-4 text-accent-camel" /> Início
              </div>
              <select
                value={fluxo}
                onChange={(event) => setFluxo(event.target.value)}
                disabled={salvando}
                className="mt-3 w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-xs text-primary"
              >
                <option value="">-- Outro fluxo --</option>
                {(etapasDisponiveis ? [peca.fluxo || 'Fluxo configurado'] : FLUXOS).map(
                  (option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  )
                )}
              </select>
              <div className="mt-5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-muted" /> {etapa || 'Selecione a etapa'}
              </div>
            </aside>
          )}
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-md border border-blue-100 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 px-3 py-2 text-xs text-muted-foreground">
              <Info className="h-4 w-4 text-blue-500" />
              {etapaDestino
                ? `${peca.etapaAtual || 'Inicial'} → ${etapaDestino}. Confirme a entrega.`
                : 'Confirme os detalhes dessa movimentação.'}
            </div>
            <div
              className={
                etapaDestino ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 gap-4 md:grid-cols-2'
              }
            >
              {!etapaDestino && (
                <label className="space-y-1.5 text-xs font-semibold text-primary">
                  Nova Etapa
                  <select
                    value={etapa}
                    onChange={(event) => setEtapa(event.target.value)}
                    disabled={salvando || !!etapaDestino}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 font-medium text-primary"
                  >
                    <option value="">Escolha ou digite uma etapa</option>
                    {(etapasDisponiveis ?? ETAPAS_FLUXO).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="space-y-1.5 text-xs font-semibold text-primary">
                Responsável
                <select
                  value={responsavel}
                  onChange={(event) => setResponsavel(event.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 font-medium text-primary disabled:cursor-not-allowed disabled:bg-surface-muted"
                  disabled={salvando || responsaveisElegiveis.length === 0}
                >
                  <option value="">
                    {usuariosCarregando
                      ? 'Carregando usuários…'
                      : responsaveisElegiveis.length
                        ? 'Escolher responsável'
                        : 'Nenhum usuário elegível para esta marca'}
                  </option>
                  {responsaveisElegiveis.map((usuario) => (
                    <option key={usuario.id} value={usuario.nome}>
                      {usuario.nome}
                    </option>
                  ))}
                </select>
                {erroUsuarios && (
                  <span className="block space-y-1 font-normal text-red-700" role="alert">
                    <span>{erroUsuarios}</span>{' '}
                    <button
                      type="button"
                      className="font-semibold underline"
                      onClick={onTentarCarregarUsuarios}
                      disabled={usuariosCarregando || salvando}
                    >
                      Tentar novamente
                    </button>
                  </span>
                )}
                {!usuariosCarregando && !erroUsuarios && responsaveisElegiveis.length === 0 && (
                  <span className="block font-normal text-muted" role="status">
                    Não há usuário ativo com acesso e função cadastrados nesta marca.
                  </span>
                )}
              </label>
            </div>
            {!etapaDestino && (
              <>
                <label className="block space-y-1.5 text-xs font-semibold text-primary">
                  Data estimada
                  <input
                    type="date"
                    value={dataEstimada}
                    onChange={(event) => setDataEstimada(event.target.value)}
                    disabled={salvando}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 font-medium text-primary"
                  />
                </label>
                <label className="block space-y-1.5 text-xs font-semibold text-primary">
                  Observações
                  <textarea
                    value={observacoes}
                    onChange={(event) => setObservacoes(event.target.value)}
                    disabled={salvando}
                    placeholder="Descreva..."
                    className="min-h-24 w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 font-medium text-primary"
                  />
                </label>
              </>
            )}
          </div>
        </div>
        {exigeConferencia(peca.etapaAtual, etapa || '—') && (
          <fieldset disabled={salvando} className="px-6 pb-4">
            <FichaConferenciaPanel
              resumido
              peca={candidata}
              onChange={(value) => {
                setConferencia(value);
                onConferenciaChange?.(value);
                setErro('');
              }}
              onVariantesChange={(value) => {
                setVariantes(value);
                onVariantesChange?.(value);
                setErro('');
              }}
              onCorrigir={corrigir}
            />
          </fieldset>
        )}
        {erro && (
          <div role="alert" className="px-6 pb-4 text-sm space-y-2">
            <p className="whitespace-pre-wrap">{erro}</p>
            {onCorrigir && (
              <button type="button" className="underline font-semibold" onClick={() => corrigir()}>
                Corrigir na ficha técnica
              </button>
            )}
          </div>
        )}
        <div className="flex justify-end gap-3 border-t border-border bg-surface-muted/30 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={salvando}
            className="rounded-lg border border-border px-4 py-2 text-xs font-bold text-primary hover:bg-surface-muted"
          >
            Fechar
          </button>
          <button
            type="submit"
            disabled={salvando}
            className="rounded-lg bg-accent-camel px-5 py-2 text-xs font-bold text-on-camel hover:bg-accent-camel/90"
          >
            {salvando ? 'Conferindo…' : etapaDestino ? 'Confirmar avanço' : 'Salvar movimentação'}
          </button>
        </div>
      </form>
    </div>
  );
};
