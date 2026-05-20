import { getApiErrorMessage } from "@/shared/errors/apiError";
import { RoleDetail, roleService } from "@/shared/services/role.service";
import { useCallback, useState } from "react";

export function useRoleDetail() {
  const [role, setRole] = useState<RoleDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRole = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await roleService.getById(id);
      setRole(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setRole(null);
    setError(null);
  }, []);

  return { role, loading, error, fetchRole, clear };
}
