import { SessionLoadingScreen } from "@/components/common/SessionLoadingScreen";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

export default function Index() {
  const [isChecking, setIsChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const verifyToken = useAuthStore((s) => s.verifyToken);

  useEffect(() => {
    (async () => {
      const valid = await verifyToken();
      setAuthenticated(valid);
      setIsChecking(false);
    })();
  }, [verifyToken]);

  if (isChecking) {
    return <SessionLoadingScreen />;
  }

  return <Redirect href={authenticated ? "/(main)/home" : "/(auth)/login"} />;
}
