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
  title: string;
  subtitle: string;
  url: string;
  iconType: SocialCommunityIcon;
}