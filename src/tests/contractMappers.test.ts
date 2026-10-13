import { describe, it, expect } from 'vitest';
import {
  normalizeId,
  formatCurrencyValue,
  mapLinxColecaoToItem,
  mapLinxProdutoToPeca,
  mapStatusPeca,
  mapStatusColecao,
  mapUsuarioDtoToUser,
  mapColecaoDtoToItem,
} from '../services/contractMappers';
import type { MarcaSummary } from '../types/auth';
import type { LinxColecaoValida, LinxProdutoValido } from '../types/linx';
import type { UsuarioResponseDTO, ColecaoResponseDTO } from '../types/dtos';

describe('contractMappers', () => {
  describe('normalizeId', () => {
    it('normalizes numbers to string', () => {
      expect(normalizeId(123)).toBe('123');
      expect(normalizeId(0)).toBe('0');
    });

    it('trims whitespace from string ids', () => {
      expect(normalizeId('  456  ')).toBe('456');
    });

    it('returns empty string for null and undefined', () => {
      expect(normalizeId(null)).toBe('');
      expect(normalizeId(undefined)).toBe('');
    });
  });

  describe('formatCurrencyValue', () => {
    it('returns dash for null and undefined to avoid misleading prices', () => {
      expect(formatCurrencyValue(null)).toBe('—');
      expect(formatCurrencyValue(undefined)).toBe('—');
    });

    it('formats numeric zero distinctly from missing values', () => {
      expect(formatCurrencyValue(0)).toBe('R$ 0,00');
    });

    it('formats positive currency values correctly', () => {
      expect(formatCurrencyValue(159.9)).toBe('R$ 159,90');
      expect(formatCurrencyValue(250)).toBe('R$ 250,00');
    });
  });

  describe('mapLinxColecaoToItem', () => {
    const mockMarca: MarcaSummary = {
      id: 'marca-1',
      nome: 'King & Joe',
      code: 'KJ',
      initials: 'KJ',
      colecoesCount: 5,
      pecasCount: 40,
      heroImageUrl: '',
      description: '',
      badgeTag: 'AKR',
    };

    const mockLinxColecao: LinxColecaoValida = {
      codigo: 'VERAO2026',
      nome: 'Verão 2026 King',
      griffeProduto: 'KING&JOE',
      griffeColecao: 'KING&JOE',
      dataInicio: '2026-06-01',
      quantidadeProdutos: 42,
      dataFinal: '2026-12-15',
      temporada: 'Verão',
    };

    it('classifies legacy collections as complete while preserving missing completion metrics', () => {
      const item = mapLinxColecaoToItem(mockLinxColecao, mockMarca, 'KING&JOE');

      expect(item.status).toBe('Completas');
      expect(item.regraFicha).toBe('legado');
      expect(item.progressoPercent).toBeUndefined();
      expect(item.pecasConcluidas).toBeUndefined();
      expect(item.concluidoEmDate).toBeUndefined();
      expect(item.griffe).toBe('KING&JOE');
      expect(item.pecasTotal).toBe(42);
      expect(item.marcaId).toBe('marca-1');
      expect(item.marcaNome).toBe('King & Joe');
    });
  });

  describe('mapLinxProdutoToPeca', () => {
    const baseLinxProduto: LinxProdutoValido = {
      codigo: 'CAM-001',
      descricao: 'Camisa Linho Especial',
      linxId: 999,
      codigoNormalizado: 'CAM001',
      tipo: 'Camisaria',
      subgrupo: 'Camisa',
      materialPrincipal: 'LNH-100',
      descricaoMaterialPrincipal: 'Linho 100%',
      custoReposicao: null,
      precoReposicao: null,
      griffe: 'KING&JOE',
      colecaoCodigo: 'VERAO2026',
      colecaoNome: 'Verão 2026',
      griffeColecao: 'KING&JOE',
      dataInicioColecao: null,
      dataFinalColecao: null,
      temporada: 'Verão',
      grupo: 'Camisaria',
      periodoPcp: null,
      grade: null,
      linha: null,
      cartela: null,
      modelagem: null,
      estilista: null,
      modelista: null,
      statusProduto: null,
      tipoStatusProduto: null,
      dataCadastramento: null,
      dataInicioDesenvolvimento: null,
    };

    it('preserves null/undefined price and cost without inventing zeroes or defaults', () => {
      const peca = mapLinxProdutoToPeca(
        baseLinxProduto,
        'col-1',
        'Verão 2026',
        'marca-1',
        'King & Joe',
        0
      );

      expect(peca.custo).toBeUndefined();
      expect(peca.preco).toBeUndefined();
      expect(peca.status).toBe('Status não identificado');
    });

    it('maps explicit cost and price when provided by Linx', () => {
      const withPrices: LinxProdutoValido = {
        ...baseLinxProduto,
        custoReposicao: 45.5,
        precoReposicao: 129.9,
      };

      const peca = mapLinxProdutoToPeca(
        withPrices,
        'col-1',
        'Verão 2026',
        'marca-1',
        'King & Joe',
        0
      );

      expect(peca.custo).toBe(45.5);
      expect(peca.preco).toBe(129.9);
    });
  });

  describe('mapStatusPeca', () => {
    it('maps known statuses correctly', () => {
      expect(mapStatusPeca('COMPLETA')).toBe('Completa');
      expect(mapStatusPeca('APROVADO')).toBe('Completa');
      expect(mapStatusPeca('A_DESENHAR')).toBe('A desenhar');
      expect(mapStatusPeca('CANCELADO')).toBe('Cancelada');
      expect(mapStatusPeca('CANCELADA')).toBe('Cancelada');
      expect(mapStatusPeca('EM_DESENVOLVIMENTO')).toBe('Em andamento');
    });

    it('falls back to "Status não identificado" for unknown or absent values', () => {
      expect(mapStatusPeca(null)).toBe('Status não identificado');
      expect(mapStatusPeca(undefined)).toBe('Status não identificado');
      expect(mapStatusPeca('CUSTOM_UNKNOWN')).toBe('Status não identificado');
    });
  });

  describe('mapStatusColecao', () => {
    it('maps completion and archived statuses', () => {
      expect(mapStatusColecao('CONCLUIDO')).toBe('Completas');
      expect(mapStatusColecao('COMPLETAS')).toBe('Completas');
      expect(mapStatusColecao('ARQUIVADO')).toBe('Arquivadas');
      expect(mapStatusColecao('EM_ANDAMENTO')).toBe('Em andamento');
      expect(mapStatusColecao(null)).toBe('Em andamento');
    });
  });

  describe('mapUsuarioDtoToUser', () => {
    it('maps user without inventing admin roles or mock brands', () => {
      const dto: UsuarioResponseDTO = {
        id: 7,
        nome: 'Estilista AKR',
        email: 'estilista@akrbrands.com.br',
        empresa: 'AKR BRANDS',
        cargo: 'Estilista Sênior',
        ativo: true,
        marcasPermitidas: [
          {
            id: 1,
            nome: 'King & Joe',
            code: 'KJ',
            initials: 'KJ',
            colecoesCount: 3,
            pecasCount: 20,
          },
        ],
      };

      const user = mapUsuarioDtoToUser(dto);
      expect(user.id).toBe('7');
      expect(user.nome).toBe('Estilista AKR');
      expect(user.cargo).toBe('Estilista Sênior');
      expect(user.marcas).toHaveLength(1);
      expect(user.marcas[0]?.id).toBe('1');
      expect(user.marcas[0]?.nome).toBe('King & Joe');
    });

    it('handles empty marcasPermitidas safely without fallback', () => {
      const dto: UsuarioResponseDTO = {
        id: 8,
        nome: 'Sem Marca',
        email: 'semmarca@akrbrands.com.br',
        ativo: true,
      };

      const user = mapUsuarioDtoToUser(dto);
      expect(user.marcas).toEqual([]);
      expect(user.cargo).toBe('Sem cargo definido');
    });
  });

  describe('mapColecaoDtoToItem', () => {
    it('maps DTO fields cleanly', () => {
      const dto: ColecaoResponseDTO = {
        id: 10,
        nome: 'Inverno 2026',
        status: 'EM_ANDAMENTO',
        progressoPercent: 45,
        pecasConcluidas: 9,
        pecasTotal: 20,
        dataEntrega: '2026-08-30',
        diasAtraso: 0,
      };

      const item = mapColecaoDtoToItem(dto, 'King & Joe');
      expect(item.id).toBe('10');
      expect(item.nome).toBe('Inverno 2026');
      expect(item.marcaNome).toBe('King & Joe');
      expect(item.progressoPercent).toBe(45);
      expect(item.status).toBe('Em andamento');
      expect(item.dataEntrega).toBe('30/08/2026');
    });
  });
});
