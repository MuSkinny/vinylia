import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius } from '../theme';

interface SkeletonBoxProps {
  width?: number | string;
  height?: number | string;
  style?: ViewStyle;
}

export const SkeletonBox: React.FC<SkeletonBoxProps> = ({ width, height, style }) => {
  const translateX = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: 300,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <View style={[styles.skeleton, { width, height }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
        <LinearGradient
          colors={[
            'transparent',
            'rgba(255,255,255,0.4)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

export const VinylCardSkeleton: React.FC = () => (
  <View style={styles.cardContainer}>
    <SkeletonBox
      width="100%"
      height={undefined}
      style={{ aspectRatio: 1, borderRadius: borderRadius.lg }}
    />
    <SkeletonBox width="60%" height={14} style={styles.textSkeleton} />
    <SkeletonBox width="90%" height={16} style={styles.textSkeleton} />
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.divider.light,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  cardContainer: {
    flex: 1,
    marginBottom: 20,
  },
  textSkeleton: {
    marginTop: 8,
  },
});
