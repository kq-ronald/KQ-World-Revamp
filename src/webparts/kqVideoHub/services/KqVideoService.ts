import {
  SPHttpClient,
  SPHttpClientResponse
} from '@microsoft/sp-http';

import {
  WebPartContext
} from '@microsoft/sp-webpart-base';

import {
  IKqVideo
} from '../models/IKqVideo';

interface ISharePointVideoItem {
  Id: number;
  Title: string;

  VideoLink?:
    | {
        Url?: string;
      }
    | string;

  Thumbnail?:
    | {
        Url?: string;
      }
    | string;
}

export default class KqVideoService {
  private readonly _context:
    WebPartContext;

  private readonly _parentWebUrl:
    string;

  public constructor(
    context: WebPartContext
  ) {
    this._context = context;

    this._parentWebUrl =
      `${window.location.origin}/homepage`;
  }

  public async getVideos():
    Promise<IKqVideo[]> {

    const url =
      `${this._parentWebUrl}` +
      `/_api/web/lists/getbytitle('Videos')/items` +
      `?$select=Id,Title,Thumbnail,VideoLink` +
      `&$orderby=Created desc` +
      `&$top=12`;

    const response:
      SPHttpClientResponse =
        await this._context.spHttpClient.get(
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
      throw new Error(
        `Unable to load videos. ${response.status} ${response.statusText}`
      );
    }

    const data =
      await response.json();

    const items:
      ISharePointVideoItem[] =
        data.value || [];

    return items
      .map(
        (
          item:
            ISharePointVideoItem,
          index: number
        ): IKqVideo => ({
          id: item.Id,

          title:
            item.Title ||
            'KQ Video',

          videoUrl:
            this._getUrlValue(
              item.VideoLink
            ),

          thumbnailUrl:
            this._getUrlValue(
              item.Thumbnail
            ),

          /*
           * The existing Videos list does not
           * currently expose a confirmed category
           * field, so we keep all real items usable.
           *
           * Replace this with a real SharePoint
           * category field later if one exists.
           */
          category:
            index % 2 === 0
              ? 'beyond-terminal'
              : 'corporate-stories'
        })
      )
      .filter(
        (
          video: IKqVideo
        ) =>
          !!video.videoUrl
      );
  }

  public async getFeaturedVideo():
    Promise<IKqVideo | undefined> {

    const url =
      `${this._parentWebUrl}` +
      `/_api/web/lists/getbytitle('Streaming Videos')/items` +
      `?$select=Id,Title,VideoLink` +
      `&$orderby=Created desc` +
      `&$top=1`;

    const response:
      SPHttpClientResponse =
        await this._context.spHttpClient.get(
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
      return undefined;
    }

    const data =
      await response.json();

    const items:
      ISharePointVideoItem[] =
        data.value || [];

    if (items.length === 0) {
      return undefined;
    }

    const item =
      items[0];

    const videoUrl =
      this._getUrlValue(
        item.VideoLink
      );

    if (!videoUrl) {
      return undefined;
    }

    return {
      id: item.Id,

      title:
        item.Title ||
        'Featured Video',

      videoUrl,

      thumbnailUrl: '',

      category:
        'beyond-terminal'
    };
  }

  private _getUrlValue(
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
      typeof value ===
      'string'
    ) {
      return value;
    }

    return value.Url || '';
  }
}