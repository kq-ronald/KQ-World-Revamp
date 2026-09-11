import * as React from 'react';

import {
  Airplane24Regular,
  CalendarLtr24Regular,
  TicketDiagonal24Regular,
  Send24Regular,
  DocumentText24Regular,
  Shield24Regular,
  People24Regular,
  Person24Regular,
  Settings24Regular,
  QuestionCircle24Regular,
  Search24Regular,
  Mail24Regular,
  Phone24Regular,
  Location24Regular,
  News24Regular,
  Alert24Regular,
  Link24Regular,
  ArrowDownload24Regular,
  ClipboardTask24Regular,
  BookOpen24Regular,
  HeartPulse24Regular,
  Money24Regular,
  Building24Regular,
  Briefcase24Regular
} from '@fluentui/react-icons';

export type QuickActionIcon =
  | 'airplane'
  | 'calendar'
  | 'ticket'
  | 'expense'
  | 'payslip'
  | 'safety'
  | 'people'
  | 'profile'
  | 'settings'
  | 'help'
  | 'search'
  | 'email'
  | 'phone'
  | 'location'
  | 'news'
  | 'notifications'
  | 'link'
  | 'download'
  | 'tasks'
  | 'training'
  | 'medical'
  | 'money'
  | 'building'
  | 'briefcase';

export interface IQuickActionIconOption {
  key: QuickActionIcon;
  label: string;
  icon: React.ElementType;
}

export const QUICK_ACTION_ICON_OPTIONS: IQuickActionIconOption[] = [
  {
    key: 'airplane',
    label: 'Airplane / Travel',
    icon: Airplane24Regular
  },
  {
    key: 'calendar',
    label: 'Calendar',
    icon: CalendarLtr24Regular
  },
  {
    key: 'ticket',
    label: 'Ticket',
    icon: TicketDiagonal24Regular
  },
  {
    key: 'expense',
    label: 'Expense / Send',
    icon: Send24Regular
  },
  {
    key: 'payslip',
    label: 'Payslip / Document',
    icon: DocumentText24Regular
  },
  {
    key: 'safety',
    label: 'Safety',
    icon: Shield24Regular
  },
  {
    key: 'people',
    label: 'People',
    icon: People24Regular
  },
  {
    key: 'profile',
    label: 'Profile',
    icon: Person24Regular
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: Settings24Regular
  },
  {
    key: 'help',
    label: 'Help',
    icon: QuestionCircle24Regular
  },
  {
    key: 'search',
    label: 'Search',
    icon: Search24Regular
  },
  {
    key: 'email',
    label: 'Email',
    icon: Mail24Regular
  },
  {
    key: 'phone',
    label: 'Phone',
    icon: Phone24Regular
  },
  {
    key: 'location',
    label: 'Location',
    icon: Location24Regular
  },
  {
    key: 'news',
    label: 'News',
    icon: News24Regular
  },
  {
    key: 'notifications',
    label: 'Notifications',
    icon: Alert24Regular
  },
  {
    key: 'link',
    label: 'Link',
    icon: Link24Regular
  },
  {
    key: 'download',
    label: 'Download',
    icon: ArrowDownload24Regular
  },
  {
    key: 'tasks',
    label: 'Tasks',
    icon: ClipboardTask24Regular
  },
  {
    key: 'training',
    label: 'Training',
    icon: BookOpen24Regular
  },
  {
    key: 'medical',
    label: 'Medical / Health',
    icon: HeartPulse24Regular
  },
  {
    key: 'money',
    label: 'Money / Finance',
    icon: Money24Regular
  },
  {
    key: 'building',
    label: 'Office / Building',
    icon: Building24Regular
  },
  {
    key: 'briefcase',
    label: 'Work',
    icon: Briefcase24Regular
  }
];

export const QUICK_ACTION_ICONS: Record<
  QuickActionIcon,
  React.ElementType
> = QUICK_ACTION_ICON_OPTIONS.reduce(
  (
    icons,
    option
  ) => {
    icons[option.key] = option.icon;
    return icons;
  },
  {} as Record<
    QuickActionIcon,
    React.ElementType
  >
);

export const getQuickActionIcon = (
  value?: string
): QuickActionIcon => {
  const normalized = (value || '')
    .trim()
    .toLowerCase();

  const match = QUICK_ACTION_ICON_OPTIONS.some(
    (option) => option.key === normalized
  );

  if (match) {
    return normalized as QuickActionIcon;
  }

  return 'calendar';
};