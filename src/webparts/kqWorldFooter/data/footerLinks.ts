export interface IFooterLink {
  label: string;
  url: string;
}

export interface IFooterSection {
  title: string;
  links: IFooterLink[];
}

export interface ISocialLink {
  label: string;
  url: string;
}

export const footerSections: IFooterSection[] = [
  {
    title: 'Kenya Airways',
    links: [
      {
        label: 'About us',
        url: 'https://corporate.kenya-airways.com/en-KE/'
      },
      {
        label: 'Awards',
        url: 'https://corporate.kenya-airways.com/en-KE/about-us/milestones/awards-achievements/'
      },
      {
        label: 'Careers',
        url: 'https://careers.kenya-airways.com/'
      },
      {
        label: 'Our Partners',
        url: 'https://www.kenya-airways.com/en-ke/plan/travel-information/codeshare-partners/'
      },
      {
        label: 'Press Releases',
        url: 'https://corporate.kenya-airways.com/en/news-press-release/'
      },
      {
        label: 'Sustainability',
        url: 'https://corporate.kenya-airways.com/en/commitments-partnerships/corporate-responsibility/commitments/'
      }
    ]
  },
  {
    title: 'KQ Group Brands',
    links: [
      {
        label: 'KQ Cargo',
        url: 'https://kqcargo.com/en/'
      },
      {
        label: 'KQ Pride Center',
        url: 'https://kqpridecentre.com/en/'
      },
      {
        label: 'KQ Holidays',
        url: 'https://www.kenya-airways.com/en-ke/explore/kq-holidays/'
      },
      {
        label: 'Fahari Aviation',
        url: 'https://fahariaviation.com/en/'
      },
      {
        label: 'Msafiri Magazine',
        url: 'https://msafirimag.com/'
      },
      {
        label: 'JamboJet',
        url: 'https://www.jambojet.com/en-us'
      },
      {
        label: 'Ground Handling Services',
        url: '#'
      }
    ]
  },
  {
    title: 'Our Destinations',
    links: [
      {
        label: 'Route Map',
        url: 'https://www.kenya-airways.com/en-KE/route-planner/'
      },
      {
        label: 'Africa',
        url: 'https://www.kenya-airways.com/en-KE/flight-deals/?flightDealsRegion=4%7c5%7c6%7c7'
      },
      {
        label: 'Asia',
        url: 'https://www.kenya-airways.com/en-ke/flight-deals/?flightDealsRegion=9'
      },
      {
        label: 'America',
        url: 'https://www.kenya-airways.com/en-KE/flight-deals/?flightDealsRegion=10'
      },
      {
        label: 'Europe',
        url: 'https://www.kenya-airways.com/en-KE/flight-deals/?flightDealsRegion=8'
      },
      {
        label: 'Middle East',
        url: 'https://www.kenya-airways.com/en-KE/flight-deals/?flightDealsRegion=11'
      }
    ]
  },
  {
    title: 'Help',
    links: [
      {
        label: 'Contact us',
        url: 'https://www.kenya-airways.com/en-KE/contact/'
      },
      {
        label: 'Name Change',
        url: 'https://www.kenya-airways.com/en-KE/policies/optional-fees/'
      },
      {
        label: 'FAQs',
        url: 'https://www.kenya-airways.com/en-KE/help/faqs/'
      },
      {
        label: 'Travel Requirements',
        url: 'https://www.kenya-airways.com/en-KE/plan/travel-information/travel-requirements/'
      },
      {
        label: 'Special Assistance',
        url: '#'
      },
      {
        label: 'KRA Clearance for Passengers',
        url: '#'
      }
    ]
  },
  {
    title: 'Useful Links',
    links: [
      {
        label: 'NDC Trade Portal',
        url: 'https://www.kenya-airways.com/en-KE/ndc-trade-portal/'
      },
      {
        label: 'ADM Trade Portal',
        url: 'https://adm.kenya-airways.com/?_gl=1*1m0b8g5*_gcl_au*MjY5MDgwNzEyLjE3ODcxMjM0NTQ.*_ga*Mjk3ODI5NDQ5LjE3ODAwNDAxNDA.*_ga_JH7YGHV0KQ*czE3ODk0NjExMjEkbzIkZzEkdDE3ODk0NjE3MDEkajU5JGwwJGgxMzkwNDM4MzY5'
      },
      {
        label: 'Group Booking',
        url: 'https://www.kenya-airways.com/en-KE/plan/travel-services/group-travel/'
      },
      {
        label: 'Corporate Travel',
        url: 'https://www.kenya-airways.com/en-ke/plan/travel-services/corporate-travel/'
      },
      {
        label: 'Affiliate Program',
        url: 'https://www.kenya-airways.com/en-KE/affiliate-program/'
      }
    ]
  },
  {
    title: 'Loyalty Program',
    links: [
      {
        label: 'About Asante',
        url: 'https://asante.kenya-airways.com/?_gl=1*1lvri5u*_gcl_au*MjY5MDgwNzEyLjE3ODcxMjM0NTQ.*_ga*Mjk3ODI5NDQ5LjE3ODAwNDAxNDA.*_ga_JH7YGHV0KQ*czE3ODk0NjExMjEkbzIkZzEkdDE3ODk0NjE5NjEkajQ4JGwwJGgxMzkwNDM4MzY5'
      },
      {
        label: 'Join Asante',
        url: 'https://asante.kenya-airways.com/enrollment?_gl=1*1lvri5u*_gcl_au*MjY5MDgwNzEyLjE3ODcxMjM0NTQ.*_ga*Mjk3ODI5NDQ5LjE3ODAwNDAxNDA.*_ga_JH7YGHV0KQ*czE3ODk0NjExMjEkbzIkZzEkdDE3ODk0NjE5NjEkajQ4JGwwJGgxMzkwNDM4MzY5'
      },
      {
        label: 'Tier and Benefits',
        url: 'https://asante.kenya-airways.com/pages/benefits?_gl=1*kchcxp*_gcl_au*MjY5MDgwNzEyLjE3ODcxMjM0NTQ.*_ga*Mjk3ODI5NDQ5LjE3ODAwNDAxNDA.*_ga_JH7YGHV0KQ*czE3ODk0NjExMjEkbzIkZzEkdDE3ODk0NjE5NjEkajQ4JGwwJGgxMzkwNDM4MzY5'
      },
      {
        label: 'Asante Partners',
        url: 'https://asante.kenya-airways.com/partners?_gl=1*kchcxp*_gcl_au*MjY5MDgwNzEyLjE3ODcxMjM0NTQ.*_ga*Mjk3ODI5NDQ5LjE3ODAwNDAxNDA.*_ga_JH7YGHV0KQ*czE3ODk0NjExMjEkbzIkZzEkdDE3ODk0NjE5NjEkajQ4JGwwJGgxMzkwNDM4MzY5'
      },
      {
        label: 'Earnings',
        url: 'https://asante.kenya-airways.com/pages/earnings?_gl=1*kchcxp*_gcl_au*MjY5MDgwNzEyLjE3ODcxMjM0NTQ.*_ga*Mjk3ODI5NDQ5LjE3ODAwNDAxNDA.*_ga_JH7YGHV0KQ*czE3ODk0NjExMjEkbzIkZzEkdDE3ODk0NjE5NjEkajQ4JGwwJGgxMzkwNDM4MzY5'
      }
    ]
  },
  {
    title: 'Popular Destinations',
    links: [
      {
        label: 'Nairobi',
        url: 'https://www.kenya-airways.com/en_ke/flights-to-nairobi'
      },
      {
        label: 'London',
        url: 'https://www.kenya-airways.com/en_ke/flights-to-london-gatwick'
      },
      {
        label: 'Mombasa',
        url: 'https://www.kenya-airways.com/en_ke/flights-to-mombasa'
      },
      {
        label: 'Johannesburg',
        url: 'https://www.kenya-airways.com/en_ke/flights-to-Johannesburg/'
      },
      {
        label: 'New York',
        url: 'https://www.kenya-airways.com/en_ke/flights-to-new-york/'
      }
    ]
  },
  {
    title: 'Manage',
    links: [
      {
        label: 'Change booking',
        url: 'https://www.kenya-airways.com/en-KE/book-manage/manage-booking/change-booking/'
      },
      {
        label: 'Check-in',
        url: 'https://www.kenya-airways.com/en-KE/book-manage/post-booking/check-in/'
      },
      {
        label: 'Refund form',
        url: 'https://www.kenya-airways.com/en-KE/book-manage/manage-booking/request-for-your-refund/'
      },
      {
        label: 'Upgrade flight',
        url: 'https://www.kenya-airways.com/en-KE/book-manage/manage-booking/upgrade-flight/'
      },
      {
        label: 'Delay and cancellations',
        url: 'https://www.kenya-airways.com/en-KE/book-manage/self-rebooking-service/'
      }
    ]
  }
];

export const legalLinks: IFooterLink[] = [
  { label: 'Privacy Statement', url: 'https://www.kenya-airways.com/en-KE/policies/privacy-statement/' },
  { label: 'Conditions of Carriage', url: 'https://www.kenya-airways.com/en-KE/policies/conditions-of-carriage/' },
  { label: 'Website Security Statement', url: 'https://www.kenya-airways.com/en-KE/policies/website-security-policy/' },
  { label: 'Browser Compatibility', url: 'https://www.kenya-airways.com/en-KE/policies/browser-compatibility/' },
  { label: 'Cookie Policy', url: 'https://www.kenya-airways.com/en-KE/policies/cookie-policy/' },
  { label: 'Customer Service Plan', url: 'https://www.kenya-airways.com/en-KE/policies/customer-service-plan/' },
  { label: 'Optional Fees', url: 'https://www.kenya-airways.com/en-KE/policies/optional-fees/' },
  { label: '24 Hours Refund Statement', url: 'https://www.kenya-airways.com/en-KE/policies/24-hours-refund-policy/' },
  { label: 'EU Passenger Rights', url: 'https://www.kenya-airways.com/en-KE/policies/eu-passenger-rights/' },
  { label: 'Thai Passenger Rights', url: 'https://www.kenya-airways.com/en-KE/policies/thai-passenger-rights/' }
];

export const appLinks = {
  appStore: 'https://apps.apple.com/us/app/kenya-airways/id6745785228',
  googlePlay: 'https://play.google.com/store/apps/details?id=com.kenyaairways'
};

export const socialLinks: ISocialLink[] = [
  {
    label: 'WhatsApp',
    url: 'https://wa.me/1234567890'
  },
  {
    label: 'YouTube',
    url: 'https://www.youtube.com/user/KenyaAirways'
  },
  {
    label: 'X',
    url: 'https://twitter.com/KenyaAirways'
  },
  {
    label: 'Threads',
    url: 'https://www.threads.net/@kenyaairways'
  },
  {
    label: 'Facebook',
    url: 'https://www.facebook.com/KenyaAirways'
  },
  {
    label: 'Instagram',
    url: 'https://www.instagram.com/kenyaairways'
  },
  {
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/company/kenya-airways'
  },
  {
    label: 'TikTok',
    url: 'https://www.tiktok.com/@kenyaairways'
  }
];