const LOCAL_STATE_EVENT = 'modaflow:local-state';

export function getLocalStateSnapshot(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function parseLocalState<T>(snapshot: string | null, fallback: T): T {
  if (snapshot !== null) {
    try {
      return JSON.parse(snapshot) as T;
    } catch {
      // Um registro inválido não impede o portal de abrir.
    }
  }
  return fallback;
}

/** Grava somente no navegador e avisa os consumidores da mesma página. */
export function saveLocalState<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(LOCAL_STATE_EVENT, { detail: { key } }));
}

export function subscribeLocalState(key: string, onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.storageArea === localStorage && (event.key === key || event.key === null)) onChange();
  };
  const onLocalChange = (event: Event) => {
    if ((event as CustomEvent<{ key: string }>).detail.key === key) onChange();
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener(LOCAL_STATE_EVENT, onLocalChange);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(LOCAL_STATE_EVENT, onLocalChange);
  };
}
