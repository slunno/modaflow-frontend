import { describe, it, expect } from 'vitest';
import { normalizeId } from '../services/contractMappers';
import type { PecaItem, ColecaoItem } from '../types/plm';
import type { MarcaSummary } from '../types/auth';

/**
 * Filtra peças para exibição dentro do detalhe da coleção garantindo isolamento
 * por colecaoId e marcaId, evitando vazamento entre coleções homônimas.
 */
function filterPecasForCollection(
  pecas: PecaItem[],
  colecao: Pick<ColecaoItem, 'id' | 'nome'>,
  marca: Pick<MarcaSummary, 'id' | 'nome'>
): PecaItem[] {
  return pecas.filter(
    (p) =>
      normalizeId(p.colecaoId) === normalizeId(colecao.id) &&
      (!p.marcaId || normalizeId(p.marcaId) === normalizeId(marca.id))
  );
}

describe('Collection Piece Linking & Isolation', () => {
  const marcaKJ: Pick<MarcaSummary, 'id' | 'nome'> = {
    id: 'marca-kj',
    nome: 'King & Joe',
  };

  const marcaOriba: Pick<MarcaSummary, 'id' | 'nome'> = {
    id: 'marca-oriba',
    nome: 'Oriba',
  };

  const colecaoVeraoKJ: Pick<ColecaoItem, 'id' | 'nome'> = {
    id: 'col-kj-verao-26',
    nome: 'VERÃO 2026',
  };

  const colecaoVeraoOriba: Pick<ColecaoItem, 'id' | 'nome'> = {
    id: 'col-oriba-verao-26',
    nome: 'VERÃO 2026',
  };

  const pecasDatabase: PecaItem[] = [
    {
      id: 'peca-1',
      codigo: 'KJ-001',
      nome: 'Bermuda Linho KJ',
      tipo: 'Bermuda',
      status: 'Em andamento',
      etapaAtual: 'Modelagem',
      tema: 'Praia',
      colecaoId: 'col-kj-verao-26',
      colecaoNome: 'VERÃO 2026',
      marcaId: 'marca-kj',
      marcaNome: 'King & Joe',
      tecidos: ['Linho'],
      estilista: 'Ana',
      previsaoEntrega: '—',
    },
    {
      id: 'peca-2',
      codigo: 'ORB-001',
      nome: 'Camiseta Orgânica Oriba',
      tipo: 'Camiseta',
      status: 'Completa',
      etapaAtual: 'Produção',
      tema: 'Minimalista',
      colecaoId: 'col-oriba-verao-26',
      colecaoNome: 'VERÃO 2026',
      marcaId: 'marca-oriba',
      marcaNome: 'Oriba',
      tecidos: ['Algodão Orgânico'],
      estilista: 'Carlos',
      previsaoEntrega: '—',
    },
  ];

  it('strictly isolates pieces by collectionId and marcaId despite identical collection names', () => {
    const kjPecas = filterPecasForCollection(pecasDatabase, colecaoVeraoKJ, marcaKJ);
    expect(kjPecas).toHaveLength(1);
    expect(kjPecas[0]?.codigo).toBe('KJ-001');

    const oribaPecas = filterPecasForCollection(pecasDatabase, colecaoVeraoOriba, marcaOriba);
    expect(oribaPecas).toHaveLength(1);
    expect(oribaPecas[0]?.codigo).toBe('ORB-001');
  });

  it('rejects pieces belonging to another brand even if collection ID matches by mistake', () => {
    const corruptedPeca: PecaItem = {
      id: 'peca-leak',
      codigo: 'LEAK-01',
      nome: 'Peça Infiltrada',
      tipo: 'Casaco',
      status: 'Em andamento',
      etapaAtual: 'Corte',
      tema: 'Urbano',
      colecaoId: 'col-kj-verao-26', // Id bate com KJ
      colecaoNome: 'VERÃO 2026',
      marcaId: 'marca-oriba', // Mas a marca é Oriba!
      marcaNome: 'Oriba',
      tecidos: [],
      estilista: 'Dev',
      previsaoEntrega: '—',
    };

    const results = filterPecasForCollection(
      [...pecasDatabase, corruptedPeca],
      colecaoVeraoKJ,
      marcaKJ
    );
    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe('peca-1');
  });
});
