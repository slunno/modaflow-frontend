import type { RegistryKind, RegistryData } from '../../types/workspace';
import { ETAPAS_FLUXO } from '../../services/fichaFluxos';

export interface RegistryField {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'textarea' | 'boolean' | 'select';
  options?: string[];
  required?: boolean;
  help?: string;
}
const validity: RegistryField[] = [
  { key: 'inicio', label: 'Vigência inicial', type: 'date' },
  { key: 'fim', label: 'Vigência final', type: 'date' },
];
export const registryDefinitions: Record<
  RegistryKind,
  {
    title: string;
    singular: string;
    description: string;
    fields: RegistryField[];
    defaults: RegistryData;
  }
> = {
  tags: {
    title: 'Tags',
    singular: 'tag',
    description: 'Classifique modelos e use os mesmos marcadores nos filtros e relatórios.',
    defaults: { nome: '', grupo: 'Linha' },
    fields: [
      { key: 'grupo', label: 'Grupo', required: true, help: 'Ex.: linha, tema ou classificação.' },
      { key: 'descricao', label: 'Descrição', type: 'textarea' },
    ],
  },
  'piece-types': {
    title: 'Tipos de peça',
    singular: 'tipo de peça',
    description: 'Tipologias e estruturas de modelagem reutilizáveis nas fichas.',
    defaults: { nome: '' },
    fields: [
      { key: 'categoria', label: 'Categoria', required: true },
      {
        key: 'identificador',
        label: 'Código de integração',
        help: 'Opcional. Identificador único nesta marca.',
      },
      { key: 'descricao', label: 'Descrição', type: 'textarea' },
      {
        key: 'grade',
        label: 'Grade padrão',
        help: 'Separe tamanhos por vírgula: PP, P, M, G, GG.',
      },
      {
        key: 'medidas',
        label: 'Medidas padrão',
        type: 'textarea',
        help: 'Uma medida por linha. Aplicação explícita na ficha preserva os valores já preenchidos.',
      },
    ],
  },
  'fixed-costs': {
    title: 'Custos fixos',
    singular: 'custo fixo',
    description:
      'Despesas com rateio explícito. O valor da despesa nunca é somado inteiro a cada unidade.',
    defaults: { nome: '', periodicidade: 'Mensal', criterio: 'Unidades do período' },
    fields: [
      { key: 'categoria', label: 'Categoria', required: true },
      { key: 'valor', label: 'Valor da despesa (R$)', type: 'number', required: true },
      {
        key: 'periodicidade',
        label: 'Periodicidade',
        type: 'select',
        options: ['Mensal', 'Trimestral', 'Anual', 'Por lote'],
        required: true,
      },
      {
        key: 'criterio',
        label: 'Critério de rateio',
        type: 'select',
        options: ['Unidades do período', 'Unidades do lote'],
        required: true,
      },
      {
        key: 'unidadesBase',
        label: 'Unidades da base de rateio',
        type: 'number',
        required: true,
        help: 'Base correspondente à mesma periodicidade da despesa. Rateio unitário = valor ÷ unidades.',
      },
      ...validity,
    ],
  },
  pricing: {
    title: 'Regras de precificação',
    singular: 'regra de preço',
    description: 'Regras por marca, coleção ou tipo, com prioridade e memória de cálculo.',
    defaults: { nome: '', modo: 'markup', prioridade: 0, escopo: 'Marca' },
    fields: [
      {
        key: 'modo',
        label: 'Método',
        type: 'select',
        options: ['markup', 'margem'],
        required: true,
      },
      {
        key: 'fator',
        label: 'Multiplicador ou margem-alvo (%)',
        type: 'number',
        required: true,
        help: 'Markup 2,5 multiplica o custo. Margem de 60% divide o custo por 0,40.',
      },
      {
        key: 'escopo',
        label: 'Aplicação',
        type: 'select',
        options: ['Marca', 'Coleção', 'Tipo de peça'],
        required: true,
      },
      {
        key: 'alvo',
        label: 'Coleção ou tipo de peça',
        help: 'O vínculo usa o identificador estável do cadastro selecionado.',
      },
      { key: 'prioridade', label: 'Prioridade (maior vence)', type: 'number', required: true },
      ...validity,
    ],
  },
  flows: {
    title: 'Fluxos e etapas',
    singular: 'fluxo',
    description: 'A mesma sequência orienta a ficha técnica, o Kanban e os indicadores.',
    defaults: {
      nome: '',
      etapas: ETAPAS_FLUXO.join('\n'),
      inicial: ETAPAS_FLUXO[0],
      final: ETAPAS_FLUXO[19],
      prazoDias: 0,
      exigirResponsavel: false,
      exigirPrazo: false,
      exigirProva: false,
    },
    fields: [
      {
        key: 'etapas',
        label: 'Etapas em ordem',
        type: 'textarea',
        required: true,
        help: 'Uma etapa por linha. Os nomes existentes foram preservados; etapas em uso não podem ser removidas.',
      },
      { key: 'inicial', label: 'Etapa inicial', required: true },
      { key: 'final', label: 'Etapa final', required: true },
      { key: 'responsavel', label: 'Responsável padrão' },
      { key: 'time', label: 'Time responsável' },
      { key: 'prazoDias', label: 'Prazo padrão por etapa (dias)', type: 'number' },
      { key: 'exigirResponsavel', label: 'Exigir responsável na transição', type: 'boolean' },
      { key: 'exigirPrazo', label: 'Exigir prazo na transição', type: 'boolean' },
      { key: 'exigirProva', label: 'Exigir prova aprovada na transição', type: 'boolean' },
    ],
  },
  'custom-fields': {
    title: 'Campos customizados',
    singular: 'campo customizado',
    description:
      'Campos validados por tipo, disponíveis no contexto escolhido e nos relatórios compatíveis.',
    defaults: { nome: '', tipo: 'texto', contexto: 'produto', obrigatorio: false, ordem: 0 },
    fields: [
      {
        key: 'identificador',
        label: 'Identificador',
        required: true,
        help: 'Identificador estável e único; exemplo: linha_comercial.',
      },
      {
        key: 'tipo',
        label: 'Tipo de dado',
        type: 'select',
        options: ['texto', 'numero', 'moeda', 'data', 'selecao', 'booleano'],
        required: true,
      },
      {
        key: 'contexto',
        label: 'Contexto',
        type: 'select',
        options: ['produto', 'colecao'],
        required: true,
      },
      { key: 'obrigatorio', label: 'Preenchimento obrigatório', type: 'boolean' },
      {
        key: 'opcoes',
        label: 'Opções de seleção',
        type: 'textarea',
        help: 'Uma opção por linha. Usado somente no tipo seleção.',
      },
      { key: 'ordem', label: 'Ordem de exibição', type: 'number' },
    ],
  },
  measurements: {
    title: 'Características e medidas',
    singular: 'estrutura de modelagem',
    description: 'Reutilize tabelas e medidas sem recadastrar cada estrutura nas fichas.',
    defaults: { nome: '' },
    fields: [
      { key: 'descricao', label: 'Característica', type: 'textarea' },
      { key: 'grade', label: 'Grade de tamanhos', help: 'Separe por vírgulas.' },
      {
        key: 'medidas',
        label: 'Medidas',
        type: 'textarea',
        required: true,
        help: 'Uma medida por linha. Valores existentes são preservados ao aplicar a estrutura.',
      },
    ],
  },
  teams: {
    title: 'Times',
    singular: 'time',
    description: 'Equipes da marca disponíveis no fluxo, nas fichas e no BI.',
    defaults: { nome: '' },
    fields: [
      { key: 'descricao', label: 'Descrição', type: 'textarea' },
      {
        key: 'designadoProduto',
        label: 'Disponível para desenvolvimento de produtos',
        type: 'boolean',
      },
    ],
  },
};
