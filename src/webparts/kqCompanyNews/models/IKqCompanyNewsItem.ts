export type KqCompanyNewsType = 'take3' | 'blog' | 'pride';

export interface IKqCompanyNewsItem {
  id: number;
  type: KqCompanyNewsType;

  title: string;
  description: string;

  publishedDate: Date;

  authorName: string;
  category: string;

  imageUrl: string;
  itemUrl: string;

  readTimeMinutes?: number;

  fileName?: string;
  issueNumber?: string;
}