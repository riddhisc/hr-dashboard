'use client';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { Toaster } from 'sonner';
export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const [open, setOpen] = useState(false);
  return <div className="min-h-screen bg-[#f7f8fc]"><Sidebar open={open} onClose={() => setOpen(false)} /><div className="lg:pl-[238px]"><Topbar /><button aria-label="Open navigation" onClick={() => setOpen(true)} className="fixed bottom-5 left-5 z-30 grid h-12 w-12 place-items-center rounded-full bg-[#6757e8] text-white shadow-lg lg:hidden"><Menu size={20}/></button><main className="px-5 py-6 sm:px-8 lg:px-10">{children}</main></div><Toaster position="top-right" richColors /></div>;
}
