export interface INavigationItem {
  title: string;
  url?: string;
  heading?: string;
  description?: string;
  icon?: string;
  children?: INavigationItem[];
}

export const navigationItems: INavigationItem[] = [
  {
    title: 'Home',
    children: [
      {
        title: 'Dashboard',
        url: '#'
      },
      {
        title: 'My Feed',
        url: '#'
      },
      {
        title: 'Notifications',
        url: '#'
      }
    ]
  },
  {
    title: 'Staff Notices',
    children: [
      {
        title: 'HR Notices',
        url: '#'
      },
      {
        title: 'Provident Fund',
        url: '#'
      },
      {
        title: 'IT Notices',
        url: '#'
      },
      {
        title: 'Wanandege Notices',
        url: '#'
      },
      {
        title: 'Brand Ambassador',
        url: '#'
      },
      {
        title: 'Data Protection',
        url: '#'
      }
    ]
  },
  {
    title: 'Brand Portal',
    children: [
      {
        title: 'KQ Templates',
        url: '#'
      },
      {
        title: 'KQ Images',
        url: '#'
      },
      {
        title: 'KQ Videos',
        url: '#'
      },
      {
        title: 'KQ Brand Documents',
        url: '#'
      },
      {
        title: 'Sales Kit',
        url: '#'
      },
      {
        title: 'Brand Guidelines',
        url: '#'
      }
    ]
  },
  {
    title: 'Departments',
    children: [
      {
        title: 'Human Resource',
        url: '#'
      },
      {
        title: 'Finance',
        url: '#'
      },
      {
        title: 'Commercial',
        url: '#'
      },
      {
        title: 'Flight Operations',
        url: '#'
      },
      {
        title: 'Ground Services',
        url: '#'
      },
      {
        title: 'Information Technology',
        url: '#'
      },
      {
        title: 'Group CEO',
        url: '#'
      },
      {
        title: 'Cargo',
        url: '#'
      },
      {
        title: 'Technical',
        url: '#'
      },
      {
        title: 'Marketing',
        url: '#'
      },
      {
        title: 'Strategy & Innovation',
        url: '#'
      },
      {
        title: 'Fahari Aviation',
        url: '#'
      }
    ]
  },
  {
    title: 'Corporate News',
    children: [
      {
        title: 'The Pride',
        url: '#'
      },
      {
        title: 'Take 3',
        url: '#'
      },
      {
        title: 'KQ Blog',
        url: 'https://corporate.kenya-airways.com/en/press-room/kq-blog/'
      },
      {
        title: 'Press Releases',
        url: '#'
      }
    ]
  },
  {
    title: 'Knowledge Hub',
    children: [
      {
        title: 'Knowledge Hub',
        url: '#'
      },
      {
        title: 'IATA Manuals',
        url: '#'
      },
      {
        title: 'iPride Manuals and User Guides',
        url: '#'
      },
      {
        title: 'Corporate Training Reading Materials',
        url: '#'
      },
      {
        title: 'Print Data Dashboard',
        url: '#'
      }
    ]
  }
];