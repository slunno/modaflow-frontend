import { api } from './api';
import type { WorkspaceDocument, WorkspaceKind, WorkspaceChange } from '../types/workspace';

export const WORKSPACE_CHANGED = 'akr_workspace_changed';
const pendingLists = new Map<string, Promise<WorkspaceDocument<unknown>[]>>();
export async function listWorkspace<T>(
  kind: WorkspaceKind,
  brand: string
): Promise<WorkspaceDocument<T>[]> {
  const key = brand + ':' + kind;
  let pending = pendingLists.get(key);
  if (!pending) {
    pending = api.get<WorkspaceDocument<unknown>[]>(`/workspace/${kind}`, brand).then((result) => {
      if (!Array.isArray(result))
        throw new Error('A API operacional retornou uma resposta inválida.');
      return result;
    });
    pendingLists.set(key, pending);
    const clean = () => {
      if (pendingLists.get(key) === pending) pendingLists.delete(key);
    };
    void pending.then(clean, clean);
  }
  return (await pending) as WorkspaceDocument<T>[];
}
export async function saveWorkspace<T>(
  kind: WorkspaceKind,
  data: T,
  brand: string,
  previous?: WorkspaceDocument<T>
): Promise<WorkspaceDocument<T>> {
  const id = previous?.id ?? crypto.randomUUID();
  const result = await api.put<WorkspaceDocument<T>>(
    `/workspace/${kind}/${id}`,
    { expectedRevision: previous?.revision ?? null, data },
    brand
  );
  if (!result?.id || !Number.isInteger(result.revision))
    throw new Error('O servidor não confirmou o salvamento.');
  pendingLists.delete(brand + ':' + kind);
  window.dispatchEvent(new CustomEvent(WORKSPACE_CHANGED, { detail: { brand, kind, id } }));
  return result;
}
export async function workspaceHistory(brand: string): Promise<WorkspaceChange[]> {
  const result = await api.get<WorkspaceChange[]>('/workspace/history', brand);
  if (!Array.isArray(result)) throw new Error('Não foi possível confirmar o histórico.');
  return result;
}
