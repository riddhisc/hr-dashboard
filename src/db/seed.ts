import { people } from '@/lib/data';
export const demoSeed = people.map((person, index) => ({ id: `demo-${index + 1}`, firstName: person.name.split(' ')[0], lastName: person.name.split(' ')[1] ?? '', email: `${person.name.toLowerCase().replace(' ', '.')}@acme.example`, department: person.department, role: person.role }));
