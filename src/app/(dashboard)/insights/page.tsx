import { AnalyticsTab } from '@/components/insights/analytics-tab';
import { ReportsTab } from '@/components/insights/reports-tab';
import { TabbedPage } from '@/components/ui/tabbed-page';
import { pickTab, insightsTabs } from '@/config/tabs';

export default async function InsightsPage({ searchParams }: { searchParams: Promise<{ tab?: string | string[] }> }) {
  const tab = pickTab(insightsTabs, (await searchParams).tab);
  return <TabbedPage title="Insights" description="Trends and downloadable reports from your data." path="/insights" tabs={insightsTabs} current={tab}>
    {tab === 'analytics' && <AnalyticsTab />}
    {tab === 'reports' && <ReportsTab />}
  </TabbedPage>;
}
