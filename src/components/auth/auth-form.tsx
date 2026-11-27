'use client';
import { email, personName, text } from '@/lib/validation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Building2, Eye, EyeOff, Lock, Mail, UserRound } from 'lucide-react';
import { AuthArt } from './auth-art';
import { Button, Field, controlClass, formValues, pillClass } from '@/components/ui/form';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/app';

const steps = [
  { title: 'Create your account', text: 'Enter your name, company, email, and a password. Returning users just sign in.' },
  { title: 'Add your team', text: 'Add employees and their departments, or load sample data from the Overview page.' },
  { title: 'Run daily HR work', text: 'Mark attendance, approve leave, finalise payroll, and track hiring.' },
  { title: 'Review and export', text: 'See trends and download CSV reports under Insights.' },
];
const passwordRule = '(?=.*[A-Za-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}';
const passwordHint = 'At least 8 characters, including a letter, a number, and a special character.';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const signIn = useAppStore((s) => s.signIn);
  const signUp = useAppStore((s) => s.signUp);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isSignup = mode === 'signup';

  useEffect(() => {
    if (useAppStore.getState().sessionId) router.replace('/dashboard');
    else setReady(true);
  }, [router]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const { name = '', company = '', email: address = '' } = formValues(event.currentTarget);
    // Passwords are read untrimmed so spaces remain part of them.
    const password = String(data.get('password') ?? '');
    if (isSignup && (!name || !company)) return setError('Enter your name and company.');
    if (isSignup && password !== String(data.get('confirm') ?? '')) return setError('The passwords do not match.');
    setBusy(true);
    setError('');
    try {
      const result = isSignup ? await signUp({ name, company, email: address, password }) : await signIn(address, password);
      if (result.ok) return router.replace('/dashboard');
      setError(result.error);
    } catch {
      setError('Could not sign you in. Check that this page is open over HTTPS and browser storage is allowed.');
    }
    setBusy(false);
  }

  if (!ready) return null;
  return <main className="grid min-h-screen bg-white lg:grid-cols-[1.15fr_1fr]">
    <aside className="order-2 flex flex-col overflow-hidden bg-gradient-to-b from-[#0a6fe0] to-[#2f2fa8] text-white lg:order-1">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 sm:px-12">
        <div className="logo-float"><Logo inverted className="text-4xl" /></div>
        <p className="mt-3 text-base text-blue-100">Your people, in flow</p>
        <section aria-labelledby="how-to-use" className="mt-10 w-full max-w-md">
          <h2 id="how-to-use" className="text-sm font-bold">How to use</h2>
          <ol className="mt-4 space-y-4">{steps.map((step, index) => <li key={step.title} className="flex gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-[#0a5fc4]">{index + 1}</span>
            <div><p className="text-sm font-semibold">{step.title}</p><p className="mt-0.5 text-xs leading-5 text-blue-100">{step.text}</p></div>
          </li>)}</ol>
        </section>
      </div>
      <div className="h-40 shrink-0 sm:h-64"><AuthArt /></div>
    </aside>
    <div className="order-1 flex items-center justify-center px-6 py-12 lg:order-2">
      <div className="w-full max-w-sm">
        <Logo className="mb-8 lg:hidden" />
        <h1 className="text-[30px] font-bold tracking-[-.02em] text-slate-900">{isSignup ? 'Hello!' : 'Welcome back'}</h1>
        <p className="mt-2 text-base text-slate-600">{isSignup ? 'Sign up to get started' : 'Sign in to continue'}</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          {isSignup && <><Field name="name" label="Full name" icon={<UserRound size={18} />} check={personName('Full name')} autoComplete="name" /><Field name="company" label="Company name" icon={<Building2 size={18} />} check={text('Company name')} autoComplete="organization" /></>}
          <Field name="email" type="email" label="Email" icon={<Mail size={18} />} check={email} autoComplete="email" />
          <PasswordField name="password" label="Password" autoComplete={isSignup ? 'new-password' : 'current-password'} pattern={isSignup ? passwordRule : undefined} title={isSignup ? passwordHint : undefined} />
          {isSignup && <PasswordField name="confirm" label="Confirm password" autoComplete="new-password" />}
          {isSignup && <p className="px-2 text-[11px] text-slate-500">{passwordHint}</p>}
          {error && <p role="alert" className="px-2 text-xs font-medium text-rose-600">{error}</p>}
          <Button type="submit" disabled={busy} className="h-13 w-full rounded-full text-sm">{busy ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}</Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">{isSignup ? 'Already have an account?' : 'New to Peopleflow?'} <Link href={isSignup ? '/login' : '/signup'} className="font-semibold text-[#0a6fe0]">{isSignup ? 'Sign in' : 'Create an account'}</Link></p>
        <p className="mt-3 text-center text-[11px] text-slate-400">Accounts and records are saved in this browser only.</p>
      </div>
    </div>
  </main>;
}

function PasswordField({ name, label, ...props }: { name: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return <div className="relative">
    <label htmlFor={name} className="sr-only">{label}</label>
    <Lock aria-hidden="true" size={18} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
    <input id={name} name={name} type={visible ? 'text' : 'password'} required placeholder={label} {...props} className={cn(controlClass, pillClass, 'pr-12')} />
    <button type="button" onClick={() => setVisible(!visible)} aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`} className="absolute inset-y-0 right-2 grid w-10 place-items-center text-slate-400">{visible ? <EyeOff size={16} /> : <Eye size={16} />}</button>
  </div>;
}
