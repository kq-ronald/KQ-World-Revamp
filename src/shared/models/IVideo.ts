export interface IFileReference {
  driveId: string;
  itemId: string;
  webUrl: string;
}
export interface IVideoEntry {
  id: string;
  title: string;
  sourceType: 'file' | 'link';
  videoUrl: string;
  file?: IFileReference;
  thumbnail?: IFileReference;
  isPublished: boolean;
  displayOrder: number;
}
export interface IVideo extends IVideoEntry {
  thumbnailUrl: string;
  duration?: string;
  revision: string;
}
export interface IVideoInput extends IVideoEntry {
  revision: string;
}
export type IVideoUpdateInput = IVideoInput;
export interface IVideoSnapshot {
  videos: IVideo[];
  revision: string;
}
