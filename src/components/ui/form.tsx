'use client';
import { useEffect, useId, useRef, useState } from 'react';
import type { Check } from '@/lib/validation';
import { cn } from '@/lib/utils';
import { buttonClass, controlClass, ghostClass, pillClass } from './styles';

export { buttonClass, controlClass, ghostClass, pillClass };

export function Button({ variant = 'primary', className, type = 'button', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' }) {
  return <button type={type} className={cn(variant === 'primary' ? buttonClass : ghostClass, className)} {...props} />;
}
/** Input with validation. Native rules (required, min, max) and `check` messages are shown under the field. */
export function Field({ label, check, icon, onBlur, onChange, onInvalid, className, ...props }: { label: string; check?: Check; /** Shows a pill input with this icon; the label becomes the placeholder. */ icon?: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
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
    <label htmlFor={id} className={icon ? 'sr-only' : undefined}>{label}</label>
    <div className="relative">
    {icon && <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-5 flex items-center text-slate-400">{icon}</span>}
    <input id={id} ref={ref} required aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined}
      placeholder={icon ? label : undefined} {...props}
      className={cn(controlClass, icon ? pillClass : 'mt-2', error && 'border-rose-400', className)}
      onChange={(event) => { const message = validate(event.currentTarget); if (error) setError(message); onChange?.(event); }}
      onBlur={(event) => { const message = validate(event.currentTarget); setError(event.currentTarget.value ? message : ''); onBlur?.(event); }}
      onInvalid={(event) => {
        event.preventDefault();
        const input = event.currentTarget;
        setError(input.validationMessage);
        if (input.form?.querySelector('input:invalid') === input) input.focus();
        onInvalid?.(event);
      }} />
    </div>
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
