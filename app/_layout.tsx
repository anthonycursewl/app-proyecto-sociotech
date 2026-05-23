import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { AppErrorBoundary } from "@/shared/components/AppErrorBoundary";

export default function RootLayout() {
  const [loaded] = useFonts({
    "SpaceGrotesk-Light": require("../assets/fonts/SpaceGrotesk-Light.ttf"),
    "SpaceGrotesk-Regular": require("../assets/fonts/SpaceGrotesk-Regular.ttf"),
    "SpaceGrotesk-Medium": require("../assets/fonts/SpaceGrotesk-Medium.ttf"),
    "SpaceGrotesk-SemiBold": require("../assets/fonts/SpaceGrotesk-SemiBold.ttf"),
    "SpaceGrotesk-Bold": require("../assets/fonts/SpaceGrotesk-Bold.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      // Fonts ready
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <AppErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </AppErrorBoundary>
  );
}
