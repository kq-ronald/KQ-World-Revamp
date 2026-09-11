export interface ICompanyNews {
  id: number;
  title: string;
  moreInfo: string;
  category: string;
  featuredImageUrl: string;
  articleUrl: string;
  isPublished: boolean;
  startDate?: string;
  displayOrder: number;
  fileName: string;
  fileUrl: string;
}