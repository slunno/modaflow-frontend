import React, { useMemo, useState } from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';
import type { UserRecord } from '../../../types/gestao';
import type { PecaItem } from '../../../types/plm';

const FLUXOS = ['Direto', 'OP CM', 'Perene', 'Piloto'];

const ETAPAS_FLUXO = [
  '01 geração de ficha',
  '02 engenharia recebimento',
  '03 modelagem',
  '04 mini risco / consumo',
  '05 checagem de MP Linx',
  '06 aguardando tecido fornecedor',
  '07 estoque de tecidos matriz',
  '08 revisão/integração + geração de OP',
  '09 encaixe / risco',
  '10 corte',
  '11 estamparia',
  '12 bordado',
  '13 estoque de aviamentos',
  '14 pilotagem/costura',
  '15 CD lavanderia',
  '16 lavanderia',
  '17 acabamento',
  '18 pré-custo e sequência operacional',
  '19 aprovação da piloto',
  '20 Final',
  '21 Inicial',
  '22 Integração Linx',
  '23 Revisar ficha técnica / liberar mostruário',
];

interface PecaFluxoEtapasModalProps {
  peca: PecaItem;
  marcaId: string;
  marcaNome: string;
  usuarios: UserRecord[];
  onClose: () => void;
  onSave: (peca: PecaItem) => void;
}

const toDateInput = (value?: string) => {
  const match = value?.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : '';
};

const toDisplayDate = (value: string) => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : '—';
};

export const PecaFluxoEtapasModal: React.FC<PecaFluxoEtapasModalProps> = ({
  peca,
  marcaId,
  marcaNome,
  usuarios,
  onClose,
  onSave,
}) => {
  const [fluxo, setFluxo] = useState(peca.fluxo || '');
  const [etapa, setEtapa] = useState(peca.etapaAtual === '—' ? '' : peca.etapaAtual);
  const [responsavel, setResponsavel] = useState(peca.responsavel || '');
  const [dataEstimada, setDataEstimada] = useState(toDateInput(peca.previsaoEntrega));
  const [observacoes, setObservacoes] = useState(peca.observacaoEtapa || '');

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

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    onSave({
      ...peca,
      fluxo: fluxo || undefined,
      etapaAtual: etapa || '—',
      responsavel: responsavel || undefined,
      previsaoEntrega: dataEstimada ? toDisplayDate(dataEstimada) : '—',
      observacaoEtapa: observacoes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/60 p-4 backdrop-blur-xs">
      <form
        onSubmit={handleSave}
        className="w-full max-w-5xl overflow-hidden rounded-xl border border-border bg-surface shadow-xl animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-bold text-primary">Fluxos de etapas</h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-[150px_1fr]">
          <aside className="border-b border-border-muted pb-4 md:border-r md:border-b-0 md:pb-0 md:pr-5">
            <div className="flex items-center gap-2 text-sm font-bold text-primary">
              <CheckCircle2 className="h-4 w-4 text-accent-camel" /> Início
            </div>
            <select
              value={fluxo}
              onChange={(event) => setFluxo(event.target.value)}
              className="mt-3 w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-xs text-primary"
            >
              <option value="">-- Outro fluxo --</option>
              {FLUXOS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="mt-5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-muted" /> {etapa || 'Selecione a etapa'}
            </div>
          </aside>
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-muted-foreground">
              <Info className="h-4 w-4 text-blue-500" /> Confirme os detalhes dessa movimentação.
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-1.5 text-xs font-semibold text-primary">
                Nova Etapa
                <select
                  value={etapa}
                  onChange={(event) => setEtapa(event.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 font-medium text-primary"
                >
                  <option value="">Escolha ou digite uma etapa</option>
                  {ETAPAS_FLUXO.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 text-xs font-semibold text-primary">
                Responsável
                <select
                  value={responsavel}
                  onChange={(event) => setResponsavel(event.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 font-medium text-primary disabled:cursor-not-allowed disabled:bg-surface-muted"
                  disabled={responsaveisElegiveis.length === 0}
                >
                  <option value="">
                    {responsaveisElegiveis.length
                      ? 'Escolher responsável'
                      : 'Nenhum usuário elegível'}
                  </option>
                  {responsaveisElegiveis.map((usuario) => (
                    <option key={usuario.id} value={usuario.nome}>
                      {usuario.nome}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block space-y-1.5 text-xs font-semibold text-primary">
              Data estimada
              <input
                type="date"
                value={dataEstimada}
                onChange={(event) => setDataEstimada(event.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 font-medium text-primary"
              />
            </label>
            <label className="block space-y-1.5 text-xs font-semibold text-primary">
              Observações
              <textarea
                value={observacoes}
                onChange={(event) => setObservacoes(event.target.value)}
                placeholder="Descreva..."
                className="min-h-24 w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 font-medium text-primary"
              />
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-border bg-surface-muted/30 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-xs font-bold text-primary hover:bg-surface-muted"
          >
            Fechar
          </button>
          <button
            type="submit"
            className="rounded-lg bg-accent-camel px-5 py-2 text-xs font-bold text-white hover:bg-accent-camel/90"
          >
            Salvar movimentação
          </button>
        </div>
      </form>
    </div>
  );
};
