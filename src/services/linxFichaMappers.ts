import type { FichaInsumo } from '../types/ficha';
import type { LinxFichaDetalhe, LinxFichaMaterial } from '../types/linx';
import type { PecaItem } from '../types/plm';

/** Apenas posições nomeadas; NUMERO_TAMANHOS inclui posições vazias em algumas grades. */
export function getLinxFichaTamanhos(ficha: LinxFichaDetalhe): string[] {
  const nomes: string[] = [];
  for (let i = 1; i <= 48; i++) {
    const nome = ficha.materiais
      .map((item) => String(item.dados[`TAMANHO_${i}`] ?? '').trim())
      .find(Boolean);
    if (nome && !nomes.includes(nome)) nomes.push(nome);
  }
  return nomes;
}

/** Os valores cuja equivalência ainda não foi definida permanecem em linxDados. */
export function mapLinxMaterialToInsumo(material: LinxFichaMaterial, versao: string): FichaInsumo {
  const porTamanho =
    material.dados.CONSUMO_P_TAMANHO === true ||
    material.dados.CONSUMO_P_TAMANHO === 1 ||
    material.dados.CONSUMO_P_TAMANHO === '1';
  const consumoPorTamanho: FichaInsumo['consumoPorTamanho'] = {};
  if (porTamanho)
    for (let i = 1; i <= 48; i++) {
      const tamanho = String(material.dados[`TAMANHO_${i}`] ?? '').trim();
      if (tamanho) consumoPorTamanho[tamanho] = { valor: String(material.dados[`C${i}`] ?? '') };
    }
  return {
    id: `linx-${versao}-${material.item}-${material.codigo}`,
    nome: material.nome ?? material.codigo,
    codigo: material.codigo,
    temErp: true,
    fornecedores: '',
    custo: '',
    unidade: String(material.dados.UNID_FICHA_TEC ?? ''),
    uso: String(material.dados.DESC_USO_MATERIAL ?? ''),
    observacoes: String(material.dados.OBS_MATERIAL ?? ''),
    linxDados: structuredClone(material),
    ...(porTamanho ? { consumoPorTamanho } : {}),
  };
}

export function getLinxFichaInsumos(ficha: LinxFichaDetalhe) {
  return {
    tecidos: ficha.materiais
      .filter((item) => item.grupo === 'TECIDO')
      .map((item) => mapLinxMaterialToInsumo(item, ficha.versao.versao)),
    aviamentos: ficha.materiais
      .filter((item) => item.grupo !== 'TECIDO')
      .map((item) => mapLinxMaterialToInsumo(item, ficha.versao.versao)),
  };
}

export function getPecaInsumoLabels(peca: PecaItem, tipo: 'tecidos' | 'aviamentos'): string[] {
  if (peca.fichaTecnica?.variantes) {
    return [
      ...new Set(
        peca.fichaTecnica.variantes
          .flatMap((variante) => variante[tipo])
          .map((item) =>
            item.nome ? `${item.nome}${item.codigo ? ` (${item.codigo})` : ''}` : item.codigo
          )
          .filter(Boolean)
      ),
    ];
  }
  if (peca.linxFichaResumo) return peca.linxFichaResumo[tipo];
  // O material principal do cadastro não é uma ficha e pode nem ser um tecido.
  if (peca.linxOrigem) return [];
  return peca[tipo] ?? [];
}
export function hasPecaInsumosConfirmados(peca: PecaItem): boolean {
  return !!(peca.fichaTecnica?.variantes || peca.linxFichaResumo || !peca.linxOrigem);
}
