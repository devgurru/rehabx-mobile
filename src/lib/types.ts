/** API contract types — mirror the response shapes of the RehabX backend. */

export type Role = 'CAREGIVER' | 'CLINICIAN';
export type PatientStatus = 'NEW' | 'UNDER_REVIEW' | 'ACTIVE' | 'COMPLETED';
export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'ACHIEVED';
export type GoalStatus = 'ACTIVE' | 'ACHIEVED';
export type KpiCategory = 'GENERAL' | 'SPECIALTY' | 'DIAGNOSIS';
export type TodayStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type TimelineEventType =
  'ASSESSMENT' | 'REFERRAL' | 'PROGRAM' | 'EXERCISE' | 'MILESTONE' | 'KPI' | 'GOAL';

export interface SessionUser {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  displayName: string;
  title: string | null;
  relationship: string | null;
}

export interface LoginResponse {
  accessToken: string;
  user: SessionUser;
}

export interface SpecialtyRef {
  id: string;
  code: string;
  name: string;
  shortName: string;
  color: string;
}

export interface Specialty extends SpecialtyRef {
  description: string;
  sortOrder: number;
}

export interface PatientRef {
  id: string;
  fullName: string;
  avatarColor: string;
}

export interface PatientSummary {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  age: number;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  status: PatientStatus;
  requiresReview: boolean;
  avatarColor: string;
  diagnosis: { id: string; name: string };
  specialty: SpecialtyRef | null;
  progress: number;
  lastAssessmentAt: string | null;
}

export interface ProgressBreakdown {
  overall: number;
  kpiAttainment: number;
  adherence: number;
  milestoneCompletion: number;
  hasActiveProgram: boolean;
  exercises: { completed: number; planned: number };
  milestones: { achieved: number; total: number };
}

export interface PatientDetail extends PatientSummary {
  caregiver: { name: string; relationship: string; phone: string | null };
  clinician: { name: string; title: string };
  program: {
    id: string;
    name: string;
    startDate: string;
    durationWeeks: number;
    sessionsPerWeek: number;
    currentWeek: number;
  } | null;
  progressBreakdown: ProgressBreakdown;
  today: { completed: number; total: number };
  nextMilestone: { title: string; targetWeek: number; status: MilestoneStatus } | null;
}

export type DomainKey =
  | 'mobility'
  | 'motorSkills'
  | 'balance'
  | 'upperLimb'
  | 'lowerLimb'
  | 'communication'
  | 'dailyFunction';

export interface Assessment {
  id: string;
  assessedAt: string;
  isBaseline: boolean;
  assessedBy: string | null;
  domains: { key: DomainKey; label: string; score: number | null; notes: string | null }[];
  currentAbilities: string | null;
  riskNotes: string | null;
  clinicalConcerns: string | null;
  summary: string | null;
  recommendedSpecialty: SpecialtyRef | null;
}

export interface AssessmentOverview {
  latest: Assessment | null;
  baseline: Assessment | null;
  count: number;
}

export type AssessmentInput = Partial<
  Record<`${DomainKey}Score`, number> &
    Record<
      `${DomainKey}Notes` | 'currentAbilities' | 'riskNotes' | 'clinicalConcerns' | 'summary',
      string
    >
> & { recommendedSpecialtyId?: string };

export interface Referral {
  id: string;
  specialty: SpecialtyRef;
  reason: string;
  status: 'PENDING' | 'ACCEPTED';
  createdAt: string;
  createdBy: string;
  patient?: PatientRef;
}

export interface ProgramExercise {
  id: string;
  exerciseId: string;
  name: string;
  description: string;
  motionKey: string | null;
  reps: number | null;
  durationMin: number;
  frequencyPerWeek: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string | null;
  targetWeek: number;
  status: MilestoneStatus;
  achievedAt: string | null;
  targetDate?: string;
}

export interface Program {
  id: string;
  name: string;
  specialty: SpecialtyRef;
  referralId: string | null;
  startDate: string;
  durationWeeks: number;
  sessionsPerWeek: number;
  currentWeek: number;
  status: string;
  exercises: ProgramExercise[];
  goals: {
    id: string;
    title: string;
    status: GoalStatus;
    kpiId: string | null;
    kpiName: string | null;
  }[];
  milestones: Milestone[];
}

export interface ProgramListItem {
  id: string;
  name: string;
  specialty: SpecialtyRef;
  patient: PatientRef;
  startDate: string;
  durationWeeks: number;
  sessionsPerWeek: number;
  currentWeek: number;
  exerciseCount: number;
  progress: number;
  status: string;
}

export interface ProgramInput {
  name: string;
  specialtyId: string;
  referralId?: string;
  startDate: string;
  durationWeeks: number;
  sessionsPerWeek: number;
}

export interface Exercise {
  id: string;
  code: string;
  name: string;
  description: string;
  instructions: string[];
  safetyNotes: string[];
  defaultReps: number | null;
  defaultDurationMin: number;
  motionKey: string | null;
  specialty: SpecialtyRef;
  targetKpi: { id: string; name: string } | null;
}

export interface AssignedExercise {
  id: string;
  exercise: Exercise;
  reps: number | null;
  durationMin: number;
  frequencyPerWeek: number;
  status: TodayStatus;
  completedAt: string | null;
  totalCompleted: number;
}

export interface TodayExercises {
  date: string;
  program: { id: string; name: string } | null;
  completed: number;
  total: number;
  items: AssignedExercise[];
}

export interface ExerciseAssignmentInput {
  exerciseId: string;
  reps?: number | null;
  durationMin: number;
  frequencyPerWeek: number;
}

export interface KpiDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  unit: string;
  category: KpiCategory;
  specialty: SpecialtyRef | null;
  diagnosis: { id: string; name: string } | null;
}

export interface PatientKpi {
  id: string;
  kpi: Pick<KpiDefinition, 'id' | 'code' | 'name' | 'description' | 'unit' | 'category'>;
  baseline: number;
  current: number;
  target: number;
  change: number;
  goalProgress: number;
  updatedAt: string;
  trend: { recordedAt: string; value: number }[];
}

export interface Goal {
  id: string;
  title: string;
  status: GoalStatus;
  kpiId?: string | null;
  kpiName: string | null;
  progress: number;
}

export interface ProgressDetail extends ProgressBreakdown {
  weeklyAdherence: { week: number; completed: number; planned: number }[];
  kpis: { code: string; name: string; baseline: number; current: number; target: number }[];
  goals: Goal[];
}

export interface MilestonePlan {
  program: {
    id: string;
    name: string;
    startDate: string;
    durationWeeks: number;
    currentWeek: number;
  } | null;
  achieved: number;
  total: number;
  items: Milestone[];
}

export interface MilestoneTemplate {
  id: string;
  title: string;
  description: string | null;
  weekOffset: number;
}

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description: string | null;
  occurredAt: string;
  patient?: PatientRef;
}

export interface ClinicianDashboard {
  stats: {
    totalPatients: number;
    activePrograms: number;
    requiringReview: number;
    averageProgress: number;
  };
  kpiOverview: {
    name: string;
    patients: number;
    baseline: number;
    current: number;
    target: number;
  }[];
  adherenceTrend: { weekStart: string; completed: number }[];
  specialtyDistribution: { specialty: SpecialtyRef; patients: number }[];
  requiresReview: PatientSummary[];
  topPatients: PatientSummary[];
  recentActivity: (TimelineEvent & { patient: PatientRef })[];
}

export interface PlatformStats {
  totals: {
    specialties: number;
    kpis: number;
    exercises: number;
    programs: number;
    referrals: number;
    completedSessions: number;
  };
  kpisByCategory: { category: KpiCategory; count: number }[];
  specialties: { id: string; name: string; color: string; exercises: number; programs: number }[];
}

export interface ApiErrorBody {
  error: { statusCode: number; code: string; message: string; details?: string[] };
}

export interface CompleteExerciseResult {
  alreadyCompleted: boolean;
  exercise: AssignedExercise;
  today: { completed: number; total: number };
  progress: { before: number; after: number };
  exercises: { completed: number; planned: number };
  kpiUpdate: { kpiName: string; before: number; after: number; target: number } | null;
}
