import type { ReactNode } from 'react';

const badgeColors: Record<string, string> = {
  ORDINARIA_DIURNA: 'bg-blue-900 text-blue-200',
  ORDINARIA_NOCTURNA: 'bg-indigo-900 text-indigo-200',
  RECARGO_NOCTURNO: 'bg-purple-900 text-purple-200',
  RECARGO_DOMINICAL_DIURNO: 'bg-amber-900 text-amber-200',
  RECARGO_DOMINICAL_NOCTURNO: 'bg-orange-900 text-orange-200',
  EXTRA_DIURNA: 'bg-green-900 text-green-200',
  EXTRA_NOCTURNA: 'bg-teal-900 text-teal-200',
  EXTRA_DOMINICAL_DIURNA: 'bg-rose-900 text-rose-200',
  EXTRA_DOMINICAL_NOCTURNA: 'bg-red-900 text-red-200',
};

interface BadgeProps {
  tipo: string;
  children?: ReactNode;
}

export function Badge({ tipo, children }: BadgeProps) {
  const colors = badgeColors[tipo] ?? 'bg-slate-800 text-slate-300';
  return (
    <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${colors}`}>
      {children ?? tipo.replace(/_/g, ' ')}
    </span>
  );
}
