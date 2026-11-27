import { EmployeesTab } from '@/components/people/employees-tab';
import { DepartmentsTab } from '@/components/people/departments-tab';
import { TabbedPage } from '@/components/ui/tabbed-page';
import { pickTab, peopleTabs } from '@/config/tabs';

export default async function PeoplePage({ searchParams }: { searchParams: Promise<{ tab?: string | string[] }> }) {
  const tab = pickTab(peopleTabs, (await searchParams).tab);
  return <TabbedPage title="People" description="Employee records and how your teams are structured." path="/people" tabs={peopleTabs} current={tab}>
    {tab === 'employees' && <EmployeesTab />}
    {tab === 'departments' && <DepartmentsTab />}
  </TabbedPage>;
}
