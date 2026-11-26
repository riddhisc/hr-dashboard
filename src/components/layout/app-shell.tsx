'use client';
import { useState } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const [open, setOpen] = useState(false);
  return <div className="min-h-screen bg-[#f7f8fc]">
    <Sidebar open={open} onClose={() => setOpen(false)} />
    <div className="lg:pl-[238px]"><Topbar onMenu={() => setOpen(true)} /><main className="px-5 py-6 sm:px-8 lg:px-10">{children}</main></div>
  </div>;
}
