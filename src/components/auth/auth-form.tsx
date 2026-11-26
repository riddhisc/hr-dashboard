'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button, Field, formValues } from '@/components/ui/form';
import { useAppStore } from '@/stores/app';

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
    const { name = '', company = '', email = '', password = '' } = formValues(event.currentTarget);
    if (isSignup && (!name || !company)) return setError('Enter your name and company.');
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
  return <main className="grid min-h-screen place-items-center bg-[#f7f8fc] p-5">
    <div className="w-full max-w-md rounded-2xl border border-[#e8eaf1] bg-white p-8">
      <div className="mb-8 text-center">
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-[#6757e8] text-white"><Sparkles size={18} /></div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">{isSignup ? 'Create your workspace' : 'Sign in'}</h1>
        <p className="mt-2 text-sm text-slate-500">{isSignup ? 'Set up Peopleflow for your team.' : 'Sign in to your Peopleflow workspace.'}</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        {isSignup && <><Field name="name" label="Full name" autoComplete="name" /><Field name="company" label="Company name" autoComplete="organization" /></>}
        <Field name="email" type="email" label="Work email" autoComplete="email" placeholder="you@company.com" />
        <Field name="password" type="password" label={isSignup ? 'Password (at least 8 characters)' : 'Password'} minLength={isSignup ? 8 : undefined} autoComplete={isSignup ? 'new-password' : 'current-password'} />
        {error && <p role="alert" className="text-xs font-medium text-rose-600">{error}</p>}
        <Button type="submit" disabled={busy} className="h-11 w-full text-sm">{busy ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}</Button>
      </form>
      <p className="mt-5 text-center text-xs text-slate-500">{isSignup ? 'Already have an account?' : 'New to Peopleflow?'} <Link href={isSignup ? '/login' : '/signup'} className="font-semibold text-[#6757e8]">{isSignup ? 'Sign in' : 'Create an account'}</Link></p>
      <p className="mt-3 text-center text-[11px] text-slate-400">Accounts and records are saved in this browser only.</p>
    </div>
  </main>;
}
