import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

export function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-neutral-800/80',
        shimmer && 'bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800',
        className
      )}
      {...props}
    />
  );
}
