/** Field checks return an error message, or '' when the value is acceptable. */
export type Check = (value: string) => string;

const length = (value: string, label: string, min: number, max: number) =>
  value.length < min ? `${label} must be at least ${min} characters.` : value.length > max ? `${label} must be ${max} characters or fewer.` : '';

/** Letters from any language, plus spaces, dots, apostrophes, and hyphens. */
export const personName = (label: string, min = 2): Check => (value) =>
  !/^\p{L}[\p{L}\p{M} .'’-]*$/u.test(value) ? `${label} can contain only letters, spaces, dots, apostrophes, and hyphens.` : length(value, label, min, 60);

/** Free text such as titles and company names: numbers are fine, but it cannot be only numbers or symbols. */
export const text = (label: string, max = 80): Check => (value) =>
  !/\p{L}/u.test(value) ? `${label} must include letters.` : length(value, label, 2, max);

export const email: Check = (value) =>
  /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.\p{L}{2,}$/u.test(value) && !value.includes('..') && value.length <= 254 ? '' : 'Enter a valid email, such as name@company.com.';
