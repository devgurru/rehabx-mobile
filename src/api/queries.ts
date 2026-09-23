import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  AssessmentOverview,
  CompleteExerciseResult,
  AssignedExercise,
  LoginResponse,
  MilestonePlan,
  PatientDetail,
  PatientKpi,
  PatientSummary,
  Program,
  ProgressDetail,
  TimelineEvent,
  TodayExercises,
} from '@/lib/types';

export const qk = {
  children: ['children'] as const,
  patient: (id: string) => ['patients', id] as const,
  assessment: (id: string) => ['patients', id, 'assessment'] as const,
  program: (id: string) => ['patients', id, 'program'] as const,
  exercises: (id: string) => ['patients', id, 'exercises'] as const,
  kpis: (id: string) => ['patients', id, 'kpis'] as const,
  progress: (id: string) => ['patients', id, 'progress'] as const,
  milestones: (id: string) => ['patients', id, 'milestones'] as const,
  timeline: (id: string) => ['patients', id, 'timeline'] as const,
};

export const useLogin = () =>
  useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      api.post<LoginResponse>('/auth/login', body),
  });

export const useChildren = (enabled = true) =>
  useQuery({
    queryKey: qk.children,
    queryFn: () => api.get<PatientSummary[]>('/me/children'),
    enabled,
  });

export const usePatient = (id: string) =>
  useQuery({ queryKey: qk.patient(id), queryFn: () => api.get<PatientDetail>(`/patients/${id}`) });

export const useAssessment = (id: string) =>
  useQuery({
    queryKey: qk.assessment(id),
    queryFn: () => api.get<AssessmentOverview>(`/patients/${id}/assessment`),
  });

export const useProgram = (id: string) =>
  useQuery({
    queryKey: qk.program(id),
    queryFn: () => api.get<Program | null>(`/patients/${id}/program`),
  });

export const useTodayExercises = (id: string) =>
  useQuery({
    queryKey: qk.exercises(id),
    queryFn: () => api.get<TodayExercises>(`/patients/${id}/exercises`),
  });

export const usePatientKpis = (id: string) =>
  useQuery({ queryKey: qk.kpis(id), queryFn: () => api.get<PatientKpi[]>(`/patients/${id}/kpis`) });

export const useProgress = (id: string) =>
  useQuery({
    queryKey: qk.progress(id),
    queryFn: () => api.get<ProgressDetail>(`/patients/${id}/progress`),
  });

export const useMilestones = (id: string) =>
  useQuery({
    queryKey: qk.milestones(id),
    queryFn: () => api.get<MilestonePlan>(`/patients/${id}/milestones`),
  });

export const useTimeline = (id: string) =>
  useQuery({
    queryKey: qk.timeline(id),
    queryFn: () => api.get<TimelineEvent[]>(`/patients/${id}/timeline`),
  });

export const useStartExercise = (patientId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (programExerciseId: string) =>
      api.post<AssignedExercise>(`/patients/${patientId}/exercises/${programExerciseId}/start`),
    onSuccess: () => client.invalidateQueries({ queryKey: qk.exercises(patientId) }),
  });
};

/** Completion changes progress, KPIs, goals and timeline — refresh the whole child. */
export const useCompleteExercise = (patientId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (programExerciseId: string) =>
      api.post<CompleteExerciseResult>(
        `/patients/${patientId}/exercises/${programExerciseId}/complete`,
      ),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: ['patients', patientId] }),
        client.invalidateQueries({ queryKey: qk.children }),
      ]),
  });
};
