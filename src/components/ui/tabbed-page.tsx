import Link from 'next/link';
import type { Tab } from '@/config/tabs';
import { cn } from '@/lib/utils';
import { Page } from './page';

export function TabbedPage({ title, description, path, tabs, current, children }: { title: string; description: string; path: string; tabs: readonly Tab[]; current: string; children: React.ReactNode }) {
  return <Page title={title} description={description}>
    <nav aria-label={`${title} sections`} className="mb-5 flex gap-1 overflow-x-auto border-b border-blue-100">
      {tabs.map((tab) => <Link key={tab.id} href={`${path}?tab=${tab.id}`} aria-current={tab.id === current ? 'page' : undefined}
        className={cn('-mb-px shrink-0 border-b-2 px-4 py-2.5 text-[13px] font-semibold', tab.id === current ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-blue-700')}>{tab.label}</Link>)}
    </nav>
    {children}
  </Page>;
}
