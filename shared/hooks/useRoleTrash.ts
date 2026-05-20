import { getApiErrorMessage } from "@/shared/errors/apiError";
import { RoleListItem, roleService } from "@/shared/services/role.service";
import { useCallback, useState } from "react";

export function useRoleTrash() {
  const [trashItems, setTrashItems] = useState<RoleListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrash = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await roleService.getTrash();
      setTrashItems(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTrash();
    setRefreshing(false);
  }, [fetchTrash]);

  const restoreRole = useCallback(async (id: string) => {
    try {
      const restored = await roleService.restore(id);
      setTrashItems((prev) => prev.filter((r) => r.id !== id));
      return restored;
    } catch (err) {
      setError(getApiErrorMessage(err));
      throw err;
    }
  }, []);

  const deletePermanent = useCallback(async (id: string) => {
    try {
      await roleService.deletePermanent(id);
      setTrashItems((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(getApiErrorMessage(err));
      throw err;
    }
  }, []);

  return {
    trashItems,
    loading,
    refreshing,
    error,
    fetchTrash,
    refresh,
    restoreRole,
    deletePermanent,
  };
}
