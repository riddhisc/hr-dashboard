'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { Button, Field, controlClass, formValues } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/app';

const steps = [
  { title: 'Create your account', text: 'Enter your name, company, email, and a password. Returning users just sign in.' },
  { title: 'Add your team', text: 'Add employees and their departments, or load sample data from the Overview page.' },
  { title: 'Run daily HR work', text: 'Mark attendance, approve leave, finalise payroll, and track hiring.' },
  { title: 'Review and export', text: 'See trends in Analytics and download CSV files from Reports.' },
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
    const { name = '', company = '', email = '' } = formValues(event.currentTarget);
    // Passwords are read untrimmed so spaces remain part of them.
    const password = String(data.get('password') ?? '');
    if (isSignup && (!name || !company)) return setError('Enter your name and company.');
    if (isSignup && password !== String(data.get('confirm') ?? '')) return setError('The passwords do not match.');
    setBusy(true);
    setError('');
    try {
      const result = isSignup ? await signUp({ name, company, email, password }) : await signIn(email, password);
      if (result.ok) return router.replace('/dashboard');
      setError(result.error);
    } catch {
      setError('Could not sign you in. Check that this page is open over HTTPS and browser storage is allowed.');
    }
    setBusy(false);
  }

  if (!ready) return null;
  return <main className="grid min-h-screen place-items-center bg-[#e4e6f0] p-3 sm:p-6">
    <div className="grid w-full max-w-6xl gap-6 rounded-2xl bg-white p-4 sm:p-8 lg:grid-cols-2 lg:gap-12 lg:p-12">
      <aside className="order-2 flex flex-col rounded-3xl bg-gradient-to-br from-[#f0effe] to-[#dedcfa] p-6 sm:p-9 lg:order-1">
        <div className="flex items-center gap-2.5 text-lg font-bold text-slate-900"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#6757e8] text-white"><Sparkles size={17} /></span>peopleflow</div>
        <h2 className="mt-10 text-3xl font-bold leading-tight tracking-[-.03em] text-slate-900 sm:text-4xl lg:mt-auto lg:pt-10">One workspace for your people</h2>
        <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">Employees, attendance, leave, payroll, and hiring, kept together.</p>
        <section aria-labelledby="how-to-use" className="mt-8">
          <h3 id="how-to-use" className="text-sm font-bold text-slate-900">How to use</h3>
          <ol className="mt-3 grid gap-3 sm:grid-cols-2">{steps.map((step, index) => <li key={step.title} className="rounded-xl bg-white/70 p-4">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[#6757e8] text-[11px] font-bold text-white">{index + 1}</span>
            <p className="mt-3 text-xs font-bold text-slate-800">{step.title}</p><p className="mt-1 text-[11px] leading-4 text-slate-500">{step.text}</p>
          </li>)}</ol>
        </section>
      </aside>
      <div className="order-1 mx-auto w-full max-w-md self-center py-4 lg:order-2">
        <h1 className="text-[28px] font-bold tracking-[-.02em] text-slate-900">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
        <p className="mt-3 text-sm text-slate-500">{isSignup ? 'Set up a Peopleflow workspace for your team.' : 'Sign in to your Peopleflow workspace.'}</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          {isSignup && <><Field name="name" label="Full name" autoComplete="name" /><Field name="company" label="Company name" autoComplete="organization" /></>}
          <Field name="email" type="email" label="Email" autoComplete="email" placeholder="you@company.com" />
          <div className={cn('grid gap-4', isSignup && 'sm:grid-cols-2')}>
            <PasswordField name="password" label="Password" autoComplete={isSignup ? 'new-password' : 'current-password'} pattern={isSignup ? passwordRule : undefined} title={isSignup ? passwordHint : undefined} />
            {isSignup && <PasswordField name="confirm" label="Confirm password" autoComplete="new-password" />}
          </div>
          {isSignup && <p className="!mt-2 text-[11px] text-slate-400">{passwordHint}</p>}
          {error && <p role="alert" className="text-xs font-medium text-rose-600">{error}</p>}
          <Button type="submit" disabled={busy} className="h-11 w-full text-sm">{busy ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}</Button>
        </form>
        <p className="mt-5 text-center text-xs text-slate-500">{isSignup ? 'Already have an account?' : 'New to Peopleflow?'} <Link href={isSignup ? '/login' : '/signup'} className="font-semibold text-[#6757e8]">{isSignup ? 'Sign in' : 'Create an account'}</Link></p>
        <p className="mt-3 text-center text-[11px] text-slate-400">Accounts and records are saved in this browser only.</p>
      </div>
    </div>
  </main>;
}

function PasswordField({ name, label, ...props }: { name: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return <div className="text-xs font-semibold text-slate-600">
    <label htmlFor={name}>{label}</label>
    <div className="relative mt-2">
      <input id={name} name={name} type={visible ? 'text' : 'password'} required className={cn(controlClass, 'pr-10')} {...props} />
      <button type="button" onClick={() => setVisible(!visible)} aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`} className="absolute inset-y-0 right-0 grid w-10 place-items-center text-slate-400">{visible ? <EyeOff size={16} /> : <Eye size={16} />}</button>
    </div>
  </div>;
}
