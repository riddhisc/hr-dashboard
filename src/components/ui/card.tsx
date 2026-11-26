import { cn } from '@/lib/utils';
export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('rounded-2xl border border-[#dfeafa] bg-white shadow-sm shadow-blue-200/50', className)}>{children}</div>;
}
