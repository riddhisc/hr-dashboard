import { cn } from '@/lib/utils';

export const controlClass = 'h-10 w-full rounded-lg border border-[#e8eaf1] bg-white px-3 text-sm font-normal text-slate-700 outline-none focus:border-[#6757e8] focus:ring-1 focus:ring-[#6757e8]';
export const buttonClass = 'inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#6757e8] px-4 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50';
export const ghostClass = 'inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#e8eaf1] bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50';

export function Button({ variant = 'primary', className, type = 'button', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' }) {
  return <button type={type} className={cn(variant === 'primary' ? buttonClass : ghostClass, className)} {...props} />;
}
export function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <label className="block text-xs font-semibold text-slate-600">{label}<input required className={cn(controlClass, 'mt-2')} {...props} /></label>;
}
export function SelectField({ label, options, ...props }: { label: string; options: (string | { value: string; label: string })[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <label className="block text-xs font-semibold text-slate-600">{label}
    <select required className={cn(controlClass, 'mt-2')} {...props}>
      {options.map((o) => { const option = typeof o === 'string' ? { value: o, label: o } : o; return <option key={option.value} value={option.value}>{option.label}</option>; })}
    </select>
  </label>;
}
/** Reads a submitted form as trimmed strings. */
export function formValues(form: HTMLFormElement): Record<string, string> {
  return Object.fromEntries([...new FormData(form)].map(([key, value]) => [key, String(value).trim()]));
}
