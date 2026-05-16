import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { View } from "react-native";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";

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
  }, []);

  if (isChecking) {
    return <View style={{ flex: 1, backgroundColor: "#F8FAFC" }} />;
  }

  return <Redirect href={authenticated ? "/(main)/home" : "/(auth)/login"} />;
}
