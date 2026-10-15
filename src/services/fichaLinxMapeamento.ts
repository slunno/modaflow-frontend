import type { PecaItem, ColecaoItem } from '../types/plm';
import type { LinxGradeDetalhe } from '../types/fichaLinxMapeamento';
import { coresMostruarioLinx, variantePrincipalLinx } from './fichaPrincipalLinx';
import { vinculosCamposParaPlanejamento } from './fichaCamposLinx';

/** Não lê rede, não grava e não deduz uma posição pela ordem dos tamanhos do portal. */
export function conferirGradeLinx(grade: string, tamanhos: string[], detalhe?: LinxGradeDetalhe) {
  const pendencias: string[] = [];
  const avisos: string[] = [];
  const mapeamento: Array<{ tamanho: string; posicao: number; campo: string }> = [];
  if (!grade.trim() || !detalhe || detalhe.grade !== grade.trim()) {
    return {
      pendencias: ['Consulte as posições da grade selecionada no Linx.'],
      avisos,
      mapeamento,
    };
  }
  if (
    !Array.isArray(detalhe.posicoes) ||
    detalhe.posicoes.length !== 48 ||
    detalhe.posicoes.some(
      (p) =>
        !p ||
        !Number.isInteger(p.posicao) ||
        p.posicao < 1 ||
        p.posicao > 48 ||
        (p.tamanho !== null &&
          (typeof p.tamanho !== 'string' || !p.tamanho.trim() || p.tamanho.length > 8))
    ) ||
    new Set(detalhe.posicoes.map((p) => p.posicao)).size !== 48 ||
    !Number.isInteger(detalhe.numeroTamanhos) ||
    detalhe.numeroTamanhos < 1 ||
    detalhe.numeroTamanhos > 48
  ) {
    return {
      pendencias: ['Resposta de grade inválida; nenhuma posição será utilizada.'],
      avisos,
      mapeamento,
    };
  }
  const preenchidas = detalhe.posicoes.filter((p) => p.tamanho !== null);
  if (!preenchidas.length) pendencias.push('A grade Linx não possui tamanhos identificados.');
  if (preenchidas.length !== detalhe.numeroTamanhos) {
    avisos.push(
      `Linx informa NUMERO_TAMANHOS = ${detalhe.numeroTamanhos}, mas possui ${preenchidas.length} posições com nome. As posições vazias não serão preenchidas automaticamente.`
    );
  }
  if (new Set(preenchidas.map((p) => p.tamanho)).size !== preenchidas.length) {
    pendencias.push(
      'A grade Linx repete nomes de tamanhos; corrija o cadastro antes do mapeamento.'
    );
    return { pendencias, avisos, mapeamento };
  }
  if (tamanhos.some((t) => !t.trim()) || new Set(tamanhos).size !== tamanhos.length)
    pendencias.push('A seleção do portal contém tamanhos vazios ou repetidos.');
  for (const tamanho of tamanhos) {
    const posicao = preenchidas.find((p) => p.tamanho === tamanho);
    if (!posicao) pendencias.push(`Tamanho “${tamanho}” não existe nessa grade Linx.`);
    else mapeamento.push({ tamanho, posicao: posicao.posicao, campo: `C${posicao.posicao}` });
  }
  const faltantes = preenchidas.filter((p) => !tamanhos.includes(p.tamanho!)).map((p) => p.tamanho);
  if (faltantes.length)
    pendencias.push(`Tamanhos da grade ainda não selecionados no portal: ${faltantes.join(', ')}.`);
  return { pendencias, avisos, mapeamento };
}

/** Projeção local para revisão, não um payload executável de escrita. */
export function projetarMapeamentoLinx(peca: PecaItem, colecao: ColecaoItem) {
  const ficha = peca.fichaTecnica;
  const grade = conferirGradeLinx(
    ficha?.integracao?.grade ?? '',
    ficha?.tamanhos ?? [],
    ficha?.gradeLinx
  );
  const pendencias = [...grade.pendencias];
  if (!peca.marcaId || peca.marcaId !== colecao.marcaId || peca.colecaoId !== colecao.id)
    pendencias.push('A peça não pertence à marca/coleção do mapeamento.');
  // Geral define a cor de mostruário; descrições não são convertidas em códigos ERP.
  const coresMostruario = coresMostruarioLinx(peca);
  const principal = variantePrincipalLinx(peca);
  const variantes = (principal ? [principal] : []).map((variante) => {
    return {
      varianteId: variante.id,
      nome: variante.nome,
      consumos: (['tecidos', 'aviamentos'] as const).flatMap((tipo) =>
        variante[tipo].map((insumo) => ({
          tipo,
          insumoId: insumo.id,
          /** Não transforma um código manual de cadastro em uma referência já validada no Linx. */
          materialLinx: insumo.linxDados?.codigo ?? null,
          itemLinx: insumo.linxDados?.item ?? null,
          coresMaterial: (insumo.coresList ?? [])
            .filter((cor) => cor.origemLinx?.materialCodigo === insumo.codigo.trim())
            .map(({ nome, origemLinx }) => ({ nome, codigo: origemLinx!.corCodigo })),
          porTamanho: grade.mapeamento.flatMap((posicao) => {
            const consumo = insumo.consumoPorTamanho?.[posicao.tamanho];
            // Não preenche vazios, propaga consumo geral ou inventa zeros.
            return consumo?.valor.trim()
              ? [
                  {
                    ...posicao,
                    valorDigitado: consumo.valor,
                    naoSeAplica: consumo.naoSeAplica ?? false,
                  },
                ]
              : [];
          }),
        }))
      ),
    };
  });
  if (!variantes.length) pendencias.push('Nenhuma variante foi informada para o mapeamento.');
  return {
    somentePlanejamento: true,
    escopo: 'SOMENTE_PRINCIPAL' as const,
    exigeReleituraNoServidor: true,
    vinculosCampos: vinculosCamposParaPlanejamento(),
    coresMostruario,
    grade,
    variantes,
    pendencias,
  };
}
