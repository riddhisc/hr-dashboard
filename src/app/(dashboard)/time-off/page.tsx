import { LeaveTab } from '@/components/time-off/leave-tab';
import { AttendanceTab } from '@/components/time-off/attendance-tab';
import { TabbedPage } from '@/components/ui/tabbed-page';
import { pickTab, timeOffTabs } from '@/config/tabs';

export default async function TimeOffPage({ searchParams }: { searchParams: Promise<{ tab?: string | string[] }> }) {
  const tab = pickTab(timeOffTabs, (await searchParams).tab);
  return <TabbedPage title="Time off" description="Leave requests, balances, and daily attendance." path="/time-off" tabs={timeOffTabs} current={tab}>
    {tab === 'leave' && <LeaveTab />}
    {tab === 'attendance' && <AttendanceTab />}
  </TabbedPage>;
}
