import { Feather } from '@expo/vector-icons';
import { Canvas } from '@react-three/fiber/native';
import { Component, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/components/AppText';
import { colors, radius, spacing } from '@/theme';
import { ChildAvatar } from './ChildAvatar';
import { hasMotion, MOTIONS } from './motion';

interface StageProps {
  motionKey: string | null;
  playing?: boolean;
  showKeypoints?: boolean;
  onFrame?: (phase: number, reps: number) => void;
  style?: StyleProp<ViewStyle>;
  /** Pull the camera in for the full-screen session view. */
  framing?: 'card' | 'full';
}

/** 3D exercise demonstration rendered with react-three-fiber on expo-gl. */
export function ExerciseStage({
  motionKey,
  playing = true,
  showKeypoints,
  onFrame,
  style,
  framing = 'card',
}: StageProps) {
  if (!hasMotion(motionKey)) {
    return (
      <View style={[styles.stage, styles.fallback, style]}>
        <Feather name="book-open" size={28} color={colors.primary} />
        <AppText variant="caption" color={colors.textSecondary} style={styles.center}>
          Follow the step-by-step instructions below. A 3D guide for this exercise is coming soon.
        </AppText>
      </View>
    );
  }
  const motion = MOTIONS[motionKey];
  const camera =
    framing === 'full'
      ? { position: [1.7, 1.45, 3.7] as const, fov: 40 }
      : { position: [1.9, 1.55, 4.1] as const, fov: 38 };

  return (
    <View style={[styles.stage, style]}>
      <LinearGradient colors={['#E4F2F3', '#F8FAFC']} style={StyleSheet.absoluteFill} />
      <GlErrorBoundary>
        <Canvas
          style={StyleSheet.absoluteFill}
          camera={{ position: [...camera.position], fov: camera.fov }}
          onCreated={({ camera: c }) => c.lookAt(0, 1.05, 0)}
        >
          <ambientLight intensity={0.75} />
          <directionalLight position={[3, 5, 4]} intensity={1.4} />
          <directionalLight position={[-3, 2, -2]} intensity={0.35} />
          <ChildAvatar
            motion={motion}
            playing={playing}
            onFrame={onFrame}
            showKeypoints={showKeypoints}
          />
        </Canvas>
      </GlErrorBoundary>
    </View>
  );
}

/** If the device can't create a GL context, keep the screen usable with a calm fallback. */
class GlErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <View style={[StyleSheet.absoluteFill, styles.fallback]}>
          <Feather name="box" size={28} color={colors.primary} />
          <AppText variant="caption" color={colors.textSecondary} style={styles.center}>
            3D preview isn’t available on this device. Follow the instructions below.
          </AppText>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  stage: {
    height: 260,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.primarySoft,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  center: { textAlign: 'center' },
});
