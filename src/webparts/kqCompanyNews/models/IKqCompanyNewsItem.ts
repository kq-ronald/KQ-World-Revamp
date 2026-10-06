export type KqCompanyNewsType =
  | 'take3'
  | 'blog'
  | 'pride';

export interface IKqCompanyNewsItem {
  id: number;
  type: KqCompanyNewsType;

  title: string;
  moreInfo: string;

  publishedDate: Date;

  authorName: string;
  category: string;

  imageUrl: string;
  itemUrl: string;

  fileName?: string;
  readTimeMinutes?: number;
  issueNumber?: string;

  contentHtml?: string;
}