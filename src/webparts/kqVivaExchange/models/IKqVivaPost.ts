export interface IKqVivaPost {
  id: number;

  authorName: string;

  authorInitials: string;

  authorRole: string;

  createdAt: Date;

  body: string;

  likes: number;

  comments: number;

  webUrl: string;
}