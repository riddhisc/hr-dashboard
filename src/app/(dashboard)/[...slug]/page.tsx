import Link from 'next/link';
import { ArrowUpRight, BriefcaseBusiness, CalendarDays, CircleDollarSign, FileBarChart, Goal, HeartHandshake, LayoutGrid, Plus, Settings2, UserRoundPlus, Users } from 'lucide-react';
import { ModulePage, type ModuleKey } from '@/components/workspace/module-page';

const pageInfo: Record<ModuleKey,{title:string;description:string;icon:React.ReactNode;action:string}> = {
  employees:{title:'Employees',description:'Manage your people, roles, and employee records.',icon:<Users size={19}/>,action:'Add employee'},
  departments:{title:'Departments',description:'See how your teams are structured and where they are growing.',icon:<LayoutGrid size={19}/>,action:'Add department'},
  attendance:{title:'Attendance',description:'Track check-ins, schedules, and attendance trends.',icon:<CalendarDays size={19}/>,action:'View calendar'},
  leave:{title:'Leave management',description:'Review requests, balances, and team availability.',icon:<HeartHandshake size={19}/>,action:'Request leave'},
  payroll:{title:'Payroll',description:'Salary structures, pay runs, and payslips in one place.',icon:<CircleDollarSign size={19}/>,action:'Run payroll'},
  recruitment:{title:'Recruitment',description:'Move candidates from first touch to great hire.',icon:<UserRoundPlus size={19}/>,action:'Create job'},
  performance:{title:'Performance',description:'Keep goals, feedback, and growth plans moving forward.',icon:<Goal size={19}/>,action:'Start review cycle'},
  reports:{title:'Reports',description:'Prebuilt people reports ready to export and share.',icon:<FileBarChart size={19}/>,action:'Create report'},
  analytics:{title:'Analytics',description:'Understand the people signals behind your business.',icon:<ArrowUpRight size={19}/>,action:'Export insights'},
  settings:{title:'Settings',description:'Configure your workspace, permissions, and notifications.',icon:<Settings2 size={19}/>,action:'Save changes'},
  jobs:{title:'Job postings',description:'Keep your hiring pipeline focused and moving.',icon:<BriefcaseBusiness size={19}/>,action:'Create job'},
  applicants:{title:'Applicants',description:'Review candidates and keep every hiring decision clear.',icon:<Users size={19}/>,action:'Add applicant'},
  interviews:{title:'Interviews',description:'Coordinate interviews, feedback, and next steps.',icon:<CalendarDays size={19}/>,action:'Schedule interview'},
};

export default async function WorkspacePage({params}:{params:Promise<{slug:string[]}>}) { const {slug}=await params; const key=(slug[0]??'employees') as ModuleKey; const info=pageInfo[key]??pageInfo.employees; return <div className="mx-auto max-w-[1500px]">
  <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-medium text-slate-400">Workspace / {info.title}</p><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f0effe] text-[#6757e8]">{info.icon}</span><h1 className="text-[26px] font-bold tracking-[-.03em] text-slate-900">{info.title}</h1></div><p className="mt-2 text-sm text-slate-500">{info.description}</p></div><Link href={actionHref(key)} className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#6757e8] px-4 text-xs font-semibold text-white"><Plus size={16}/>{info.action}</Link></div>
  <ModulePage module={key}/>
</div>; }
function actionHref(key: ModuleKey): string { if (key === 'employees') return '/employees?new=1'; if (key === 'leave') return '/leave?new=1'; if (key === 'attendance') return '/attendance?calendar=1'; if (key === 'payroll') return '/payroll?run=1'; if (key === 'settings') return '/settings'; if (key === 'recruitment' || key === 'jobs') return '/recruitment?new=1'; if (key === 'performance') return '/performance?cycle=1'; if (key === 'reports') return '/reports?new=1'; return '/dashboard'; }
