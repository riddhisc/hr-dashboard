import type { LucideIcon } from 'lucide-react';
import { BriefcaseBusiness, CalendarCheck, CalendarDays, ChartNoAxesCombined, CircleDollarSign, FileBarChart, Gauge, Goal, HeartHandshake, LayoutGrid, Settings2, UserRound, UserRoundPlus, Users } from 'lucide-react';
export type NavItem = { label: string; href: string; icon: LucideIcon };
export const navGroups: { title: string; items: NavItem[] }[] = [
  { title: 'Workspace', items: [
    { label: 'Overview', href: '/dashboard', icon: Gauge }, { label: 'Employees', href: '/employees', icon: Users }, { label: 'Departments', href: '/departments', icon: LayoutGrid },
    { label: 'Attendance', href: '/attendance', icon: CalendarDays }, { label: 'Leave', href: '/leave', icon: HeartHandshake }, { label: 'Payroll', href: '/payroll', icon: CircleDollarSign },
  ] },
  { title: 'Hiring', items: [
    { label: 'Recruitment', href: '/recruitment', icon: UserRoundPlus }, { label: 'Jobs', href: '/jobs', icon: BriefcaseBusiness }, { label: 'Applicants', href: '/applicants', icon: UserRound }, { label: 'Interviews', href: '/interviews', icon: CalendarCheck },
  ] },
  { title: 'Insights', items: [
    { label: 'Performance', href: '/performance', icon: Goal }, { label: 'Reports', href: '/reports', icon: FileBarChart }, { label: 'Analytics', href: '/analytics', icon: ChartNoAxesCombined }, { label: 'Settings', href: '/settings', icon: Settings2 },
  ] },
];
