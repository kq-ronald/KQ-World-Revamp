export type KqVideoCategory = 'corporate-stories' | 'beyond-terminal';
export interface IKqVideo {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  category: KqVideoCategory;
  driveId?: string;
  driveItemId?: string;
  duration?: string;
}
