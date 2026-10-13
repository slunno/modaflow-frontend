import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import {
  registrarAlteracoesFicha,
  registrarCriacaoPeca,
  registrarAlteracoesAnexos,
} from '../services/fichaAlteracoes';
import { FichaAlteracoesPanel } from '../pages/Home/components/FichaAlteracoesPanel';
import type { PecaItem } from '../types/plm';
import type { FichaAnexo } from '../services/fichaAnexosStorage';

const autor = { id: 'usuario-teste', nome: 'Usuária de teste' };
const peca: PecaItem = {
  id: 'peca-teste',
  nome: 'Peça teste',
  codigo: '',
  tipo: 'Camisa',
  status: 'Em andamento',
  etapaAtual: '',
  tema: '',
  colecaoNome: '',
  marcaNome: '',
  estilista: '',
  tecidos: [],
  previsaoEntrega: '',
  fichaTecnica: {
    descricao: '',
    tecnica: '',
    estampa: '',
    observacoesGerais: '',
    variantes: [
      {
        id: 'principal',
        nome: 'Principal',
        tecidos: [
          {
            id: 'tecido',
            nome: 'Tecido teste',
            codigo: '01',
            temErp: false,
            fornecedores: '',
            custo: '',
            unidade: 'KG',
            consumo: '1',
            uso: '',
          },
        ],
        aviamentos: [],
      },
    ],
  },
};

describe('Histórico local de alterações', () => {
  it('registra criação com nome original, instante e autor real, sem presumir criação anterior', () => {
    const created = registrarCriacaoPeca(peca, autor);
    expect(created.historicoAlteracoes).toHaveLength(1);
    expect(created.historicoAlteracoes![0]).toMatchObject({
      titulo: 'Peça criada',
      nomePeca: 'Peça teste',
      responsavel: autor,
      campos: [],
    });
    expect(Number.isFinite(Date.parse(created.historicoAlteracoes![0]!.registradoEm))).toBe(true);
    const old = registrarAlteracoesFicha(peca, { ...peca, tema: 'Novo tema' }, autor);
    expect(old.historicoAlteracoes?.some((event) => event.tipo === 'criacao')).toBe(false);
  });

  it('de quatro campos vazios registra apenas os dois que foram preenchidos', () => {
    const updated = registrarAlteracoesFicha(
      peca,
      {
        ...peca,
        fichaTecnica: {
          ...peca.fichaTecnica,
          descricao: 'Descrição adicionada',
          tecnica: 'Técnica adicionada',
        },
      },
      autor
    );
    expect(updated.historicoAlteracoes).toHaveLength(1);
    expect(updated.historicoAlteracoes![0]).toMatchObject({
      titulo: 'Geral atualizada',
      responsavel: autor,
      campos: [
        { campo: 'Descrição', antes: 'Vazio', depois: 'Descrição adicionada' },
        { campo: 'Técnicas', antes: 'Vazio', depois: 'Técnica adicionada' },
      ],
    });
    expect(
      registrarAlteracoesFicha(updated, structuredClone(updated), autor).historicoAlteracoes
    ).toHaveLength(1);
    render(<FichaAlteracoesPanel peca={updated} />);
    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(3);
    expect(within(table).queryByText('Estampa')).toBeNull();
    expect(screen.getAllByText(/Usuária de teste/).length).toBeGreaterThan(0);
    expect(document.querySelector('time')?.getAttribute('datetime')).toBe(
      updated.historicoAlteracoes![0]!.registradoEm
    );
  });

  it('preserva antes/depois do tecido e agrupa a alteração da variante sem alterar a origem', () => {
    const next = structuredClone(peca);
    const variant = next.fichaTecnica!.variantes![0]!;
    variant.nome = 'Nome novo';
    variant.tecidos[0]!.uso = 'Uso preenchido';
    variant.tecidos[0]!.consumo = '2';
    const result = registrarAlteracoesFicha(peca, next, autor);
    expect(result.historicoAlteracoes?.map((event) => event.secao)).toEqual([
      'Variantes',
      'Tecidos',
    ]);
    expect(result.historicoAlteracoes![1]!.campos).toEqual([
      { campo: 'Nome novo / Tecido teste — Consumo', antes: '1', depois: '2' },
      { campo: 'Nome novo / Tecido teste — Uso', antes: 'Vazio', depois: 'Uso preenchido' },
    ]);
    expect(peca.fichaTecnica!.variantes![0]!.tecidos[0]!.consumo).toBe('1');
  });

  it('registra campos apagados e insumos removidos sem listar vazios que não mudaram', () => {
    const filled = {
      ...peca,
      fichaTecnica: { ...peca.fichaTecnica, descricao: 'Descrição antiga' },
    };
    const cleared = {
      ...filled,
      fichaTecnica: {
        ...filled.fichaTecnica,
        descricao: '',
        variantes: [{ id: 'principal', nome: 'Principal', tecidos: [], aviamentos: [] }],
      },
    };
    const result = registrarAlteracoesFicha(filled, cleared, autor);
    expect(result.historicoAlteracoes![0]!.campos).toEqual([
      { campo: 'Descrição', antes: 'Descrição antiga', depois: 'Vazio' },
    ]);
    const fabric = result.historicoAlteracoes!.find((event) => event.secao === 'Tecidos')!;
    expect(fabric.campos.every((field) => field.depois === 'Vazio')).toBe(true);
    expect(fabric.campos.some((field) => field.campo.endsWith('Uso'))).toBe(false);
  });

  it('audita fotos pelo nome, sem duplicar base64 no histórico ou criar versões integradas', () => {
    const next = {
      ...peca,
      fichaTecnica: {
        ...peca.fichaTecnica,
        provaRoupa: {
          data: '2026-10-02',
          observacoes: 'Ajuste teste',
          fotos: [{ id: 'foto', nome: 'prova.png', imagemUrl: 'data:image/png;base64,TESTE' }],
        },
      },
    };
    const saved = registrarAlteracoesFicha(peca, next, autor);
    expect(saved.historicoAlteracoes![0]!.campos).toHaveLength(3);
    expect(JSON.stringify(saved.historicoAlteracoes)).not.toContain('base64');
    expect(saved.historicoIntegracoes).toBeUndefined();
    expect(registrarAlteracoesFicha(peca, peca, null).historicoAlteracoes).toEqual([]);
  });

  it('registro automático de anexos contém apenas o arquivo adicionado ou removido', () => {
    const anexo: FichaAnexo = {
      id: 'file',
      pieceKey: 'marca:peca',
      categoria: 'referencias',
      nome: 'foto.png',
      tamanho: 4,
      tipo: 'image/png',
      arquivo: new Blob(['foto']),
      criadoEm: Date.now(),
    };
    const saved = registrarAlteracoesAnexos(peca, [], [anexo], autor);
    expect(saved.historicoAlteracoes![0]!.campos).toEqual([
      { campo: 'Imagens de referência — foto.png', antes: 'Vazio', depois: 'foto.png' },
    ]);
    const removed = registrarAlteracoesAnexos(saved, [anexo], [], autor);
    expect(removed.historicoAlteracoes![1]!.campos[0]).toMatchObject({
      antes: 'foto.png',
      depois: 'Vazio',
    });
    expect(registrarAlteracoesAnexos(saved, [anexo], [anexo], autor)).toBe(saved);
  });

  it('registra a remoção da imagem da Principal exibida a partir dos anexos', () => {
    const anexo: FichaAnexo = {
      id: 'capa',
      pieceKey: 'marca:peca',
      categoria: 'variantes',
      nome: 'capa.png',
      tamanho: 4,
      tipo: 'image/png',
      arquivo: new Blob(['foto']),
      criadoEm: Date.now(),
    };
    const next = structuredClone(peca);
    next.fichaTecnica!.variantes![0]!.imagemRemovida = true;
    const result = registrarAlteracoesFicha(peca, next, autor, [anexo]);
    expect(result.historicoAlteracoes![0]!.campos).toEqual([
      { campo: 'Imagem — Principal', antes: 'capa.png', depois: 'Vazio' },
    ]);
    expect(registrarAlteracoesFicha(peca, peca, autor, [anexo]).historicoAlteracoes).toEqual([]);
  });
});
