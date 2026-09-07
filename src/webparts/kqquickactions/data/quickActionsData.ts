export type QuickActionIcon =
  | 'calendar'
  | 'airplane'
  | 'ticket'
  | 'expense'
  | 'payslip'
  | 'safety';

export interface IQuickAction {
  id: number;
  title: string;
  accent: string;
  icon: QuickActionIcon;
  url: string;
}

export const quickActions: IQuickAction[] = [
  {
    id: 1,
    title: 'Apply for Leave',
    accent: '#2fc56f',
    icon: 'calendar',
    url: 'https://i-pride.kenya-airways.com/OA_HTML/AppsLocalLogin.jsp'
  },
  {
    id: 2,
    title: 'Book Staff Travel',
    accent: '#d5632d',
    icon: 'airplane',
    url: 'https://isafari.kenya-airways.com/stms/'
  },
  {
    id: 3,
    title: 'Log a Ticket',
    accent: '#861d44',
    icon: 'ticket',
    url: 'https://kenyaairwaysplc.sharepoint.com/sites/isr/workflows/Pages/request.aspx'
  },
  {
    id: 4,
    title: 'Submit Expense',
    accent: '#b49a67',
    icon: 'expense',
    url: 'PASTE_SUBMIT_EXPENSE_URL_HERE'
  },
  {
    id: 5,
    title: 'View my Payslip',
    accent: '#999d9f',
    icon: 'payslip',
    url: 'PASTE_PAYSLIP_URL_HERE'
  },
  {
    id: 6,
    title: 'Report Safety Concern',
    accent: '#ff1111',
    icon: 'safety',
    url: 'PASTE_SAFETY_CONCERN_URL_HERE'
  }
];