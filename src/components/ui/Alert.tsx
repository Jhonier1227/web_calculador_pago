import type { ReactNode } from 'react';
import { InfoIcon, AlertTriangleIcon, XCircleIcon } from './Icons';

type Severity = 'info' | 'warning' | 'error';

interface AlertProps {
  severity?: Severity;
  children: ReactNode;
}

const styles: Record<Severity, string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200',
  warning:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200',
  error:
    'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200',
};

const icons: Record<Severity, typeof InfoIcon> = {
  info: InfoIcon,
  warning: AlertTriangleIcon,
  error: XCircleIcon,
};

export function Alert({ severity = 'info', children }: AlertProps) {
  const Icon = icons[severity];
  return (
    <div
      role="alert"
      className={`flex items-start gap-1.5 rounded-lg border px-3 py-2 text-xs ${styles[severity]}`}
    >
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
