import { describe, expect, it } from 'vitest';
import { planejarAlteracaoDeLinha, planejarOperacaoLinx } from '../services/fichaLinxPlanejamento';
import type { PecaItem, ColecaoItem } from '../types/plm';

const colecao: ColecaoItem = {
  id: 'colecao-teste',
  marcaId: 'marca-teste',
  griffe: 'KING&JOE',
  nome: 'Coleção de teste',
  marcaNome: 'Marca de teste',
  status: 'Em andamento',
  dataEntrega: '',
  diasAtraso: 0,
};
const peca: PecaItem = {
  id: 'peca-teste',
  marcaId: colecao.marcaId,
  colecaoId: colecao.id,
  codigo: 'TESTE',
  nome: 'Peça de teste',
  tipo: 'Peça',
  status: 'Em andamento',
  etapaAtual: 'Final',
  tema: '',
  colecaoNome: colecao.nome,
  marcaNome: colecao.marcaNome,
  estilista: '',
  tecidos: [],
  previsaoEntrega: '',
};
const integrada: PecaItem = {
  ...peca,
  linxOrigem: { codigoProduto: 'TESTE', colecaoCodigo: 'T01', griffe: 'KING&JOE' },
  fichaTecnica: { linxVersaoImportada: '00001', linxColecaoOrigem: 'T01' },
};

describe('Planejamento incremental; sem SQL e sem integração simulada', () => {
  it('criação exige verificar se o código global já existe, não atribui uma versão', () => {
    expect(planejarOperacaoLinx(peca, colecao)).toMatchObject({
      operacao: 'VERIFICAR_CADASTRO_E_FICHA_COLECAO',
      versaoAlvo: null,
      alterarCatalogosCompartilhados: false,
      gerarNovaVersaoAutomaticamente: false,
    });
  });
  it('edição mantém a versão importada, os vínculos e exige releitura no ERP', () => {
    expect(planejarOperacaoLinx(integrada, colecao)).toMatchObject({
      operacao: 'ATUALIZAR_FICHA_ATUAL',
      versaoAlvo: '00001',
      colecaoLinxCodigo: 'T01',
      preservarDadosNaoSolicitados: true,
      descartarApenasComSolicitacaoExplicita: true,
    });
    expect(() => planejarOperacaoLinx({ ...integrada, fichaTecnica: {} }, colecao)).toThrow(
      /Carregue a identidade/
    );
  });
  it('não troca a PK nem a coleção só porque o usuário editou uma referência', () => {
    expect(() => planejarOperacaoLinx({ ...integrada, codigo: 'OUTRO' }, colecao)).toThrow(
      /migração de identidade/
    );
    expect(() => planejarOperacaoLinx(integrada, { ...colecao, id: 'outra' })).toThrow(
      /não pertence/
    );
    expect(() => planejarOperacaoLinx(integrada, { ...colecao, griffe: 'K&J BLACK' })).toThrow(
      /griffe/
    );
    expect(() =>
      planejarOperacaoLinx(
        {
          ...integrada,
          fichaTecnica: { ...integrada.fichaTecnica, linxColecaoOrigem: 'T02' },
        },
        colecao
      )
    ).toThrow(/outra coleção/);
  });
  it('preço, consumo, campos desconhecidos e chaves omitidos são preservados', () => {
    const atual = {
      PRODUTO: 'TESTE',
      VERSAO_FICHA: '00001',
      MATERIAL: 'MAT',
      ITEM: '0001',
      DESC_USO_MATERIAL: 'Uso original',
      C1: 1,
      C2: 2,
      CAMPO_NAO_MAPEADO: 'Preservado',
    };
    const plano = planejarAlteracaoDeLinha('materialDaFicha', atual, {
      DESC_USO_MATERIAL: 'Novo uso',
    });
    expect(plano.camposAlterados).toEqual(['DESC_USO_MATERIAL']);
    expect(plano.depois).toEqual({ ...atual, DESC_USO_MATERIAL: 'Novo uso' });
    expect(atual.DESC_USO_MATERIAL).toBe('Uso original');
    expect(plano.status).toBe('PENDENTE_MAPEAMENTO');
  });
  it('troca apenas a cor solicitada, sem zerar percentual ou alterar catálogos', () => {
    const atual = { COR_PRODUTO: 'CP', COR_MATERIAL: 'CM1', PORCENTAGEM_CONSUMO: 100 };
    expect(planejarAlteracaoDeLinha('corDaFicha', atual, { COR_MATERIAL: 'CM2' }).depois).toEqual({
      ...atual,
      COR_MATERIAL: 'CM2',
    });
  });
  it('rejeita preço global, alteração de PK/versão e campos não mapeados', () => {
    for (const campo of [
      'CUSTO_A_VISTA',
      'CUSTO_REPOSICAO',
      'MATERIAL',
      'ITEM',
      'VERSAO_FICHA',
      'C49',
    ])
      expect(() => planejarAlteracaoDeLinha('materialDaFicha', {}, { [campo]: '1' })).toThrow(
        /não possui edição mapeada/
      );
    expect(() =>
      planejarAlteracaoDeLinha('produto', {}, { U_NOME_PRODUTO: 'Nome da peça' })
    ).not.toThrow();
  });
  it('não transforma ausência, zero ou falso em preenchimentos automáticos', () => {
    const atual = { C1: 0, C2: 2, CONSUMO_FIXO: false };
    expect(planejarAlteracaoDeLinha('materialDaFicha', atual, {}).depois).toEqual(atual);
    expect(planejarAlteracaoDeLinha('materialDaFicha', atual, { C1: 0 }).camposAlterados).toEqual(
      []
    );
    expect(() => planejarAlteracaoDeLinha('materialDaFicha', atual, { C1: NaN })).toThrow(
      /Valor inválido/
    );
  });
});
