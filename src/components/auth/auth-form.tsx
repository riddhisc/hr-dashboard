'use client';
import { email, personName, text } from '@/lib/validation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button, Field, controlClass, formValues } from '@/components/ui/form';
import { Logo } from '@/components/ui/logo';
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
  return <main className="grid min-h-screen place-items-center bg-[#f5f5fc] p-3 sm:p-6">
    <div className="grid w-full max-w-6xl gap-6 rounded-3xl border border-[#ececf8] bg-white p-4 shadow-xl shadow-[#7b6cf0]/5 sm:p-8 lg:grid-cols-2 lg:gap-12 lg:p-10">
      <aside className="relative order-2 overflow-hidden rounded-3xl bg-gradient-to-br from-[#fafaff] via-[#f3f2fe] to-[#e9e7fd] p-6 sm:p-9 lg:order-1">
        {/* Decorative blocks */}
        <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 grid grid-cols-3">{[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => <span key={n} className={cn('h-14 w-14', [1, 2, 5].includes(n) && 'bg-[#7b6cf0]/10', n === 4 && 'bg-white/60')} />)}</div>
        <div className="relative">
          <Logo className="text-2xl" />
          <h2 className="mt-12 text-3xl font-bold leading-tight tracking-[-.03em] text-slate-800 sm:text-[40px]">The HR platform for <span className="text-[#7b6cf0]">people teams</span></h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">Manage employees, attendance, leave, payroll, and hiring in one simple workspace.</p>
          <section aria-labelledby="how-to-use" className="mt-10">
            <h3 id="how-to-use" className="text-sm font-bold text-slate-800">How to use</h3>
            <ol className="mt-3 grid gap-3 sm:grid-cols-2">{steps.map((step, index) => <li key={step.title} className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm shadow-[#7b6cf0]/10">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#ebe9fd] text-xs font-bold text-[#6757e8]">{index + 1}</span>
              <p className="mt-3 text-xs font-bold text-slate-800">{step.title}</p><p className="mt-1 text-[11px] leading-4 text-slate-500">{step.text}</p>
            </li>)}</ol>
          </section>
        </div>
      </aside>
      <div className="order-1 mx-auto w-full max-w-md self-center py-4 lg:order-2">
        <h1 className="text-[28px] font-bold tracking-[-.02em] text-slate-900">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
        <p className="mt-3 text-sm text-slate-500">{isSignup ? 'Set up a Peopleflow workspace for your team.' : 'Sign in to your Peopleflow workspace.'}</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          {isSignup && <><Field name="name" label="Full name" check={personName('Full name')} autoComplete="name" /><Field name="company" label="Company name" check={text('Company name')} autoComplete="organization" /></>}
          <Field name="email" type="email" label="Email" check={email} autoComplete="email" placeholder="you@company.com" />
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
