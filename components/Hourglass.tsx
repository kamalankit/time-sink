import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface HourglassProps {
  daysRemaining: number;
  totalDays: number;
  size?: number;
}

export const Hourglass: React.FC<HourglassProps> = ({
  daysRemaining,
  totalDays,
  size = 280,
}) => {
  const { colors } = useTheme();
  const glowOpacity = useSharedValue(0.6);
  const sandLevel = useSharedValue(1);
  const fallingSandOpacity = useSharedValue(0);

  const getUrgencyColors = () => {
    const ratio = daysRemaining / totalDays;
    if (ratio > 0.3) return colors.electricGradient || ['#3B82F6', '#1D4ED8'];
    if (ratio > 0.1) return ['#F59E0B', '#FCD34D'];
    return colors.dangerGradient || ['#EF4444', '#DC2626'];
  };

  const getGlowColor = () => {
    const ratio = daysRemaining / totalDays;
    if (ratio > 0.3) return colors.electricBlue || '#3B82F6';
    if (ratio > 0.1) return colors.warningAmber || '#F59E0B';
    return colors.dangerRed || '#EF4444';
  };

  useEffect(() => {
    const progress = Math.max(0, Math.min(1, daysRemaining / totalDays));
    sandLevel.value = withTiming(progress, {
      duration: 2000,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
    glowOpacity.value = withRepeat(withTiming(1, { duration: 2000 }), -1, true);
    fallingSandOpacity.value =
      progress > 0 && progress < 1
        ? withRepeat(withTiming(1, { duration: 1500 }), -1, false)
        : 0;
  }, [daysRemaining, totalDays]);

  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));
  const topSandStyle = useAnimatedStyle(() => ({ height: `${sandLevel.value * 100}%` }));
  const bottomSandStyle = useAnimatedStyle(() => ({ height: `${(1 - sandLevel.value) * 100}%` }));
  const fallingSandStyle = useAnimatedStyle(() => ({ opacity: fallingSandOpacity.value }));

  const hourglassColors = getUrgencyColors();
  const glowColor = getGlowColor();

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Glow */}
      <Animated.View style={[styles.glow, glowStyle]}>
        <View style={[styles.glowInner, { backgroundColor: glowColor, opacity: 0.3 }]} />
      </Animated.View>

      {/* Hourglass */}
      <View style={styles.hourglassFrame}>
        {/* Top */}
        <View style={styles.topSection}>
          <View style={styles.topBulb}>
            <View style={styles.topSandContainer}>
              <Animated.View style={[styles.topSand, topSandStyle]}>
                <LinearGradient colors={hourglassColors} style={styles.sandGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
              </Animated.View>
            </View>
          </View>
        </View>

        {/* Neck */}
        <View style={styles.neck}>
          <View style={styles.neckContainer}>
            <Animated.View style={[styles.fallingSand, fallingSandStyle]}>
              <LinearGradient colors={hourglassColors} style={styles.fallingSandGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
            </Animated.View>
          </View>
        </View>

        {/* Bottom */}
        <View style={styles.bottomSection}>
          <View style={styles.bottomBulb}>
            <View style={styles.bottomSandContainer}>
              <Animated.View style={[styles.bottomSand, bottomSandStyle]}>
                <LinearGradient colors={hourglassColors} style={styles.sandGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
              </Animated.View>
            </View>
          </View>
        </View>
      </View>

      {/* Outline */}
      <View style={styles.outline}>
        <View style={styles.outlineTop} />
        <View style={styles.outlineNeck} />
        <View style={styles.outlineBottom} />
      </View>

      {/* Central highlight */}
      <View style={styles.centerGlow} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    borderRadius: 200,
    zIndex: -1,
  },
  glowInner: {
    flex: 1,
    borderRadius: 200,
  },
  hourglassFrame: {
    width: '65%',
    height: '80%',
    position: 'relative',
  },
  topSection: {
    flex: 3,
    justifyContent: 'flex-end',
  },
  topBulb: {
    width: '100%',
    height: '85%',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  topSandContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  topSand: {
    width: '100%',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  neck: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  neckContainer: {
    width: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallingSand: {
    width: 2,
    height: 15,
    borderRadius: 1,
  },
  fallingSandGradient: {
    flex: 1,
    borderRadius: 1,
  },
  bottomSection: {
    flex: 3,
    justifyContent: 'flex-start',
  },
  bottomBulb: {
    width: '100%',
    height: '85%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    overflow: 'hidden',
    position: 'relative',
  },
  bottomSandContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    justifyContent: 'flex-start',
  },
  bottomSand: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  sandGradient: {
    flex: 1,
    borderRadius: 60,
  },
  outline: {
    position: 'absolute',
    width: '65%',
    height: '80%',
    pointerEvents: 'none',
  },
  outlineTop: {
    flex: 3,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: -1,
  },
  outlineNeck: {
    flex: 1.2,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: '35%',
  },
  outlineBottom: {
    flex: 3,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginTop: -1,
  },
  centerGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    transform: [{ translateX: -18 }, { translateY: -18 }],
  },
});
