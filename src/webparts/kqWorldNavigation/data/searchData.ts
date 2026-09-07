export interface IKqSearchItem {
  id: string;
  title: string;
  description?: string;
  url: string;

  keywords: string[];
  aliases?: string[];

  category:
    | 'Application'
    | 'Department'
    | 'Knowledge'
    | 'HR'
    | 'Travel'
    | 'Support'
    | 'News';
}

export const kqSearchItems: IKqSearchItem[] = [
  {
    id: 'annual-leave',
    title: 'How to request annual leave',
    description: 'Open the leave management application',
    url: 'https://YOUR-LEAVE-APP-URL',
    keywords: [
      'leave',
      'annual leave',
      'vacation',
      'days off',
      'request leave'
    ],
    aliases: [
      'apply for leave',
      'book leave',
      'leave application'
    ],
    category: 'HR'
  },

  {
    id: 'travel-policy',
    title: 'New travel policy updates',
    description: 'View current staff travel policies',
    url: 'https://YOUR-POLICY-URL',
    keywords: [
      'travel',
      'policy',
      'staff travel',
      'travel rules'
    ],
    category: 'Travel'
  },

  {
    id: 'knowledge-hub',
    title: 'Knowledge Hub',
    description: 'Manuals, policies, forms and corporate resources',
    url: 'https://YOUR-KNOWLEDGE-HUB-URL',
    keywords: [
      'manual',
      'manuals',
      'policy',
      'policies',
      'forms',
      'documents',
      'knowledge'
    ],
    aliases: [
      'KH',
      'manual library'
    ],
    category: 'Knowledge'
  },

  {
    id: 'it-support',
    title: 'IT Support',
    description: 'Get technical assistance',
    url: 'https://YOUR-IT-SUPPORT-URL',
    keywords: [
      'IT',
      'support',
      'computer',
      'password',
      'technical issue',
      'help desk'
    ],
    aliases: [
      'service desk',
      'helpdesk'
    ],
    category: 'Support'
  }
];