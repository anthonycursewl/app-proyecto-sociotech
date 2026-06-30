import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLatest } from "@/shared/hooks/useLatest";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const DRAG_THRESHOLD = 60;
const DEFAULT_HEIGHT_FACTOR = 0.7;

interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number;
}

function resolveSheetHeight(height: number | undefined): number {
  if (height === undefined) return SCREEN_HEIGHT * DEFAULT_HEIGHT_FACTOR;
  if (height > 0 && height <= 1) return SCREEN_HEIGHT * height;
  return height;
}

export const BottomSheetModal = ({
  visible,
  onClose,
  children,
  height,
}: BottomSheetModalProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const onCloseRef = useLatest(onClose);
  const insets = useSafeAreaInsets();

  const sheetHeight = resolveSheetHeight(height);

  const slideY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetScale = useRef(new Animated.Value(0.95)).current;

  const openAnimation = useCallback(() => {
    setIsVisible(true);
    setAnimating(true);
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(slideY, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
      Animated.spring(sheetScale, { toValue: 1, tension: 65, friction: 11, useNativeDriver: true }),
    ]).start(() => setAnimating(false));
  }, [overlayOpacity, slideY, sheetScale]);

  const closeAnimation = useCallback(() => {
    setAnimating(true);
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: SCREEN_HEIGHT, duration: 200, useNativeDriver: true }),
      Animated.timing(sheetScale, { toValue: 0.95, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setIsVisible(false);
      setAnimating(false);
      onCloseRef.current();
    });
  }, [overlayOpacity, slideY, sheetScale, onCloseRef]);

  useEffect(() => {
    if (visible && !isVisible) {
      openAnimation();
    } else if (!visible && isVisible) {
      closeAnimation();
    }
  }, [visible, isVisible, openAnimation, closeAnimation]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        gestureState.dy > 5 && gestureState.vy > 0.5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideY.setValue(gestureState.dy);
          overlayOpacity.setValue(Math.max(0, 1 - gestureState.dy / (SCREEN_HEIGHT * 0.4)));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > DRAG_THRESHOLD || gestureState.vy > 1.5) {
          Animated.parallel([
            Animated.timing(overlayOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
            Animated.timing(slideY, { toValue: SCREEN_HEIGHT, duration: 150, useNativeDriver: true }),
          ]).start(() => {
            setIsVisible(false);
            setAnimating(false);
            onCloseRef.current();
          });
        } else {
          Animated.spring(slideY, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }).start();
          Animated.timing(overlayOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
        }
      },
    }),
  ).current;

  return (
    <Modal
      visible={isVisible || animating}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={closeAnimation}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeAnimation} />
        <Animated.View
          style={[
            styles.sheet,
            {
              height: sheetHeight,
              paddingBottom: 28 + insets.bottom,
              transform: [{ translateY: slideY }, { scale: sheetScale }],
            },
          ]}
        >
          <View style={styles.dragArea} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>
          {children}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  dragArea: {
    paddingVertical: 8,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
  },
});
