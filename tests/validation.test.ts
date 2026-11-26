import { describe, expect, it } from 'vitest';
import { email, personName, text } from '@/lib/validation';

describe('field validation', () => {
  it('rejects numbers and symbols in names', () => {
    for (const bad of ['risp8', '8', '@sam', 'a']) expect(personName('Name')(bad)).not.toBe('');
    for (const good of ['Riddhi', "Mary-Jane O'Neil", 'José', 'प्रिया', 'R. K. Narayan']) expect(personName('Name')(good)).toBe('');
  });
  it('requires a complete email address', () => {
    for (const bad of ['name', 'name@', 'name@company', '@company.com', 'a b@c.com', 'a..b@c.com', 'a@c.123']) expect(email(bad)).not.toBe('');
    for (const good of ['name@company.com', 'first.last+hr@sub.company.co.in']) expect(email(good)).toBe('');
  });
  it('allows numbers in titles only alongside letters', () => {
    expect(text('Title')('123')).not.toBe('');
    expect(text('Title')('Level 2 Engineer')).toBe('');
  });
});
