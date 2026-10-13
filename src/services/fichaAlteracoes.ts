import type { User } from '../types/auth';
import type { FichaAlteracaoEvento } from '../types/fichaHistorico';
import type { PecaItem } from '../types/plm';
import type { FichaAnexo } from './fichaAnexosStorage';
import { getCorteCorKey } from './fichaCorte';

type Autor = Pick<User, 'id' | 'nome'> | null | undefined;
type Campo = { secao: string; campo: string; valor: string; comparacao: string };

function responsavel(autor: Autor): FichaAlteracaoEvento['responsavel'] {
  return { id: autor?.id ?? null, nome: autor?.nome ?? null };
}

export function registrarCriacaoPeca(peca: PecaItem, autor: Autor): PecaItem {
  return {
    ...peca,
    historicoAlteracoes: [
      {
        id: crypto.randomUUID(),
        tipo: 'criacao',
        secao: 'Peça',
        titulo: 'Peça criada',
        nomePeca: peca.nome,
        registradoEm: new Date().toISOString(),
        responsavel: responsavel(autor),
        campos: [],
      },
    ],
  };
}

function texto(value: unknown): string {
  if (value == null || value === '' || value === '—') return '';
  if (Array.isArray(value)) return value.map(texto).filter(Boolean).join(', ');
  return String(value);
}

/** Detecta troca da imagem sem duplicar base64 de arquivos no histórico. */
function assinatura(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  return `${value.length}:${hash >>> 0}`;
}

function camposDaFicha(peca: PecaItem, anexos: FichaAnexo[]): Map<string, Campo> {
  const result = new Map<string, Campo>();
  const add = (key: string, secao: string, campo: string, value: unknown, compare?: string) => {
    const valor = texto(value);
    result.set(key, { secao, campo, valor, comparacao: compare ?? valor });
  };
  const imagem = (
    key: string,
    secao: string,
    label: string,
    url?: string,
    nome?: string,
    anexo?: string
  ) =>
    add(
      key,
      secao,
      label,
      url || anexo ? nome || 'Imagem da peça' : '',
      url ? assinatura(url) : (anexo ?? '')
    );
  const ficha = peca.fichaTecnica;
  add(
    'conferencia.grade',
    'Conferência',
    'Grade completa confirmada',
    ficha?.conferencia?.gradeCompleta == null ? '' : ficha.conferencia.gradeCompleta ? 'Sim' : 'Não'
  );
  Object.entries(ficha?.conferencia?.componentesPorVariante ?? {}).forEach(([id, decisoes]) => {
    const variante = ficha?.variantes?.find((x) => x.id === id);
    Object.entries(decisoes).forEach(([componente, decisao]) =>
      add(
        `conferencia.${id}.${componente}`,
        'Conferência',
        `${variante?.nome ?? id} — ${componente}`,
        `${decisao.aplicavel ? 'Aplica-se' : 'Não se aplica'}; ${decisao.responsavel.nome ?? 'Usuário não identificado'}; ${decisao.registradoEm}`
      )
    );
  });
  add(
    'processo.concluida',
    'Etapas',
    'Conclusão da ficha',
    ficha?.processo?.concluida?.registradoEm
  );
  add(
    'processo.preparada',
    'Integração Linx',
    'Preparação (não enviada)',
    ficha?.processo?.integracaoPreparada?.registradoEm
  );
  const gerais: Array<[string, string, unknown]> = [
    ['nome', 'Nome da peça', peca.nome],
    ['codigo', 'Código da peça', peca.codigo],
    ['tipo', 'Tipo de peça', peca.tipo],
    ['status', 'Status', peca.status],
    ['tema', 'Tema', peca.tema],
    ['estilista', 'Estilista', peca.estilista],
    ['modelista', 'Modelista', peca.modelista],
    ['previsao', 'Previsão', peca.previsaoEntrega],
  ];
  gerais.forEach(([key, label, value]) => add(`peca.${key}`, 'Geral', label, value));
  [
    ['etapaAtual', 'Etapa'],
    ['fluxo', 'Fluxo'],
    ['responsavel', 'Responsável da etapa'],
    ['observacaoEtapa', 'Observação da etapa'],
  ].forEach(([key, label]) => add(`peca.${key}`, 'Etapas', label!, peca[key as keyof PecaItem]));
  const fields = {
    nomeProduto: ['Geral', 'Nome do Produto'],
    codigoReferencia: ['Geral', 'Código de Referência'],
    descricao: ['Geral', 'Descrição'],
    tamanhos: ['Geral', 'Tamanhos'],
    tecnica: ['Geral', 'Técnicas'],
    estampa: ['Geral', 'Estampa'],
    observacoesGerais: ['Observações', 'Observações Gerais'],
    observacoesCorte: ['Observações', 'Observação de Corte'],
    simbologiaDescricao: ['Observações', 'Descrição da simbologia'],
    modelagem: ['Modelagem', 'Modelagem'],
    observacoesModelagem: ['Modelagem', 'Observações de Modelagem'],
  } as const;
  Object.entries(fields).forEach(([key, [secao, label]]) =>
    add(`ficha.${key}`, secao, label, ficha?.[key as keyof typeof fields])
  );
  if (ficha?.corte) {
    add('ficha.corte.iniciada', 'Corte', 'Tabela de quantidade de peças', 'Iniciada');
    add('ficha.corte.tamanhos', 'Corte', 'Tamanhos da tabela de corte', ficha.corte.tamanhos);
    for (const linha of ficha.corte.linhas) {
      const prefix = `ficha.corte.${getCorteCorKey(linha.cor)}`;
      add(`${prefix}.cor`, 'Corte', 'Cor de mostruário da tabela de corte', linha.cor.nome);
      for (const [tamanho, quantidade] of Object.entries(linha.quantidades)) {
        add(
          `${prefix}.quantidade.${tamanho}`,
          'Corte',
          `Quantidade — ${linha.cor.nome} / ${tamanho}`,
          quantidade
        );
      }
    }
  }
  imagem(
    'ficha.simbologia',
    'Observações',
    'Simbologia',
    ficha?.simbologiaImagemUrl ?? undefined,
    'Imagem de simbologia'
  );
  imagem('peca.croqui', 'Geral', 'Imagem da peça', peca.imagemCroquiUrl);
  add(
    'ficha.cores',
    'Geral',
    'Cor de Mostruário',
    ficha?.coresMostruario?.map(
      (cor) => `${cor.nome}${cor.codigo ? ` (${cor.codigo})` : ''}${cor.hex ? ` ${cor.hex}` : ''}`
    ) ?? ficha?.corMostruario
  );
  const integrationLabels = {
    subgrupo: 'Sub-grupo',
    linha: 'Linha',
    grade: 'Grade',
    griffe: 'Griffe',
    tipoMateriaPrima: 'Tipo de matéria-prima',
    categoria: 'Categoria',
    subcategoria: 'Subcategoria',
  };
  Object.entries(integrationLabels).forEach(([key, label]) =>
    add(
      `integracao.${key}`,
      'Integração Linx',
      label,
      ficha?.integracao?.[key as keyof typeof integrationLabels]
    )
  );
  add(
    'integracao.gradePosicoes',
    'Integração Linx',
    'Posições da grade consultada',
    ficha?.gradeLinx?.posicoes
      .filter((p) => p.tamanho !== null)
      .map((p) => `${p.tamanho} → C${p.posicao}`)
  );
  ficha?.variantes?.forEach((variant, index) => {
    const prefix = `variante.${variant.id}`;
    const precificacao = variant.precificacao;
    if (precificacao) {
      const labels = {
        modo: 'Tipo de cálculo',
        markup: 'Markup',
        margemLucro: 'Margem de lucro (%)',
        precoAprovado: 'Preço aprovado',
        baseCusto: 'Base do cálculo',
      };
      Object.entries(labels).forEach(([field, title]) =>
        add(
          `${prefix}.precificacao.${field}`,
          'Precificação',
          `${variant.nome} — ${title}`,
          field === 'modo'
            ? precificacao.modo === 'markup'
              ? 'Markup'
              : 'Margem de lucro'
            : precificacao[field as keyof typeof labels]
        )
      );
    }
    const custos = variant.custos;
    if (custos) {
      const camposCustos = {
        fonte: 'Base dos custos',
        corProduto: 'Cor do produto',
        posicao: 'Posição do tamanho',
        rota: 'Rota de produção',
        quantidadeProducao: 'Quantidade a ser produzida',
      };
      Object.entries(camposCustos).forEach(([field, title]) =>
        add(
          `${prefix}.custos.${field}`,
          'Custos',
          `${variant.nome} — ${title}`,
          custos[field as keyof typeof camposCustos]
        )
      );
      custos.outros?.forEach((item) => {
        Object.entries({ nome: 'Nome', custo: 'Custo unitário', quantidade: 'Quantidade' }).forEach(
          ([field, title]) =>
            add(
              `${prefix}.custos.outro.${item.id}.${field}`,
              'Custos',
              `${variant.nome} / ${item.nome || 'Outro custo'} — ${title}`,
              item[field as 'nome' | 'custo' | 'quantidade']
            )
        );
      });
    }
    add(`${prefix}.nome`, 'Variantes', 'Nome da variante', variant.nome);
    add(
      `${prefix}.corProdutoLinx`,
      'Variantes',
      `${variant.nome} — cor do produto Linx`,
      variant.corProdutoLinx
        ? `${variant.corProdutoLinx.descricao} (${variant.corProdutoLinx.corProduto}); produto ${variant.corProdutoLinx.produto}; ${variant.corProdutoLinx.griffe}; coleção ${variant.corProdutoLinx.colecao}`
        : ''
    );
    add(
      `${prefix}.corBasicaLinx`,
      'Variantes',
      `${variant.nome} — cor básica Linx`,
      variant.corBasicaLinx
        ? `${variant.corBasicaLinx.descricao} (${variant.corBasicaLinx.codigo})`
        : variant.corProdutoLinx?.corBasica
          ? `${variant.corProdutoLinx.descricaoBasica ?? ''} (${variant.corProdutoLinx.corBasica})`
          : ''
    );
    // A Principal pode exibir a primeira imagem dos anexos sem ter uma capa explícita.
    // Compare a mesma imagem visível no editor ao removê-la ou substituí-la.
    const anexo =
      anexos.find((item) => item.id === variant.imagemAnexoId) ??
      (index === 0 && !variant.imagemUrl && !peca.imagemCroquiUrl && !variant.imagemAnexoId
        ? anexos.find((item) => item.categoria === 'variantes')
        : undefined);
    imagem(
      `${prefix}.imagem`,
      'Variantes',
      `Imagem — ${variant.nome}`,
      variant.imagemRemovida
        ? undefined
        : (variant.imagemUrl ?? (index === 0 ? peca.imagemCroquiUrl : undefined)),
      variant.imagemNome ?? anexo?.nome,
      variant.imagemRemovida ? undefined : (variant.imagemAnexoId ?? anexo?.id)
    );
    (['tecidos', 'aviamentos'] as const).forEach((tipo) =>
      variant[tipo].forEach((item) => {
        const secao = tipo === 'tecidos' ? 'Tecidos' : 'Aviamentos';
        const key = `${prefix}.${tipo}.${item.id}`;
        const label = `${variant.nome} / ${item.nome || item.codigo || 'Insumo'}`;
        const simpleFields = {
          nome: 'Nome',
          codigo: 'Código',
          custo: 'Preço',
          unidade: 'Unidade',
          consumo: 'Consumo',
          quantidade: 'Quantidade',
          peso: 'Peso',
          uso: 'Uso',
          finalidade: 'Finalidade do insumo',
          encolhimento: 'Encolhimento',
          observacoes: 'Observações',
          componente: 'Finalidade do insumo',
        };
        Object.entries(simpleFields).forEach(([field, title]) =>
          add(
            `${key}.${field}`,
            secao,
            `${label} — ${title}`,
            item[field as keyof typeof simpleFields]
          )
        );
        Object.entries(item.consumoPorTamanho ?? {}).forEach(([tamanho, consumo]) => {
          add(
            `${key}.consumoTamanho.${tamanho}`,
            secao,
            `${label} — Consumo ${tamanho}`,
            consumo.naoSeAplica ? 'Não se aplica' : consumo.valor
          );
          add(
            `${key}.confirmacaoZero.${tamanho}`,
            'Conferência',
            `${label} — Não uso de elástico no tamanho ${tamanho}`,
            consumo.confirmacaoZero
              ? `Consumo zero confirmado; ${consumo.confirmacaoZero.responsavel.nome ?? 'Usuário não identificado'}; ${consumo.confirmacaoZero.registradoEm}`
              : ''
          );
        });
        add(
          `${key}.fornecedores`,
          secao,
          `${label} — Fornecedores`,
          item.fornecedoresList?.map((x) => `${x.fornecedor} (${x.codigo})`) ?? item.fornecedores
        );
        add(
          `${key}.composicao`,
          secao,
          `${label} — Composição`,
          item.composicoesList?.map((x) => `${x.porcentagem}% ${x.composicao}`)
        );
        add(
          `${key}.cores`,
          secao,
          `${label} — Cores`,
          item.coresList?.map((x) => `${x.nome}${x.codigo ? ` (${x.codigo})` : ''} ${x.hex}`)
        );
        for (const cor of item.coresList ?? []) {
          const dados = cor.dadosInsumo;
          if (!dados) continue;
          for (const [campo, titulo] of Object.entries({
            custo: 'Preço',
            unidade: 'Unidade',
            consumo: 'Consumo',
            peso: 'Peso',
            quantidade: 'Quantidade',
            fornecedorNome: 'Fornecedor',
            observacoes: 'Observações',
          })) {
            add(
              `${key}.cor.${cor.id}.${campo}`,
              secao,
              `${label} / ${cor.nome} — ${titulo}`,
              dados[campo as keyof typeof dados]
            );
          }
        }
        Object.entries(item.propriedades ?? {}).forEach(([field, value]) => {
          const titles: Record<string, string> = {
            gramatura: 'Gramatura',
            largura: 'Largura',
            rendimento1: 'Rendimento 1',
            rendimento2: 'Rendimento 2',
            encolhimento: 'Encolhimento',
            construcao: 'Construção',
          };
          add(`${key}.propriedades.${field}`, secao, `${label} — ${titles[field] ?? field}`, value);
        });
        const pictures = item.imagensList?.length
          ? item.imagensList
          : item.imagemUrl
            ? [item.imagemUrl]
            : [];
        add(
          `${key}.imagens`,
          secao,
          `${label} — Imagens`,
          pictures.length ? `${pictures.length} imagem(ns)` : '',
          pictures.map(assinatura).join(',')
        );
      })
    );
  });
  ficha?.terceiros?.forEach((item) => {
    const labels = {
      tipo: 'Tipo',
      fornecedor: 'Fornecedor',
      tecnicas: 'Técnicas',
      observacoes: 'Observações',
      tela: 'Tela',
      traducao: 'Tradução',
    };
    Object.entries(labels).forEach(([key, label]) =>
      add(
        `terceiro.${item.id}.${key}`,
        'Terceiros',
        `${item.tipo || 'Terceiro'} — ${label}`,
        item[key as keyof typeof labels]
      )
    );
    add(
      `terceiro.${item.id}.variantes`,
      'Terceiros',
      `${item.tipo || 'Terceiro'} — Uso em variantes`,
      item.variantes.map((id) => ficha.variantes?.find((x) => x.id === id)?.nome ?? id)
    );
    item.observacoesList?.forEach((obs) => {
      add(
        `terceiro.${item.id}.obs.${obs.id}.titulo`,
        'Terceiros',
        'Título da observação',
        obs.titulo
      );
      add(
        `terceiro.${item.id}.obs.${obs.id}.descricao`,
        'Terceiros',
        'Descrição da observação',
        obs.descricao
      );
    });
    item.custosProcesso?.forEach((custo, index) => {
      add(
        `terceiro.${item.id}.custo.${custo.id}.valor`,
        'Terceiros',
        `${item.tipo || 'Terceiro'} — Custo ${index + 1} (R$)`,
        custo.valor
      );
      add(
        `terceiro.${item.id}.custo.${custo.id}.observacao`,
        'Terceiros',
        `${item.tipo || 'Terceiro'} — Observação do custo ${index + 1}`,
        custo.observacao
      );
    });
    item.imagens?.forEach((foto) =>
      imagem(
        `terceiro.${item.id}.imagem.${foto.id}`,
        'Terceiros',
        `${item.tipo || 'Terceiro'} — Imagem`,
        foto.imagemUrl,
        foto.nome
      )
    );
    imagem(
      `terceiro.${item.id}.imagem`,
      'Terceiros',
      `${item.tipo || 'Terceiro'} — Imagem`,
      item.imagemUrl
    );
  });
  ficha?.tabelasMedidas?.forEach((table) => {
    const prefix = `medidas.${table.id}`;
    add(`${prefix}.nome`, 'Modelagem', 'Nome da tabela', table.nome);
    add(`${prefix}.medidas`, 'Modelagem', `${table.nome} — Medidas`, table.medidasSelecionadas);
    Object.entries(table.valoresMedidas).forEach(([medida, sizes]) =>
      Object.entries(sizes).forEach(([size, value]) =>
        add(
          `${prefix}.${medida}.${size}`,
          'Modelagem',
          `${table.nome} / ${medida} / ${size}`,
          value
        )
      )
    );
    imagem(`${prefix}.imagem`, 'Modelagem', `${table.nome} — Imagem`, table.imagemUrl);
  });
  add('prova.data', 'Prova de roupa', 'Data da prova', ficha?.provaRoupa?.data);
  add('prova.observacoes', 'Prova de roupa', 'Observações', ficha?.provaRoupa?.observacoes);
  ficha?.provaRoupa?.fotos?.forEach((foto) =>
    imagem(
      `prova.foto.${foto.id}`,
      'Prova de roupa',
      `Foto — ${foto.nome}`,
      foto.imagemUrl,
      foto.nome
    )
  );
  return result;
}

export function registrarAlteracoesFicha(
  antes: PecaItem,
  depois: PecaItem,
  autor: Autor,
  anexos: FichaAnexo[] = []
): PecaItem {
  const oldFields = camposDaFicha(antes, anexos);
  const newFields = camposDaFicha(depois, anexos);
  const groups = new Map<string, FichaAlteracaoEvento['campos']>();
  // Nome e código da peça acompanham a ficha; não registre a mesma mudança duas vezes.
  const duplicate = new Set<string>();
  if (
    oldFields.get('ficha.nomeProduto')?.comparacao !==
      newFields.get('ficha.nomeProduto')?.comparacao &&
    depois.nome === depois.fichaTecnica?.nomeProduto
  )
    duplicate.add('peca.nome');
  if (
    oldFields.get('ficha.codigoReferencia')?.comparacao !==
      newFields.get('ficha.codigoReferencia')?.comparacao &&
    depois.codigo === depois.fichaTecnica?.codigoReferencia
  )
    duplicate.add('peca.codigo');
  for (const key of new Set([...oldFields.keys(), ...newFields.keys()])) {
    if (duplicate.has(key)) continue;
    const old = oldFields.get(key);
    const next = newFields.get(key);
    if ((old?.comparacao ?? '') === (next?.comparacao ?? '')) continue;
    const field = next ?? old!;
    const changes = groups.get(field.secao) ?? [];
    const oldText = old?.valor || 'Vazio';
    let newText = next?.valor || 'Vazio';
    if (oldText === newText) newText += ' (conteúdo alterado)';
    changes.push({ campo: field.campo, antes: oldText, depois: newText });
    groups.set(field.secao, changes);
  }
  const registered = new Date().toISOString();
  const titles: Record<string, string> = {
    Tecidos: 'Tecidos atualizados',
    Aviamentos: 'Aviamentos atualizados',
    Variantes: 'Variantes atualizadas',
    Terceiros: 'Terceiros atualizados',
    Etapas: 'Etapas atualizadas',
  };
  const events = [...groups].map(([secao, campos]): FichaAlteracaoEvento => ({
    id: crypto.randomUUID(),
    tipo: 'alteracao',
    secao,
    titulo: titles[secao] ?? `${secao} atualizada`,
    nomePeca: depois.nome,
    registradoEm: registered,
    responsavel: responsavel(autor),
    campos,
  }));
  return { ...depois, historicoAlteracoes: [...(antes.historicoAlteracoes ?? []), ...events] };
}

export function registrarAlteracoesAnexos(
  peca: PecaItem,
  antes: FichaAnexo[],
  depois: FichaAnexo[],
  autor: Autor
): PecaItem {
  const oldIds = new Set(antes.map((item) => item.id));
  const newIds = new Set(depois.map((item) => item.id));
  const labels = {
    variantes: 'Imagens de variantes',
    referencias: 'Imagens de referência',
    desenhos: 'Desenhos técnicos',
    projeto: 'Arquivos de projeto',
    outros: 'Outros arquivos',
  };
  const campos = [
    ...depois
      .filter((item) => !oldIds.has(item.id))
      .map((item) => ({
        campo: `${labels[item.categoria]} — ${item.nome}`,
        antes: 'Vazio',
        depois: item.nome,
      })),
    ...antes
      .filter((item) => !newIds.has(item.id))
      .map((item) => ({
        campo: `${labels[item.categoria]} — ${item.nome}`,
        antes: item.nome,
        depois: 'Vazio',
      })),
  ];
  if (!campos.length) return peca;
  return {
    ...peca,
    historicoAlteracoes: [
      ...(peca.historicoAlteracoes ?? []),
      {
        id: crypto.randomUUID(),
        tipo: 'alteracao',
        secao: 'Anexos',
        titulo: 'Anexos atualizados',
        nomePeca: peca.nome,
        registradoEm: new Date().toISOString(),
        responsavel: responsavel(autor),
        campos,
      },
    ],
  };
}
