import type { PecaItem } from '../../types/plm';
import { COMPONENTES_FICHA, assinaturaConferenciaVariante } from '../../services/fichaProcesso';

/** Dados sintéticos de teste: simula respostas explícitas, nunca usado no portal. */
export function confirmarAusentesTeste(peca: PecaItem): PecaItem {
  const ficha = peca.fichaTecnica!;
  ficha.conferencia = {
    ...ficha.conferencia,
    componentesPorVariante: { ...ficha.conferencia?.componentesPorVariante },
  };
  for (const variante of ficha.variantes ?? []) {
    const assinaturaInsumos = assinaturaConferenciaVariante(variante, ficha.tamanhos ?? []);
    const decisoes = { ...ficha.conferencia.componentesPorVariante?.[variante.id] };
    for (const componente of Object.keys(COMPONENTES_FICHA) as Array<
      keyof typeof COMPONENTES_FICHA
    >) {
      if (
        [...variante.tecidos, ...variante.aviamentos].some((item) => item.componente === componente)
      )
        continue;
      decisoes[componente] = {
        aplicavel: false,
        assinaturaInsumos,
        registradoEm: '2026-10-07T12:00:00.000Z',
        responsavel: { id: 'u', nome: 'Usuário teste' },
      };
    }
    ficha.conferencia.componentesPorVariante![variante.id] = decisoes;
  }
  return peca;
}
