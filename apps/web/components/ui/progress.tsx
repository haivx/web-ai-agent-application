import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(({ className, value = 0, ...props }, ref) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div ref={ref} className={cn('h-2 w-full overflow-hidden rounded-full bg-neutral-800', className)} {...props}>
      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${clampedValue}%` }} />
    </div>
  );
});
Progress.displayName = 'Progress';
