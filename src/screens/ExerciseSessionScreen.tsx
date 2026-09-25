import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef } from 'react';
import { Platform, Pressable, StyleSheet, View, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCompleteExercise, useStartExercise, useTodayExercises } from '@/api/queries';
import { useChild } from '@/api/useChild';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/Progress';
import { ErrorView, LoadingView } from '@/components/States';
import { ExerciseStage } from '@/exercise3d/ExerciseStage';
import { cueAt, hasMotion, MOTIONS } from '@/exercise3d/motion';
import { formatDuration } from '@/lib/format';
import type { RootScreenProps } from '@/navigation/types';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  cueChanged,
  repCounted,
  sessionEnded,
  sessionStarted,
  sessionTicked,
  sessionToggled,
  skeletonToggled,
} from '@/store/sessionSlice';
import { colors, radius, spacing } from '@/theme';

const haptic = (style: Haptics.ImpactFeedbackStyle) => {
  if (Platform.OS !== 'web') void Haptics.impactAsync(style);
};

/**
 * Guided session: the 3D coach demonstrates, a simulated "AI coach" counts reps and gives
 * form cues. Real camera-based motion tracking is future work and labelled as such.
 */
export default function ExerciseSessionScreen({
  route,
  navigation,
}: RootScreenProps<'ExerciseSession'>) {
  const { programExerciseId } = route.params;
  const { child } = useChild();
  const patientId = child?.id ?? '';
  const today = useTodayExercises(patientId);
  const start = useStartExercise(patientId);
  const complete = useCompleteExercise(patientId);
  const { t } = useTranslation('exercises');
  const dispatch = useAppDispatch();
  const session = useAppSelector((s) => s.session);
  const item = today.data?.items.find((i) => i.id === programExerciseId);

  // Start (or resume) the session once.
  const startedRef = useRef(false);
  useEffect(() => {
    if (!patientId || startedRef.current) return;
    startedRef.current = true;
    dispatch(sessionStarted(programExerciseId));
    start.mutate(programExerciseId);
  }, [patientId, programExerciseId, dispatch, start]);

  // Session clock.
  useEffect(() => {
    if (!session.running) return;
    const id = setInterval(() => dispatch(sessionTicked(1)), 1000);
    return () => clearInterval(id);
  }, [session.running, dispatch]);

  useEffect(() => () => void dispatch(sessionEnded()), [dispatch]);

  // Pulsing animation for the AI dot
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  // Frame callback from the 3D coach — only dispatch when something visible changes.
  const lastReps = useRef(0);
  const lastCue = useRef('');
  const motion =
    item && hasMotion(item.exercise.motionKey) ? MOTIONS[item.exercise.motionKey] : null;
  const onFrame = useCallback(
    (phase: number, reps: number) => {
      if (!motion) return;
      if (reps !== lastReps.current) {
        lastReps.current = reps;
        dispatch(repCounted(reps));
        haptic(Haptics.ImpactFeedbackStyle.Light);
      }
      const cue = cueAt(motion, phase);
      if (cue !== lastCue.current) {
        lastCue.current = cue;
        dispatch(cueChanged(cue));
      }
    },
    [dispatch, motion],
  );

  if (today.isPending) return <LoadingView label={t('preparingSession')} />;
  if (!item)
    return (
      <ErrorView
        error={today.error ?? new Error(t('exerciseNotFound'))}
        onRetry={() => void today.refetch()}
      />
    );

  const targetReps = item.reps;
  const targetSec = item.durationMin * 60;
  const repProgress = targetReps
    ? (session.reps / targetReps) * 100
    : (session.elapsedSec / targetSec) * 100;
  const targetReached = targetReps
    ? session.reps >= targetReps
    : session.elapsedSec >= Math.min(targetSec, 60);

  const finish = () =>
    complete.mutate(programExerciseId, {
      onSuccess: (result) => {
        if (Platform.OS !== 'web')
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.replace('ExerciseComplete', { result });
      },
    });

  return (
    <View style={styles.root}>
      <ExerciseStage
        motionKey={item.exercise.motionKey}
        playing={session.running}
        showKeypoints={session.showSkeleton}
        onFrame={onFrame}
        framing="full"
        style={styles.stage}
      />

      {/* Camera-framing overlay: communicates the future AI motion-tracking concept */}
      <View pointerEvents="none" style={styles.frame}>
        {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
          <View key={c} style={[styles.corner, styles[c]]} />
        ))}
      </View>

      <SafeAreaView edges={['top']} style={styles.topBar} pointerEvents="box-none">
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.roundButton}
          accessibilityRole="button"
          accessibilityLabel={t('closeSession')}
          hitSlop={8}
        >
          <Feather name="x" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.aiPill}>
          <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
          <AppText variant="caption" color={colors.primaryDark}>
            {t('aiCoachSimulated')}
          </AppText>
        </View>
        <Pressable
          onPress={() => dispatch(skeletonToggled())}
          style={[styles.roundButton, session.showSkeleton && styles.roundButtonActive]}
          accessibilityRole="switch"
          accessibilityState={{ checked: session.showSkeleton }}
          accessibilityLabel={t('showPoseKeypoints')}
          hitSlop={8}
        >
          <Feather
            name="crosshair"
            size={20}
            color={session.showSkeleton ? colors.onPrimary : colors.text}
          />
        </Pressable>
      </SafeAreaView>

      <View style={styles.cueWrap} pointerEvents="none">
        <View style={styles.cue}>
          <Feather name="message-circle" size={16} color={colors.primary} />
          <AppText variant="bodyStrong">
            {session.running ? (session.cue ?? t('getReady')) : t('paused')}
          </AppText>
        </View>
      </View>

      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <View style={styles.sheetHead}>
          <View style={styles.flex}>
            <AppText variant="heading">{t(item.exercise.name)}</AppText>
            <View style={styles.formRow}>
              <Feather name="check-circle" size={14} color={colors.success} />
              <AppText variant="caption" color={colors.success}>
                {t('formLooksGood')}
              </AppText>
            </View>
          </View>
          <Pressable
            onPress={() => dispatch(sessionToggled())}
            style={styles.playButton}
            accessibilityRole="button"
            accessibilityLabel={session.running ? 'Pause' : 'Resume'}
          >
            <Feather name={session.running ? 'pause' : 'play'} size={22} color={colors.onPrimary} />
          </Pressable>
        </View>

        <View style={styles.metrics}>
          <View style={styles.metric}>
            <AppText variant="caption" color={colors.textSecondary}>
              {targetReps ? t('repetitionsLabel') : t('holdsLabel')}
            </AppText>
            <AppText variant="title">
              {session.reps}
              {targetReps ? (
                <AppText variant="heading" color={colors.textMuted}>
                  {' '}
                  / {targetReps}
                </AppText>
              ) : null}
            </AppText>
          </View>
          <View style={styles.metric}>
            <AppText variant="caption" color={colors.textSecondary}>
              {t('timeLabel')}
            </AppText>
            <AppText variant="title">
              {formatDuration(session.elapsedSec)}
              <AppText variant="heading" color={colors.textMuted}>
                {' '}
                / {item.durationMin}:00
              </AppText>
            </AppText>
          </View>
        </View>
        <ProgressBar value={repProgress} color={targetReached ? colors.success : colors.primary} />

        <View style={styles.soon}>
          <Feather name="camera" size={14} color={colors.textSecondary} />
          <AppText variant="caption" color={colors.textSecondary} style={styles.flex}>
            {t('cameraMotionDesc')}
          </AppText>
        </View>

        {complete.error && (
          <AppText variant="caption" color={colors.danger}>
            {complete.error.message}
          </AppText>
        )}
        <Button
          title={targetReached ? t('markAsCompleteGreat') : t('markAsComplete')}
          icon="check"
          variant={targetReached ? 'primary' : 'secondary'}
          loading={complete.isPending}
          onPress={finish}
        />
      </SafeAreaView>
    </View>
  );
}

const CORNER = 28;
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  stage: { flex: 1, height: undefined, borderRadius: 0 },
  frame: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 330,
    margin: spacing.xxxl,
    marginTop: 110,
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: 'rgba(14,124,134,0.55)',
  },
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 10 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 10 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 10 },
  br: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 10,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundButtonActive: { backgroundColor: colors.coral },
  aiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.coral },
  cueWrap: { position: 'absolute', left: 0, right: 0, bottom: 350, alignItems: 'center' },
  cue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.xl,
    gap: spacing.md,
    shadowColor: '#0F172A',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  formRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  playButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metrics: { flexDirection: 'row', gap: spacing.md },
  metric: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  soon: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
});
