const DATABASE_NAME = "studora-local-files";
const STORE_NAME = "materials";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Penyimpanan berkas tidak tersedia di browser ini."));
      return;
    }
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Penyimpanan berkas gagal dibuka."));
  });
}

async function transaction<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore, done: (value: T) => void) => void): Promise<T> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, mode);
    let value: T;
    tx.oncomplete = () => { database.close(); resolve(value); };
    tx.onerror = () => { database.close(); reject(tx.error ?? new Error("Berkas tidak dapat disimpan.")); };
    tx.onabort = () => { database.close(); reject(tx.error ?? new Error("Penyimpanan berkas dibatalkan.")); };
    work(tx.objectStore(STORE_NAME), (result) => { value = result; });
  });
}

export function saveLocalFile(id: string, file: File): Promise<void> {
  return transaction<void>("readwrite", (store) => { store.put(file, id); });
}

export function getLocalFile(id: string): Promise<Blob | undefined> {
  return transaction<Blob | undefined>("readonly", (store, done) => {
    const request = store.get(id);
    request.onsuccess = () => done(request.result as Blob | undefined);
  });
}

export function deleteLocalFile(id: string): Promise<void> {
  return transaction<void>("readwrite", (store) => { store.delete(id); });
}

export function clearLocalFiles(): Promise<void> {
  return transaction<void>("readwrite", (store) => { store.clear(); });
}
