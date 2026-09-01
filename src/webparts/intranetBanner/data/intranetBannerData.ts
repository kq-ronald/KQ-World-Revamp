import intranetBanner1 from '../assets/intranetbanner1.svg';

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
    image: intranetBanner1,
    headline: 'Fueling the future... 5% SAF milestone reached',
    description:
      'Our sustainable aviation fuel programme has crossed a company-first 5% blend on select long-haul departures out of NBO.',
    url: '#'
  },

  // TEMPORARY SLIDES FOR TESTING THE CAROUSEL
  {
    id: 2,
    image: intranetBanner1,
    headline: 'Banner 2',
    description: '',
    url: '#'
  },
  {
    id: 3,
    image: intranetBanner1,
    headline: 'Banner 3',
    description: '',
    url: '#'
  },
  {
    id: 4,
    image: intranetBanner1,
    headline: 'Banner 4',
    description: '',
    url: '#'
  }
];