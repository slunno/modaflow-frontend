import { useEffect, useState } from 'react';
import type { PecaItem } from '../../../types/plm';
import type { FichaHistoricoVersao } from '../../../types/fichaHistorico';
import type { FichaAnexo } from '../../../services/fichaAnexosStorage';
import {
  conteudoAlteracoesLinx,
  resumoAlteracoesLinx,
} from '../../../services/fichaLinxAlteracoes';

interface ReferenciaLinx {
  recibo: string;
  resumo: string;
}
// Novo escopo; hashes antigos incluíam anexos e variantes que não vão ao ERP.
const PREFIXO = 'modaflow_ficha_linx_referencia_v2:';

function lerReferencia(chave: string): ReferenciaLinx | null {
  try {
    const valor = JSON.parse(localStorage.getItem(PREFIXO + chave) ?? 'null');
    return typeof valor?.recibo === 'string' && /^[a-f0-9]{64}$/.test(valor?.resumo)
      ? (valor as ReferenciaLinx)
      : null;
  } catch {
    return null;
  }
}

/** A base sobrevive ao salvamento local; só um recibo real substitui a referência. */
export function useFichaLinxAlteracoes({
  peca,
  referencia,
  anexos,
  chave,
  carregando,
}: {
  peca: PecaItem;
  referencia: PecaItem;
  anexos: FichaAnexo[];
  chave: string;
  carregando: boolean;
}) {
  const ultimaIntegracao = (peca.historicoIntegracoes ?? [])
    .filter(
      (item) =>
        item.pecaId === peca.id &&
        item.marcaId === peca.marcaId &&
        item.recibo.colecaoId === peca.colecaoId &&
        item.recibo.status === 'CONFIRMADA'
    )
    .reduce<FichaHistoricoVersao | undefined>(
      (ultima, item) => (!ultima || item.numero > ultima.numero ? item : ultima),
      undefined
    );
  const recibo = ultimaIntegracao?.recibo.integracaoId ?? 'PRIMEIRA_ABERTURA';
  const assinaturaAtual = conteudoAlteracoesLinx(peca, anexos);
  const assinaturaReferencia = conteudoAlteracoesLinx(
    ultimaIntegracao?.peca ?? referencia,
    ultimaIntegracao?.peca.fichaTecnica?.processo?.concluida?.anexosAssinatura ?? anexos
  );
  const [estado, setEstado] = useState({ assinatura: '', atual: '', referencia: '', erro: '' });

  useEffect(() => {
    if (carregando) return;
    let ativo = true;
    void Promise.all([
      resumoAlteracoesLinx(assinaturaAtual),
      resumoAlteracoesLinx(assinaturaReferencia),
    ])
      .then(([atual, baseInicial]) => {
        if (!ativo) return;
        const salva = lerReferencia(chave);
        const base = salva?.recibo === recibo ? salva.resumo : baseInicial;
        let erro = '';
        if (!salva || salva.recibo !== recibo) {
          try {
            localStorage.setItem(PREFIXO + chave, JSON.stringify({ recibo, resumo: base }));
          } catch {
            erro =
              'Não foi possível guardar a referência do Linx neste navegador. As alterações continuam disponíveis nesta sessão.';
          }
        }
        setEstado({ assinatura: assinaturaAtual, atual, referencia: base, erro });
      })
      .catch(() => {
        if (ativo)
          setEstado((anterior) => ({
            ...anterior,
            erro: 'Não foi possível conferir as alterações para o Linx. Reabra a ficha e tente novamente.',
          }));
      });
    return () => {
      ativo = false;
    };
  }, [assinaturaAtual, assinaturaReferencia, chave, recibo, carregando]);

  return {
    carregando: carregando || !estado.referencia,
    temAlteracoes:
      !!estado.referencia &&
      (estado.assinatura === assinaturaAtual ? estado.atual !== estado.referencia : true),
    erro: estado.erro,
  };
}
