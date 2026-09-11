export interface IBanner {
  id: number;
  fileName: string;
  fileUrl: string;
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  displayOrder: number;
  isPublished: boolean;
  startDate?: string;
  endDate?: string;
}