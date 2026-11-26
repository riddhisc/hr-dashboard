'use client';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const tick = { fill: '#98a0b3', fontSize: 10 };
const tooltip = { border: '1px solid #e8eaf1', borderRadius: 10, fontSize: 12 };

export function HiringChart({ data }: { data: { month: string; hires: number; exits: number }[] }) {
  return <div className="h-[240px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
    <CartesianGrid vertical={false} stroke="#f0f1f5" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={tick} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={tick} /><Tooltip contentStyle={tooltip} />
    <Area type="monotone" dataKey="hires" name="Joined" stroke="#6757e8" strokeWidth={2.5} fill="#6757e8" fillOpacity={0.12} /><Area type="monotone" dataKey="exits" name="Left" stroke="#94a3b8" strokeWidth={2} fill="none" />
  </AreaChart></ResponsiveContainer></div>;
}
export function DepartmentChart({ data }: { data: { name: string; count: number }[] }) {
  return <div className="h-[240px] w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 10, right: 0, left: -24, bottom: 0 }}>
    <CartesianGrid vertical={false} stroke="#f0f1f5" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={tick} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={tick} /><Tooltip contentStyle={tooltip} />
    <Bar dataKey="count" name="People" fill="#8d82ed" radius={[5, 5, 0, 0]} maxBarSize={40} />
  </BarChart></ResponsiveContainer></div>;
}
