export interface IKqNotification {
  /** Composite source + item ID, or legacy manual-list numeric ID. */
  id: string | number;
  title: string;
  message: string;
  link?: string;
  notificationType: string;
  publishDate: Date;
  isActive: boolean;
  /** Includes the revision timestamp, so a later edit becomes unread again. */
  revisionKey?: string;
  isRead?: boolean;
}
