import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAssessment, usePatientKpis, useProgram } from '@/api/queries';
import { useChild } from '@/api/useChild';
import { AppText } from '@/components/AppText';
import { SpecialtyChip } from '@/components/Badge';
import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/Progress';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/Section';
import { EmptyView, ErrorView, LoadingView } from '@/components/States';
import { formatDate } from '@/lib/format';
import { colors, radius, spacing } from '@/theme';

/** Caregiver-friendly summary of the clinical assessment — not the clinical form itself. */
export default function AssessmentScreen() {
  const { child } = useChild();
  const id = child?.id ?? '';
  const assessment = useAssessment(id);
  const kpis = usePatientKpis(id);
  const program = useProgram(id);

  const { t } = useTranslation(['assessment', 'program', 'exercises', 'milestones']);

  if (assessment.isPending) return <LoadingView />;
  if (assessment.error)
    return <ErrorView error={assessment.error} onRetry={() => void assessment.refetch()} />;
  const a = assessment.data.baseline ?? assessment.data.latest;
  if (!a) return <EmptyView icon="file-text" title={t('noAssessmentYet')} />;

  return (
    <Screen edges={['bottom']}>
      <Card>
        <AppText variant="micro" color={colors.textSecondary}>
          {t('diagnosisUpper')}
        </AppText>
        <AppText variant="heading">{t(child?.diagnosis.name ?? '')}</AppText>
        <AppText variant="body" color={colors.textSecondary}>
          {t(a.summary ?? '')}
        </AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {t('assessedAtBy', { date: formatDate(a.assessedAt), name: a.assessedBy })}
        </AppText>
        {a.recommendedSpecialty && (
          <SpecialtyChip name={t(a.recommendedSpecialty.name)} color={a.recommendedSpecialty.color} />
        )}
      </Card>

      <SectionHeader title={t('startingPoint')} />
      <Card>
        <AppText variant="caption" color={colors.textSecondary}>
          {t('howWasDoingAtFirstAssessment', { name: child?.firstName ?? '' })}
        </AppText>
        {a.domains
          .filter((d) => d.score !== null)
          .map((d) => (
            <View key={d.key} style={styles.domain}>
              <View style={styles.domainHead}>
                <AppText variant="bodyStrong">{t(d.label)}</AppText>
                <AppText variant="bodyStrong">{d.score}%</AppText>
              </View>
              <ProgressBar value={d.score ?? 0} height={6} color={colors.baseline} />
            </View>
          ))}
      </Card>

      {a.currentAbilities && (
        <>
          <SectionHeader title={t('whatTheyCanDo')} />
          <Card>
            <AppText variant="body">{t(a.currentAbilities ?? '')}</AppText>
          </Card>
        </>
      )}

      <View style={styles.risk}>
        <View style={styles.riskHead}>
          <Feather name="shield" size={18} color={colors.warning} />
          <AppText variant="subheading" color={colors.warning}>
            {t('thingsToWatch')}
          </AppText>
        </View>
        <AppText variant="body">{t(a.riskNotes ?? '')}</AppText>
      </View>

      <SectionHeader title={t('goals')} />
      <Card>
        {(program.data?.goals ?? []).map((g) => (
          <View key={g.id} style={styles.goal}>
            <Feather name="target" size={16} color={colors.primary} />
            <AppText variant="bodyStrong">{t(g.title)}</AppText>
          </View>
        ))}
      </Card>

      <SectionHeader title={t('howWeMeasureProgress')} />
      <Card>
        {kpis.data?.map((k) => (
          <View key={k.id} style={styles.measure}>
            <AppText variant="bodyStrong" style={styles.flex}>
              {t(k.kpi.name)}
            </AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              {Math.round(k.baseline)}% → {t('target')} {Math.round(k.target)}%
            </AppText>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  domain: { gap: 6 },
  domainHead: { flexDirection: 'row', justifyContent: 'space-between' },
  risk: {
    backgroundColor: colors.warningSoft,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  riskHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  goal: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  measure: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 4 },
});
