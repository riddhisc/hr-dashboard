import { describe, expect, it } from 'vitest';
import nextConfig from '../next.config.mjs';
import { hiringTabs, insightsTabs, peopleTabs, pickTab, timeOffTabs, type Tab } from '@/config/tabs';
import { goalsFor } from '@/lib/stats';

const sections: Record<string, readonly Tab[]> = { '/people': peopleTabs, '/time-off': timeOffTabs, '/hiring': hiringTabs, '/insights': insightsTabs };

describe('navigation', () => {
  it('redirects every old address to an existing page and tab', async () => {
    const redirects = await nextConfig.redirects();
    const sources = redirects.map((r) => r.source);
    for (const old of ['/jobs', '/applicants', '/interviews', '/recruitment', '/attendance', '/leave', '/reports', '/analytics', '/departments', '/employees', '/performance']) expect(sources).toContain(old);
    for (const { destination } of redirects) {
      const [path = '', query] = destination.split('?tab=');
      const tabs = sections[path] ?? [];
      expect(tabs.length).toBeGreaterThan(0);
      if (query) expect(tabs.map((t) => t.id)).toContain(query);
    }
  });
  it('falls back to the first tab', () => {
    expect(pickTab(hiringTabs, 'jobs')).toBe('jobs');
    expect(pickTab(hiringTabs, 'nope')).toBe('pipeline');
    expect(pickTab(hiringTabs, undefined)).toBe('pipeline');
  });
  it('summarises one employee\'s goals', () => {
    const goal = (id: string, ownerId: string, due: string, progress: number) => ({ id, ownerId, due, progress, title: id });
    const result = goalsFor([goal('b', 'e', '2027-02-01', 50), goal('a', 'e', '2027-01-01', 100), goal('x', 'other', '2027-01-01', 0)], 'e');
    expect(result.goals.map((g) => g.id)).toEqual(['a', 'b']);
    expect(result.completed).toBe(1);
    expect(result.average).toBe(75);
  });
});
