import { cn } from '@/lib/utils';

/** Peopleflow mark: two people joined by a flowing line. */
export function LogoMark({ className }: { className?: string }) {
  return <svg viewBox="0 0 40 40" aria-hidden="true" className={cn('h-9 w-9 shrink-0', className)}>
    <rect width="40" height="40" rx="12" fill="#7b6cf0" />
    <circle cx="13" cy="14" r="4.5" fill="#fff" />
    <circle cx="27" cy="14" r="4.5" fill="#d9d5fd" />
    <path d="M7 29c3-7 9-7 13-2s10 5 13-2" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
  </svg>;
}
export function Logo({ className }: { className?: string }) {
  return <span className={cn('flex items-center gap-2.5 text-xl font-bold tracking-[-.02em] text-slate-800', className)}><LogoMark /><span>people<span className="text-[#7b6cf0]">flow</span></span></span>;
}
