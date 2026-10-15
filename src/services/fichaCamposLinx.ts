/**
 * Correspondências auditadas por SELECT em .6/HOMOLOG_COBRANCA em 15/10/2026.
 * Identificar uma coluna não autoriza escrita. Não gera SQL, valores padrão ou novas identidades.
 */
export type SituacaoCampoLinx =
  'IDENTIFICADO' | 'CATALOGO_LEITURA' | 'PENDENTE_REGRA' | 'SOMENTE_PORTAL';
export interface CampoFichaLinx {
  id: string;
  campo: string;
  origemPortal: string;
  colunas: readonly string[];
  situacao: SituacaoCampoLinx;
  regra: string;
}

export const CAMPOS_FICHA_LINX: readonly CampoFichaLinx[] = [
  {
    id: 'codigo',
    campo: 'Código do produto',
    origemPortal: 'codigo',
    colunas: ['PRODUTOS.PRODUTO'],
    situacao: 'IDENTIFICADO',
    regra:
      'Chave global char(12). Referência não substitui este código. Validar existência e vínculo no servidor.',
  },
  {
    id: 'nome',
    campo: 'Nome do Produto',
    origemPortal: 'fichaTecnica.nomeProduto',
    colunas: ['PRODUTOS.DESC_PRODUTO'],
    situacao: 'IDENTIFICADO',
    regra:
      'Destino mantido em DESC_PRODUTO (100 bytes), conforme confirmação de 15/10/2026. Categoria é outro campo; não copiar seu texto para o nome nem alterar U_NOME_PRODUTO. A gravação permanece desabilitada.',
  },
  {
    id: 'descricao',
    campo: 'Descrição detalhada',
    origemPortal: 'fichaTecnica.descricao',
    colunas: ['PRODUTOS.OBS', 'PRODUTO_FICHA_VERSAO.OBS_VERSAO_FICHA'],
    situacao: 'PENDENTE_REGRA',
    regra:
      'São candidatos estruturais, não equivalências comprovadas. OBS_VERSAO_FICHA possui 250 bytes e pertence à versão; OBS pertence ao produto global.',
  },
  {
    id: 'referencia',
    campo: 'Código de Referência',
    origemPortal: 'fichaTecnica.codigoReferencia',
    colunas: [],
    situacao: 'SOMENTE_PORTAL',
    regra:
      'Campo retirado da tela; valores antigos são preservados no portal. Não é PRODUTO, REFER_FABRICANTE nem MODELAGEM por inferência.',
  },
  {
    id: 'griffe',
    campo: 'Griffe',
    origemPortal: 'colecao.griffe / linxOrigem.griffe',
    colunas: ['PRODUTOS.GRIFFE'],
    situacao: 'IDENTIFICADO',
    regra:
      'Código do catálogo PRODUTOS_GRIFFES validado com marca e coleção, não pelo sufixo do código.',
  },
  {
    id: 'colecao',
    campo: 'Coleção da ficha',
    origemPortal: 'linxOrigem.colecaoCodigo / recibo confirmado',
    colunas: ['PRODUTO_FICHA_VERSAO.U_COLECAO', 'PRODUTOS.COLECAO'],
    situacao: 'IDENTIFICADO',
    regra:
      'Código ERP char(6), não UUID, ano ou descrição. U_COLECAO identifica a coleção da versão; reutilizar referência não autoriza mudar PRODUTOS.COLECAO.',
  },
  {
    id: 'versao',
    campo: 'Versão vinculada',
    origemPortal: 'fichaTecnica.linxVersaoImportada / recibo confirmado',
    colunas: [
      'PRODUTO_FICHA_VERSAO.VERSAO_FICHA',
      'PRODUTO_VERSAO_MATERIAL.VERSAO_FICHA',
      'PRODUTO_VERSAO_MATERIAL_COR.VERSAO_FICHA',
    ],
    situacao: 'IDENTIFICADO',
    regra:
      'char(5). Releitura do vínculo da coleção; não usar MAX, criar versão local ou adotar o default 00001.',
  },
  {
    id: 'grade',
    campo: 'Grade e tamanhos',
    origemPortal: 'fichaTecnica.integracao.grade / fichaTecnica.tamanhos',
    colunas: ['PRODUTOS.GRADE'],
    situacao: 'IDENTIFICADO',
    regra:
      'Grade varchar(25). Consultar PRODUTOS_TAMANHOS.TAMANHO_1…TAMANHO_48; a ordem escolhida no portal não define Cn.',
  },
  {
    id: 'linha',
    campo: 'Linha',
    origemPortal: 'fichaTecnica.integracao.linha',
    colunas: ['PRODUTOS.LINHA'],
    situacao: 'IDENTIFICADO',
    regra:
      'varchar(25), referência de PRODUTOS_LINHAS. Não copiar o tema do portal como linha automaticamente.',
  },
  {
    id: 'subgrupo',
    campo: 'Sub-grupo',
    origemPortal: 'fichaTecnica.integracao.subgrupo',
    colunas: ['PRODUTOS.SUBGRUPO_PRODUTO', 'PRODUTOS.GRUPO_PRODUTO'],
    situacao: 'IDENTIFICADO',
    regra:
      'Subgrupo varchar(25); validar o par grupo/subgrupo em PRODUTOS_SUBGRUPO. Tipo da peça e TIPO_PRODUTO não são sinônimos.',
  },
  {
    id: 'categoria',
    campo: 'Categoria e subcategoria',
    origemPortal: 'fichaTecnica.integracao.categoria / subcategoria',
    colunas: ['PRODUTOS.COD_CATEGORIA', 'PRODUTOS.COD_SUBCATEGORIA'],
    situacao: 'PENDENTE_REGRA',
    regra:
      'Categoria em Geral é um texto descritivo, não DESC_PRODUTO. COD_CATEGORIA e COD_SUBCATEGORIA são códigos char(6); resolver o par na referência correta antes de gravar, sem enviar o texto no lugar do código.',
  },
  {
    id: 'estilista',
    campo: 'Estilista e modelista',
    origemPortal: 'estilista / modelista',
    colunas: ['PRODUTOS.ESTILISTA', 'PRODUTOS.MODELISTA'],
    situacao: 'IDENTIFICADO',
    regra:
      'Leitura existente; varchar(25). Confirmar a representação ERP do usuário, sem truncar nome de conta do portal.',
  },
  {
    id: 'mostruario',
    campo: 'Cor de mostruário',
    origemPortal: 'fichaTecnica.coresMostruario[].codigo',
    colunas: ['PRODUTO_CORES.COR'],
    situacao: 'IDENTIFICADO',
    regra:
      'FK de COR para CORES_BASICAS.COR, char(10). Catálogo agora preserva código. Não é prova nem gerador de COR_PRODUTO.',
  },
  {
    id: 'corProduto',
    campo: 'Identidade e descrição da cor do produto',
    origemPortal: 'vínculo explícito produto/cor relido no ERP',
    colunas: [
      'PRODUTO_CORES.PRODUTO',
      'PRODUTO_CORES.COR_PRODUTO',
      'PRODUTO_CORES.DESC_COR_PRODUTO',
      'PRODUTO_CORES.U_COLECAO',
    ],
    situacao: 'PENDENTE_REGRA',
    regra:
      'PK PRODUTO+COR_PRODUTO; descrição varchar(40). Alocação de COR_PRODUTO e relação com o mostruário dependem de regra. A tabela não tem VERSAO_FICHA.',
  },
  {
    id: 'material',
    campo: 'Código do tecido/aviamento',
    origemPortal: 'Principal.tecidos/aviamentos[].codigo',
    colunas: ['PRODUTO_VERSAO_MATERIAL.MATERIAL'],
    situacao: 'IDENTIFICADO',
    regra:
      'char(11), FK MATERIAIS.MATERIAL. Validar o cadastro existente; não criar ou renomear o material global ao editar a peça.',
  },
  {
    id: 'item',
    campo: 'Item do insumo na ficha',
    origemPortal: 'Principal.tecidos/aviamentos[].linxDados.item',
    colunas: ['PRODUTO_VERSAO_MATERIAL.ITEM', 'PRODUTO_VERSAO_MATERIAL_COR.ITEM'],
    situacao: 'IDENTIFICADO',
    regra:
      'char(4). Preservar em edição; alocação de novo item precisa da futura rotina no servidor. UUID local não é ITEM.',
  },
  {
    id: 'uso',
    campo: 'Uso do insumo',
    origemPortal: 'Principal.tecidos/aviamentos[].uso',
    colunas: ['PRODUTO_VERSAO_MATERIAL.DESC_USO_MATERIAL'],
    situacao: 'IDENTIFICADO',
    regra:
      'varchar(80), vínculo de leitura existente. Textos personalizados permanecem livres; não deduzir consumo ou classificação de elástico pelo texto.',
  },
  {
    id: 'consumos',
    campo: 'Consumo por tamanho',
    origemPortal: 'Principal.tecidos/aviamentos[].consumoPorTamanho',
    colunas: Array.from({ length: 48 }, (_, i) => `PRODUTO_VERSAO_MATERIAL.C${i + 1}`),
    situacao: 'IDENTIFICADO',
    regra:
      'numeric(9,3), posição real da grade. Não arredondar 8 casas silenciosamente, preencher vazios, converter unidades ou replicar consumo geral em C1.',
  },
  {
    id: 'faseSetor',
    campo: 'Fase/setor do material',
    origemPortal: 'Principal.tecidos/aviamentos[].linxDados.dados',
    colunas: ['PRODUTO_VERSAO_MATERIAL.FASE_PRODUCAO', 'PRODUTO_VERSAO_MATERIAL.SETOR_PRODUCAO'],
    situacao: 'IDENTIFICADO',
    regra:
      'varchar(25), FK composta para PRODUCAO_SETOR. Preservar vínculo importado; etapa 01/02 do portal não é fase/setor ERP.',
  },
  {
    id: 'principal',
    campo: 'Indicadores de material e consumo',
    origemPortal: 'Principal.tecidos/aviamentos[].linxDados.dados',
    colunas: [
      'PRODUTO_VERSAO_MATERIAL.MATERIAL_PRINCIPAL',
      'PRODUTO_VERSAO_MATERIAL.CONSUMO_P_TAMANHO',
      'PRODUTO_VERSAO_MATERIAL.CONSUMO_FIXO',
      'PRODUTO_VERSAO_MATERIAL_COR.MATERIAL_PRINCIPAL',
    ],
    situacao: 'IDENTIFICADO',
    regra:
      'Flags bit. Apenas valores explícitos/importados; primeiro tecido ou variante Principal não autoriza atribuir os indicadores.',
  },
  {
    id: 'corMaterial',
    campo: 'Cor do tecido/aviamento',
    origemPortal: 'Principal.tecidos/aviamentos[].coresList[].origemLinx',
    colunas: [
      'PRODUTO_VERSAO_MATERIAL_COR.COR_MATERIAL',
      'PRODUTO_VERSAO_MATERIAL_COR.MATERIAL',
      'PRODUTO_VERSAO_MATERIAL_COR.COR_PRODUTO',
    ],
    situacao: 'IDENTIFICADO',
    regra:
      'Cor do material char(10), validada com MATERIAL em MATERIAIS_CORES. Exige item, versão e identidade separada da cor do produto.',
  },
  {
    id: 'percentual',
    campo: 'Percentual da combinação de cor',
    origemPortal: 'Principal.tecidos/aviamentos[].linxDados.cores',
    colunas: ['PRODUTO_VERSAO_MATERIAL_COR.PORCENTAGEM_CONSUMO'],
    situacao: 'IDENTIFICADO',
    regra:
      'numeric(9,3). Preservar o percentual importado; não inventar 100% para cores recém-selecionadas.',
  },
  {
    id: 'dimensoesAplicadas',
    campo: 'Dimensões aplicadas e parte do material',
    origemPortal: 'Principal.tecidos/aviamentos[].linxDados.dados',
    colunas: [
      'PRODUTO_VERSAO_MATERIAL.LARGURA',
      'PRODUTO_VERSAO_MATERIAL.ALTURA',
      'PRODUTO_VERSAO_MATERIAL.PARTE_APLICADO_MATERIAL',
    ],
    situacao: 'PENDENTE_REGRA',
    regra:
      'Dimensões numeric(9,3), parte varchar(10). Não são automaticamente a largura do rolo, o peso ou o campo livre Finalidade.',
  },
  {
    id: 'modelagem',
    campo: 'Modelagem',
    origemPortal: 'fichaTecnica.modelagem',
    colunas: ['PRODUTOS.MODELAGEM'],
    situacao: 'PENDENTE_REGRA',
    regra:
      'FK PRODUTOS_MODELO.MODELAGEM, char(10). O seletor atual oferece códigos de PRODUTOS: não enviar diretamente sem equivalência.',
  },
  {
    id: 'observacoes',
    campo: 'Observações e Técnica',
    origemPortal:
      'fichaTecnica.observacoesGerais / observacoesCorte / observacoesModelagem / tecnica',
    colunas: [
      'PRODUTOS.OBS',
      'PRODUTO_FICHA_VERSAO.OBS_VERSAO_FICHA',
      'PRODUTO_CORES.OBS_EST',
      'PRODUTO_CORES.OBS_BOR',
      'PRODUTO_CORES.OBS_LAV',
      'PRODUTO_CORES.OBS_TER',
    ],
    situacao: 'PENDENTE_REGRA',
    regra:
      'Candidatos com escopos e limites diferentes. Não concatenar nem sobrescrever para caber nos campos de 150/250 bytes.',
  },
  {
    id: 'workflow',
    campo: 'Etapa, status e responsável do portal',
    origemPortal: 'etapaAtual / status / responsavelId',
    colunas: [
      'PRODUTOS.PERIODO_PCP',
      'PRODUTOS.STATUS_PRODUTO',
      'PRODUTO_FICHA_VERSAO.STATUS_VERSAO_FICHA',
      'PRODUTO_FICHA_VERSAO.RESPONSAVEL',
    ],
    situacao: 'PENDENTE_REGRA',
    regra:
      'Fluxo do portal não é o status da versão ERP. Não traduzir 01/02, Final ou UUID de usuário em códigos/status sem regra aprovada.',
  },
  {
    id: 'preco',
    campo: 'Preço, fornecedor, consumo geral e peso do insumo',
    origemPortal:
      'Principal.tecidos/aviamentos[].custo / fornecedoresList / consumo / quantidade / peso',
    colunas: [],
    situacao: 'PENDENTE_REGRA',
    regra:
      'Não existe destino equivalente confirmado nestas cinco tabelas para preço/fornecedor por item. Consumo/peso gerais não equivalem automaticamente a C1 ou PRODUTOS.PESO.',
  },
  {
    id: 'variantesLocais',
    campo: 'Variantes adicionais e cores personalizadas',
    origemPortal: 'variantes adicionais / cores com origem portal',
    colunas: [],
    situacao: 'SOMENTE_PORTAL',
    regra: 'Exclusivas do portal, conforme regra do projeto. Não criam cadastros globais do ERP.',
  },
  {
    id: 'arquivos',
    campo: 'Arquivos, prova de roupa e histórico',
    origemPortal: 'anexos / fichaTecnica.provaRoupa / historicoAlteracoes',
    colunas: [],
    situacao: 'SOMENTE_PORTAL',
    regra: 'Não entram no contrato Linx nem alteram tabelas de fotos do ERP.',
  },
];

/** Somente metadados; nunca inclui valores de campos locais ou instruções de escrita. */
export function vinculosCamposParaPlanejamento() {
  return {
    evidencia: 'SELECT .6/HOMOLOG_COBRANCA 2026-10-15',
    gravacaoHabilitada: false,
    campos: CAMPOS_FICHA_LINX.filter((campo) => campo.situacao !== 'SOMENTE_PORTAL').map(
      (campo) => ({
        ...campo,
        colunas: [...campo.colunas],
      })
    ),
  };
}
