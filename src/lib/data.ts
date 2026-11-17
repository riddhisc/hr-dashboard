export type Trend = { value: string; direction: 'up' | 'down'; label: string };
export type Metric = { label: string; value: string; detail: string; trend: Trend; accent: 'violet'|'blue'|'amber'|'rose' };
export const metrics: Metric[] = [
  {label:'Total headcount',value:'1,284',detail:'Across 12 departments',trend:{value:'8.4%',direction:'up',label:'vs last month'},accent:'violet'},
  {label:'New hires',value:'38',detail:'This month',trend:{value:'12.8%',direction:'up',label:'vs last month'},accent:'blue'},
  {label:'Attrition rate',value:'4.2%',detail:'Rolling 12 months',trend:{value:'0.8%',direction:'down',label:'vs last year'},accent:'amber'},
  {label:'Open positions',value:'24',detail:'Across 8 teams',trend:{value:'6.2%',direction:'up',label:'vs last month'},accent:'rose'},
];
export const departments = [
  {name:'Engineering',count:342,color:'bg-indigo-500'},{name:'Product & Design',count:188,color:'bg-violet-500'},
  {name:'Sales & Marketing',count:276,color:'bg-sky-500'},{name:'Operations',count:204,color:'bg-emerald-500'},
  {name:'Finance & Legal',count:141,color:'bg-amber-500'},{name:'People & Culture',count:133,color:'bg-rose-400'},
];
export const hiringData = [
  {month:'Jan',hires:28,exits:11},{month:'Feb',hires:32,exits:9},{month:'Mar',hires:24,exits:14},{month:'Apr',hires:41,exits:13},
  {month:'May',hires:36,exits:8},{month:'Jun',hires:44,exits:12},{month:'Jul',hires:31,exits:10},{month:'Aug',hires:39,exits:15},
  {month:'Sep',hires:35,exits:9},{month:'Oct',hires:38,exits:7},{month:'Nov',hires:42,exits:10},{month:'Dec',hires:38,exits:8},
];
export const people = [
  {name:'Maya Patel',role:'VP of Engineering',department:'Engineering',status:'Active',location:'Bengaluru',initials:'MP',tone:'bg-indigo-100 text-indigo-700'},
  {name:'Jon Bell',role:'Product Designer',department:'Product & Design',status:'Active',location:'New York',initials:'JB',tone:'bg-amber-100 text-amber-700'},
  {name:'Arjun Nair',role:'Senior Recruiter',department:'People & Culture',status:'On leave',location:'Mumbai',initials:'AN',tone:'bg-emerald-100 text-emerald-700'},
  {name:'Lena Ortiz',role:'Account Executive',department:'Sales & Marketing',status:'Active',location:'Austin',initials:'LO',tone:'bg-rose-100 text-rose-700'},
  {name:'David Kim',role:'Finance Manager',department:'Finance & Legal',status:'Active',location:'Seoul',initials:'DK',tone:'bg-sky-100 text-sky-700'},
];
export const activities = [
  {title:'Maya Patel approved a leave request',time:'12 min ago',icon:'check'},
  {title:'New hire added to Engineering',time:'46 min ago',icon:'user'},
  {title:'Q4 performance cycle opened',time:'2 hours ago',icon:'spark'},
  {title:'Payroll report exported',time:'Yesterday',icon:'file'},
];
