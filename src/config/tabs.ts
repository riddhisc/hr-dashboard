export type Tab<T extends string = string> = { id: T; label: string };

export const peopleTabs = [{ id: 'employees', label: 'Employees' }, { id: 'departments', label: 'Departments' }] as const;
export const timeOffTabs = [{ id: 'leave', label: 'Leave' }, { id: 'attendance', label: 'Attendance' }] as const;
export const hiringTabs = [{ id: 'pipeline', label: 'Pipeline' }, { id: 'jobs', label: 'Jobs' }, { id: 'applicants', label: 'Applicants' }, { id: 'interviews', label: 'Interviews' }] as const;
export const insightsTabs = [{ id: 'analytics', label: 'Analytics' }, { id: 'reports', label: 'Reports' }] as const;

/** The tab named in the URL, or the first tab when the name is missing or unknown. */
export function pickTab<const List extends readonly [Tab, ...Tab[]]>(tabs: List, value: string | string[] | undefined): List[number]['id'] {
  return (tabs.find((tab) => tab.id === value) ?? tabs[0]).id;
}
