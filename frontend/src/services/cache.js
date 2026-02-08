import { openDB } from 'idb';

const DB_NAME = 'catalyst-cache';
const DB_VERSION = 1;
const DATASET_STORE = 'datasets';

/**
 * Initialize IndexedDB
 */
async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(DATASET_STORE)) {
        db.createObjectStore(DATASET_STORE, { keyPath: 'id' });
      }
    },
  });
}

/**
 * Cache dataset in IndexedDB
 */
export async function cacheDataset(datasetId, data) {
  try {
    const db = await getDB();
    await db.put(DATASET_STORE, {
      id: datasetId,
      data,
      timestamp: Date.now(),
    });
    console.log(`Cached dataset ${datasetId}`);
  } catch (error) {
    console.error('Failed to cache dataset:', error);
  }
}

/**
 * Get cached dataset
 */
export async function getCachedDataset(datasetId, maxAge = 3600000) {
  try {
    const db = await getDB();
    const cached = await db.get(DATASET_STORE, datasetId);
    
    if (!cached) return null;
    
    // Check if cache is still valid
    const age = Date.now() - cached.timestamp;
    if (age > maxAge) {
      // Cache expired
      await db.delete(DATASET_STORE, datasetId);
      return null;
    }
    
    console.log(`Retrieved cached dataset ${datasetId}`);
    return cached.data;
  } catch (error) {
    console.error('Failed to get cached dataset:', error);
    return null;
  }
}

/**
 * Clear all cached datasets
 */
export async function clearCache() {
  try {
    const db = await getDB();
    await db.clear(DATASET_STORE);
    console.log('Cache cleared');
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
}

export default {
  cacheDataset,
  getCachedDataset,
  clearCache,
};
