import type { LinxMaterialCadastro } from '../../../src/types/linx';

export async function getLinxMaterialCadastro(): Promise<LinxMaterialCadastro> {
  const aviamento = new URLSearchParams(location.search).get('tipo') === 'aviamento';
  const longos = new URLSearchParams(location.search).get('longos') === '1';
  const unidade = aviamento
    ? 'UN'
    : new URLSearchParams(location.search).get('unidade') === 'kg'
      ? 'KG'
      : 'MT';
  const cores = (
    longos
      ? ['Azul com nome personalizado longo para validar o espaço do painel', 'Verde', 'Branco']
      : ['Azul', 'Verde', 'Branco']
  ).map((nome, indice) => ({
    MATERIAL: 'TESTE-CORES',
    CODIGO_COR: `C${indice + 1}`,
    NOME_COR: nome,
    GRAMATURA: 200,
    TEC_ENCOLHIMENTO_CORTE_X: null,
    TEC_ENCOLHIMENTO_CORTE_Y: null,
    TEC_ENCOLHIMENTO_ACABAMENTO_X: null,
    TEC_ENCOLHIMENTO_ACABAMENTO_Y: null,
    TEC_ENCOLHIMENTO_LAVAGEM_X: null,
    TEC_ENCOLHIMENTO_LAVAGEM_Y: null,
    CUSTO_A_VISTA: null,
    CUSTO_REPOSICAO: null,
  }));
  return {
    codigo: 'TESTE-CORES',
    nome: `${aviamento ? 'Aviamento' : 'Tecido'} simulado`,
    grupo: aviamento ? 'AVIAMENTOS' : 'TECIDOS',
    unidadeEstoque: unidade,
    unidadeFichaTecnica: unidade,
    largura: null,
    comprimento: null,
    altura: null,
    rendimento: null,
    cores,
    fornecedores: cores.map((cor, indice) => ({
      CODIGO_COR: cor.CODIGO_COR,
      NOME_COR: cor.NOME_COR,
      CODIGO_FORNECEDOR: 'TEST-S',
      FORNECEDOR: longos
        ? 'Fornecedor simulado com nome e razão social extensos para validar os campos'
        : 'Fornecedor simulado',
      UNIDADE: unidade,
      FATOR_CONVERSAO_FORNECEDOR: 1,
      CUSTO_REPOSICAO: `${10 + indice * 10}.12345`,
      FONTE: 'MATERIAIS_FORNECEDOR.CUSTO_REPOSICAO',
    })),
  };
}
export async function getLinxFornecedores() {
  return [{ codigo: 'TEST-S', fornecedor: 'Fornecedor simulado' }];
}
export async function getLinxCoresBasicas() {
  return [];
}
