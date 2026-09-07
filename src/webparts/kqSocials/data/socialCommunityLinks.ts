import {
  ISocialCommunityLink
} from '../models/ISocialCommunityLink';

export const socialCommunityLinks:
  ISocialCommunityLink[] = [

    {
      id: 'internal-viva',
      type: 'internal',
      title: 'KQ World on Viva',
      subtitle: 'Community community',
      url: 'https://engage.cloud.microsoft/main/groups/eyJfdHlwZSI6Ikdyb3VwIiwiaWQiOiIxODIyNDM1MjQ2MDgifQ/new',
      iconType: 'viva'
    },

    {
      id: 'internal-whatsapp',
      type: 'internal',
      title: 'Official KQ WhatsApp',
      subtitle: 'Family group',
      url: '',
      iconType: 'whatsapp'
    },

    {
      id: 'internal-broadcast',
      type: 'internal',
      title: 'KQ Yammer Broadcasts',
      subtitle: 'Live town halls',
      url: '',
      iconType: 'broadcast'
    },

    {
      id: 'external-facebook',
      type: 'external',
      title: 'Facebook',
      subtitle: '@KenyaAirways',
      url: 'https://www.facebook.com/KenyaAirways',
      iconType: 'facebook'
    },

    {
      id: 'external-twitter',
      type: 'external',
      title: 'X / Twitter',
      subtitle: '@KenyaAirways',
      url: 'https://x.com/KenyaAirways',
      iconType: 'twitter'
    },

    {
      id: 'external-youtube',
      type: 'external',
      title: 'YouTube',
      subtitle: 'Kenya Airways',
      url: 'https://www.youtube.com/@KenyaAirways',
      iconType: 'youtube'
    },

    {
      id: 'external-website',
      type: 'external',
      title: 'kenya-airways.com',
      subtitle: 'Corporate site',
      url: 'https://www.kenya-airways.com/',
      iconType: 'website'
    },

    {
      id: 'external-newsroom-whatsapp',
      type: 'external',
      title: 'Newsroom WhatsApp',
      subtitle: 'External media',
      url: '',
      iconType: 'whatsapp'
    },

    {
      id: 'external-linkedin',
      type: 'external',
      title: 'LinkedIn',
      subtitle: 'Kenya Airways plc',
      url: 'https://www.linkedin.com/company/kenya-airways/',
      iconType: 'linkedin'
    }
  ];