
export interface INavigationItem {
  title: string;
  url?: string;
  heading?: string;
  description?: string;
  icon?: string;
  children?: INavigationItem[];

  newsCategory?: 'pride' | 'take3' | 'blog';
}