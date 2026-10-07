export interface IKqMoment {
  id: number;
  title: string;
  imageUrl: string;
  galleryUrl: string;
}

export interface IKqGalleryImage {
  name: string;
  url: string;
  serverRelativeUrl: string;
}

export interface IKqGallery {
  id: number;
  title: string;
  coverImageUrl: string;
  galleryUrl: string;
  images: IKqGalleryImage[];
}