export interface IKqCalendarEvent {
  id: number;
  title: string;
  date: string;

  startTime?: string;
  endTime?: string;

  location?: string;
  organizer?: string;
  recurrence?: string;
  description?: string;
}

export const calendarEvents: IKqCalendarEvent[] = [
  {
    id: 1,
    title: 'Safety Standdown — Q3',
    date: '2026-07-23',
    startTime: '8:55 AM',
    endTime: '9:45 AM',
    location: 'Base, Hangar 1',
    organizer: 'KQ World.Net',
    recurrence: 'Every Thursday',
    description:
      'Quarterly safety standdown bringing together operational leaders to review safety performance, discuss incidents and lessons learned, reinforce the airline’s safety culture, and align on actions to enhance operational safety across all departments.'
  },
  {
    id: 2,
    title: 'CEO Weekly Operations Review',
    date: '2026-07-23',
    startTime: '8:30 AM',
    endTime: '9:30 AM',
    location: 'Pride Centre Boardroom',
    organizer: "CEO's Office",
    recurrence: 'Every Thursday',
    description:
      'Weekly executive meeting chaired by the CEO to review airline operational performance, safety metrics, on-time performance, fleet availability, customer experience, cargo operations, commercial performance, and key strategic initiatives.'
  },
  {
    id: 3,
    title: 'Employee financial literacy webinar',
    date: '2026-07-23',
    startTime: '8:55 AM',
    endTime: '9:45 AM',
    location: 'Microsoft Teams',
    organizer: 'KQ World.Net',
    recurrence: 'Every Thursday',
    description:
      'Employee financial literacy webinar.'
  },
  {
    id: 4,
    title: 'Staff Engagement Session',
    date: '2026-07-18',
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    location: 'Pride Centre',
    organizer: 'Human Resources'
  },
  {
    id: 5,
    title: 'Department Briefing',
    date: '2026-07-22',
    startTime: '2:00 PM',
    endTime: '3:00 PM',
    location: 'Microsoft Teams',
    organizer: 'KQ World.Net'
  },
  {
    id: 6,
    title: 'Operations Meeting',
    date: '2026-07-27',
    startTime: '9:00 AM',
    endTime: '10:00 AM',
    location: 'Pride Centre',
    organizer: 'Operations'
  }
];
