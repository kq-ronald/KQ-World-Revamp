export interface IKqEvent {
  id: string | number;
  title: string;
  date: Date;
  dateText: string;
  location: string;
  imageUrl: string;
  category: string;
  endDate?: Date;
  isAllDay?: boolean;
  categories?: string[];
  webLink?: string;
}
