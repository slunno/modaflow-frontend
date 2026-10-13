import type { PecaItem, ColecaoItem } from '../types/plm';
import type { FichaInsumo, FichaVariante } from '../types/ficha';
import type { FichaConfirmacao, FichaPendencia } from '../types/fichaProcesso';
import { api } from './api';
import type { FichaAnexo } from './fichaAnexosStorage';
import { planejarOperacaoLinx } from './fichaLinxPlanejamento';
import { projetarMapeamentoLinx } from './fichaLinxMapeamento';
import { projetarFichaPrincipalLinx, variantePrincipalLinx } from './fichaPrincipalLinx';
import { itemNoContextoDaCor } from './insumoInformacoesCores';

export function manifestoAnexos(anexos: FichaAnexo[]) {
  return anexos
    .map(({ id, categoria, nome, tamanho, tipo, criadoEm }) => ({
      id,
      categoria,
      nome,
      tamanho,
      tipo,
      criadoEm,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}
export const assinaturaAnexos = (anexos: FichaAnexo[]) => JSON.stringify(manifestoAnexos(anexos));

/** Sem separador de milhar: evita interpretar silenciosamente 1.234 como 1234. */
export function decimalManual(valor?: string): number | null {
  const texto = valor?.trim() ?? '';
  if (!/^\d+(?:[.,]\d{1,8})?$/.test(texto)) return null;
  const numero = Number(texto.replace(',', '.'));
  return Number.isFinite(numero) && numero <= 1e12 ? numero : null;
}
/** Equivalências de escrita, não fatores de conversão. Preserva a unidade original do insumo. */
export function normalizarUnidadeInsumo(unidade: string): 'kg' | 'metros' | 'unidade' | null {
  const nome = unidade.trim().toLowerCase();
  if (['kg', 'quilo', 'quilos', 'quilograma', 'quilogramas'].includes(nome)) return 'kg';
  if (['m', 'mt', 'mts', 'metro', 'metros'].includes(nome)) return 'metros';
  if (['un', 'und', 'unid', 'unidade', 'unidades'].includes(nome)) return 'unidade';
  return null;
}

/** Quantidade manual na unidade do preço. Nunca converte metragem em peso nem escolhe um Cn. */
export function baseConsumoInsumo(item: FichaInsumo, tipo: 'tecidos' | 'aviamentos') {
  item = itemNoContextoDaCor(item);
  const unidade = normalizarUnidadeInsumo(item.unidade);
  const campo = tipo === 'aviamentos' ? 'quantidade' : unidade === 'kg' ? 'peso' : 'consumo';
  return { campo, valor: item[campo], unidade };
}

export function custoConsumo(item: FichaInsumo, tipo: 'tecidos' | 'aviamentos'): number | null {
  item = itemNoContextoDaCor(item);
  const preco = decimalManual(item.custo);
  const base = baseConsumoInsumo(item, tipo);
  const consumo = decimalManual(base.valor);
  return preco === null || consumo === null || base.unidade === null ? null : preco * consumo;
}
export const formatarCusto = (valor: number | null) =>
  valor === null
    ? 'Não informado'
    : new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      }).format(valor);

export const COMPONENTES_FICHA = {
  ziper: 'Zíper',
  etiqueta: 'Etiqueta',
  elastico: 'Elástico',
  entretela: 'Entretela',
} as const;

/** Contrato determinístico também recalculado no backend; não inclui as próprias confirmações. */
export function assinaturaConferenciaVariante(
  variante: FichaVariante,
  tamanhos: readonly string[]
): string {
  const insumos = [
    ...variante.tecidos.map((item) => ({ ...item, tipo: 'tecidos' as const })),
    ...variante.aviamentos.map((item) => ({ ...item, tipo: 'aviamentos' as const })),
  ].sort((a, b) =>
    `${a.tipo}:${a.id}` < `${b.tipo}:${b.id}`
      ? -1
      : `${a.tipo}:${a.id}` > `${b.tipo}:${b.id}`
        ? 1
        : 0
  );
  return JSON.stringify([
    variante.id,
    tamanhos,
    insumos.map((item) => [
      item.tipo,
      item.id,
      item.nome,
      item.codigo,
      item.componente ?? '',
      item.custo,
      item.unidade,
      baseConsumoInsumo(item, item.tipo).valor ?? '',
      tamanhos.map((tamanho) => [
        tamanho,
        item.consumoPorTamanho?.[tamanho]?.valor ?? '',
        item.consumoPorTamanho?.[tamanho]?.naoSeAplica === true,
      ]),
    ]),
  ]);
}

export function confirmacaoAtual(
  registro: FichaConfirmacao | undefined,
  assinatura: string
): boolean {
  return (
    !!registro &&
    registro.assinaturaInsumos === assinatura &&
    registro.responsavel?.id != null &&
    String(registro.responsavel.id).trim() !== '' &&
    !!registro.responsavel.nome?.trim() &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(registro.registradoEm) &&
    Number.isFinite(Date.parse(registro.registradoEm))
  );
}

export function criarConfirmacao(
  assinatura: string,
  autor: FichaConfirmacao['responsavel']
): FichaConfirmacao {
  return {
    assinaturaInsumos: assinatura,
    registradoEm: new Date().toISOString(),
    responsavel: autor,
  };
}

export function conferirFicha(peca: PecaItem, paraIntegracao = false): FichaPendencia[] {
  const ficha = peca.fichaTecnica;
  const pendencias: FichaPendencia[] = [];
  const add = (campo: string, mensagem: string, aba: FichaPendencia['aba'], varianteId?: string) =>
    pendencias.push({ campo, mensagem, aba, varianteId });
  const tamanhos = ficha?.tamanhos ?? [];
  if (
    !tamanhos.length ||
    tamanhos.some((x) => !x.trim()) ||
    new Set(tamanhos).size !== tamanhos.length ||
    tamanhos.length > 48
  )
    add(
      'tamanhos',
      'Selecione em Geral a grade de tamanhos completa (até 48 tamanhos, sem repetições).',
      'geral'
    );
  if (!ficha?.conferencia?.gradeCompleta)
    add(
      'gradeCompleta',
      'Confirme que a grade contém todos os tamanhos da peça, não somente o piloto.',
      'geral'
    );
  if (!ficha?.variantes?.length)
    add('variantes', 'Cadastre a variante Principal e seus insumos.', 'aviamentos');
  const varianteIds = new Set<string>();
  const variantes = paraIntegracao
    ? (ficha?.variantes?.slice(0, 1) ?? [])
    : (ficha?.variantes ?? []);
  for (const variante of variantes) {
    if (!variante.id.trim() || varianteIds.has(variante.id))
      add('varianteId', 'Variantes precisam de identificadores únicos.', 'aviamentos', variante.id);
    varianteIds.add(variante.id);
    const assinatura = assinaturaConferenciaVariante(variante, tamanhos);
    const todosInsumos = [...variante.tecidos, ...variante.aviamentos];
    for (const [componente, nome] of Object.entries(COMPONENTES_FICHA)) {
      const presente = todosInsumos.some((item) => item.componente === componente);
      const decisao =
        ficha?.conferencia?.componentesPorVariante?.[variante.id]?.[
          componente as keyof typeof COMPONENTES_FICHA
        ];
      if (presente && decisao?.aplicavel === false)
        add(
          `componente.${componente}`,
          `${variante.nome}: ${nome} está cadastrado, mas foi marcado como não aplicável. Revise a confirmação ou remova o insumo explicitamente.`,
          variante.tecidos.some((item) => item.componente === componente)
            ? 'tecidos'
            : 'aviamentos',
          variante.id
        );
      else if (
        !presente &&
        (!decisao ||
          typeof decisao.aplicavel !== 'boolean' ||
          !confirmacaoAtual(decisao, assinatura))
      )
        add(
          `componente.${componente}`,
          `${variante.nome}: confirme se ${nome} se aplica à peça. A confirmação precisa corresponder aos insumos e à grade atuais.`,
          componente === 'entretela' ? 'tecidos' : 'aviamentos',
          variante.id
        );
      else if (!presente && decisao?.aplicavel)
        add(
          `componente.${componente}`,
          `${variante.nome}: adicione e identifique o insumo de ${nome}, ou confirme que não se aplica.`,
          componente === 'entretela' ? 'tecidos' : 'aviamentos',
          variante.id
        );
    }
    for (const tipo of ['tecidos', 'aviamentos'] as const)
      for (const item of variante[tipo]) {
        const label = `${variante.nome} / ${item.nome || item.codigo || 'Insumo'}`;
        if (
          item.componente &&
          item.componente !== 'outro' &&
          !Object.hasOwn(COMPONENTES_FICHA, item.componente)
        )
          add(
            `finalidade.${item.id}`,
            `${label}: selecione uma finalidade válida.`,
            tipo,
            variante.id
          );
        if (item.componente === 'elastico')
          for (const tamanho of tamanhos) {
            const consumo = item.consumoPorTamanho?.[tamanho];
            const valor = decimalManual(consumo?.valor);
            if (valor === null)
              add(
                `consumo.${item.id}.${tamanho}`,
                `${label}: preencha o consumo do elástico no tamanho ${tamanho}. Vazio não significa que não é usado.`,
                tipo,
                variante.id
              );
            else if (consumo?.naoSeAplica)
              add(
                `consumo.${item.id}.${tamanho}`,
                `${label}: tamanho ${tamanho}, revise a dispensa antiga. Para não usar elástico, digite zero e confirme expressamente na conferência de entrega.`,
                tipo,
                variante.id
              );
            else if (valor === 0 && !confirmacaoAtual(consumo?.confirmacaoZero, assinatura))
              add(
                `consumo.${item.id}.${tamanho}`,
                `${label}: confirme expressamente que o elástico NÃO é usado no tamanho ${tamanho} (consumo zero).`,
                tipo,
                variante.id
              );
          }
        const base = baseConsumoInsumo(item, tipo);
        const geral = base.valor;
        if (geral?.trim() && decimalManual(geral) === null)
          add(
            `consumoGeral.${item.id}`,
            `${label}: informe ${base.campo === 'peso' ? 'peso em kg' : 'consumo geral'} válido, sem separador de milhar.`,
            tipo,
            variante.id
          );
        if (
          (item.custo.trim() && decimalManual(item.custo) === null) ||
          (paraIntegracao && decimalManual(item.custo) === null)
        )
          add(
            `preco.${item.id}`,
            `${label}: informe preço manual válido, sem separador de milhar. Zero é permitido.`,
            tipo,
            variante.id
          );
        if (paraIntegracao && (!item.codigo.trim() || !item.unidade.trim()))
          add(
            `material.${item.id}`,
            `${label}: código e unidade precisam ser definidos para preparar o vínculo com o Linx.`,
            tipo,
            variante.id
          );
      }
  }
  return pendencias;
}

/** Exclui trilha e status; alterar conteúdo invalida a conclusão, sem gerar versão Linx. */
export function conteudoFicha(peca: PecaItem): string {
  const ficha = { ...peca.fichaTecnica };
  delete ficha.processo;
  return JSON.stringify({
    nome: peca.nome,
    codigo: peca.codigo,
    tipo: peca.tipo,
    imagem: peca.imagemCroquiUrl,
    ficha,
  });
}
export function atualizarRevisao(antes: PecaItem, depois: PecaItem): PecaItem {
  if (conteudoFicha(antes) === conteudoFicha(depois) && depois.fichaTecnica?.processo)
    return depois;
  return {
    ...depois,
    fichaTecnica: {
      ...depois.fichaTecnica,
      processo: {
        ...depois.fichaTecnica?.processo,
        revisao: crypto.randomUUID(),
      },
    },
  };
}
export function etapaInicial(etapa: string): boolean {
  return !etapa || etapa === '—' || /^(01\b|geracao_ficha$|inicial$|21\b)/i.test(etapa);
}
export function exigeConferencia(antes: string, depois: string): boolean {
  const normalizar = (etapa: string) =>
    etapa
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/_/g, ' ')
      .trim()
      .toLowerCase();
  const origem = normalizar(antes);
  const destino = normalizar(depois);
  return (
    /^(0?1\b|geracao(?: de)? ficha$)/.test(origem) &&
    /^(0?2\b|engenharia recebimento$)/.test(destino)
  );
}
export function etapaPermiteConclusao(etapa: string): boolean {
  const nome = etapa
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/_/g, ' ')
    .trim()
    .toLowerCase();
  // No fluxo Direto, Integração Linx pode ser a etapa de prontidão; não é um envio ERP.
  return /^(20\b|22\b|final$|ficha tecnica final$|integracao linx$)/.test(nome);
}

export function contratoConferencia(peca: PecaItem, paraIntegracao = false) {
  const ficha = peca.fichaTecnica;
  return {
    tamanhos: ficha?.tamanhos ?? [],
    gradeCompleta: ficha?.conferencia?.gradeCompleta === true,
    paraIntegracao,
    variantePrincipalId: variantePrincipalLinx(peca)?.id ?? null,
    variantes: (paraIntegracao
      ? (ficha?.variantes?.slice(0, 1) ?? [])
      : (ficha?.variantes ?? [])
    ).map((variante) => ({
      id: variante.id,
      nome: variante.nome,
      componentes: Object.fromEntries(
        Object.entries(ficha?.conferencia?.componentesPorVariante?.[variante.id] ?? {}).map(
          ([key, value]) => [key, { aplicavel: value.aplicavel, registro: contratoRegistro(value) }]
        )
      ),
      insumos: [
        ...variante.tecidos.map((x) => ({ ...x, tipo: 'tecidos' as const })),
        ...variante.aviamentos.map((x) => ({ ...x, tipo: 'aviamentos' as const })),
      ].map((x) => ({
        id: x.id,
        nome: x.nome,
        codigo: x.codigo,
        tipo: x.tipo,
        componente: x.componente ?? '',
        preco: x.custo,
        unidade: x.unidade,
        // Quantidade na unidade declarada: peso/kg, consumo/metros ou quantidade do aviamento.
        // A metragem de referência e o peso originais permanecem separados na ficha completa.
        consumoGeral: baseConsumoInsumo(x, x.tipo).valor ?? '',
        consumoPorTamanho: Object.fromEntries(
          (ficha?.tamanhos ?? [])
            .filter((tamanho) => x.consumoPorTamanho?.[tamanho])
            .map((tamanho) => {
              const consumo = x.consumoPorTamanho![tamanho]!;
              return [
                tamanho,
                {
                  valor: consumo.valor,
                  naoSeAplica: consumo.naoSeAplica === true,
                  confirmacaoZero: consumo.confirmacaoZero
                    ? contratoRegistro(consumo.confirmacaoZero)
                    : undefined,
                },
              ];
            })
        ),
      })),
    })),
  };
}
function contratoRegistro(registro: FichaConfirmacao) {
  return {
    registradoEm: registro.registradoEm,
    responsavelId: registro.responsavel.id == null ? null : String(registro.responsavel.id),
    responsavelNome: registro.responsavel.nome,
    assinaturaInsumos: registro.assinaturaInsumos,
  };
}
export async function validarConferenciaServidor(
  peca: PecaItem,
  marcaId: string,
  paraIntegracao = false
): Promise<void> {
  const local = conferirFicha(peca, paraIntegracao);
  if (local.length) throw new Error(local.map((x) => x.mensagem).join('\n'));
  const resposta = await api.post<{ valida: boolean; pendencias: string[] }>(
    '/fichas/conferencia',
    contratoConferencia(peca, paraIntegracao),
    marcaId
  );
  if (!resposta?.valida)
    throw new Error(
      resposta?.pendencias?.join('\n') || 'A conferência não foi confirmada pelo backend.'
    );
}
export function prepararContratoLinx(peca: PecaItem, colecao: ColecaoItem) {
  if (
    !peca.marcaId ||
    !colecao.marcaId ||
    peca.marcaId !== colecao.marcaId ||
    peca.colecaoId !== colecao.id
  ) {
    throw new Error('A peça não pertence à marca e à coleção do contrato de integração.');
  }
  if (
    !peca.fichaTecnica?.processo?.concluida ||
    peca.fichaTecnica.processo.concluida.revisao !== peca.fichaTecnica.processo.revisao
  )
    throw new Error('Conclua novamente a ficha após a última edição.');
  const pendencias = conferirFicha(peca, true);
  if (pendencias.length) throw new Error(pendencias.map((x) => x.mensagem).join('\n'));
  const griffe = peca.fichaTecnica.integracao?.griffe?.trim() || colecao.griffe;
  if (
    (colecao.griffe && griffe !== colecao.griffe) ||
    (peca.linxOrigem && peca.linxOrigem.griffe !== griffe)
  ) {
    throw new Error('A griffe da ficha não corresponde à coleção e ao cadastro de origem.');
  }
  if (!peca.codigo.trim() || !griffe || !colecao.id || !colecao.nome.trim())
    throw new Error('Informe código da peça, griffe e coleção antes de preparar a integração.');
  const mapeamento = projetarMapeamentoLinx(peca, colecao);
  return {
    schemaVersion: 2,
    status: 'PENDENTE_MAPEAMENTO' as const,
    gravacao: planejarOperacaoLinx(peca, colecao),
    mapeamento,
    identidade: {
      pecaId: peca.id,
      produto: peca.codigo,
      marcaId: peca.marcaId,
      griffe,
      colecaoId: colecao.id,
      descColecao: colecao.nome,
      revisao: peca.fichaTecnica.processo.revisao,
    },
    escopo: 'SOMENTE_PRINCIPAL' as const,
    ficha: structuredClone(projetarFichaPrincipalLinx(peca)),
    catalogos: 'SOMENTE_VINCULO' as const,
    pendenciasContrato: [
      'Procedimento/API de gravação e confirmação no Linx',
      'Mapeamento da cor de mostruário de Geral para o Linx e validação dos códigos no ERP',
      'Destino do preço escolhido/manual por item da Principal, sem alterar os preços do catálogo',
      ...mapeamento.pendencias,
      'Modelagem do portal é referência de peça; PRODUTOS.MODELAGEM aponta para PRODUTOS_MODELO, não para PRODUTOS.PRODUTO',
      'Valores aprovados dos campos fiscais/operacionais para criação de produto novo',
      'Captura da base atual do ERP, alterações explícitas, exclusões confirmadas e controle de concorrência',
    ],
    aviso:
      'Não enviado ao Linx. Somente a Principal é preparada; variantes, cores personalizadas, histórico e anexos permanecem no portal. O preenchimento do preço pela cor não confirma sua gravação no ERP.',
  };
}
