import { useChildren } from './queries';

/**
 * The child whose journey the caregiver is viewing. The demo caregiver has one child;
 * the list endpoint already supports families with several.
 */
export function useChild() {
  const children = useChildren();
  return { ...children, child: children.data?.[0] ?? null };
}
