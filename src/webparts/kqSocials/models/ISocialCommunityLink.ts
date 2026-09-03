export type SocialCommunityType =
  | 'internal'
  | 'external';

export type SocialCommunityIcon =
  | 'viva'
  | 'whatsapp'
  | 'broadcast'
  | 'facebook'
  | 'twitter'
  | 'youtube'
  | 'website'
  | 'linkedin';

export interface ISocialCommunityLink {
  id: string;
  type: SocialCommunityType;
  title: string;
  subtitle: string;
  url: string;
  iconType: SocialCommunityIcon;
}