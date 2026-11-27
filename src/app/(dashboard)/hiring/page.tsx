import { PipelineTab } from '@/components/hiring/pipeline-tab';
import { JobsTab } from '@/components/hiring/jobs-tab';
import { ApplicantsTab } from '@/components/hiring/applicants-tab';
import { InterviewsTab } from '@/components/hiring/interviews-tab';
import { TabbedPage } from '@/components/ui/tabbed-page';
import { pickTab, hiringTabs } from '@/config/tabs';

export default async function HiringPage({ searchParams }: { searchParams: Promise<{ tab?: string | string[] }> }) {
  const tab = pickTab(hiringTabs, (await searchParams).tab);
  return <TabbedPage title="Hiring" description="Jobs, applicants, interviews, and your pipeline." path="/hiring" tabs={hiringTabs} current={tab}>
    {tab === 'pipeline' && <PipelineTab />}
    {tab === 'jobs' && <JobsTab />}
    {tab === 'applicants' && <ApplicantsTab />}
    {tab === 'interviews' && <InterviewsTab />}
  </TabbedPage>;
}
