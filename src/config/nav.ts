import type { LucideIcon } from 'lucide-react';
import { BarChart3, BriefcaseBusiness, CalendarDays, ChartNoAxesCombined, CircleDollarSign, FileBarChart, Gauge, Goal, HeartHandshake, LayoutGrid, Settings2, Users, UserRoundPlus } from 'lucide-react';
export type RoutePath = '/dashboard' | '/employees' | '/departments' | '/attendance' | '/leave' | '/payroll' | '/recruitment' | '/performance' | '/reports' | '/analytics' | '/settings';
export type NavItem = { label:string; href:RoutePath; icon:LucideIcon; badge?:string };
export const mainNav: NavItem[] = [
  {label:'Overview',href:'/dashboard',icon:Gauge},{label:'Employees',href:'/employees',icon:Users},{label:'Departments',href:'/departments',icon:LayoutGrid},
  {label:'Attendance',href:'/attendance',icon:CalendarDays},{label:'Leave',href:'/leave',icon:HeartHandshake,badge:'7'},{label:'Payroll',href:'/payroll',icon:CircleDollarSign},
];
export const talentNav: NavItem[] = [
  {label:'Recruitment',href:'/recruitment',icon:UserRoundPlus},{label:'Performance',href:'/performance',icon:Goal},{label:'Reports',href:'/reports',icon:FileBarChart},{label:'Analytics',href:'/analytics',icon:ChartNoAxesCombined},
];
export const settingsNav: NavItem[] = [{label:'Settings',href:'/settings',icon:Settings2}];
