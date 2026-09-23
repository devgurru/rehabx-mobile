import type { ReactNode } from 'react';
import { useChild } from '@/api/useChild';
import type { PatientSummary } from '@/lib/types';
import { Screen } from './Screen';
import { EmptyView, ErrorView, LoadingView } from './States';

/** Resolves the caregiver's child and renders shared loading / error / empty states. */
export function ChildGate({ children }: { children: (child: PatientSummary) => ReactNode }) {
  const { child, isPending, error, refetch } = useChild();
  if (isPending) return <LoadingView />;
  if (error) return <ErrorView error={error} onRetry={() => void refetch()} />;
  if (!child)
    return (
      <Screen>
        <EmptyView
          icon="users"
          title="No child linked yet"
          message="Your clinician will link your child’s profile to this account."
        />
      </Screen>
    );
  return <>{children(child)}</>;
}
