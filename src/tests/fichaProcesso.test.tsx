import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  atualizarRevisao,
  conferirFicha,
  conteudoFicha,
  contratoConferencia,
  custoConsumo,
  decimalManual,
  exigeConferencia,
  etapaPermiteConclusao,
  prepararContratoLinx,
} from '../services/fichaProcesso';
import { registrarAlteracoesFicha } from '../services/fichaAlteracoes';
import { api } from '../services/api';
import { PecaFluxoEtapasModal } from '../pages/Home/components/PecaFluxoEtapasModal';
import { FichaInsumoCard } from '../pages/Home/components/FichaInsumoCard';
import type { ColecaoItem, PecaItem } from '../types/plm';
import type { FichaInsumo } from '../types/ficha';
import type { UserRecord } from '../types/gestao';
import { getLinxFichaTamanhos, mapLinxMaterialToInsumo } from '../services/linxFichaMappers';
import type { LinxFichaDetalhe, LinxFichaMaterial } from '../types/linx';
import { confirmarAusentesTeste } from './fixtures/conferencia';
import { assinaturaConferenciaVariante, criarConfirmacao } from '../services/fichaProcesso';

vi.mock('../services/api', () => ({ api: { post: vi.fn() } }));
afterEach(cleanup);
beforeEach(() => vi.resetAllMocks());

const insumo: FichaInsumo = {
  id: 'a',
  nome: 'Material de teste',
  codigo: 'A1',
  custo: '0,3671',
  unidade: 'Metros',
  quantidade: '2',
  temErp: false,
  fornecedores: '',
  componente: 'elastico',
  consumoPorTamanho: { P: { valor: '0,5' }, M: { valor: '0,6' } },
};
const autor = { id: 'u', nome: 'Usuário de teste' };
const decisao = (aplicavel: boolean) => ({
  aplicavel,
  registradoEm: '2026-10-05T12:00:00Z',
  responsavel: autor,
});
const peca: PecaItem = {
  id: 'p',
  colecaoId: 'c',
  marcaId: 'm',
  nome: 'Peça de teste',
  tipo: 'Peça',
  codigo: 'P1',
  status: 'Em andamento',
  etapaAtual: '01 geração de ficha',
  tema: '',
  colecaoNome: 'Coleção de teste',
  marcaNome: 'Marca teste',
  estilista: '',
  tecidos: [],
  previsaoEntrega: '',
  fichaTecnica: {
    tamanhos: ['P', 'M'],
    integracao: {
      subgrupo: '',
      linha: '',
      grade: '',
      griffe: 'KING&JOE',
      tipoMateriaPrima: '',
      categoria: '',
      subcategoria: '',
    },
    variantes: [{ id: 'principal', nome: 'Principal', tecidos: [], aviamentos: [insumo] }],
    conferencia: {
      gradeCompleta: true,
      componentesPorVariante: {
        principal: {
          ziper: decisao(false),
          etiqueta: decisao(false),
          elastico: decisao(true),
          entretela: decisao(false),
        },
      },
    },
  },
};
confirmarAusentesTeste(peca);
const colecao: ColecaoItem = {
  id: 'c',
  marcaId: 'm',
  nome: 'Coleção de teste',
  griffe: 'KING&JOE',
  marcaNome: 'Marca teste',
  status: 'Em andamento',
  dataEntrega: '',
  diasAtraso: 0,
  regraFicha: 'integracao-colecao-v1',
};
const usuarios: UserRecord[] = [
  {
    ...autor,
    email: 'test@example.invalid',
    marcas: ['m'],
    status: 'Ativo',
    acesso: 'Permitido',
    brandRoles: [{ marcaId: 'm', marcaNome: 'Marca teste', cargo: 'Estilista', times: [] }],
  },
];

describe('Conferência e preparação sem envio ERP', () => {
  it('importa somente posições nomeadas e consumo por tamanho explícito, nunca preço do catálogo', () => {
    const material: LinxFichaMaterial = {
      codigo: 'A1',
      nome: 'Material teste',
      grupo: 'AVIAMENTOS',
      item: '1',
      cores: [],
      dados: {
        NUMERO_TAMANHOS: 12,
        TAMANHO_1: 'P',
        TAMANHO_2: 'M',
        TAMANHO_3: '',
        C1: 0.5,
        C2: 0,
        C3: 20,
        CONSUMO_P_TAMANHO: true,
        CUSTO_A_VISTA: 100,
      },
    };
    const ficha: LinxFichaDetalhe = {
      versao: {
        produto: 'P1',
        versao: '1',
        descricao: null,
        dataCriacao: null,
        responsavel: null,
        status: null,
        colecaoCodigo: null,
        colecaoNome: null,
      },
      materiais: [material],
    };
    expect(getLinxFichaTamanhos(ficha)).toEqual(['P', 'M']);
    const item = mapLinxMaterialToInsumo(material, '1');
    expect(item.consumoPorTamanho).toEqual({ P: { valor: '0.5' }, M: { valor: '0' } });
    expect(item.custo).toBe('');
    expect(item.componente).toBeUndefined();
    expect(
      mapLinxMaterialToInsumo(
        { ...material, dados: { ...material.dados, CONSUMO_P_TAMANHO: false } },
        '1'
      ).consumoPorTamanho
    ).toBeUndefined();
  });
  it('preço aceita vírgula, ponto e zero, mas não vazio, negativo, expoente ou separadores misturados', () => {
    expect(decimalManual('14,9799')).toBe(14.9799);
    expect(decimalManual('0')).toBe(0);
    for (const value of ['', '-1', '1.234,56', '1e2', 'NaN', 'Infinity'])
      expect(decimalManual(value)).toBeNull();
    expect(custoConsumo(insumo, 'aviamentos')).toBeCloseTo(0.7342);
    expect(custoConsumo({ ...insumo, custo: '' }, 'aviamentos')).toBeNull();
  });
  it.each(['tecidos', 'aviamentos'] as const)(
    'outros %s não exigem consumo por tamanho, mas precisam confirmar os componentes ausentes',
    (tipo) => {
      const copia = structuredClone(peca);
      copia.fichaTecnica!.conferencia = { gradeCompleta: true };
      const variante = copia.fichaTecnica!.variantes![0]!;
      variante.tecidos = [];
      variante.aviamentos = [];
      variante[tipo] = [{ ...insumo, componente: undefined, consumoPorTamanho: undefined }];
      expect(conferirFicha(copia)).toHaveLength(4);
      confirmarAusentesTeste(copia);
      expect(conferirFicha(copia)).toEqual([]);
      expect(conferirFicha(copia, true)).toEqual([]);
    }
  );
  it('consumo zero de elástico exige confirmação explícita e vazio não pode ser dispensado', () => {
    expect(conferirFicha(peca)).toEqual([]);
    const copia = structuredClone(peca);
    copia.fichaTecnica!.variantes![0]!.aviamentos[0]!.consumoPorTamanho!.M = { valor: '0' };
    confirmarAusentesTeste(copia);
    expect(conferirFicha(copia).map((x) => x.campo)).toContain('consumo.a.M');
    const variante = copia.fichaTecnica!.variantes![0]!;
    variante.aviamentos[0]!.consumoPorTamanho!.M!.confirmacaoZero = criarConfirmacao(
      assinaturaConferenciaVariante(variante, ['P', 'M']),
      autor
    );
    expect(conferirFicha(copia)).toEqual([]);
    copia.fichaTecnica!.variantes![0]!.aviamentos[0]!.consumoPorTamanho!.M = {
      valor: '',
      naoSeAplica: true,
    };
    expect(conferirFicha(copia).map((x) => x.campo)).toContain('consumo.a.M');
  });
  it('continua rejeitando consumo geral inválido', () => {
    const copia = structuredClone(peca);
    copia.fichaTecnica!.variantes![0]!.aviamentos[0]!.quantidade = '-1';
    expect(conferirFicha(copia).map((x) => x.campo)).toContain('consumoGeral.a');
  });
  it('preço vazio permite entrega parcial, mas impede preparação da integração', () => {
    const copia = structuredClone(peca);
    copia.fichaTecnica!.variantes![0]!.aviamentos[0]!.custo = '';
    confirmarAusentesTeste(copia);
    expect(conferirFicha(copia)).toEqual([]);
    expect(conferirFicha(copia, true).map((x) => x.campo)).toContain('preco.a');
  });
  it('alteração invalida conclusão sem modificar snapshot anterior ou criar histórico Linx', () => {
    const salva = atualizarRevisao(peca, peca);
    const revisao = salva.fichaTecnica!.processo!.revisao;
    salva.fichaTecnica!.processo!.concluida = {
      revisao,
      registradoEm: '2026-10-05T12:00:00Z',
      responsavel: autor,
    };
    const alterada = structuredClone(salva);
    alterada.fichaTecnica!.variantes![0]!.aviamentos[0]!.custo = '1';
    const nova = atualizarRevisao(salva, alterada);
    expect(nova.fichaTecnica!.processo!.revisao).not.toBe(revisao);
    expect(salva.fichaTecnica!.variantes![0]!.aviamentos[0]!.custo).toBe('0,3671');
    expect(nova.historicoIntegracoes).toBeUndefined();
    expect(() => prepararContratoLinx(nova, colecao)).toThrow(/Conclua novamente/);
    expect(conteudoFicha(salva)).not.toBe(conteudoFicha(nova));
  });
  it('contrato preserva preço manual, tamanho e identidade da coleção, nunca marca integrado', () => {
    const salva = atualizarRevisao(peca, peca);
    salva.fichaTecnica!.processo!.concluida = {
      revisao: salva.fichaTecnica!.processo!.revisao,
      registradoEm: '2026-10-05T12:00:00Z',
      responsavel: autor,
    };
    salva.fichaTecnica!.coresMostruario = [{ id: 'amostra', nome: 'Bege', hex: '' }];
    const contrato = prepararContratoLinx(salva, colecao);
    expect(contrato.status).toBe('PENDENTE_MAPEAMENTO');
    expect(contrato.identidade).toMatchObject({
      produto: 'P1',
      griffe: 'KING&JOE',
      colecaoId: 'c',
      descColecao: colecao.nome,
    });
    expect(contrato.ficha.variantes![0]!.aviamentos[0]!.custo).toBe('0,3671');
    expect(contrato.ficha.tamanhos).toEqual(['P', 'M']);
    expect(contrato.mapeamento.coresMostruario).toEqual([]);
    expect(salva.fichaTecnica!.coresMostruario).toMatchObject([{ nome: 'Bege' }]);
    expect(contrato.pendenciasContrato.join(' ')).not.toContain('COR_PRODUTO');
    expect(contrato.pendenciasContrato).toContain(
      'Mapeamento da cor de mostruário de Geral para o Linx e validação dos códigos no ERP'
    );
    expect(contratoConferencia(salva).variantes[0]!.insumos[0]!.preco).toBe('0,3671');
    expect(() => prepararContratoLinx(salva, { ...colecao, id: 'outra-colecao' })).toThrow(
      /não pertence/
    );
    expect(() => prepararContratoLinx(salva, { ...colecao, marcaId: 'outra-marca' })).toThrow(
      /não pertence/
    );
    expect(() => prepararContratoLinx(salva, { ...colecao, griffe: 'K&J BLACK' })).toThrow(
      /griffe/
    );
    expect(api.post).not.toHaveBeenCalled();
  });
  it('histórico registra apenas o consumo por tamanho alterado e mantém usuário/data', () => {
    const copia = structuredClone(peca);
    copia.fichaTecnica!.variantes![0]!.aviamentos[0]!.consumoPorTamanho!.M = { valor: '0,9' };
    const historico = registrarAlteracoesFicha(peca, copia, autor).historicoAlteracoes!;
    expect(historico).toHaveLength(1);
    expect(historico[0]!.campos).toEqual([
      { campo: 'Principal / Material de teste — Consumo M', antes: '0,6', depois: '0,9' },
    ]);
    expect(historico[0]!.responsavel).toEqual(autor);
  });
  it('confere somente na passagem de 01 para 02, sem alterar a validação de conclusão', () => {
    expect(etapaPermiteConclusao('22 Integração Linx')).toBe(true);
    expect(etapaPermiteConclusao('FINAL')).toBe(true);
    expect(etapaPermiteConclusao('FICHA TECNICA FINAL')).toBe(true);
    expect(etapaPermiteConclusao('02 engenharia recebimento')).toBe(false);
    expect(
      exigeConferencia('01 geração de ficha', '23 Revisar ficha técnica / liberar mostruário')
    ).toBe(false);
    expect(exigeConferencia('01 geração de ficha', '02 engenharia recebimento')).toBe(true);
    expect(exigeConferencia('02 engenharia recebimento', '01 geração de ficha')).toBe(false);
    expect(exigeConferencia('01 geração de ficha', '01 geração de ficha')).toBe(false);
    expect(exigeConferencia('02 engenharia recebimento', '03 modelagem')).toBe(false);
    expect(exigeConferencia('03 modelagem', '04 mini risco / consumo')).toBe(false);
    expect(exigeConferencia('GERACAO_FICHA', 'ENGENHARIA_RECEBIMENTO')).toBe(true);
    expect(exigeConferencia('GERACAO FICHA', 'ENGENHARIA RECEBIMENTO')).toBe(true);
    expect(exigeConferencia('—', '01 geração de ficha')).toBe(false);
    expect(exigeConferencia('21 Inicial', '01 geração de ficha')).toBe(false);
  });
});

describe('Fluxo de entrega e edição de insumo', () => {
  it('movimentação de 02 para 03 não mostra nem exige conferência da ficha', async () => {
    const onSave = vi.fn();
    render(
      <PecaFluxoEtapasModal
        peca={{ ...peca, etapaAtual: '02 engenharia recebimento', fichaTecnica: {} }}
        marcaId="m"
        marcaNome="Marca teste"
        usuarios={[]}
        onClose={() => {}}
        onSave={onSave}
      />
    );
    fireEvent.change(screen.getByLabelText('Nova Etapa'), { target: { value: '03 modelagem' } });
    expect(screen.queryByRole('region', { name: 'Conferência antes da entrega' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar movimentação' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0]![0].etapaAtual).toBe('03 modelagem');
    expect(api.post).not.toHaveBeenCalled();
  });
  function modal(item = peca) {
    const onSave = vi.fn();
    render(
      <PecaFluxoEtapasModal
        peca={item}
        marcaId="m"
        marcaNome="Marca teste"
        usuarios={usuarios}
        onClose={() => {}}
        onSave={onSave}
      />
    );
    fireEvent.change(screen.getByLabelText('Nova Etapa'), {
      target: { value: '02 engenharia recebimento' },
    });
    fireEvent.change(screen.getByLabelText('Responsável'), { target: { value: autor.nome } });
    return onSave;
  }
  it('bloqueia pendências localmente sem chamar API ou salvar a etapa', async () => {
    const onSave = modal({ ...peca, fichaTecnica: {} });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar movimentação' }));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('grade'));
    expect(onSave).not.toHaveBeenCalled();
    expect(api.post).not.toHaveBeenCalled();
  });
  it('conferência válida chama backend e só então salva', async () => {
    vi.mocked(api.post).mockResolvedValue({ valida: true, pendencias: [] });
    const onSave = modal();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar movimentação' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(api.post).toHaveBeenCalledWith('/fichas/conferencia', contratoConferencia(peca), 'm');
    expect(onSave.mock.calls[0]![0].etapaAtual).toBe('02 engenharia recebimento');
  });
  it('backend indisponível não confirma entrega', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('Servidor indisponível'));
    const onSave = modal();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar movimentação' }));
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain('Servidor indisponível')
    );
    expect(onSave).not.toHaveBeenCalled();
  });
  it('reprovação do backend não confirma entrega', async () => {
    vi.mocked(api.post).mockResolvedValue({ valida: false, pendencias: ['Tamanho incompleto'] });
    const onSave = modal();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar movimentação' }));
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain('Tamanho incompleto')
    );
    expect(onSave).not.toHaveBeenCalled();
  });
  it('edição de preço e quantidade mantém os valores manuais separados', () => {
    const onUpdate = vi.fn();
    render(
      <FichaInsumoCard
        item={insumo}
        tipo="aviamento"
        usoKey="test"
        produto="teste"
        onUpdate={onUpdate}
        onEdit={() => {}}
        onRemove={() => {}}
      />
    );
    fireEvent.change(screen.getByLabelText('Preço por Metros (R$)'), { target: { value: '0,40' } });
    expect(onUpdate).toHaveBeenLastCalledWith({ custo: '0,40', precoOrigem: 'manual' });
    fireEvent.change(screen.getByLabelText('Quantidade (Metros)'), { target: { value: '0,8' } });
    expect(onUpdate).toHaveBeenLastCalledWith({ quantidade: '0,8' });
  });
});
