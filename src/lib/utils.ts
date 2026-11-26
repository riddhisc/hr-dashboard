import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string { return twMerge(clsx(inputs)); }
export function formatNumber(value: number): string { return new Intl.NumberFormat('en-US').format(value); }
export function newId(): string { return crypto.randomUUID(); }

/** Local calendar date as yyyy-mm-dd (toISOString would shift the day in non-UTC zones). */
export function isoDate(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
export function formatDate(iso: string): string {
  return new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
export function formatMonth(month: string): string {
  return new Date(`${month}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}
export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}
export function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');
}
export function greeting(hour: number = new Date().getHours()): string {
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}
export function downloadCsv(filename: string, rows: (string | number)[][]): void {
  const escape = (value: string | number) => {
    const text = String(value);
    // Prefix formula-like text so spreadsheet apps do not execute it.
    const safe = typeof value === 'string' && /^[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const blob = new Blob([rows.map((row) => row.map(escape).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
