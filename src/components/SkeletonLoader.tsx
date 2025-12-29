import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle, Animated } from 'react-native';
import { colors, borderRadius } from '../theme';

interface SkeletonBoxProps {
  width?: number | string;
  height?: number | string;
  style?: ViewStyle;
}

export const SkeletonBox: React.FC<SkeletonBoxProps> = ({ width, height, style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height },
        { opacity },
        style,
      ]}
    />
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
  },
  cardContainer: {
    flex: 1,
    marginBottom: 20,
  },
  textSkeleton: {
    marginTop: 8,
  },
});
