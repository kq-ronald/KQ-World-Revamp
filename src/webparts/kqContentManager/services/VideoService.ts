import {
  SPHttpClient,
  SPHttpClientResponse
} from '@microsoft/sp-http';

import {
  WebPartContext
} from '@microsoft/sp-webpart-base';

import {
  IVideo,
  IVideoInput,
  IVideoUpdateInput
} from '../models/IVideo';

interface ISharePointVideoItem {
  Id: number;
  Title?: string;

  VideoUrl?:
    | string
    | {
        Url?: string;
        Description?: string;
      };

  Thumbnail?: string;
  Category?: string;
  IsPublished?: boolean;
  DisplayOrder?: number;
}

export class VideoService {
  private readonly _context:
    WebPartContext;

  private readonly _listName =
    'KQ Videos Dev';

  private readonly _categories:
    string[] = [
      'Beyond The Terminal',
      'Corporate Stories'
    ];

  public constructor(
    context: WebPartContext
  ) {
    this._context =
      context;
  }

  public getCategories():
    string[] {

    return [
      ...this._categories
    ];
  }

  public async getVideos():
    Promise<IVideo[]> {

    const webUrl =
      this._context
        .pageContext
        .web
        .absoluteUrl;

    const url =
      `${webUrl}` +
      `/_api/web/lists/getbytitle('${this._listName}')/items` +
      `?$select=` +
      `Id,` +
      `Title,` +
      `VideoUrl,` +
      `Thumbnail,` +
      `Category,` +
      `IsPublished,` +
      `DisplayOrder` +
      `&$orderby=DisplayOrder asc`;

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

    await this._ensureSuccess(
      response,
      'Unable to load Videos.'
    );

    const data:
      {
        value:
          ISharePointVideoItem[];
      } =
        await response.json();

    return (
      data.value || []
    ).map(
      (
        item:
          ISharePointVideoItem
      ): IVideo => ({
        id:
          item.Id,

        title:
          item.Title || '',

        videoUrl:
          this._getUrlValue(
            item.VideoUrl
          ),

        thumbnailUrl:
          this._getImageUrl(
            item.Thumbnail
          ),

        category:
          item.Category || '',

        isPublished:
          item.IsPublished === true,

        displayOrder:
          typeof item.DisplayOrder ===
          'number'
            ? item.DisplayOrder
            : 9999
      })
    );
  }

  public async addVideo(
    input:
      IVideoInput
  ): Promise<void> {

    this._validateInput(
      input
    );

    await this._validateDisplayOrder(
      input.displayOrder
    );

    const itemId =
      await this._createListItem(
        input
      );

    if (
      input.thumbnailFile
    ) {
      const thumbnailUrl =
        await this._uploadThumbnail(
          itemId,
          input.thumbnailFile
        );

      await this._updateThumbnailField(
        itemId,
        thumbnailUrl,
        input.thumbnailFile.name
      );
    }
  }

  public async updateVideo(
    input:
      IVideoUpdateInput
  ): Promise<void> {

    this._validateInput(
      input
    );

    await this._validateDisplayOrder(
      input.displayOrder,
      input.id
    );

    const webUrl =
      this._context
        .pageContext
        .web
        .absoluteUrl;

    const url =
      `${webUrl}` +
      `/_api/web/lists/getbytitle('${this._listName}')/items(${input.id})`;

    const payload = {
      Title:
        input.title.trim(),

      VideoUrl: {
        Url:
          input.videoUrl.trim(),

        Description:
          input.title.trim()
      },

      Category:
        input.category,

      IsPublished:
        input.isPublished,

      DisplayOrder:
        input.displayOrder
    };

    const response:
      SPHttpClientResponse =
        await this._context
          .spHttpClient
          .post(
            url,
            SPHttpClient
              .configurations
              .v1,
            {
              headers: {
                Accept:
                  'application/json;odata=nometadata',

                'Content-Type':
                  'application/json;odata=nometadata',

                'IF-MATCH':
                  '*',

                'X-HTTP-Method':
                  'MERGE'
              },

              body:
                JSON.stringify(
                  payload
                )
            }
          );

    await this._ensureSuccess(
      response,
      'Unable to update Video.'
    );

    if (
      input.thumbnailFile
    ) {
      const thumbnailUrl =
        await this._uploadThumbnail(
          input.id,
          input.thumbnailFile
        );

      await this._updateThumbnailField(
        input.id,
        thumbnailUrl,
        input.thumbnailFile.name
      );
    }
  }

  public async setPublished(
    id: number,
    isPublished: boolean
  ): Promise<void> {

    const webUrl =
      this._context
        .pageContext
        .web
        .absoluteUrl;

    const url =
      `${webUrl}` +
      `/_api/web/lists/getbytitle('${this._listName}')/items(${id})`;

    const response:
      SPHttpClientResponse =
        await this._context
          .spHttpClient
          .post(
            url,
            SPHttpClient
              .configurations
              .v1,
            {
              headers: {
                Accept:
                  'application/json;odata=nometadata',

                'Content-Type':
                  'application/json;odata=nometadata',

                'IF-MATCH':
                  '*',

                'X-HTTP-Method':
                  'MERGE'
              },

              body:
                JSON.stringify({
                  IsPublished:
                    isPublished
                })
            }
          );

    await this._ensureSuccess(
      response,
      'Unable to update Video publication status.'
    );
  }

  private async _createListItem(
    input:
      IVideoInput
  ): Promise<number> {

    const webUrl =
      this._context
        .pageContext
        .web
        .absoluteUrl;

    const url =
      `${webUrl}` +
      `/_api/web/lists/getbytitle('${this._listName}')/items`;

    const payload = {
      Title:
        input.title.trim(),

      VideoUrl: {
        Url:
          input.videoUrl.trim(),

        Description:
          input.title.trim()
      },

      Category:
        input.category,

      IsPublished:
        input.isPublished,

      DisplayOrder:
        input.displayOrder
    };

    const response:
      SPHttpClientResponse =
        await this._context
          .spHttpClient
          .post(
            url,
            SPHttpClient
              .configurations
              .v1,
            {
              headers: {
                Accept:
                  'application/json;odata=nometadata',

                'Content-Type':
                  'application/json;odata=nometadata'
              },

              body:
                JSON.stringify(
                  payload
                )
            }
          );

    await this._ensureSuccess(
      response,
      'Unable to create Video.'
    );

    const item =
      await response.json();

    return item.Id;
  }

  private async _uploadThumbnail(
    itemId: number,
    file: File
  ): Promise<string> {

    const webUrl =
      this._context
        .pageContext
        .web
        .absoluteUrl;

    const safeFileName =
      this._safeFileName(
        file.name
      );

    const attachmentUrl =
      `${webUrl}` +
      `/_api/web/lists/getbytitle('${this._listName}')` +
      `/items(${itemId})` +
      `/AttachmentFiles/add(FileName='${encodeURIComponent(
        safeFileName
      )}')`;

    const response:
      SPHttpClientResponse =
        await this._context
          .spHttpClient
          .post(
            attachmentUrl,
            SPHttpClient
              .configurations
              .v1,
            {
              headers: {
                Accept:
                  'application/json;odata=nometadata'
              },

              body:
                await file.arrayBuffer()
            }
          );

    await this._ensureSuccess(
      response,
      'Unable to upload Video thumbnail.'
    );

    const data:
      {
        ServerRelativeUrl?: string;
      } =
        await response.json();

    if (
      !data.ServerRelativeUrl
    ) {
      throw new Error(
        'Thumbnail uploaded but SharePoint did not return its URL.'
      );
    }

    return (
      window.location.origin +
      data.ServerRelativeUrl
    );
  }

  private async _updateThumbnailField(
    itemId: number,
    thumbnailUrl: string,
    fileName: string
  ): Promise<void> {

    const webUrl =
      this._context
        .pageContext
        .web
        .absoluteUrl;

    const url =
      `${webUrl}` +
      `/_api/web/lists/getbytitle('${this._listName}')/items(${itemId})`;

    const absoluteUrl =
      new URL(
        thumbnailUrl
      );

    const imageValue =
      JSON.stringify({
        type:
          'thumbnail',

        fileName:
          fileName,

        serverUrl:
          absoluteUrl.origin,

        serverRelativeUrl:
          absoluteUrl.pathname
      });

    const response:
      SPHttpClientResponse =
        await this._context
          .spHttpClient
          .post(
            url,
            SPHttpClient
              .configurations
              .v1,
            {
              headers: {
                Accept:
                  'application/json;odata=nometadata',

                'Content-Type':
                  'application/json;odata=nometadata',

                'IF-MATCH':
                  '*',

                'X-HTTP-Method':
                  'MERGE'
              },

              body:
                JSON.stringify({
                  Thumbnail:
                    imageValue
                })
            }
          );

    await this._ensureSuccess(
      response,
      'Unable to save Video thumbnail.'
    );
  }

  private async _validateDisplayOrder(
    displayOrder: number,
    currentId?: number
  ): Promise<void> {

    const videos =
      await this.getVideos();

    const duplicate =
      videos.some(
        (video) =>
          video.displayOrder ===
            displayOrder &&
          video.id !==
            currentId
      );

    if (duplicate) {
      throw new Error(
        `Display Order ${displayOrder} is already being used by another Video.`
      );
    }
  }

  private _validateInput(
    input:
      IVideoInput
  ): void {

    if (
      !input.title.trim()
    ) {
      throw new Error(
        'Video title is required.'
      );
    }

    if (
      !input.videoUrl.trim()
    ) {
      throw new Error(
        'Video URL is required.'
      );
    }

    if (
      !this._isValidUrl(
        input.videoUrl
      )
    ) {
      throw new Error(
        'Enter a valid Video URL.'
      );
    }

    if (
      this._categories.indexOf(
        input.category
      ) === -1
    ) {
      throw new Error(
        'Select a valid Video category.'
      );
    }

    if (
      !Number.isInteger(
        input.displayOrder
      ) ||
      input.displayOrder < 1
    ) {
      throw new Error(
        'Display Order must be a whole number greater than 0.'
      );
    }
  }

  private _isValidUrl(
    value: string
  ): boolean {

    try {
      new URL(
        value,
        window.location.origin
      );

      return true;
    } catch {
      return false;
    }
  }

  private _safeFileName(
    value: string
  ): string {

    return value.replace(
      /[#%&*:<>?\/\\{|}~]/g,
      '_'
    );
  }

  private _getUrlValue(
    value:
      ISharePointVideoItem[
        'VideoUrl'
      ]
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
    value?: string
  ): string {

    if (!value) {
      return '';
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
      return value;
    }

    return '';
  }

  private async _ensureSuccess(
    response:
      SPHttpClientResponse,
    message: string
  ): Promise<void> {

    if (
      response.ok
    ) {
      return;
    }

    const errorText =
      await response.text();

    console.error(
      message,
      response.status,
      errorText
    );

    throw new Error(
      `${message} SharePoint returned ${response.status}.`
    );
  }
}