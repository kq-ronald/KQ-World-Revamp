export type KqVideoCategory =
  | 'beyond-terminal'
  | 'corporate-stories';

export interface IKqVideo {
  id: number;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  category: KqVideoCategory;
  duration?: string;
}