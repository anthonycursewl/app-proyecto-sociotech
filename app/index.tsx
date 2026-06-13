import { SessionLoadingScreen , SessionLoadingError } from "@/components/common/SessionLoadingScreen";
import { initSessionManager } from "@/shared/http/sessionManager";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import * as SecureStore from "expo-secure-store";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

initSessionManager();

export default function Index() {
  const [isChecking, setIsChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const verifyToken = useAuthStore((s) => s.verifyToken);

  useEffect(() => {
    (async () => {
      try {
        const at = await SecureStore.getItemAsync("accessToken");
        const rt = await SecureStore.getItemAsync("refreshToken");
        if (!at || !rt) {
          setAuthenticated(false);
          setIsChecking(false);
          return;
        }
        const valid = await verifyToken();
        setAuthenticated(valid);
      } catch (err: any) {
        setError(err.message || "Error al verificar la sesión");
      } finally {
        setIsChecking(false);
      }
    })();
  }, [verifyToken]);

  if (error) {
    return <SessionLoadingError message={error} />;
  }

  if (isChecking) {
    return <SessionLoadingScreen />;
  }

  return <Redirect href={authenticated ? "/(main)/home" : "/(auth)/login"} />;
}
