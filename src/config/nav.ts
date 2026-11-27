import type { LucideIcon } from 'lucide-react';
import { ChartNoAxesCombined, CircleDollarSign, Gauge, HeartHandshake, Settings2, UserRoundPlus, Users } from 'lucide-react';
import { hiringTabs, insightsTabs, peopleTabs, timeOffTabs, type Tab } from './tabs';

export type NavItem = { label: string; href: string; icon: LucideIcon; tone: string; tabs?: readonly Tab[]; /** Other paths that belong to this item. */ also?: string };
export const navItems: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: Gauge, tone: 'bg-blue-100 text-blue-700' },
  { label: 'People', href: '/people', icon: Users, tone: 'bg-blue-100 text-blue-700', tabs: peopleTabs, also: '/employees' },
  { label: 'Time off', href: '/time-off', icon: HeartHandshake, tone: 'bg-sky-100 text-sky-700', tabs: timeOffTabs },
  { label: 'Hiring', href: '/hiring', icon: UserRoundPlus, tone: 'bg-pink-100 text-pink-700', tabs: hiringTabs },
  { label: 'Insights', href: '/insights', icon: ChartNoAxesCombined, tone: 'bg-sky-100 text-sky-700', tabs: insightsTabs },
  { label: 'Payroll', href: '/payroll', icon: CircleDollarSign, tone: 'bg-blue-100 text-blue-700' },
  { label: 'Settings', href: '/settings', icon: Settings2, tone: 'bg-indigo-100 text-indigo-700' },
];
/** Every page and tab, for the top bar search. */
export const searchPages: { href: string; label: string }[] = navItems.flatMap((item) => [
  { href: item.href, label: item.label },
  ...(item.tabs ?? []).map((tab) => ({ href: `${item.href}?tab=${tab.id}`, label: tab.label })),
]);
