import {
  SPHttpClient,
  SPHttpClientResponse
} from '@microsoft/sp-http';

import {
  WebPartContext
} from '@microsoft/sp-webpart-base';

import {
  IKqCompanyNewsItem,
  KqCompanyNewsType
} from '../models/IKqCompanyNewsItem';


/**
 * Lightweight SharePoint Site Page record.
 *
 * Used for:
 * - Homepage cards
 * - News library
 *
 * CanvasContent1 is optional because we only request it
 * when a user opens an individual story.
 */
interface ISitePageItem {
  Id: number;

  Title?: string;

  Description?: string;

  FileLeafRef?: string;

  FileRef?: string;

  Created?: string;

  Modified?: string;


  CanvasContent1?: string;

  BannerImageUrl?:
  | string
  | {
    Url?: string;
    Description?: string;
  };
}


/**
 * Shape returned by SharePoint for list queries.
 */
interface ISitePageCollectionResponse {
  value: ISitePageItem[];
}


export default class KqCompanyNewsService {

  private readonly _context: WebPartContext;

  private static _pagesCache?: {
    expiresAt: number;
    pages: ISitePageItem[];
  };

  private static _pagesRequest?: Promise<ISitePageItem[]>;


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


  public constructor(
    context: WebPartContext
  ) {

    this._context = context;

  }


  /*
   * ==========================================================
   * LOAD ALL COMPANY NEWS
   * ==========================================================
   */

  public async getAllCompanyNews():
    Promise<{
      take3: IKqCompanyNewsItem[];
      blogs: IKqCompanyNewsItem[];
      pride: IKqCompanyNewsItem[];
    }> {

    // Load independent sources concurrently. The SharePoint request
    // still determines when Take 3 and Pride are available.
    const [sitePages, blogs] = await Promise.all([
      this._getSitePages(),
      this.getBlogItems()
    ]);

    return {
      take3: this._getTake3FromPages(sitePages),
      blogs,
      pride: this._getPrideFromPages(sitePages)
    };
  }


  /*
   * ==========================================================
   * PUBLIC COLLECTION METHODS
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


  public async getPrideItems():
    Promise<IKqCompanyNewsItem[]> {

    const pages =
      await this._getSitePages();

    return this._getPrideFromPages(
      pages
    );

  }


  /*
   * ==========================================================
   * BLOGS
   * ==========================================================
   *
   * These are currently curated corporate-site articles.
   *
   * They can appear:
   * - on the homepage;
   * - inside the full KQ News Library.
   *
   * Their full article body is NOT currently stored inside
   * KQ World/SharePoint, so getStoryById() cannot yet return
   * internal contentHtml for them.
   *
   * Later this can be replaced with the KQ World CMS source.
   * ==========================================================
   */

  public async getBlogItems():
    Promise<IKqCompanyNewsItem[]> {

    return [

      {
        id: 20260826,

        type: 'blog',

        title:
          'The Hidden Cost of Running an Airline',

        moreInfo:
          'An overview of the costs and financial pressures behind airline operations.',

        publishedDate:
          new Date(
            '2026-08-26T00:00:00+03:00'
          ),

        authorName:
          'Mary Mwenga',

        category:
          'BLOG',

        imageUrl:
          'https://corporate.kenya-airways.com/contentassets/a4c003e4bfa3410b9ee0c37d56ecb86f/whatsapp-image-2026-08-20-at-14.32.41.jpeg',

        itemUrl:
          this._blogLandingUrl +
          '2026/august/the-hidden-cost-of-running-an-airline/',

        fileName:
          '',

        readTimeMinutes:
          undefined,

        issueNumber:
          undefined,

        contentHtml:
          undefined
      },

      {
        id: 20260819,

        type:
          'blog',

        title:
          "What Kenya Airways' Resilience Reveals About Aviation as Economic Infrastructure",

        moreInfo:
          'How air connectivity supports trade, tourism and resilience during disruption.',

        publishedDate:
          new Date(
            '2026-08-19T00:00:00+03:00'
          ),

        authorName:
          '',

        category:
          'BLOG',

        imageUrl:
          'https://corporate.kenya-airways.com/contentassets/1f4d7de0a1b94584b1bd970753cea580/kq-boeing-777---er_mombasa-flight-9965.jpg',

        itemUrl:
          this._blogLandingUrl +
          '2026/august/kenya-airways-aviation-as-ecnomic-infrastructure/',

        fileName:
          '',

        readTimeMinutes:
          undefined,

        issueNumber:
          undefined,

        contentHtml:
          undefined
      },

      {
        id:
          20260708,

        type:
          'blog',

        title:
          'From Cabin to Couture',

        moreInfo:
          'Meet Caroline Karimi, who combines her cabin crew career with a passion for fashion.',

        publishedDate:
          new Date(
            '2026-07-08T00:00:00+03:00'
          ),

        authorName:
          'Sharon Kiende',

        category:
          'BLOG',

        imageUrl:
          'https://corporate.kenya-airways.com/globalassets/corporate/press-room/kq-blog/carolyne-karimi.jpg',

        itemUrl:
          this._blogLandingUrl +
          '2026/july/from-cabin-to-couture/',

        fileName:
          '',

        readTimeMinutes:
          undefined,

        issueNumber:
          undefined,

        contentHtml:
          undefined
      }

    ];

  }


  /*
   * ==========================================================
   * GET ONE FULL STORY
   * ==========================================================
   *
   * This method is used by the KQ Story Viewer.
   *
   * The homepage does NOT call this.
   *
   * CanvasContent1 is only requested when somebody actually
   * opens a story.
   * ==========================================================
   */

  public async getStoryById(
    id: number,
    type: KqCompanyNewsType
  ): Promise<IKqCompanyNewsItem | undefined> {


    if (type === 'blog') {

      const blogs =
        await this.getBlogItems();

      const blog =
        blogs.find(
          (item) =>
            item.id === id
        );

      if (!blog) {

        throw new Error(
          'The requested blog story could not be found.'
        );

      }

      return blog;

    }


    /*
     * Take 3 / The Pride are SharePoint Site Pages.
     */

    const page =
      await this._getSitePageById(
        id
      );


    /*
     * Protect against somebody manually changing the URL
     * and requesting a Take 3 page as Pride or vice versa.
     */

    const normalisedTitle =
      this._normaliseText(
        page.Title
      );

    if (
      type === 'take3' &&
      !normalisedTitle.includes(
        'take 3'
      )
    ) {

      throw new Error(
        'The requested page is not a Take 3 story.'
      );

    }


    if (
      type === 'pride' &&
      !normalisedTitle.includes(
        'the pride'
      )
    ) {

      throw new Error(
        'The requested page is not a Pride story.'
      );

    }


    const story =
      this._mapSitePage(
        page,
        type
      );


    return {
      ...story,

      contentHtml:
        page.CanvasContent1 || ''
    };

  }


  /** Load the second embedded image for requested Take 3 pages.
   * Keeps full CanvasContent1 out of the homepage metadata request.
   */
  public async getTake3CoverImages(
    items: IKqCompanyNewsItem[]
  ): Promise<{ [id: number]: string }> {
    const covers: { [id: number]: string } = {};
    // Limit concurrent requests to avoid flooding SharePoint.
    for (let index = 0; index < items.length; index += 3) {
      const batch = items.slice(index, index + 3);
      await Promise.all(batch.map(async item => {
        try {
          const page = await this._getSitePageById(item.id);
          const image = this._secondEmbeddedImage(page.CanvasContent1 || '', item.itemUrl);
          if (image) covers[item.id] = image;
        } catch (error) {
          console.warn('Could not load Take 3 cover', item.id, error);
        }
      }));
    }
    return covers;
  }

  private _secondEmbeddedImage(content: string, pageUrl: string): string {
    if (!content || typeof DOMParser === 'undefined') return '';
    const documentNode = new DOMParser().parseFromString(content, 'text/html');
    const images = Array.from(documentNode.querySelectorAll('img'));
    const validUrls: string[] = [];

    for (const image of images) {
      const raw = image.getAttribute('src') || image.getAttribute('data-src') || '';
      if (!raw) continue;
      try {
        const resolved = new URL(raw, pageUrl || this._homepageWebUrl);
        if (resolved.protocol === 'https:' || resolved.protocol === 'http:') {
          validUrls.push(resolved.href);
        }
      } catch { /* Ignore malformed image URLs. */ }
    }

    // Use the second embedded image; fall back to the first if only one exists.
    // If there are no embedded images, the card keeps its existing banner image.
    return validUrls[1] || validUrls[0] || '';
  }

  /*
   * ==========================================================
   * LOAD SITE PAGE METADATA
   * ==========================================================
   */

  private _getSitePages(): Promise<ISitePageItem[]> {
    const cached = KqCompanyNewsService._pagesCache;

    if (cached && cached.expiresAt > Date.now()) {
      return Promise.resolve(cached.pages);
    }

    const existingRequest = KqCompanyNewsService._pagesRequest;
    if (existingRequest) {
      return existingRequest;
    }

    const request = this._fetchSitePages().then((pages: ISitePageItem[]) => {
      KqCompanyNewsService._pagesCache = {
        pages,
        expiresAt: Date.now() + 2 * 60 * 1000
      };
      return pages;
    });

    KqCompanyNewsService._pagesRequest = request;

    void request.then(
      () => {
        if (KqCompanyNewsService._pagesRequest === request) {
          KqCompanyNewsService._pagesRequest = undefined;
        }
      },
      () => {
        if (KqCompanyNewsService._pagesRequest === request) {
          KqCompanyNewsService._pagesRequest = undefined;
        }
      }
    );

    return request;
  }

  private async _fetchSitePages(): Promise<ISitePageItem[]> {

    /*
     * This request intentionally remains lightweight.
     *
     * CanvasContent1 is NOT included here.
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
      `&$top=500`;


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
      ISitePageCollectionResponse =
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
   * LOAD ONE FULL SITE PAGE
   * ==========================================================
   */

  private async _getSitePageById(
    id: number
  ): Promise<ISitePageItem> {

    const url =
      `${this._homepageWebUrl}` +
      `/_api/web/lists/getbytitle('${this._sitePagesLibrary}')/items(${id})` +
      `?$select=` +
      [
        'Id',
        'Title',
        'Description',
        'FileLeafRef',
        'FileRef',
        'Created',
        'Modified',
        'BannerImageUrl',
        'CanvasContent1'
      ].join(',');


    console.log(
      'Loading full KQ story:',
      id
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
        'Unable to load KQ story:',
        response.status,
        response.statusText,
        errorText
      );

      throw new Error(
        `Unable to load this story. ` +
        `SharePoint returned ${response.status}.`
      );

    }


    const page:
      ISitePageItem =
      await response.json();


    return page;

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

      .filter(
        (page) =>
          this._normaliseText(
            page.Title
          ).includes(
            'take 3'
          )
      )

      .sort(
        this._sortPagesNewestFirst
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

    /*
     * Same principle as Take 3:
     *
     * return everything here;
     * limit to three only inside the homepage component.
     */

    return pages

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
   * MAP SHAREPOINT PAGE -> KQ NEWS ITEM
   * ==========================================================
   */

  private _mapSitePage(
    page: ISitePageItem,
    type:
      'take3' |
      'pride'
  ): IKqCompanyNewsItem {

    const fileName = page.FileLeafRef || '';

    const displayName = fileName
      .replace(/\.aspx$/i, '')
      .replace(/-/g, ' ')
      .replace(/\(/g, ' (')
      .replace(/\s+/g, ' ')
      .trim();

    const title =
      displayName || page.Title || '';

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
          : undefined,

      /*
       * If this object came from getStoryById(),
       * CanvasContent1 will exist.
       *
       * For homepage/library objects it will remain
       * undefined.
       */
      contentHtml:
        page.CanvasContent1 ||
        undefined

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
     * Some SharePoint REST responses return image/hyperlink
     * fields as JSON strings.
     */

    if (
      typeof value === 'string'
    ) {

      try {

        const parsed:
          unknown =
          JSON.parse(
            value
          );


        if (
          parsed &&
          typeof parsed === 'object'
        ) {

          const imageData =
            parsed as {
              serverUrl?: unknown;
              serverRelativeUrl?: unknown;
              Url?: unknown;
              url?: unknown;
            };


          if (
            typeof imageData.serverUrl ===
            'string' &&
            typeof imageData.serverRelativeUrl ===
            'string'
          ) {

            return (
              imageData.serverUrl +
              imageData.serverRelativeUrl
            );

          }


          if (
            typeof imageData.serverRelativeUrl ===
            'string'
          ) {

            return (
              window.location.origin +
              imageData.serverRelativeUrl
            );

          }


          if (
            typeof imageData.Url ===
            'string'
          ) {

            return imageData.Url;

          }


          if (
            typeof imageData.url ===
            'string'
          ) {

            return imageData.url;

          }

        }

      } catch {

        /*
         * Not JSON.
         *
         * Treat it as a regular URL.
         */

        return this._makeAbsoluteUrl(
          value
        );

      }


      return '';

    }


    /*
     * SharePoint hyperlink object.
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