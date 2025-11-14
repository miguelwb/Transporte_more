import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder, Pressable, StyleSheet, View } from 'react-native';

/**
 * BottomSheet puxável (drag up/down), sem dependências externas.
 * - Props:
 *   - visible: boolean
 *   - onClose?: () => void
 *   - snapPoints?: number[] (em px, de menor para maior)
 *   - initialIndex?: number (índice do snap inicial ao abrir)
 *   - children: conteúdo do sheet
 */
export default function BottomSheet({
  visible,
  onClose,
  snapPoints = [160, 320, 520],
  initialIndex = Math.max(0, Math.min(2, 1)),
  children,
  backdropOpacity = 0.2,
  closeOnBackdropPress = true,
  closeOnDragDown = true,
}) {
  const screenHeight = Dimensions.get('window').height;
  // Garante que nenhum snap ultrapasse a altura útil
  const safeSnaps = useMemo(() => snapPoints.map((p) => Math.min(p, screenHeight - 80)), [snapPoints, screenHeight]);
  const [open, setOpen] = useState(!!visible);
  const lastSnapRef = useRef(safeSnaps[initialIndex] || safeSnaps[safeSnaps.length - 1]);
  const translateY = useRef(new Animated.Value(screenHeight)).current; // começa fora da tela
  const backdrop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setOpen(true);
      const target = lastSnapRef.current;
      Animated.parallel([
        Animated.timing(translateY, { toValue: screenHeight - target, duration: 220, useNativeDriver: true }),
        Animated.timing(backdrop, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else if (open) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: screenHeight, duration: 200, useNativeDriver: true }),
        Animated.timing(backdrop, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setOpen(false);
      });
    }
  }, [visible, open, screenHeight, translateY, backdrop]);

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gesture) => Math.abs(gesture.dy) > 6,
      onPanResponderMove: (_evt, gesture) => {
        const currentTop = screenHeight - (translateY.__getValue?.() || 0);
        const nextTop = currentTop - gesture.dy; // mover seguindo o dedo
        const clamped = Math.max(safeSnaps[0] * 0.6, Math.min(nextTop, safeSnaps[safeSnaps.length - 1] + 40));
        translateY.setValue(screenHeight - clamped);
      },
      onPanResponderRelease: (_evt, gesture) => {
        const projectedTop = screenHeight - (translateY.__getValue?.() || 0) - gesture.vy * 60;
        // decidir snap mais próximo
        let target = safeSnaps[0];
        let best = Infinity;
        for (const s of safeSnaps) {
          const d = Math.abs(projectedTop - s);
          if (d < best) { best = d; target = s; }
        }
        // se arrastou muito para baixo
        if (gesture.dy > 60 && projectedTop < safeSnaps[0] * 0.7) {
          if (closeOnDragDown) {
            Animated.parallel([
              Animated.timing(translateY, { toValue: screenHeight, duration: 200, useNativeDriver: true }),
              Animated.timing(backdrop, { toValue: 0, duration: 150, useNativeDriver: true }),
            ]).start(() => {
              lastSnapRef.current = safeSnaps[initialIndex] || safeSnaps[safeSnaps.length - 1];
              onClose?.();
              setOpen(false);
            });
          } else {
            lastSnapRef.current = safeSnaps[0];
            Animated.timing(translateY, { toValue: screenHeight - safeSnaps[0], duration: 180, useNativeDriver: true }).start();
          }
          return;
        }
        lastSnapRef.current = target;
        Animated.timing(translateY, { toValue: screenHeight - target, duration: 180, useNativeDriver: true }).start();
      },
    })
  ).current;

  if (!open) return null;

  return (
    <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { zIndex: 1000 }] }>
      {closeOnBackdropPress ? (
        <Pressable style={StyleSheet.absoluteFill} onPress={() => onClose?.()}>
          <Animated.View
            pointerEvents="none"
            style={[styles.backdrop, { opacity: backdrop.interpolate({ inputRange: [0, 1], outputRange: [0, backdropOpacity] }) }]} />
        </Pressable>
      ) : (
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdrop.interpolate({ inputRange: [0, 1], outputRange: [0, backdropOpacity] }) }]} />
      )}

      <Animated.View
        style={[styles.sheet, { transform: [{ translateY }] }]}
        {...pan.panHandlers}
      >
        <View style={styles.handle} />
        <View style={styles.content}>{children}</View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: '#000',
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1001,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    marginTop: 8,
    marginBottom: 8,
  },
  content: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
});