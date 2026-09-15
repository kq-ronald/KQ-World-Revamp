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
        url: 'https://kenyaairwaysplc.sharepoint.com/Notices/Document%20Library/Forms/AllItems.aspx'
      },
      {
        title: 'Provident Fund',
        url: 'https://kenyaairwaysplc.sharepoint.com/Notices/Provident%20Fund/Forms/AllItems.aspx'
      },
      {
        title: 'IT Notices',
        url: 'https://kenyaairwaysplc.sharepoint.com/Notices/IS%20Notices/Forms/AllItems.aspx'
      },
      {
        title: 'Wanandege Notices',
        url: 'https://kenyaairwaysplc.sharepoint.com/Notices/Wanandege%20Notices/Forms/AllItems.aspx'
      },
      {
        title: 'Brand Ambassador',
        url: 'https://kenyaairwaysplc.sharepoint.com/mrkt/Brand%20Ambassador/Forms/AllItems.aspx'
      },
      {
        title: 'Data Protection',
        url: 'https://kenyaairwaysplc.sharepoint.com/Notices/dataprotection/Forms/AllItems.aspx'
      }
    ]
  },

  {
    title: 'Brand Portal',
    children: [
      {
        title: 'KQ Templates',
        url: 'https://kenyaairwaysplc.sharepoint.com/Quicklinks/Presentation%20Templates/Forms/AllItems.aspx'
      },
      {
        title: 'KQ Images',
        url: 'https://kenyaairwaysplc.sharepoint.com/Quicklinks/KQLogos/Forms/Thumbnails.aspx'
      },
      {
        title: 'KQ Videos',
        url: 'https://kenyaairwaysplc.sharepoint.com/Quicklinks/KQ%20videos/Forms/Thumbnails.aspx'
      },
      {
        title: 'KQ Brand Documents',
        url: 'https://kenyaairwaysplc.sharepoint.com/Quicklinks/KQ%20Brand%20Documents/Forms/AllItems.aspx'
      },
      {
        title: 'Sales Kit',
        url: 'https://kenyaairwaysplc.sharepoint.com/Quicklinks/Sales%20Kit/Forms/AllItems.aspx'
      },
      {
        title: 'Brand Guidelines',
        url: 'https://kenyaairwaysplc.sharepoint.com/Quicklinks/Brand%20Guidelines/Forms/AllItems.aspx'
      }
    ]
  },

  {
    title: 'Departments',
    children: [
      {
        title: 'Human Resource',
        url: 'https://kenyaairwaysplc.sharepoint.com/hr/portal/Pages/default.aspx'
      },
      {
        title: 'Finance',
        url: 'https://kenyaairwaysplc.sharepoint.com/homepage/Lists/Finance%20Department/AllItems.aspx'
      },
      {
        title: 'Commercial',
        url: 'https://kenyaairwaysplc.sharepoint.com/homepage/Lists/Commercial%20Department/AllItems.aspx'
      },
      {
        title: 'Flight Operations',
        url: 'https://kenyaairwaysplc.sharepoint.com/homepage/Lists/Flight%20Operations%20Department/AllItems.aspx'
      },
      {
        title: 'Ground Services',
        url: 'https://kenyaairwaysplc.sharepoint.com/homepage/Lists/Ground%20Services%20Department/AllItems.aspx'
      },
      {
        title: 'Information Technology',
        url: 'https://kenyaairwaysplc.sharepoint.com/homepage/Lists/IT%20Department/AllItems.aspx'
      },
      {
        title: 'Group CEO',
        url: 'https://kenyaairwaysplc.sharepoint.com/homepage/Lists/MDs%20Department/AllItems.aspx'
      },
      {
        title: 'Cargo',
        url: 'https://kenyaairwaysplc.sharepoint.com/homepage/Lists/COO%20Department/AllItems.aspx'
      },
      {
        title: 'Technical',
        url: 'https://kenyaairwaysplc.sharepoint.com/homepage/Lists/Technical%20Department/AllItems.aspx'
      },
      {
        title: 'Marketing',
        url: 'https://kenyaairwaysplc.sharepoint.com/homepage/Lists/Marketing%20Department/AllItems.aspx'
      },
      {
        title: 'Strategy & Innovation',
        url: 'https://kenyaairwaysplc.sharepoint.com/StrategyInnovation/SitePages/Home.aspx'
      },
      {
        title: 'Fahari Aviation',
        url: 'https://kenyaairwaysplc.sharepoint.com/fahariaviation/SitePages/Home.aspx'
      }
    ]
  },

  {
    title: 'Corporate News',
    children: [
      {
        title: 'The Pride Newsletter',
        url: 'https://kenyaairwaysplc.sharepoint.com/homepage/SitePages/THE%20PRIDE%20014.aspx'
      },
      {
        title: 'Take 3',
        url: 'https://kenyaairwaysplc.sharepoint.com/homepage/SitePages/Forms/AllPages.aspx'
      },
      {
        title: 'KQ Blog',
        url: 'https://corporate.kenya-airways.com/en/press-room/kq-blog/'
      }
    ]
  },

  {
    title: 'Knowledge Hub',
    children: [
      {
        title: 'Knowledge Hub',
        url: 'https://kenyaairwaysplc.sharepoint.com/sites/kqdocshares/omnidocs/pages/homev2.aspx'
      },
      {
        title: 'IATA Manuals',
        url: 'https://app.powerbi.com/groups/me/reports/90d2cd2a-79eb-43f5-b58a-cf4f21bff900/257f124439103336e910?ctid=dd74aad9-c569-463a-bc17-0ba25a8fa388&experience=power-bi&bookmarkGuid=99d79559-d079-4470-8407-1f7ca8e3d3bc'
      },
      {
        title: 'iPride Manuals and User Guides',
        url: 'https://kenyaairwaysplc.sharepoint.com/erp/default.aspx'
      },
      {
        title: 'Corporate Training Reading Materials',
        url: 'https://kenyaairwaysplc.sharepoint.com/sites/trnProgs/default.aspx'
      },
      {
        title: 'Print Data Dashboard',
        url: 'https://app.powerbi.com/groups/me/reports/130e98eb-f3e3-4626-9309-56a2b0b49e36/8bc5b60e9ded1b02cb02?ctid=dd74aad9-c569-463a-bc17-0ba25a8fa388&experience=power-bi'
      }
    ]
  }
];