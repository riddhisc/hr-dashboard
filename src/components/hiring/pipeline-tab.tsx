'use client';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { buttonClass, controlClass } from '@/components/ui/form';
import { Empty } from '@/components/ui/page';
import { stages, type Stage } from '@/lib/types';
import { useAppStore, useWorkspace } from '@/stores/app';

export function PipelineTab() {
  const ws = useWorkspace();
  const update = useAppStore((s) => s.update);
  return <>
    {ws.candidates.length > 0 && <div className="mb-4 flex justify-end"><Link href="/hiring?tab=applicants" className={buttonClass}>Add applicant</Link></div>}
    {!ws.candidates.length ? <Empty title="Your pipeline is empty" hint="Create a job, then add applicants to see them here." href="/hiring?tab=jobs" action="Go to jobs" /> :
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">{stages.map((stage) => {
        const items = ws.candidates.filter((c) => c.stage === stage);
        return <section key={stage} className="min-h-[160px] rounded-xl bg-[#eef0f6] p-3"><div className="mb-3 flex justify-between px-1"><h2 className="text-xs font-bold text-slate-700">{stage}</h2><span className="text-[11px] text-slate-400">{items.length}</span></div>
          <div className="space-y-2">{items.map((c) => <Card key={c.id} className="p-3"><p className="truncate text-xs font-semibold text-slate-700">{c.name}</p><p className="mt-1 truncate text-[11px] text-slate-400">{ws.jobs.find((j) => j.id === c.jobId)?.title}</p>
            <select aria-label={`Move ${c.name}`} value={c.stage} onChange={(e) => update((w) => ({ candidates: w.candidates.map((x) => x.id === c.id ? { ...x, stage: e.target.value as Stage } : x) }), `${c.name} moved to ${e.target.value}`)} className={`${controlClass} mt-3 h-8 text-xs`}>{stages.map((s) => <option key={s}>{s}</option>)}</select></Card>)}</div></section>;
      })}</div>}
  </>;
}
