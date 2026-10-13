import type { ColecaoItem, PecaItem } from '../types/plm';
import type { FichaIntegracaoConfirmada, FichaHistoricoVersao } from '../types/fichaHistorico';

export function getHistoricoDaPeca(peca: PecaItem, colecao: ColecaoItem): FichaHistoricoVersao[] {
  if (colecao.regraFicha !== 'integracao-colecao-v1') return [];
  return (peca.historicoIntegracoes ?? []).filter(
    (item) =>
      item.pecaId === peca.id &&
      item.marcaId === peca.marcaId &&
      item.recibo.colecaoId === colecao.id
  );
}

/** Preparação para o retorno da futura integração. Não chama nem simula o Linx. */
export function registrarIntegracaoConfirmada(
  peca: PecaItem,
  colecao: ColecaoItem,
  recibo: FichaIntegracaoConfirmada
): PecaItem {
  if (colecao.regraFicha !== 'integracao-colecao-v1')
    throw new Error('Coleções da base antiga não iniciam histórico de versões.');
  if (
    recibo.status !== 'CONFIRMADA' ||
    !recibo.integracaoId.trim() ||
    !recibo.versaoLinx.trim() ||
    !recibo.colecaoLinxCodigo.trim() ||
    !Number.isFinite(Date.parse(recibo.confirmadaEm))
  )
    throw new Error('A integração real precisa ser confirmada antes de criar uma versão.');
  if (
    !peca.marcaId ||
    peca.marcaId !== colecao.marcaId ||
    peca.colecaoId !== colecao.id ||
    recibo.colecaoId !== colecao.id ||
    recibo.descColecao.trim() !== colecao.nome.trim() ||
    recibo.produto.trim() !== peca.codigo.trim() ||
    !peca.codigo.trim()
  )
    throw new Error('O recibo da integração não corresponde à peça e à coleção abertas.');
  const griffe = colecao.griffe ?? peca.linxOrigem?.griffe ?? peca.fichaTecnica?.integracao?.griffe;
  if (!griffe || griffe !== recibo.griffe)
    throw new Error('A griffe da integração não corresponde à peça.');
  if (peca.linxOrigem && peca.linxOrigem.griffe !== recibo.griffe)
    throw new Error('A griffe cadastrada no Linx não corresponde à integração.');
  const history = getHistoricoDaPeca(peca, colecao);
  if (
    history.some(
      (item) =>
        item.recibo.produto !== recibo.produto ||
        item.recibo.griffe !== recibo.griffe ||
        item.recibo.colecaoLinxCodigo !== recibo.colecaoLinxCodigo
    )
  )
    throw new Error(
      'O vínculo original desta peça não pode ser trocado por outra coleção ou produto.'
    );
  if (
    history.some(
      (item) =>
        item.recibo.integracaoId === recibo.integracaoId ||
        item.recibo.versaoLinx === recibo.versaoLinx
    )
  )
    return peca;
  const payload = structuredClone(peca);
  delete payload.historicoIntegracoes;
  const snapshot: FichaHistoricoVersao = {
    numero: Math.max(0, ...history.map((item) => item.numero)) + 1,
    marcaId: peca.marcaId,
    pecaId: peca.id,
    recibo: structuredClone(recibo),
    peca: payload,
  };
  return {
    ...structuredClone(peca),
    historicoIntegracoes: [...structuredClone(history), snapshot],
  };
}
