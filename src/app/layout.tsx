import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = { title: 'Peopleflow | HR workspace', description: 'A calm, connected workspace for your people.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<Toaster position="top-right" richColors /></body></html>;
}
