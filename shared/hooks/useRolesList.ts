import { getApiErrorMessage } from "@/shared/errors/apiError";
import { RoleListItem, roleService } from "@/shared/services/role.service";
import { useCallback, useEffect, useRef, useState } from "react";

const PAGE_LIMIT = 20;

export function useRolesList() {
  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [loading, setLoading] = useState(true);
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
      setRoles((prev) => (cursor ? [...prev, ...response.roles] : response.roles));
      setNextCursor(response.nextCursor);
      setHasNext(response.hasNext);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchRoles().then(() => {
      setLoading(false);
      setInitialized(true);
    });
  }, [fetchRoles]);

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

  const reload = useCallback(async () => {
    setLoading(true);
    await fetchRoles();
    setLoading(false);
  }, [fetchRoles]);

  const load = useCallback(async () => {
    setLoading(true);
    await fetchRoles();
    setLoading(false);
    setInitialized(true);
  }, [fetchRoles]);

  const reset = useCallback(() => {
    setRoles([]);
    setNextCursor(null);
    setHasNext(false);
    setInitialized(false);
    setError(null);
  }, []);

  const updateRoleInList = useCallback((updated: RoleListItem) => {
    setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }, []);

  const removeRoleFromList = useCallback((id: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addRoleToList = useCallback((newRole: RoleListItem) => {
    setRoles((prev) => [newRole, ...prev]);
  }, []);

  return {
    roles,
    loading,
    refreshing,
    loadingMore,
    hasNext,
    error,
    initialized,
    refresh,
    loadMore,
    reload,
    load,
    reset,
    updateRoleInList,
    removeRoleFromList,
    addRoleToList,
  };
}
