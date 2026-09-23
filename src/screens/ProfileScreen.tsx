import { Feather } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Pressable, StyleSheet, View } from 'react-native';
import { usePatient, useProgram } from '@/api/queries';
import { AppText } from '@/components/AppText';
import { SpecialtyChip } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ChildGate } from '@/components/ChildGate';
import { Screen } from '@/components/Screen';
import { InfoRow, InitialsAvatar, SectionHeader } from '@/components/Section';
import { ErrorView, LoadingView } from '@/components/States';
import type { TabScreenProps } from '@/navigation/types';
import { useAppDispatch, useAppSelector } from '@/store';
import { signOut } from '@/store/authSlice';
import { colors, spacing } from '@/theme';

export default function ProfileScreen(props: TabScreenProps<'Profile'>) {
  return <ChildGate>{(child) => <ProfileContent childId={child.id} {...props} />}</ChildGate>;
}

function ProfileContent({ childId, navigation }: TabScreenProps<'Profile'> & { childId: string }) {
  const patient = usePatient(childId);
  const program = useProgram(childId);
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  if (patient.isPending) return <LoadingView />;
  if (patient.error)
    return <ErrorView error={patient.error} onRetry={() => void patient.refetch()} />;
  const p = patient.data;

  const links = [
    {
      icon: 'file-text' as const,
      label: 'Assessment summary',
      onPress: () => navigation.navigate('Assessment'),
    },
    {
      icon: 'flag' as const,
      label: 'Goals & milestones',
      onPress: () => navigation.navigate('Milestones'),
    },
    {
      icon: 'git-commit' as const,
      label: 'Rehabilitation journey',
      onPress: () => navigation.navigate('Timeline'),
    },
  ];

  return (
    <Screen onRefresh={() => void patient.refetch()} refreshing={patient.isRefetching}>
      <View style={styles.header}>
        <InitialsAvatar name={p.fullName} color={p.avatarColor} size={72} />
        <AppText variant="title">{p.fullName}</AppText>
        <AppText variant="body" color={colors.textSecondary}>
          {p.age} years old · {p.gender === 'MALE' ? 'Boy' : 'Girl'}
        </AppText>
        {p.specialty && (
          <View style={styles.chip}>
            <SpecialtyChip name={p.specialty.name} color={p.specialty.color} />
          </View>
        )}
      </View>

      <Card>
        <InfoRow label="Diagnosis" value={p.diagnosis.name} />
        <InfoRow label="Current specialty" value={p.specialty?.name ?? '—'} />
        <InfoRow
          label="Program"
          value={
            p.program
              ? `${p.program.durationWeeks} weeks · week ${p.program.currentWeek}`
              : 'Not started'
          }
        />
        <InfoRow label="Clinician" value={p.clinician.name} />
      </Card>

      <SectionHeader title="Rehabilitation goals" />
      <Card>
        {(program.data?.goals ?? []).map((g) => (
          <View key={g.id} style={styles.goal}>
            <Feather
              name={g.status === 'ACHIEVED' ? 'check-circle' : 'target'}
              size={18}
              color={g.status === 'ACHIEVED' ? colors.success : colors.primary}
            />
            <AppText variant="bodyStrong" style={styles.flex}>
              {g.title}
            </AppText>
          </View>
        ))}
      </Card>

      <Card>
        {links.map((l, i) => (
          <Pressable
            key={l.label}
            onPress={l.onPress}
            style={[styles.link, i > 0 && styles.divider]}
            accessibilityRole="button"
          >
            <Feather name={l.icon} size={18} color={colors.primary} />
            <AppText variant="bodyStrong" style={styles.flex}>
              {l.label}
            </AppText>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </Card>

      <SectionHeader title="Caregiver" />
      <Card>
        <InfoRow label="Signed in as" value={user?.displayName ?? ''} />
        <InfoRow label="Relationship" value={p.caregiver.relationship} />
      </Card>

      <Button
        title="Sign out"
        variant="secondary"
        icon="log-out"
        onPress={() => {
          queryClient.clear();
          void dispatch(signOut());
        }}
      />
      <AppText variant="caption" color={colors.textMuted} style={styles.center}>
        RehabX investor prototype · fictional demo data · not for clinical use
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  goal: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  center: { textAlign: 'center' },
  chip: { alignSelf: 'center' },
});
