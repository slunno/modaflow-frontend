import type { PrecoMaterialLinx } from '../../../services/insumoLinxVinculos';
import { unidadeLinxNormalizada } from '../../../services/insumoLinxVinculos';
import { decimalManual } from '../../../services/fichaProcesso';

interface Props {
  precos: PrecoMaterialLinx[];
  unidade: string;
  onUsar: (preco: PrecoMaterialLinx) => void;
}

export function LinxMaterialPrecos({ precos, unidade, onUsar }: Props) {
  return (
    <section aria-label="Valores disponíveis no Linx" className="space-y-2">
      <h5 className="text-xs font-semibold text-primary">Valores do Linx</h5>
      <p className="text-[11px] text-muted">
        Referências filtradas pela cor e fornecedor. Escolha qual usar ou mantenha o preço manual.
        Nenhuma fonte tem prioridade automática; zero é exibido como cadastrado.
      </p>
      {precos.length === 0 && (
        <p role="status" className="text-xs text-muted">
          Não há valores cadastrados para esta seleção.
        </p>
      )}
      <div className="max-h-64 space-y-2 overflow-y-auto">
        {precos.map((preco) => {
          const unidadeCompativel =
            Boolean(preco.unidade) &&
            unidadeLinxNormalizada(preco.unidade) === unidadeLinxNormalizada(unidade);
          return (
            <div key={preco.id} className="rounded-lg border border-border p-3 text-xs">
              <p className="font-semibold text-primary">{preco.descricao}</p>
              <p className="mt-1 text-primary">
                R${' '}
                {(decimalManual(preco.valor) ?? 0).toLocaleString('pt-BR', {
                  minimumFractionDigits: 4,
                  maximumFractionDigits: 5,
                })}{' '}
                / {preco.unidade || 'unidade não informada'}
              </p>
              <p className="mt-1 break-all text-[10px] text-muted">Fonte: {preco.fonte}</p>
              {preco.fatorConversaoFornecedor != null && (
                <p className="text-[10px] text-muted">
                  Fator do fornecedor: {preco.fatorConversaoFornecedor}. Nenhuma conversão aplicada.
                </p>
              )}
              {!unidadeCompativel && (
                <p className="mt-1 text-[11px] text-muted">
                  A unidade não coincide com a do insumo. Revise a unidade ou informe o preço
                  manualmente.
                </p>
              )}
              <button
                type="button"
                disabled={!unidadeCompativel}
                onClick={() => onUsar(preco)}
                aria-label={`Usar valor de ${preco.descricao} — ${preco.fonte}`}
                className="mt-2 rounded-lg border border-border bg-surface-muted px-3 py-1.5 font-semibold text-primary hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                Usar este valor
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
