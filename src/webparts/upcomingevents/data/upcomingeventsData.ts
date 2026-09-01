export type UpcomingEventCategory = 'All' | 'Ops' | 'People' | 'Tech';

export interface IUpcomingEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  category: Exclude<UpcomingEventCategory, 'All'>;
}

export const upcomingEvents: IUpcomingEvent[] = [
  {
    id: 1,
    title: 'Town Hall with the Group CEO',
    date: '2026-07-20',
    time: '10:00 EAT',
    location: 'Pride Centre',
    category: 'People'
  },
  {
    id: 2,
    title: 'Safety Standdown — Q3',
    date: '2026-07-29',
    time: '13:10 EAT',
    location: 'Base, Hanger 1',
    category: 'Ops'
  },
  {
    id: 3,
    title: 'Msafiri Awards Nominations Close',
    date: '2026-08-01',
    time: '09:00 EAT',
    location: 'Online',
    category: 'People'
  },
  {
    id: 4,
    title: 'Wellness Wednesday: Mental Health Talk',
    date: '2026-08-10',
    time: '14:00 EAT',
    location: 'Online',
    category: 'People'
  },
  {
    id: 5,
    title: 'DevSecOps UI/UX Awards',
    date: '2026-09-02',
    time: '09:00 EAT',
    location: 'Control Tower',
    category: 'Tech'
  }
];