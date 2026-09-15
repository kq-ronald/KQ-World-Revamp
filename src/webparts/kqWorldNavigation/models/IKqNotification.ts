export interface IKqNotification {
  id: number;
  title: string;
  message: string;
  link?: string;
  notificationType: string;
  publishDate: Date;
  isActive: boolean;
}