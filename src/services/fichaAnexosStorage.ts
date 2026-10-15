import { api } from './api';
export type FichaAnexoCategoria = 'variantes' | 'referencias' | 'desenhos' | 'projeto' | 'outros';

export function sharedAttachmentScope(pieceKey: string) {
  const match = /^shared:(\d+):([a-zA-Z0-9_-]+)$/.exec(pieceKey);
  return match ? { brand: match[1]!, path: `/workspace/products/${match[2]}/attachments` } : null;
}

export async function shareLocalAttachments(localKey: string, sharedKey: string) {
  const scope = sharedAttachmentScope(sharedKey);
  if (!scope) throw new Error('Destino compartilhado inválido.');
  const local = await listFichaAnexos(localKey);
  for (const item of local) {
    const body = new FormData();
    body.append('category', item.categoria);
    body.append('file', item.arquivo, item.nome);
    await api.put(`${scope.path}/${item.id}`, body, scope.brand);
  }
  return local.length;
}

export interface FichaAnexo {
  id: string;
  pieceKey: string;
  categoria: FichaAnexoCategoria;
  nome: string;
  tamanho: number;
  tipo: string;
  arquivo: Blob;
  criadoEm: number;
}

const STORE = 'anexos';
const openDatabase = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    if (!globalThis.indexedDB) {
      reject(new Error('O armazenamento de arquivos não está disponível neste navegador.'));
      return;
    }
    const request = indexedDB.open('modaflow_ficha_anexos', 1);
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore(STORE, { keyPath: 'id' });
      store.createIndex('pieceKey', 'pieceKey');
    };
    request.onerror = () => reject(request.error ?? new Error('Não foi possível abrir os anexos.'));
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
  });

export async function listFichaAnexos(pieceKey: string): Promise<FichaAnexo[]> {
  const scope = sharedAttachmentScope(pieceKey);
  if (scope) {
    const records = await api.get<Omit<FichaAnexo, 'arquivo' | 'pieceKey'>[]>(
      scope.path,
      scope.brand
    );
    return Promise.all(
      records.map(async (item) => ({
        ...item,
        pieceKey,
        arquivo: new Blob([await api.download(`${scope.path}/${item.id}`, scope.brand)], {
          type: item.tipo,
        }),
      }))
    );
  }
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readonly');
    const request = transaction.objectStore(STORE).index('pieceKey').getAll(pieceKey);
    transaction.oncomplete = () => {
      db.close();
      resolve((request.result as FichaAnexo[]).sort((a, b) => a.criadoEm - b.criadoEm));
    };
    transaction.onabort = () => {
      db.close();
      reject(transaction.error ?? new Error('Não foi possível carregar os anexos.'));
    };
  });
}

/** Lê somente a foto necessária ao card, sem baixar desenhos e projetos da ficha. */
export async function getFichaImagem(
  pieceKey: string,
  anexoId?: string,
  excludedIds: string[] = []
): Promise<Blob | null> {
  const excluded = new Set(excludedIds);
  const scope = sharedAttachmentScope(pieceKey);
  if (scope) {
    let id = anexoId;
    if (!id) {
      const records = await api.get<Omit<FichaAnexo, 'arquivo' | 'pieceKey'>[]>(
        scope.path,
        scope.brand
      );
      id = records.find((item) => item.categoria === 'variantes' && !excluded.has(item.id))?.id;
    }
    return id ? api.download(`${scope.path}/${id}`, scope.brand) : null;
  }
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readonly');
    const store = transaction.objectStore(STORE);
    let image: Blob | null = null;
    if (anexoId) {
      const request = store.get(anexoId);
      request.onsuccess = () => {
        const item = request.result as FichaAnexo | undefined;
        if (item?.pieceKey === pieceKey && item.categoria === 'variantes') image = item.arquivo;
      };
    } else {
      const request = store.index('pieceKey').openCursor(pieceKey);
      let createdAt = Infinity;
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return;
        const item = cursor.value as FichaAnexo;
        if (item.categoria === 'variantes' && !excluded.has(item.id) && item.criadoEm < createdAt) {
          image = item.arquivo;
          createdAt = item.criadoEm;
        }
        cursor.continue();
      };
    }
    transaction.oncomplete = () => {
      db.close();
      resolve(image);
    };
    transaction.onabort = () => {
      db.close();
      reject(transaction.error ?? new Error('Não foi possível carregar a foto da peça.'));
    };
  });
}

export async function addFichaAnexos(
  pieceKey: string,
  categoria: FichaAnexoCategoria,
  files: File[]
): Promise<FichaAnexo[]> {
  const isImage = ['variantes', 'referencias', 'desenhos'].includes(categoria);
  const limit = (isImage ? 10 : 100) * 1024 * 1024;
  for (const file of files) {
    if (isImage && !file.type.startsWith('image/'))
      throw new Error('Selecione apenas arquivos de imagem.');
    if (categoria === 'projeto' && !/\.(cdr|cpt|ai|eps|psd|psb|pdf)$/i.test(file.name))
      throw new Error('Selecione um arquivo Corel, Illustrator, Photoshop ou PDF.');
    if (file.size > limit)
      throw new Error(
        `Cada ${isImage ? 'imagem deve ter até 10' : 'arquivo deve ter até 100'} MB.`
      );
  }
  if (!files.length) return [];
  const scope = sharedAttachmentScope(pieceKey);
  if (scope) {
    const saved: FichaAnexo[] = [];
    for (const file of files) {
      const body = new FormData();
      body.append('category', categoria);
      body.append('file', file);
      const item = await api.put<Omit<FichaAnexo, 'arquivo' | 'pieceKey'>>(
        `${scope.path}/${crypto.randomUUID()}`,
        body,
        scope.brand
      );
      saved.push({ ...item, pieceKey, arquivo: file });
    }
    return saved;
  }
  const records: FichaAnexo[] = files.map((file, index) => ({
    id: crypto.randomUUID(),
    pieceKey,
    categoria,
    nome: file.name,
    tamanho: file.size,
    tipo: file.type,
    arquivo: file,
    criadoEm: Date.now() + index,
  }));
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    for (const record of records) transaction.objectStore(STORE).add(record);
    transaction.oncomplete = () => {
      db.close();
      resolve(records);
    };
    transaction.onabort = () => {
      db.close();
      reject(transaction.error ?? new Error('Não foi possível salvar os anexos.'));
    };
  });
}

export async function removeFichaAnexo(id: string, pieceKey?: string): Promise<void> {
  const scope = sharedAttachmentScope(pieceKey ?? '');
  if (scope) {
    await api.delete(`${scope.path}/${id}`, scope.brand);
    return;
  }
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).delete(id);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onabort = () => {
      db.close();
      reject(transaction.error ?? new Error('Não foi possível remover o anexo.'));
    };
  });
}

/** Duplica o arquivo: remover a imagem original não apaga a capa da nova variante. */
export async function copiarImagemVariante(pieceKey: string, anexoId: string): Promise<FichaAnexo> {
  const original = (await listFichaAnexos(pieceKey)).find(
    (item) => item.id === anexoId && item.categoria === 'variantes'
  );
  if (!original) throw new Error('A imagem principal não está mais disponível nos anexos.');
  const file = new File([original.arquivo], original.nome, { type: original.tipo });
  const copied = await addFichaAnexos(pieceKey, 'variantes', [file]);
  return copied[0]!;
}
