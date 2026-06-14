import { create } from "zustand";
import type { AdminUserDetail } from "@/shared/services/user.service";

const MAX_CACHED_USERS = 5;
const TTL_MS = 120_000;

interface UserCacheEntry {
  data: AdminUserDetail;
  timestamp: number;
}

interface UserCacheState {
  cache: Record<string, UserCacheEntry>;
  keys: string[];

  getUser: (id: string) => AdminUserDetail | null;
  setUser: (id: string, data: AdminUserDetail) => void;
}

const isExpired = (entry: UserCacheEntry) => Date.now() - entry.timestamp > TTL_MS;

export const useUserCacheStore = create<UserCacheState>((set, get) => ({
  cache: {},
  keys: [],

  getUser: (id: string) => {
    const entry = get().cache[id];
    if (!entry) return null;
    if (isExpired(entry)) {
      set((s) => {
        const next = { ...s.cache };
        delete next[id];
        return { cache: next, keys: s.keys.filter((k) => k !== id) };
      });
      return null;
    }
    return entry.data;
  },

  setUser: (id: string, data: AdminUserDetail) => {
    set((s) => {
      const nextCache = { ...s.cache, [id]: { data, timestamp: Date.now() } };
      let nextKeys = s.keys.filter((k) => k !== id);
      nextKeys.push(id);
      if (nextKeys.length > MAX_CACHED_USERS) {
        const oldest = nextKeys.shift()!;
        delete nextCache[oldest];
      }
      return { cache: nextCache, keys: nextKeys };
    });
  },
}));
