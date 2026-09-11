import {
  SPHttpClient,
  SPHttpClientResponse
} from '@microsoft/sp-http';

import {
  WebPartContext
} from '@microsoft/sp-webpart-base';

import {
  IKqVideo,
  KqVideoCategory
} from '../models/IKqVideo';

interface ISharePointVideoItem {
  Id: number;
  Title?: string;

  VideoUrl?:
    | string
    | {
        Url?: string;
        Description?: string;
      };

  Thumbnail?:
    | string
    | {
        Url?: string;
      };

  Category?: string;

  IsPublished?:
    | boolean
    | number
    | string;

  DisplayOrder?: number;
}

export default class KqVideoService {
  private readonly _context:
    WebPartContext;

  private readonly _listName =
    'KQ Videos Dev';

  public constructor(
    context: WebPartContext
  ) {
    this._context =
      context;
  }

  public async getVideos():
    Promise<IKqVideo[]> {

    const webUrl =
      this._context
        .pageContext
        .web
        .absoluteUrl;

    const url =
      `${webUrl}` +
      `/_api/web/lists/getbytitle('${this._listName}')/items` +
      `?$top=100`;

    console.log(
      'KQ Videos DEV request:',
      url
    );

    const response:
      SPHttpClientResponse =
        await this._context
          .spHttpClient
          .get(
            url,
            SPHttpClient
              .configurations
              .v1,
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
        'KQ Videos DEV SharePoint error:',
        response.status,
        response.statusText,
        errorText
      );

      throw new Error(
        `Unable to load videos. SharePoint returned ${response.status}.`
      );
    }

    const data:
      {
        value:
          ISharePointVideoItem[];
      } =
        await response.json();

    const items =
      data.value || [];

    console.log(
      'KQ Videos DEV raw items:',
      items
    );

    if (
      items.length > 0
    ) {
      console.log(
        'KQ Videos DEV field names:',
        Object.keys(
          items[0]
        )
      );
    }

    return items
      .filter(
        (
          item:
            ISharePointVideoItem
        ) =>
          this._isPublished(
            item.IsPublished
          )
      )
      .sort(
        (
          first,
          second
        ) =>
          this._getDisplayOrder(
            first
          ) -
          this._getDisplayOrder(
            second
          )
      )
      .map(
        (
          item:
            ISharePointVideoItem
        ): IKqVideo => ({
          id:
            item.Id,

          title:
            item.Title ||
            'KQ Video',

          videoUrl:
            this._getUrlValue(
              item.VideoUrl
            ),

          thumbnailUrl:
            this._getImageUrl(
              item.Thumbnail
            ),

          category:
            this._mapCategory(
              item.Category
            )
        })
      )
      .filter(
        (
          video:
            IKqVideo
        ) =>
          !!video.videoUrl
      );
  }

  private _isPublished(
    value:
      boolean |
      number |
      string |
      undefined
  ): boolean {

    return (
      value === true ||
      value === 1 ||
      String(
        value
      ).toLowerCase() ===
        'true'
    );
  }

  private _getDisplayOrder(
    item:
      ISharePointVideoItem
  ): number {

    return (
      typeof item.DisplayOrder ===
      'number'
        ? item.DisplayOrder
        : 9999
    );
  }

  private _mapCategory(
    value?: string
  ): KqVideoCategory {

    const category =
      (
        value || ''
      )
        .trim()
        .toLowerCase();

    if (
      category ===
        'corporate stories' ||
      category ===
        'corporate-stories'
    ) {
      return (
        'corporate-stories'
      );
    }

    return (
      'beyond-terminal'
    );
  }

  private _getUrlValue(
    value:
      | string
      | {
          Url?: string;
          Description?: string;
        }
      | undefined
  ): string {

    if (!value) {
      return '';
    }

    if (
      typeof value ===
      'string'
    ) {
      return value;
    }

    return (
      value.Url || ''
    );
  }

  private _getImageUrl(
    value:
      | string
      | {
          Url?: string;
        }
      | undefined
  ): string {

    if (!value) {
      return '';
    }

    if (
      typeof value !==
      'string'
    ) {
      return (
        value.Url || ''
      );
    }

    try {
      const parsed =
        JSON.parse(
          value
        );

      if (
        parsed &&
        typeof parsed ===
        'object'
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
          return (
            parsed.Url
          );
        }

        if (
          typeof parsed.url ===
          'string'
        ) {
          return (
            parsed.url
          );
        }
      }
    } catch {
      if (
        value.indexOf(
          'http://'
        ) === 0 ||
        value.indexOf(
          'https://'
        ) === 0
      ) {
        return value;
      }

      if (
        value.indexOf(
          '/'
        ) === 0
      ) {
        return (
          window.location.origin +
          value
        );
      }
    }

    return '';
  }
}