export interface IKqMoment {
  id: number;
  title: string;
  description: string;
  isPublished: boolean;
  publishDate?: string;

  fileName: string;
  fileUrl: string;

  folderUrl: string;
}

export interface IKqMomentFolder {
  name: string;
  serverRelativeUrl: string;
}

export interface IKqMomentFolderContents {
  folderUrl: string;

  folders: IKqMomentFolder[];

  moments: IKqMoment[];
}

export interface IKqMomentMetadata {
  title: string;
  description: string;
  isPublished: boolean;
  publishDate?: string;
}

export interface IKqMomentUploadInput
  extends IKqMomentMetadata {

  file: File;

  folderUrl: string;
}

export interface IKqMomentUpdateInput
  extends IKqMomentMetadata {

  id: number;
}