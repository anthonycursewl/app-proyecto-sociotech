import { getApiErrorMessage } from "@/shared/errors/apiError";
import { AdminUserListItem, userService } from "@/shared/services/user.service";
import { useCallback, useEffect, useRef, useState } from "react";

const PAGE_LIMIT = 20;

export type UserStatusFilter = "all" | "active" | "inactive";

export function useUsersList(statusFilter: UserStatusFilter = "all") {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filterRef = useRef(statusFilter);

  const fetchUsers = useCallback(
    async (cursor?: string) => {
      try {
        const isActive =
          filterRef.current === "active"
            ? true
            : filterRef.current === "inactive"
              ? false
              : undefined;
        const response = await userService.listAdmin({
          cursor,
          limit: PAGE_LIMIT,
          isActive,
        });
        const items = response.data ?? response.users ?? [];
        setUsers((prev) => (cursor ? [...prev, ...items] : items));
        setNextCursor(response.nextCursor);
        setHasNext(response.hasNext);
        setError(null);
      } catch (err) {
        setError(getApiErrorMessage(err));
      }
    },
    [],
  );

  useEffect(() => {
    filterRef.current = statusFilter;
    setUsers([]);
    setNextCursor(null);
    setHasNext(false);
    setLoading(true);
    fetchUsers().then(() => setLoading(false));
  }, [statusFilter, fetchUsers]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  }, [fetchUsers]);

  const loadMore = useCallback(async () => {
    if (!hasNext || !nextCursor || loadingMore) return;
    setLoadingMore(true);
    await fetchUsers(nextCursor);
    setLoadingMore(false);
  }, [hasNext, nextCursor, loadingMore, fetchUsers]);

  const reload = useCallback(async () => {
    setLoading(true);
    await fetchUsers();
    setLoading(false);
  }, [fetchUsers]);

  const updateUserInList = useCallback((updated: AdminUserListItem) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }, []);

  return {
    users,
    loading,
    refreshing,
    loadingMore,
    hasNext,
    error,
    refresh,
    loadMore,
    reload,
    updateUserInList,
  };
}
