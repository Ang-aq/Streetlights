import type { ProjectPhase, ProjectCategory } from '../types/project';

export function phaseToVerb(phase: ProjectPhase): string {
  switch (phase) {
    case 'Planning':    return 'being planned';
    case 'Design':      return 'in design';
    case 'Construction': return 'under construction';
    case 'Complete':    return 'complete';
    case 'On Hold':     return 'on hold';
    default:            return 'in progress';
  }
}

export function formatCost(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

export function generatePlainSummary(
  phase: ProjectPhase,
  category: ProjectCategory,
  totalBudget: number,
  estimatedCompletion: string,
): string {
  const verb = phaseToVerb(phase);
  const cost = formatCost(totalBudget);
  const completion = estimatedCompletion && estimatedCompletion !== 'Unknown'
    ? `, expected to wrap up ${estimatedCompletion}`
    : '';
  return `This ${category.toLowerCase()} project is currently ${verb} with a total budget of ${cost}${completion}.`;
}

export function percentSpent(spent: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.round((spent / total) * 100));
}
