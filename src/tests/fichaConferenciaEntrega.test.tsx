import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthContext } from '../contexts/authContextInstance';
import type { AuthContextType } from '../types/auth';
import type { PecaItem } from '../types/plm';
import type { FichaVariante } from '../types/ficha';
import { FichaConferenciaPanel } from '../pages/Home/components/FichaConferenciaPanel';
import { PecaFluxoEtapasModal } from '../pages/Home/components/PecaFluxoEtapasModal';
import { FichaConsumoTamanhosEditor } from '../pages/Home/components/FichaConsumoTamanhosEditor';
import {
  assinaturaConferenciaVariante,
  conferirFicha,
  criarConfirmacao,
  contratoConferencia,
} from '../services/fichaProcesso';
import {
  atualizarConsumoPorTamanho,
  clonarInsumoSemConfirmacoes,
} from '../services/fichaConsumoTamanhos';
import { registrarAlteracoesFicha } from '../services/fichaAlteracoes';
import { confirmarAusentesTeste } from './fixtures/conferencia';
import { api } from '../services/api';

vi.mock('../services/api', () => ({ api: { post: vi.fn() } }));
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});
const autor = {
  id: 'u',
  nome: 'Estilista teste',
  email: 'test@example.invalid',
  empresa: 'Teste',
  cargo: 'Estilista',
  marcas: [],
};
const context: AuthContextType = {
  user: autor,
  isAuthenticated: true,
  activeMarca: null,
  login: vi.fn(),
  logout: vi.fn(),
  setActiveMarca: vi.fn(),
};
const variante: FichaVariante = {
  id: 'principal',
  nome: 'Principal',
  tecidos: [],
  aviamentos: [
    {
      id: 'a',
      nome: 'Material de teste',
      codigo: 'A1',
      componente: 'elastico',
      custo: '0,3671',
      unidade: 'Metros',
      quantidade: '2',
      fornecedores: '',
      temErp: false,
      consumoPorTamanho: { P: { valor: '0,5' }, M: { valor: '0,6' } },
    },
  ],
};
function pecaTeste(elastico = true): PecaItem {
  const v = structuredClone(variante);
  if (!elastico) v.aviamentos = [];
  return {
    id: 'p',
    colecaoId: 'c',
    marcaId: 'm',
    nome: 'Peça teste',
    codigo: 'P1',
    tipo: 'Peça',
    status: 'Em andamento',
    etapaAtual: '01 geração de ficha',
    tema: '',
    colecaoNome: 'Coleção teste',
    marcaNome: 'Marca teste',
    estilista: '',
    tecidos: [],
    previsaoEntrega: '',
    fichaTecnica: { tamanhos: ['P', 'M'], variantes: [v], conferencia: { gradeCompleta: true } },
  };
}
function abrirPanel(peca: PecaItem, autenticado = true) {
  const alteracoes = vi.fn();
  const corrigir = vi.fn();
  function Harness() {
    const [atual, setAtual] = useState(peca);
    return (
      <AuthContext.Provider value={{ ...context, user: autenticado ? autor : null }}>
        <FichaConferenciaPanel
          peca={atual}
          onCorrigir={corrigir}
          onChange={(conferencia) => {
            const proxima = { ...atual, fichaTecnica: { ...atual.fichaTecnica, conferencia } };
            setAtual(proxima);
            alteracoes(proxima);
          }}
          onVariantesChange={(variantes) => {
            const proxima = { ...atual, fichaTecnica: { ...atual.fichaTecnica, variantes } };
            setAtual(proxima);
            alteracoes(proxima);
          }}
        />
      </AuthContext.Provider>
    );
  }
  render(<Harness />);
  return { alteracoes, corrigir };
}
describe('Conferência explícita, por variante, antes da entrega', () => {
  it('não pré-seleciona respostas nem dispensa itens pelo nome', () => {
    const peca = pecaTeste(false);
    abrirPanel(peca);
    expect(screen.getAllByRole('combobox')).toHaveLength(4);
    screen
      .getAllByRole('combobox')
      .forEach((select) => expect((select as HTMLSelectElement).value).toBe(''));
    expect(conferirFicha(peca)).toHaveLength(4);
  });
  it('registra Não com autor, data/hora, e sem liberar outra variante', () => {
    const peca = pecaTeste(false);
    peca.fichaTecnica!.variantes!.push({ id: 'v2', nome: 'Azul', tecidos: [], aviamentos: [] });
    const { alteracoes } = abrirPanel(peca);
    fireEvent.change(screen.getByLabelText('Zíper se aplica à variante Principal?'), {
      target: { value: 'nao' },
    });
    const atual = alteracoes.mock.calls[0]![0] as PecaItem;
    const decisao = atual.fichaTecnica!.conferencia!.componentesPorVariante!.principal!.ziper!;
    expect(decisao.aplicavel).toBe(false);
    expect(decisao.responsavel).toEqual({ id: autor.id, nome: autor.nome });
    expect(Number.isFinite(Date.parse(decisao.registradoEm))).toBe(true);
    expect(atual.fichaTecnica!.conferencia!.componentesPorVariante!.v2).toBeUndefined();
    const historico = registrarAlteracoesFicha(peca, atual, autor).historicoAlteracoes!;
    expect(historico[0]!.campos[0]).toMatchObject({
      antes: 'Vazio',
      depois: expect.stringContaining('Não se aplica'),
    });
    expect(historico[0]!.responsavel.nome).toBe(autor.nome);
  });
  it('Sim sem item cadastrado mantém pendência e apresenta caminho de correção', () => {
    const { alteracoes, corrigir } = abrirPanel(pecaTeste(false));
    fireEvent.change(screen.getByLabelText('Zíper se aplica à variante Principal?'), {
      target: { value: 'sim' },
    });
    expect(
      conferirFicha(alteracoes.mock.calls[0]![0]).some((p) =>
        p.mensagem.includes('adicione e identifique')
      )
    ).toBe(true);
    fireEvent.click(screen.getAllByRole('button', { name: 'Abrir aviamentos' })[0]!);
    expect(corrigir).toHaveBeenCalledWith('aviamentos', 'principal', 'componente.ziper');
  });
  it('zero somente libera com confirmação nominal no tamanho e na variante', () => {
    const peca = pecaTeste();
    peca.fichaTecnica!.variantes![0]!.aviamentos[0]!.consumoPorTamanho!.M = { valor: '0' };
    confirmarAusentesTeste(peca);
    const { alteracoes } = abrirPanel(peca);
    const checkbox = screen.getByRole('checkbox', {
      name: /Confirmo que Material de teste NÃO é usado no tamanho M da variante Principal/,
    });
    expect((checkbox as HTMLInputElement).checked).toBe(false);
    expect(conferirFicha(peca).map((p) => p.campo)).toContain('consumo.a.M');
    fireEvent.click(checkbox);
    const atual = alteracoes.mock.calls[0]![0] as PecaItem;
    expect(conferirFicha(atual)).toEqual([]);
    const confirmado = atual.fichaTecnica!.variantes![0]!.aviamentos[0]!.consumoPorTamanho!.M!;
    expect(confirmado.confirmacaoZero!.responsavel.nome).toBe(autor.nome);
    expect(
      contratoConferencia(atual).variantes[0]!.insumos[0]!.consumoPorTamanho.M!.confirmacaoZero!
        .responsavelId
    ).toBe('u');
    const historico = registrarAlteracoesFicha(peca, atual, autor).historicoAlteracoes!;
    expect(historico[0]!.campos[0]!.depois).toContain('Consumo zero confirmado');
    fireEvent.click(checkbox);
    expect(conferirFicha(alteracoes.mock.calls[1]![0]).map((p) => p.campo)).toContain(
      'consumo.a.M'
    );
  });
  it('vazio, dispensa antiga e falta de usuário não recebem confirmação automática', () => {
    const peca = pecaTeste();
    peca.fichaTecnica!.variantes![0]!.aviamentos[0]!.consumoPorTamanho!.M = {
      valor: '',
      naoSeAplica: true,
    };
    confirmarAusentesTeste(peca);
    abrirPanel(peca, false);
    expect(screen.queryByRole('checkbox', { name: /Confirmo que.*NÃO/ })).toBeNull();
    expect(conferirFicha(peca).map((p) => p.campo)).toContain('consumo.a.M');
    screen
      .getAllByRole('combobox')
      .forEach((select) => expect((select as HTMLSelectElement).disabled).toBe(true));
  });
  it('somente elástico exige preenchimento por tamanho', () => {
    for (const componente of ['ziper', 'etiqueta', 'entretela'] as const) {
      const peca = pecaTeste();
      const item = peca.fichaTecnica!.variantes![0]!.aviamentos[0]!;
      item.componente = componente;
      delete item.consumoPorTamanho;
      confirmarAusentesTeste(peca);
      expect(conferirFicha(peca)).toEqual([]);
    }
  });
  it('retratos TypeScript e Java têm o mesmo formato', () => {
    expect(assinaturaConferenciaVariante(variante, ['P', 'M'])).toBe(
      '["principal",["P","M"],[["aviamentos","a","Material de teste","A1","elastico","0,3671","Metros","2",[["P","0,5",false],["M","0,6",false]]]]]'
    );
  });
  it('mudança de grade, preço, consumo ou variante invalida respostas antigas', () => {
    const peca = pecaTeste();
    peca.fichaTecnica!.variantes![0]!.aviamentos[0]!.consumoPorTamanho!.M = { valor: '0' };
    confirmarAusentesTeste(peca);
    const v = peca.fichaTecnica!.variantes![0]!;
    v.aviamentos[0]!.consumoPorTamanho!.M!.confirmacaoZero = criarConfirmacao(
      assinaturaConferenciaVariante(v, ['P', 'M']),
      { id: autor.id, nome: autor.nome }
    );
    expect(conferirFicha(peca)).toEqual([]);
    for (const alterar of [
      (p: PecaItem) => {
        p.fichaTecnica!.tamanhos!.push('G');
      },
      (p: PecaItem) => {
        p.fichaTecnica!.variantes![0]!.aviamentos[0]!.custo = '2';
      },
      (p: PecaItem) => {
        p.fichaTecnica!.variantes![0]!.aviamentos[0]!.quantidade = '5';
      },
      (p: PecaItem) => {
        p.fichaTecnica!.variantes![0]!.id = 'nova';
      },
    ]) {
      const copia = structuredClone(peca);
      alterar(copia);
      expect(conferirFicha(copia).map((p) => p.campo)).toContain('consumo.a.M');
    }
    const copia = clonarInsumoSemConfirmacoes(v.aviamentos[0]!);
    expect(copia.id).not.toBe('a');
    expect(copia.consumoPorTamanho!.M!.valor).toBe('0');
    expect(copia.consumoPorTamanho!.M!.confirmacaoZero).toBeUndefined();
    expect(v.aviamentos[0]!.consumoPorTamanho!.M!.confirmacaoZero).toBeDefined();
    const editado = atualizarConsumoPorTamanho(v.aviamentos[0]!.consumoPorTamanho, 'M', {
      valor: '0,00',
    });
    expect(editado.M!.confirmacaoZero).toBeUndefined();
  });
  it('editor de elástico permite corrigir a dispensa antiga e não substitui consumo por confirmação', () => {
    const onChange = vi.fn();
    render(
      <FichaConsumoTamanhosEditor
        elastico
        nomeInsumo="Elástico teste"
        unidade="Metros"
        tamanhos={['P']}
        value={{ P: { valor: '', naoSeAplica: true } }}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Consumo por tamanho de Elástico teste' }));
    const input = screen.getByLabelText('Consumo tamanho P — Elástico teste');
    expect((input as HTMLInputElement).disabled).toBe(false);
    fireEvent.change(input, { target: { value: '0' } });
    expect(onChange).toHaveBeenCalledWith({ P: { valor: '0', naoSeAplica: false } });
    expect(screen.queryByRole('checkbox')).toBeNull();
  });
  it('entrega valida no servidor só após confirmação do zero, mantendo o rascunho intacto', async () => {
    const peca = pecaTeste();
    peca.fichaTecnica!.variantes![0]!.aviamentos[0]!.consumoPorTamanho!.M = { valor: '0' };
    confirmarAusentesTeste(peca);
    const onSave = vi.fn();
    vi.mocked(api.post).mockResolvedValue({ valida: true, pendencias: [] });
    render(
      <AuthContext.Provider value={context}>
        <PecaFluxoEtapasModal
          peca={peca}
          marcaId="m"
          marcaNome="Marca teste"
          usuarios={[
            {
              ...autor,
              marcas: ['m'],
              status: 'Ativo',
              acesso: 'Permitido',
              brandRoles: [
                { marcaId: 'm', marcaNome: 'Marca teste', cargo: 'Estilista', times: [] },
              ],
            },
          ]}
          onSave={onSave}
          onClose={() => {}}
        />
      </AuthContext.Provider>
    );
    fireEvent.change(screen.getByLabelText('Nova Etapa'), {
      target: { value: '02 engenharia recebimento' },
    });
    fireEvent.change(screen.getByLabelText('Responsável'), { target: { value: autor.nome } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar movimentação' }));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('consumo zero'));
    expect(api.post).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole('checkbox', {
        name: /Confirmo que Material de teste NÃO é usado no tamanho M da variante Principal/,
      })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Salvar movimentação' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0]![0].etapaAtual).toBe('02 engenharia recebimento');
    expect(
      peca.fichaTecnica!.variantes![0]!.aviamentos[0]!.consumoPorTamanho!.M!.confirmacaoZero
    ).toBeUndefined();
  });
});
