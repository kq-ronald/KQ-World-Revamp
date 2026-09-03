import {
  SPHttpClient,
  SPHttpClientResponse
} from '@microsoft/sp-http';

import {
  WebPartContext
} from '@microsoft/sp-webpart-base';

import {
  IKqMoment
} from '../models/IKqMoment';

interface ISharePointMomentItem {
  Id: number;
  Title: string;

  EventUrl?:
    | string
    | {
        Url?: string;
      };

  Poster?:
    | string
    | {
        Url?: string;
      };
}

export default class KqMomentsService {
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

  public async getMoments():
    Promise<IKqMoment[]> {

    const url =
      `${this._parentWebUrl}` +
      `/_api/web/lists/getbytitle('Events')/items` +
      `?$select=Id,Title,EventUrl,Poster` +
      `&$orderby=Created desc` +
      `&$top=4`;

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
        `Unable to load KQ Moments. ${response.status} ${response.statusText}`
      );
    }

    const data =
      await response.json();

    const items:
      ISharePointMomentItem[] =
      data.value || [];

    return items
      .map(
        (
          item:
            ISharePointMomentItem
        ): IKqMoment => ({
          id:
            item.Id,

          title:
            item.Title ||
            'KQ Moment',

          imageUrl:
            this._getUrlValue(
              item.Poster
            ),

          galleryUrl:
            this._getUrlValue(
              item.EventUrl
            )
        })
      )
      .filter(
        (
          item:
            IKqMoment
        ) =>
          !!item.imageUrl
      );
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