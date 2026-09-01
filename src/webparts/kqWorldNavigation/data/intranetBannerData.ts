export interface IIntranetBannerItem {
  id: number;
  image: string;
  headline: string;
  description: string;
  url: string;
}

export const intranetBannerItems: IIntranetBannerItem[] = [
  {
    id: 1,
    image: '/Users/ronaldekajul/kq-world/src/webparts/kqWorldNavigation/assets/intranetbanner/intranetbanner1.svg',
    headline: 'Fueling the future... 5% SAF milestone reached',
    description:
      'Our sustainable aviation fuel programme has crossed a company-first 5% blend on select long-haul departures out of NBO.',
    url: '#'
  }
];