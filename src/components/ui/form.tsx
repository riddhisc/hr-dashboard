import { useEffect, useId, useRef, useState } from 'react';
import type { Check } from '@/lib/validation';
import { cn } from '@/lib/utils';

export const controlClass = 'h-10 w-full rounded-lg border border-[#e8eaf1] bg-white px-3 text-sm font-normal text-slate-700 outline-none focus:border-[#6757e8] focus:ring-1 focus:ring-[#6757e8]';
export const buttonClass = 'inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 text-xs font-semibold text-white shadow-md shadow-violet-300/50 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50';
export const ghostClass = 'inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white px-3 text-xs font-semibold text-violet-700 transition hover:bg-violet-50 disabled:opacity-50';

export function Button({ variant = 'primary', className, type = 'button', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' }) {
  return <button type={type} className={cn(variant === 'primary' ? buttonClass : ghostClass, className)} {...props} />;
}
/** Input with validation. Native rules (required, min, max) and `check` messages are shown under the field. */
export function Field({ label, check, onBlur, onChange, onInvalid, ...props }: { label: string; check?: Check } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const ref = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  function validate(input: HTMLInputElement): string {
    const value = input.value.trim();
    input.setCustomValidity(input.value && !value && input.required ? 'This field cannot be blank.' : value && check ? check(value) : '');
    return input.validationMessage;
  }
  useEffect(() => { if (ref.current) validate(ref.current); });
  return <div className="text-xs font-semibold text-slate-600">
    <label htmlFor={id}>{label}</label>
    <input id={id} ref={ref} required aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined}
      className={cn(controlClass, 'mt-2', error && 'border-rose-400')} {...props}
      onChange={(event) => { const message = validate(event.currentTarget); if (error) setError(message); onChange?.(event); }}
      onBlur={(event) => { const message = validate(event.currentTarget); setError(event.currentTarget.value ? message : ''); onBlur?.(event); }}
      onInvalid={(event) => {
        event.preventDefault();
        const input = event.currentTarget;
        setError(input.validationMessage);
        if (input.form?.querySelector('input:invalid') === input) input.focus();
        onInvalid?.(event);
      }} />
    {error && <p id={`${id}-error`} role="alert" className="mt-1 text-[11px] font-medium text-rose-600">{error}</p>}
  </div>;
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
