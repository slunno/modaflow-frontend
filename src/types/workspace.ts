import type { PecaItem, ColecaoItem } from './plm';

export type RegistryKind =
  | 'tags'
  | 'piece-types'
  | 'fixed-costs'
  | 'pricing'
  | 'flows'
  | 'custom-fields'
  | 'measurements'
  | 'teams';
export type WorkspaceKind = RegistryKind | 'products' | 'collections';
export type FieldValue = string | number | boolean;
export interface RegistryData {
  nome: string;
  marcaId?: string;
  archived?: boolean;
  [key: string]: FieldValue | undefined;
}
export interface OperationalProduct extends PecaItem {
  stageDeadline?: string;
  sourceKey: string;
  tagIds?: string[];
  customFields?: Record<string, FieldValue>;
  typeId?: string;
  flowId?: string;
  team?: string;
  teamId?: string;
  responsavelId?: string;
  estilistaId?: string;
  modelistaId?: string;
  sharedAt?: string;
  completedAt?: string;
  archived?: boolean;
}
export interface OperationalCollection extends ColecaoItem {
  sourceKey: string;
  responsavel?: string;
  customFields?: Record<string, FieldValue>;
}
export interface WorkspaceDocument<T = RegistryData> {
  id: string;
  kind: WorkspaceKind;
  revision: number;
  updatedAt: string;
  data: T;
}
export interface WorkspaceChange {
  id: string;
  documentId: string;
  kind: WorkspaceKind;
  at: string;
  author: string;
  fromStage: string | null;
  toStage: string | null;
  data: {
    nome?: string;
    codigo?: string;
    colecaoId?: string;
    flowId?: string;
    responsavel?: string;
    status?: string;
    revision: number;
    operation: string;
    fields: string[];
  };
}
export interface WorkspaceFilter {
  colecao?: string;
  q?: string;
  etapa?: string;
  status?: string;
  tag?: string;
  tipo?: string;
  responsavel?: string;
  estilista?: string;
  modelista?: string;
  time?: string;
  from?: string;
  to?: string;
  attention?: string;
  custom?: string;
  value?: string;
}
