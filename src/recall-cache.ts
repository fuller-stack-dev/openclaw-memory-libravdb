import type { RecallCache, RecallCacheEntry } from "./types.js";

export function createRecallCache<T = unknown>(): RecallCache<T> {
  const entries = new Map<string, RecallCacheEntry<T>>();

  return {
    put(entry) {
      entries.set(cacheKey(entry.userId, entry.queryText), entry);
    },
    get(key) {
      return entries.get(cacheKey(key.userId, key.queryText));
    },
    take(key) {
      const id = cacheKey(key.userId, key.queryText);
      const hit = entries.get(id);
      if (hit) {
        entries.delete(id);
      }
      return hit;
    },
    clearUser(userId) {
      const prefix = `${userId}\n`;
      for (const key of entries.keys()) {
        if (key.startsWith(prefix)) {
          entries.delete(key);
        }
      }
    },
  };
}

function cacheKey(userId: string, queryText: string): string {
  return `${userId}\n${queryText}`;
}
