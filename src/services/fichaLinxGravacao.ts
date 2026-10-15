import type { ColecaoItem, PecaItem } from '../types/plm';
import { contratoConferencia, conferirFicha } from './fichaProcesso';
import { variantePrincipalLinx } from './fichaPrincipalLinx';
import { registrarIntegracaoConfirmada } from './fichaHistorico';
import type {
  LinxWriteIdentity,
  LinxWritePatch,
  LinxWritePreview,
  LinxWriteReceipt,
} from '../types/linxGravacao';
const text = (value: unknown) => String(value ?? '').trim();
const same = (a: unknown, b: unknown) => text(a).replace(',', '.') === text(b).replace(',', '.');

/** Só a Principal e os deltas conhecidos. Nunca transporta fotos, variantes, preço ou cadastro fiscal. */
export function prepararGravacaoDireta(
  peca: PecaItem,
  referencia: PecaItem,
  colecao: ColecaoItem,
  descartar = false
) {
  if (!peca.marcaId || peca.marcaId !== colecao.marcaId || peca.colecaoId !== colecao.id)
    throw new Error('A peça não pertence à marca/coleção aberta.');
  const origem = peca.linxOrigem;
  const versao = peca.fichaTecnica?.linxVersaoImportada;
  if (
    !origem ||
    !versao ||
    origem.codigoProduto.trim() !== peca.codigo.trim() ||
    origem.griffe !== colecao.griffe
  )
    throw new Error(
      'Esta etapa atualiza fichas já vinculadas ao Linx. Produto novo depende do cadastro fiscal/operacional no ERP, que não virá do site.'
    );
  if (peca.fichaTecnica?.linxColecaoOrigem?.trim() !== origem.colecaoCodigo.trim())
    throw new Error('Carregue o vínculo explícito da ficha com esta coleção antes de enviar.');
  const pendencias = conferirFicha(peca, true);
  if (pendencias.length) throw new Error(pendencias.map((item) => item.mensagem).join('\n'));
  const principal = variantePrincipalLinx(peca);
  if (!principal) throw new Error('Cadastre a Principal.');
  const identidade: LinxWriteIdentity = {
    produto: peca.codigo.trim(),
    griffe: origem.griffe,
    colecao: origem.colecaoCodigo.trim(),
    descColecao: colecao.nome.trim(),
    versao: versao.trim(),
  };
  const alteracoes: LinxWritePatch[] = [];
  const patch = (
    tabela: LinxWritePatch['tabela'],
    chave: Record<string, string>,
    valores: Record<string, string | number>
  ) => {
    if (Object.keys(valores).length)
      alteracoes.push({ tabela, chave, valores, excluir: false, descarteConfirmado: false });
  };
  // Nome/cores do produto pertencem ao cadastro GLOBAL. Não sobrescrever outra coleção.
  const atuais = [...principal.tecidos, ...principal.aviamentos];
  const base = variantePrincipalLinx(referencia);
  const originais = base ? [...base.tecidos, ...base.aviamentos] : [];
  for (const item of atuais) {
    const source = item.linxDados;
    if (!source || item.codigo.trim() !== source.codigo.trim())
      throw new Error(
        `${item.nome}: inclusão/troca de material ainda exige definir item, fase e setor no ERP. Nenhuma alteração será enviada parcialmente.`
      );
    if (
      text(source.dados.PRODUTO) !== identidade.produto ||
      text(source.dados.VERSAO_FICHA) !== identidade.versao
    )
      throw new Error(`${item.nome}: a origem do insumo não corresponde à ficha atual.`);
    const valores: Record<string, string | number> = {};
    if (!same(item.uso, source.dados.DESC_USO_MATERIAL)) valores.DESC_USO_MATERIAL = item.uso ?? '';
    for (const [tamanho, consumo] of Object.entries(item.consumoPorTamanho ?? {})) {
      const posicoes: Array<{ posicao: number; tamanho: string | null }> =
        peca.fichaTecnica?.gradeLinx?.posicoes.filter((position) => position.tamanho === tamanho) ??
        [];
      if (posicoes.length !== 1)
        throw new Error(`${item.nome}: consulte a grade Linx para mapear o tamanho ${tamanho}.`);
      const column = `C${posicoes[0]!.posicao}`;
      if (!consumo.valor.trim()) {
        if (source.dados[column] != null)
          throw new Error(
            `${item.nome}: consumo apagado em ${tamanho}. Informe o valor; vazio não será convertido em zero.`
          );
        continue;
      }
      if (!same(consumo.valor, source.dados[column])) valores[column] = consumo.valor.trim();
    }
    const chave = { MATERIAL: source.codigo.trim(), ITEM: source.item.trim() };
    patch('PRODUTO_VERSAO_MATERIAL', chave, valores);
    const novasCores = (item.coresList ?? []).filter(
      (cor) =>
        cor.origemLinx &&
        !source.cores.some((row) => same(row.COR_MATERIAL, cor.origemLinx!.corCodigo))
    );
    if (
      novasCores.length ||
      (item.corLinx && !source.cores.some((row) => same(row.COR_MATERIAL, item.corLinx!.corCodigo)))
    ) {
      const target = principal.corProdutoLinx;
      const selected = item.corLinx;
      if (
        !target ||
        !selected ||
        novasCores.length > 1 ||
        selected.materialCodigo !== source.codigo ||
        target.produto !== identidade.produto ||
        target.griffe !== identidade.griffe ||
        target.colecao !== identidade.colecao ||
        target.inativa
      )
        throw new Error(
          `${item.nome}: falta o vínculo explícito entre a cor do material e a cor do produto da Principal.`
        );
      const corresponding = source.cores.filter(
        (cor) => text(cor.COR_PRODUTO) === target.corProduto
      );
      if (corresponding.length !== 1)
        throw new Error(`${item.nome}: vínculo de cor ERP inexistente ou ambíguo.`);
      patch(
        'PRODUTO_VERSAO_MATERIAL_COR',
        { ...chave, COR_PRODUTO: target.corProduto },
        { COR_MATERIAL: selected.corCodigo }
      );
    }
  }
  for (const item of originais)
    if (item.linxDados && !atuais.some((atual) => atual.id === item.id)) {
      if (!descartar)
        throw new Error(
          'Há materiais removidos. Confirme expressamente o descarte dos materiais e seus vínculos de cor.'
        );
      alteracoes.push({
        tabela: 'PRODUTO_VERSAO_MATERIAL',
        chave: { MATERIAL: item.linxDados.codigo.trim(), ITEM: item.linxDados.item.trim() },
        valores: {},
        excluir: true,
        descarteConfirmado: true,
      });
    }
  const color = principal.corProdutoLinx;
  const mostruario = (peca.fichaTecnica?.coresMostruario ?? []).filter(
    (cor) => cor.origemMostruario === 'linx'
  );
  if (
    color &&
    mostruario.length === 1 &&
    mostruario[0]?.codigo &&
    !same(color.corBasica, mostruario[0].codigo)
  ) {
    if (
      color.produto !== identidade.produto ||
      color.griffe !== identidade.griffe ||
      color.colecao !== identidade.colecao ||
      color.inativa
    )
      throw new Error('O vínculo de cor do produto não corresponde à Principal desta coleção.');
    throw new Error(
      'A cor global do produto é compartilhada. Mantenha a cor local ou selecione um vínculo ERP existente; ela não será renomeada por esta coleção.'
    );
  }
  return { identidade, conferencia: contratoConferencia(peca, true), alteracoes };
}

export function validarReciboGravacao(
  recibo: LinxWriteReceipt,
  preview: LinxWritePreview,
  novaVersao = false
) {
  if (
    !recibo ||
    recibo.status !== 'CONFIRMADA' ||
    recibo.escopo !== (novaVersao ? 'NOVA_VERSAO_COLECAO' : 'CAMPOS_MAPEADOS') ||
    !recibo.integracaoId ||
    !Number.isFinite(Date.parse(recibo.confirmadaEm)) ||
    !recibo.identidade ||
    (Object.keys(preview.identidade) as Array<keyof LinxWriteIdentity>).some(
      (key) => recibo.identidade[key] !== preview.identidade[key]
    )
  )
    throw new Error(
      'Resposta sem confirmação válida da ficha enviada. Não foi marcado como integrado.'
    );
}

/** Atualiza só a base dos campos confirmados. Não cria versão nem declara a ficha inteira integrada. */
export function aplicarReciboCamposMapeados(
  peca: PecaItem,
  preview: LinxWritePreview,
  recibo: LinxWriteReceipt
): PecaItem {
  validarReciboGravacao(recibo, preview);
  const updated = structuredClone(peca);
  updated.linxUltimaGravacao = structuredClone(recibo);
  const principal = variantePrincipalLinx(updated);
  if (!principal) return updated;
  for (const item of [...principal.tecidos, ...principal.aviamentos]) {
    const source = item.linxDados;
    if (!source) continue;
    for (const change of preview.alteracoes) {
      if (
        change.chave.MATERIAL !== source.codigo ||
        change.chave.ITEM !== source.item ||
        change.exclusao
      )
        continue;
      if (change.tabela === 'PRODUTO_VERSAO_MATERIAL') source.dados[change.campo] = change.depois;
      if (change.tabela === 'PRODUTO_VERSAO_MATERIAL_COR') {
        const cor = source.cores.find((row) => text(row.COR_PRODUTO) === change.chave.COR_PRODUTO);
        if (cor) cor[change.campo] = change.depois;
      }
    }
  }
  return updated;
}

/** A mesma referência em outra coleção SEMPRE cria versão; nunca atualiza a fonte. */
export function prepararNovaVersao(
  peca: PecaItem,
  referencia: PecaItem,
  colecao: ColecaoItem,
  colecaoLinx: string,
  descricaoVersao: string,
  descartar = false
) {
  if (peca.linxOrigem)
    throw new Error('Esta peça já possui versão própria. Edite-a dentro de sua coleção.');
  const source = peca.linxReferenciaCopia;
  if (!source || source.produto !== peca.codigo.trim() || source.griffe !== colecao.griffe)
    throw new Error('Carregue explicitamente a ficha de referência deste código e griffe.');
  if (!colecaoLinx.trim() || colecaoLinx.trim() === source.colecao)
    throw new Error('Informe o código Linx da coleção de destino, diferente da referência.');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(peca.id))
    throw new Error('A criação exige uma peça nova do portal, identificada por UUID.');
  // A identidade temporária serve APENAS para calcular deltas da referência; nunca é salva.
  const asSource = (item: PecaItem): PecaItem => ({
    ...item,
    linxOrigem: {
      codigoProduto: source.produto,
      griffe: source.griffe,
      colecaoCodigo: source.colecao,
    },
    fichaTecnica: {
      ...item.fichaTecnica,
      linxVersaoImportada: source.versao,
      linxColecaoOrigem: source.colecao,
    },
  });
  const request = prepararGravacaoDireta(asSource(peca), asSource(referencia), colecao, descartar);
  return {
    pecaId: peca.id,
    origem: structuredClone(source),
    destino: { colecao: colecaoLinx.trim(), descColecao: colecao.nome.trim() },
    descricaoVersao: descricaoVersao.trim(),
    conferencia: request.conferencia,
    alteracoes: request.alteracoes,
  };
}

export function aplicarReciboNovaVersao(
  peca: PecaItem,
  colecao: ColecaoItem,
  preview: LinxWritePreview,
  recibo: LinxWriteReceipt
): PecaItem {
  validarReciboGravacao(recibo, preview, true);
  if (
    peca.linxOrigem ||
    recibo.integracaoId !== peca.id ||
    recibo.identidade.produto !== peca.codigo.trim() ||
    recibo.identidade.griffe !== colecao.griffe ||
    recibo.identidade.descColecao !== colecao.nome.trim() ||
    peca.colecaoId !== colecao.id ||
    peca.marcaId !== colecao.marcaId
  )
    throw new Error('O recibo de nova versão não pertence à peça/coleção abertas.');
  // Reaproveita a aplicação dos deltas, mas não confunde os dois tipos de recibo.
  const updated = aplicarReciboCamposMapeados(peca, preview, {
    ...recibo,
    escopo: 'CAMPOS_MAPEADOS',
  });
  updated.linxUltimaGravacao = structuredClone(recibo);
  updated.linxOrigem = {
    codigoProduto: recibo.identidade.produto,
    colecaoCodigo: recibo.identidade.colecao,
    griffe: recibo.identidade.griffe,
  };
  updated.fichaTecnica = {
    ...updated.fichaTecnica,
    linxVersaoImportada: recibo.identidade.versao,
    linxColecaoOrigem: recibo.identidade.colecao,
  };
  const principal = variantePrincipalLinx(updated);
  if (principal) {
    for (const item of [...principal.tecidos, ...principal.aviamentos])
      if (item.linxDados) {
        item.linxDados.dados.VERSAO_FICHA = recibo.identidade.versao;
        for (const color of item.linxDados.cores)
          if ('VERSAO_FICHA' in color) color.VERSAO_FICHA = recibo.identidade.versao;
      }
    if (principal.corProdutoLinx) principal.corProdutoLinx.colecao = recibo.identidade.colecao;
  }
  if (colecao.regraFicha !== 'integracao-colecao-v1') return updated;
  return registrarIntegracaoConfirmada(updated, colecao, {
    status: 'CONFIRMADA',
    integracaoId: recibo.integracaoId,
    confirmadaEm: recibo.confirmadaEm,
    produto: recibo.identidade.produto,
    griffe: recibo.identidade.griffe,
    colecaoId: colecao.id,
    descColecao: colecao.nome.trim(),
    colecaoLinxCodigo: recibo.identidade.colecao,
    versaoLinx: recibo.identidade.versao,
  });
}
