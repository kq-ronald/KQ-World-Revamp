export interface IIntranetBannerItem {
  id: number;
  image: string;
  headline: string;
  description: string;
  url: string;
}

export interface ISharePointBannerItem {
  Id: number;
  Title?: string;
  File?: {
    Name: string;
    ServerRelativeUrl: string;
  };
}