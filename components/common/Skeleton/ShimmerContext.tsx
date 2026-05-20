import React, { createContext, useContext, useEffect } from "react";
import { Easing, useSharedValue, withRepeat, withTiming, type SharedValue } from "react-native-reanimated";

const ShimmerContext = createContext<SharedValue<number> | null>(null);

/** Una sola animación compartida para todos los Skeleton dentro del layout (sin saltos desincronizados) */
export function ShimmerProvider({ children }: { children: React.ReactNode }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.linear }),
      -1,
      true,
    );
  }, [progress]);

  return <ShimmerContext.Provider value={progress}>{children}</ShimmerContext.Provider>;
}

export function useSharedShimmerProgress(): SharedValue<number> | null {
  return useContext(ShimmerContext);
}
