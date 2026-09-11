export interface IVideo {
  id: number;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  category: string;
  isPublished: boolean;
  displayOrder: number;
}

export interface IVideoInput {
  title: string;
  videoUrl: string;
  category: string;
  isPublished: boolean;
  displayOrder: number;
  thumbnailFile?: File;
}

export interface IVideoUpdateInput
  extends IVideoInput {
  id: number;
}