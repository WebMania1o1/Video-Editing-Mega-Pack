// Client-Side IndexedDB Storage of Large Video Files for Perpetual Persistence

const DB_NAME = "MediaVaultDB";
const STORE_NAME = "videosStore";

/**
 * Opens connection to browser's IndexedDB.
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Saves a video Blob directly to IndexedDB associated with an asset ID.
 * Returns the object URL coordinates for immediate playback.
 */
export async function saveVideoBlob(id: string, file: Blob): Promise<string> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      const request = store.put(file, id);

      request.onsuccess = () => {
        const objectUrl = URL.createObjectURL(file);
        resolve(objectUrl);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.warn("IndexedDB save failed, falling back to instant blob URL", err);
    return URL.createObjectURL(file);
  }
}

/**
 * Retrieves a persistent video Blob from IndexedDB and returns a temporary object URL,
 * or null if no custom video was ever uploaded for this asset ID.
 */
export async function getVideoBlobUrl(id: string): Promise<string | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);

      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result;
        if (result instanceof Blob) {
          const objectUrl = URL.createObjectURL(result);
          resolve(objectUrl);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.error("IndexedDB retrieval failed", err);
    return null;
  }
}

/**
 * Deletes a video association from IndexedDB.
 */
export async function deleteVideoBlob(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.error("IndexedDB delete failed", err);
  }
}
