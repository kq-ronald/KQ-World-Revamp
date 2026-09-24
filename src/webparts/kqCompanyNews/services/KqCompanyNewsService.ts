import {
  SPHttpClient,
  SPHttpClientResponse
} from '@microsoft/sp-http';

import {
  WebPartContext
} from '@microsoft/sp-webpart-base';

import {
  IKqCompanyNewsItem
} from '../models/IKqCompanyNewsItem';


interface ISitePageItem {
  Id: number;
  Title?: string;
  Description?: string;
  FileLeafRef?: string;
  FileRef?: string;
  Created?: string;
  Modified?: string;

  BannerImageUrl?:
    | string
    | {
        Url?: string;
        Description?: string;
      };
}


export default class KqCompanyNewsService {

  private readonly _context: WebPartContext;

  /*
   * ==========================================================
   * DATA SOURCES
   * ==========================================================
   */

  private readonly _homepageWebUrl =
    'https://kenyaairwaysplc.sharepoint.com/homepage';

  private readonly _sitePagesLibrary =
    'Site Pages';

  private readonly _blogLandingUrl =
    'https://corporate.kenya-airways.com/en/press-room/kq-blog/';

  private readonly _sitePagesLandingUrl =
    'https://kenyaairwaysplc.sharepoint.com/homepage/SitePages/Forms/AllPages.aspx';


  public constructor(
    context: WebPartContext
  ) {
    this._context = context;
  }


  /*
   * ==========================================================
   * LOAD EVERYTHING
   * ==========================================================
   */

  public async getAllCompanyNews():
    Promise<{
      take3: IKqCompanyNewsItem[];
      blogs: IKqCompanyNewsItem[];
      pride: IKqCompanyNewsItem[];
    }> {

    /*
     * Site Pages only needs to be requested once.
     * Take 3 and The Pride are then extracted from it.
     */

    const sitePages =
      await this._getSitePages();

    const take3 =
      this._getTake3FromPages(sitePages);

    const pride =
      this._getPrideFromPages(sitePages);

    const blogs = await this.getBlogItems();

    console.log(
      'KQ Company News loaded:',
      {
        take3,
        blogs,
        pride
      }
    );

    return {
      take3,
      blogs,
      pride
    };
  }


  /*
   * ==========================================================
   * PUBLIC METHODS
   * ==========================================================
   */

  public async getTake3Items():
    Promise<IKqCompanyNewsItem[]> {

    const pages =
      await this._getSitePages();

    return this._getTake3FromPages(
      pages
    );
  }


  public async getBlogItems():
    Promise<IKqCompanyNewsItem[]> {

    // Curated real articles verified on 22 September 2026.
    // This is NOT an automatically refreshed corporate-site feed.
    // Update these records, or replace this method with an approved feed later.
    return [
      {
        id: 20260826,
        type: 'blog',
        title: 'The Hidden Cost of Running an Airline',
        moreInfo: 'An overview of the costs and financial pressures behind airline operations.',
        publishedDate: new Date('2026-08-26T00:00:00+03:00'),
        authorName: 'Mary Mwenga',
        category: 'BLOG',
        imageUrl: 'https://corporate.kenya-airways.com/contentassets/a4c003e4bfa3410b9ee0c37d56ecb86f/whatsapp-image-2026-08-20-at-14.32.41.jpeg',
        itemUrl: this._blogLandingUrl + '2026/august/the-hidden-cost-of-running-an-airline/',
        fileName: '',
        readTimeMinutes: undefined,
        issueNumber: undefined
      },
      {
        id: 20260819,
        type: 'blog',
        title: "What Kenya Airways' Resilience Reveals About Aviation as Economic Infrastructure",
        moreInfo: 'How air connectivity supports trade, tourism and resilience during disruption.',
        publishedDate: new Date('2026-08-19T00:00:00+03:00'),
        authorName: '',
        category: 'BLOG',
        imageUrl: 'https://corporate.kenya-airways.com/contentassets/1f4d7de0a1b94584b1bd970753cea580/kq-boeing-777---er_mombasa-flight-9965.jpg',
        itemUrl: this._blogLandingUrl + '2026/august/kenya-airways-aviation-as-ecnomic-infrastructure/',
        fileName: '',
        readTimeMinutes: undefined,
        issueNumber: undefined
      },
      {
        id: 20260708,
        type: 'blog',
        title: 'From Cabin to Couture',
        moreInfo: 'Meet Caroline Karimi, who combines her cabin crew career with a passion for fashion.',
        publishedDate: new Date('2026-07-08T00:00:00+03:00'),
        authorName: 'Sharon Kiende',
        category: 'BLOG',
        imageUrl: 'https://corporate.kenya-airways.com/globalassets/corporate/press-room/kq-blog/carolyne-karimi.jpg',
        itemUrl: this._blogLandingUrl + '2026/july/from-cabin-to-couture/',
        fileName: '',
        readTimeMinutes: undefined,
        issueNumber: undefined
      }
    ];
  }


  public async getPrideItems():
    Promise<IKqCompanyNewsItem[]> {

    const pages =
      await this._getSitePages();

    return this._getPrideFromPages(
      pages
    );
  }


  public getBlogLandingUrl():
    string {

    return this._blogLandingUrl;
  }


  public getSitePagesLandingUrl():
    string {

    return this._sitePagesLandingUrl;
  }


  /*
   * ==========================================================
   * SHAREPOINT SITE PAGES
   * ==========================================================
   */

  private async _getSitePages():
    Promise<ISitePageItem[]> {

    /*
     * We query the Site Pages library itself.
     *
     * Do NOT query:
     *
     * /SitePages/Forms/AllPages.aspx
     *
     * That URL is only SharePoint's visual library view.
     */

    const url =
      `${this._homepageWebUrl}` +
      `/_api/web/lists/getbytitle('${this._sitePagesLibrary}')/items` +
      `?$select=` +
      [
        'Id',
        'Title',
        'Description',
        'FileLeafRef',
        'FileRef',
        'Created',
        'Modified',
        'BannerImageUrl'
      ].join(',') +
      `&$orderby=Modified desc` +
      `&$top=100`;

    console.log(
      'Loading KQ Site Pages:',
      url
    );

    const response:
      SPHttpClientResponse =
      await this._context
        .spHttpClient
        .get(
          url,
          SPHttpClient.configurations.v1,
          {
            headers: {
              Accept:
                'application/json;odata=nometadata'
            }
          }
        );


    if (!response.ok) {

      const errorText =
        await response.text();

      console.error(
        'Unable to load Site Pages:',
        response.status,
        response.statusText,
        errorText
      );

      throw new Error(
        `Unable to load Company News from Site Pages. ` +
        `SharePoint returned ${response.status}.`
      );
    }


    const data:
      {
        value: ISitePageItem[];
      } =
      await response.json();


    console.log(
      'KQ Site Pages:',
      data.value
    );


    return (
      data.value || []
    );
  }


  /*
   * ==========================================================
   * TAKE 3
   * ==========================================================
   */

  private _getTake3FromPages(
    pages: ISitePageItem[]
  ): IKqCompanyNewsItem[] {

    return pages

      /*
       * Title contains TAKE 3.
       *
       * Examples:
       *
       * TAKE 3 - September 2026
       * Take 3 Issue 21
       * KQ TAKE 3
       */

      .filter(
        (page) =>
          this._normaliseText(
            page.Title
          ).includes(
            'take 3'
          )
      )

      /*
       * Most recently modified first.
       */

      .sort(
        this._sortPagesNewestFirst
      )

      /*
       * Home screen shows maximum 6.
       */

      .slice(
        0,
        6
      )

      .map(
        (page) =>
          this._mapSitePage(
            page,
            'take3'
          )
      );
  }


  /*
   * ==========================================================
   * THE PRIDE
   * ==========================================================
   */

  private _getPrideFromPages(
    pages: ISitePageItem[]
  ): IKqCompanyNewsItem[] {

    return pages

      /*
       * Title contains THE PRIDE.
       */

      .filter(
        (page) =>
          this._normaliseText(
            page.Title
          ).includes(
            'the pride'
          )
      )

      .sort(
        this._sortPagesNewestFirst
      )

      /*
       * Home screen shows maximum 4.
       */

      .slice(
        0,
        4
      )

      .map(
        (page) =>
          this._mapSitePage(
            page,
            'pride'
          )
      );
  }


  /*
   * ==========================================================
   * MAP SHAREPOINT PAGE -> UI MODEL
   * ==========================================================
   */

  private _mapSitePage(
    page: ISitePageItem,

    type:
      'take3' |
      'pride'
  ): IKqCompanyNewsItem {

    const title =
      page.Title || '';

    const description =
      page.Description || '';

    return {

      id:
        page.Id,

      type,

      title,

      moreInfo:
        description,

      publishedDate:
        this._parseDate(
          page.Modified ||
          page.Created
        ),

      authorName:
        '',

      category:
        type === 'take3'
          ? 'TAKE 3'
          : 'THE PRIDE',

      imageUrl:
        this._getBannerImageUrl(
          page.BannerImageUrl
        ),

      /*
       * FileRef is normally something such as:
       *
       * /homepage/SitePages/TAKE-3.aspx
       *
       * We turn that into an absolute URL.
       */

      itemUrl:
        this._makeAbsoluteUrl(
          page.FileRef || ''
        ),

      fileName:
        page.FileLeafRef || '',

      readTimeMinutes:
        undefined,

      issueNumber:
        type === 'pride'
          ? this._extractIssueNumber(
              title
            )
          : undefined
    };
  }


  /*
   * ==========================================================
   * IMAGE HANDLING
   * ==========================================================
   */

  private _getBannerImageUrl(
    value?: ISitePageItem['BannerImageUrl']
  ): string {

    if (!value) {
      return '';
    }


    /*
     * Some SharePoint REST responses return
     * hyperlink/image fields as plain strings.
     */

    if (
      typeof value === 'string'
    ) {

      /*
       * Sometimes SharePoint sends JSON encoded
       * image information.
       */

      try {

        const parsed =
          JSON.parse(
            value
          );

        if (
          parsed &&
          typeof parsed === 'object'
        ) {

          if (
            typeof parsed.serverUrl ===
              'string' &&
            typeof parsed.serverRelativeUrl ===
              'string'
          ) {

            return (
              parsed.serverUrl +
              parsed.serverRelativeUrl
            );
          }


          if (
            typeof parsed.serverRelativeUrl ===
              'string'
          ) {

            return (
              window.location.origin +
              parsed.serverRelativeUrl
            );
          }


          if (
            typeof parsed.Url ===
              'string'
          ) {

            return parsed.Url;
          }


          if (
            typeof parsed.url ===
              'string'
          ) {

            return parsed.url;
          }
        }

      } catch {

        /*
         * It wasn't JSON.
         * Treat it as a normal URL.
         */

        return this._makeAbsoluteUrl(
          value
        );
      }

      return '';
    }


    /*
     * Hyperlink object.
     */

    if (
      typeof value.Url ===
        'string'
    ) {

      return this._makeAbsoluteUrl(
        value.Url
      );
    }


    return '';
  }


  /*
   * ==========================================================
   * HELPERS
   * ==========================================================
   */

  private _normaliseText(
    value?: string
  ): string {

    return (
      value || ''
    )
      .trim()
      .toLowerCase();
  }


  private _sortPagesNewestFirst = (
    first: ISitePageItem,
    second: ISitePageItem
  ): number => {

    const firstDate =
      new Date(
        first.Modified ||
        first.Created ||
        0
      ).getTime();

    const secondDate =
      new Date(
        second.Modified ||
        second.Created ||
        0
      ).getTime();

    return (
      secondDate -
      firstDate
    );
  };


  private _makeAbsoluteUrl(
    value: string
  ): string {

    if (!value) {
      return '';
    }


    if (
      value.startsWith(
        'http://'
      ) ||
      value.startsWith(
        'https://'
      )
    ) {

      return value;
    }


    if (
      value.startsWith('/')
    ) {

      return (
        window.location.origin +
        value
      );
    }


    return (
      `${this._homepageWebUrl}/` +
      value.replace(
        /^\/+/,
        ''
      )
    );
  }


  private _parseDate(
    value?: string
  ): Date {

    if (!value) {
      return new Date();
    }


    const date =
      new Date(
        value
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return new Date();
    }


    return date;
  }


  private _extractIssueNumber(
    value: string
  ): string {

    if (!value) {
      return '';
    }


    const match =
      value.match(
        /(?:issue\s*(?:no\.?)?\s*)?(\d+)/i
      );


    return match
      ? match[1]
      : '';
  }
}