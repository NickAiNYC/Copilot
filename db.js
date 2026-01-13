// db.js - IndexedDB management
export async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('DealerCopilotDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Store listings
      if (!db.objectStoreNames.contains('listings')) {
        const listingStore = db.createObjectStore('listings', { keyPath: 'id', autoIncrement: true });
        listingStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      // Store post history
      if (!db.objectStoreNames.contains('postHistory')) {
        const historyStore = db.createObjectStore('postHistory', { keyPath: 'id', autoIncrement: true });
        historyStore.createIndex('groupName', 'groupName', { unique: false });
        historyStore.createIndex('listingId', 'listingId', { unique: false });
      }
      
      // Store group profiles
      if (!db.objectStoreNames.contains('groups')) {
        const groupStore = db.createObjectStore('groups', { keyPath: 'name' });
        groupStore.createIndex('performance', 'performance', { unique: false });
      }
    };
  });
}

export async function saveToIndexedDB(storeName, data) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add({ ...data, timestamp: Date.now() });
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
