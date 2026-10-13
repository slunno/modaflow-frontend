import { describe, expect, it } from 'vitest';
import type { PecaItem, ColecaoItem } from '../types/plm';
import { projetarFichaPrincipalLinx } from '../services/fichaPrincipalLinx';
import {
  conferirFicha,
  contratoConferencia,
  prepararContratoLinx,
} from '../services/fichaProcesso';
import { planejarOperacaoLinx } from '../services/fichaLinxPlanejamento';
import { projetarMapeamentoLinx } from '../services/fichaLinxMapeamento';
import { conteudoAlteracoesLinx } from '../services/fichaLinxAlteracoes';
import { confirmarAusentesTeste } from './fixtures/conferencia';

const colecao: ColecaoItem = {
  id: 'c',
  marcaId: 'm',
  nome: 'Teste',
  marcaNome: 'Teste',
  griffe: 'KING&JOE',
  status: 'Em andamento',
  dataEntrega: '',
  diasAtraso: 0,
};
function criar(): PecaItem {
  const peca: PecaItem = {
    id: 'p',
    marcaId: 'm',
    colecaoId: 'c',
    codigo: 'NOVO',
    nome: 'Teste',
    tipo: 'Teste',
    status: 'Em andamento',
    etapaAtual: '20 Final',
    tema: '',
    colecaoNome: 'Teste',
    marcaNome: 'Teste',
    estilista: '',
    tecidos: [],
    previsaoEntrega: '',
    fichaTecnica: {
      codigoReferencia: 'ANTIGO',
      tamanhos: ['P'],
      conferencia: { gradeCompleta: true },
      provaRoupa: { data: '', observacoes: 'EXCLUSIVO_PORTAL', fotos: [] },
      processo: {
        revisao: 'r',
        concluida: {
          revisao: 'r',
          registradoEm: '2026-10-13T12:00:00.000Z',
          responsavel: { id: 'u', nome: 'Teste' },
        },
      },
      coresMostruario: [
        { id: 'erp', nome: 'Preto', hex: '', origemMostruario: 'linx' },
        { id: 'custom', nome: 'COR_EXCLUSIVA_PORTAL', codigo: 'FICTICIO', hex: '#123456' },
      ],
      variantes: [
        {
          id: 'principal',
          nome: 'Mostruário renomeado',
          tecidos: [
            {
              id: 't',
              nome: 'Tecido',
              codigo: 'MAT',
              temErp: false,
              fornecedores: '',
              custo: '10,12345',
              unidade: 'Metros',
              imagensList: ['data:image/png;base64,EXCLUSIVO_PORTAL'],
              coresList: [
                {
                  id: 'c1',
                  nome: 'Preto',
                  codigo: '00003',
                  hex: '',
                  origemLinx: { materialCodigo: 'MAT', corCodigo: '00003', corNome: 'Preto' },
                },
                { id: 'c2', nome: 'COR_EXCLUSIVA_PORTAL', codigo: 'FICTICIO', hex: '#123456' },
              ],
            },
          ],
          aviamentos: [],
        },
        {
          id: 'outra',
          nome: 'VARIANTE_EXCLUSIVA_PORTAL',
          tecidos: [
            {
              id: 'outro',
              nome: 'Só local',
              codigo: '',
              temErp: false,
              fornecedores: '',
              custo: '',
              unidade: '',
            },
          ],
          aviamentos: [],
        },
      ],
    },
  };
  return confirmarAusentesTeste(peca);
}
describe('Identidade e escopo da futura integração', () => {
  it('referência nunca determina o produto a criar ou atualizar', () => {
    const peca = criar();
    const plano = planejarOperacaoLinx(peca, colecao);
    expect(plano.operacao).toBe('VERIFICAR_CADASTRO_E_FICHA_COLECAO');
    expect(plano.codigoInformadoPor).toBe('USUARIO');
    expect(plano.referencia).toEqual({
      codigo: 'ANTIGO',
      somenteReferencia: true,
      atualizarProdutoReferenciado: false,
    });
    expect(plano.persistenciaCodigo).toBe('PENDENTE_GRAVADOR_ERP');
    peca.linxOrigem = { codigoProduto: 'NOVO', colecaoCodigo: '025', griffe: 'KING&JOE' };
    peca.fichaTecnica!.linxVersaoImportada = '00001';
    expect(planejarOperacaoLinx(peca, colecao)).toMatchObject({
      operacao: 'ATUALIZAR_FICHA_ATUAL',
      versaoAlvo: '00001',
    });
    peca.codigo = 'ANTIGO';
    expect(() => planejarOperacaoLinx(peca, colecao)).toThrow(/migração de identidade/);
  });
  it('não prepara código vazio ou maior do que a coluna real', () => {
    for (const codigo of ['', '1234567890123']) {
      expect(() => planejarOperacaoLinx({ ...criar(), codigo }, colecao)).toThrow(
        /até 12 caracteres/
      );
    }
  });
  it('só prepara a primeira variante, mesmo renomeada, sem mídias ou dados exclusivos do portal', () => {
    const peca = criar();
    const antes = structuredClone(peca);
    expect(conferirFicha(peca, true)).toEqual([]);
    expect(contratoConferencia(peca, true)).toMatchObject({
      variantePrincipalId: 'principal',
      variantes: [{ id: 'principal' }],
    });
    expect(contratoConferencia(peca, false).variantes).toHaveLength(2);
    const contrato = prepararContratoLinx(peca, colecao);
    expect(contrato.escopo).toBe('SOMENTE_PRINCIPAL');
    expect(contrato.ficha.variantes).toHaveLength(1);
    expect(contrato.mapeamento.variantes).toHaveLength(1);
    expect(contrato.ficha.variantes[0]!.tecidos[0]!.custo).toBe('10,12345');
    expect(JSON.stringify(contrato)).not.toMatch(
      /EXCLUSIVO_PORTAL|EXCLUSIVA_PORTAL|FICTICIO|data:image|imagemUrl|provaRoupa/
    );
    expect(projetarMapeamentoLinx(peca, colecao).variantes[0]!.consumos[0]!.coresMaterial).toEqual([
      { nome: 'Preto', codigo: '00003' },
    ]);
    expect(peca).toEqual(antes);
  });
  it('edição de variante ou anexo local não cria alteração pendente para o ERP', () => {
    const peca = criar();
    const alterada = structuredClone(peca);
    alterada.fichaTecnica!.variantes![1]!.nome = 'Mudou somente no portal';
    alterada.tecidos = ['Rótulo agregado de um tecido de variante local'];
    alterada.aviamentos = ['Rótulo agregado de um aviamento de variante local'];
    alterada.fichaTecnica!.coresMostruario![1]!.nome = 'Mudou personalizada';
    expect(conteudoAlteracoesLinx(alterada, 'anexos diferentes')).toBe(
      conteudoAlteracoesLinx(peca, [])
    );
    alterada.fichaTecnica!.variantes![0]!.tecidos[0]!.custo = '11';
    expect(conteudoAlteracoesLinx(alterada, [])).not.toBe(conteudoAlteracoesLinx(peca, []));
    expect(projetarFichaPrincipalLinx(peca).coresMostruario).toEqual([
      { nome: 'Preto', codigo: null },
    ]);
  });
});
