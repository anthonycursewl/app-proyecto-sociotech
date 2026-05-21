import { getApiErrorMessage } from "@/shared/errors/apiError";
import { Permission, roleService } from "@/shared/services/role.service";
import { useCallback, useState } from "react";

export function useAvailablePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await roleService.listAllPermissions();
      setPermissions(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  return { permissions, loading, error, fetchPermissions };
}
