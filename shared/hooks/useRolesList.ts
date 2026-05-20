import { getApiErrorMessage } from "@/shared/errors/apiError";
import { RoleListItem, roleService } from "@/shared/services/role.service";
import { useCallback, useRef, useState } from "react";

const PAGE_LIMIT = 20;

export function useRolesList() {
  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const fetchRoles = useCallback(async (cursor?: string) => {
    try {
      const response = await roleService.listAdmin({
        cursor,
        limit: PAGE_LIMIT,
      });

      let roleItems: RoleListItem[];
      let next: string | null = null;
      let hasMore = false;

      if (Array.isArray(response)) {
        roleItems = response;
      } else {
        roleItems = response.roles ?? [];
        next = response.nextCursor ?? null;
        hasMore = response.hasNext ?? false;
      }

      const assignable = roleItems.filter((r) => !r.isSystem);
      setRoles((prev) => (cursor ? [...prev, ...assignable] : assignable));
      setNextCursor(next);
      setHasNext(hasMore);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }, []);

  const load = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    await fetchRoles();
    setLoading(false);
    setInitialized(true);
  }, [fetchRoles, loading]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRoles();
    setRefreshing(false);
  }, [fetchRoles]);

  const loadMore = useCallback(async () => {
    if (!hasNext || !nextCursor || loadingMore) return;
    setLoadingMore(true);
    await fetchRoles(nextCursor);
    setLoadingMore(false);
  }, [hasNext, nextCursor, loadingMore, fetchRoles]);

  const reset = useCallback(() => {
    setRoles([]);
    setNextCursor(null);
    setHasNext(false);
    setInitialized(false);
    setError(null);
  }, []);

  return {
    roles,
    loading,
    refreshing,
    loadingMore,
    hasNext,
    error,
    initialized,
    load,
    refresh,
    loadMore,
    reset,
  };
}
