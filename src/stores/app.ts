import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { hashPassword, newSalt } from '@/lib/password';
import type { Account, Workspace } from '@/lib/types';
import { newId } from '@/lib/utils';

export function emptyWorkspace(company: string): Workspace {
  return { settings: { company, currency: 'INR', leaveAllowance: { Annual: 18, Sick: 12, Personal: 6 } }, employees: [], departments: [], attendance: {}, leave: [], payroll: [], jobs: [], candidates: [], interviews: [], goals: [], activities: [] };
}

const sessionKey = 'peopleflow-session';
// The signed-in user is kept per tab, so a new visit starts at the sign-in page.
function readSession(): string | null {
  try { return sessionStorage.getItem(sessionKey); } catch { return null; }
}
function writeSession(id: string | null): void {
  try { if (id) sessionStorage.setItem(sessionKey, id); else sessionStorage.removeItem(sessionKey); } catch { /* storage blocked: stay signed in until reload */ }
}

type Result = { ok: true } | { ok: false; error: string };
type AppState = {
  accounts: Account[];
  workspaces: Record<string, Workspace>;
  sessionId: string | null;
  signUp: (input: { name: string; company: string; email: string; password: string }) => Promise<Result>;
  signIn: (email: string, password: string) => Promise<Result>;
  signOut: () => void;
  renameAccount: (name: string) => void;
  /** Applies a change to the signed-in user's workspace, optionally logging it to recent activity. */
  update: (change: (ws: Workspace) => Partial<Workspace>, activity?: string) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      accounts: [],
      workspaces: {},
      sessionId: readSession(),
      signUp: async ({ name, company, email, password }) => {
        const normalized = email.trim().toLowerCase();
        const salt = newSalt();
        const passwordHash = await hashPassword(password, salt);
        if (get().accounts.some((a) => a.email === normalized)) return { ok: false, error: 'An account with this email already exists. Sign in instead.' };
        const account: Account = { id: newId(), name: name.trim(), email: normalized, salt, passwordHash };
        set((s) => ({ accounts: [...s.accounts, account], workspaces: { ...s.workspaces, [account.id]: emptyWorkspace(company.trim()) }, sessionId: account.id }));
        writeSession(account.id);
        return { ok: true };
      },
      signIn: async (email, password) => {
        const account = get().accounts.find((a) => a.email === email.trim().toLowerCase());
        if (!account || (await hashPassword(password, account.salt)) !== account.passwordHash) return { ok: false, error: 'Email or password is incorrect.' };
        writeSession(account.id);
        set({ sessionId: account.id });
        return { ok: true };
      },
      signOut: () => { writeSession(null); set({ sessionId: null }); },
      renameAccount: (name) => set((s) => ({ accounts: s.accounts.map((a) => (a.id === s.sessionId ? { ...a, name } : a)) })),
      update: (change, activity) => set((s) => {
        const current = s.sessionId ? s.workspaces[s.sessionId] : undefined;
        if (!s.sessionId || !current) return {};
        const next = { ...current, ...change(current) };
        if (activity) next.activities = [{ id: newId(), text: activity, at: new Date().toISOString() }, ...next.activities].slice(0, 50);
        return { workspaces: { ...s.workspaces, [s.sessionId]: next } };
      }),
    }),
    {
      name: 'peopleflow', version: 1, storage: createJSONStorage(() => localStorage),
      partialize: ({ accounts, workspaces }: AppState) => ({ accounts, workspaces }),
      // Ignore any sessionId saved by earlier versions.
      merge: (saved: unknown, current: AppState): AppState => ({ ...current, ...(saved as Partial<AppState>), sessionId: current.sessionId }),
    },
  ),
);

const signedOut = emptyWorkspace('');
export const useWorkspace = (): Workspace => useAppStore((s) => (s.sessionId ? s.workspaces[s.sessionId] : undefined) ?? signedOut);
export const useAccount = (): Account | undefined => useAppStore((s) => s.accounts.find((a) => a.id === s.sessionId));
