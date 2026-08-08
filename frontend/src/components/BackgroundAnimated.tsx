import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface BackgroundAnimatedProps {
  children: React.ReactNode;
}

export default function BackgroundAnimated({ children }: BackgroundAnimatedProps) {
  const moveAnim1 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const moveAnim2 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Movimiento orgánico para el Orbe 1
    const anim1 = Animated.loop(
      Animated.sequence([
        Animated.timing(moveAnim1, {
          toValue: { x: width * 0.3, y: height * 0.15 },
          duration: 7000,
          useNativeDriver: true,
        }),
        Animated.timing(moveAnim1, {
          toValue: { x: -width * 0.2, y: height * 0.35 },
          duration: 9000,
          useNativeDriver: true,
        }),
        Animated.timing(moveAnim1, {
          toValue: { x: 0, y: 0 },
          duration: 8000,
          useNativeDriver: true,
        }),
      ])
    );

    // Movimiento inverso para el Orbe 2
    const anim2 = Animated.loop(
      Animated.sequence([
        Animated.timing(moveAnim2, {
          toValue: { x: -width * 0.35, y: -height * 0.2 },
          duration: 8500,
          useNativeDriver: true,
        }),
        Animated.timing(moveAnim2, {
          toValue: { x: width * 0.2, y: -height * 0.12 },
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(moveAnim2, {
          toValue: { x: 0, y: 0 },
          duration: 9000,
          useNativeDriver: true,
        }),
      ])
    );

    // Rotación suave del aura de fondo
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 25000,
        useNativeDriver: true,
      })
    );

    anim1.start();
    anim2.start();
    rotate.start();

    return () => {
      anim1.stop();
      anim2.stop();
      rotate.stop();
    };
  }, [moveAnim1, moveAnim2, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Animated.View
          style={[
            styles.orb,
            styles.orbCyan,
            {
              transform: [
                ...moveAnim1.getTranslateTransform(),
                { rotate: spin },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.orb,
            styles.orbPurple,
            {
              transform: [
                ...moveAnim2.getTranslateTransform(),
                { rotate: spin },
              ],
            },
          ]}
        />
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
  orb: {
    position: 'absolute',
    borderRadius: 300,
    opacity: 0.28,
  },
  orbCyan: {
    width: width * 0.95,
    height: width * 0.95,
    top: -height * 0.12,
    left: -width * 0.25,
    backgroundColor: COLORS.primary,
  },
  orbPurple: {
    width: width * 1.0,
    height: width * 1.0,
    bottom: -height * 0.12,
    right: -width * 0.3,
    backgroundColor: COLORS.accent,
  },
});