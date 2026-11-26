import { cn } from '@/lib/utils';
export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('rounded-2xl border border-[#e8eaf1] bg-white', className)}>{children}</div>;
}
