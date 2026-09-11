import {
  SPHttpClient,
  SPHttpClientResponse
} from '@microsoft/sp-http';

import {
  WebPartContext
} from '@microsoft/sp-webpart-base';

import {
  IKqMoment,
  IKqMomentFolder,
  IKqMomentFolderContents,
  IKqMomentMetadata,
  IKqMomentUploadInput,
  IKqMomentUpdateInput
} from '../models/IKqMoment';

interface ISharePointFolder {
  Name?: string;
  ServerRelativeUrl?: string;
}

interface ISharePointFile {
  Name?: string;
  ServerRelativeUrl?: string;

  ListItemAllFields?: {
    Id?: number;
    Title?: string;
    Description?: string;

    IsPublished?:
      | boolean
      | number
      | string;

    PublishDate?: string;
  };
}

interface IRootFolderResponse {
  ServerRelativeUrl?: string;
}

interface IListItemIdResponse {
  Id?: number;
}

export default class MomentsService {
  private readonly _context:
    WebPartContext;

  private readonly _libraryName:
    string =
      'KQ Moments Dev';

  private _rootFolderUrl?:
    string;

  public constructor(
    context:
      WebPartContext
  ) {
    this._context =
      context;
  }

  public async getRootFolderUrl():
    Promise<string> {

    if (
      this._rootFolderUrl
    ) {
      return (
        this._rootFolderUrl
      );
    }

    const webUrl =
      this._context
        .pageContext
        .web
        .absoluteUrl;

    const url =
      `${webUrl}` +
      `/_api/web/lists/getbytitle('${this._libraryName}')` +
      `/RootFolder` +
      `?$select=ServerRelativeUrl`;

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
      'Unable to find the KQ Moments library.'
    );

    const data:
      IRootFolderResponse =
        await response.json();

    if (
      !data.ServerRelativeUrl
    ) {
      throw new Error(
        'SharePoint did not return the KQ Moments library path.'
      );
    }

    this._rootFolderUrl =
      data.ServerRelativeUrl;

    return (
      this._rootFolderUrl
    );
  }

  public async getFolderContents(
    folderUrl?: string
  ): Promise<IKqMomentFolderContents> {

    const currentFolderUrl =
      folderUrl ||
      await this.getRootFolderUrl();

    const results =
      await Promise.all([
        this._getFolders(
          currentFolderUrl
        ),

        this._getFiles(
          currentFolderUrl
        )
      ]);

    const folders =
      results[0];

    const moments =
      results[1];

    return {
      folderUrl:
        currentFolderUrl,

      folders,

      moments
    };
  }

  public async getMoment(
    id:
      number
  ): Promise<IKqMoment> {

    const webUrl =
      this._context
        .pageContext
        .web
        .absoluteUrl;

    const url =
      `${webUrl}` +
      `/_api/web/lists/getbytitle('${this._libraryName}')` +
      `/items(${id})` +
      `?$select=` +
      `Id,` +
      `Title,` +
      `Description,` +
      `IsPublished,` +
      `PublishDate,` +
      `FileLeafRef,` +
      `FileRef,` +
      `FileDirRef`;

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
      'Unable to load this KQ Moment.'
    );

    const item =
      await response.json();

    return {
      id:
        item.Id,

      title:
        item.Title || '',

      description:
        item.Description || '',

      isPublished:
        this._isPublished(
          item.IsPublished
        ),

      publishDate:
        item.PublishDate || undefined,

      fileName:
        item.FileLeafRef || '',

      fileUrl:
        this._toAbsoluteUrl(
          item.FileRef || ''
        ),

      folderUrl:
        item.FileDirRef || ''
    };
  }

  public async addMoment(
    input:
      IKqMomentUploadInput
  ): Promise<IKqMoment> {

    this._validateMetadata(
      input
    );

    this._validateImage(
      input.file
    );

    const targetFolder =
      input.folderUrl ||
      await this.getRootFolderUrl();

    const safeFileName =
      this._safeFileName(
        input.file.name
      );

    const uploadedFileUrl =
      await this._uploadFile(
        targetFolder,
        safeFileName,
        input.file
      );

    const itemId =
      await this._getFileItemId(
        uploadedFileUrl
      );

    await this._updateMetadata(
      itemId,
      input
    );

    return (
      this.getMoment(
        itemId
      )
    );
  }

  public async updateMoment(
    input:
      IKqMomentUpdateInput
  ): Promise<void> {

    this._validateMetadata(
      input
    );

    await this._updateMetadata(
      input.id,
      input
    );
  }

  public async setPublished(
    id:
      number,

    isPublished:
      boolean
  ): Promise<void> {

    const webUrl =
      this._context
        .pageContext
        .web
        .absoluteUrl;

    const url =
      `${webUrl}` +
      `/_api/web/lists/getbytitle('${this._libraryName}')` +
      `/items(${id})`;

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
      isPublished
        ? 'Unable to publish this KQ Moment.'
        : 'Unable to unpublish this KQ Moment.'
    );
  }

  public async createFolder(
    parentFolderUrl:
      string,

    folderName:
      string
  ): Promise<IKqMomentFolder> {

    const cleanName =
      folderName.trim();

    if (
      !cleanName
    ) {
      throw new Error(
        'Folder name is required.'
      );
    }

    if (
      /["*:<>?\/\\|#%]/.test(
        cleanName
      )
    ) {
      throw new Error(
        'The folder name contains characters that SharePoint does not allow.'
      );
    }

    const folderUrl =
      `${parentFolderUrl}/${cleanName}`;

    const webUrl =
      this._context
        .pageContext
        .web
        .absoluteUrl;

    const url =
      `${webUrl}` +
      `/_api/web/folders`;

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
                JSON.stringify({
                  ServerRelativeUrl:
                    folderUrl
                })
            }
          );

    await this._ensureSuccess(
      response,
      'Unable to create the folder.'
    );

    return {
      name:
        cleanName,

      serverRelativeUrl:
        folderUrl
    };
  }

  private async _getFolders(
    folderUrl:
      string
  ): Promise<IKqMomentFolder[]> {

    const webUrl =
      this._context
        .pageContext
        .web
        .absoluteUrl;

    const escapedFolderUrl =
      this._escapeODataString(
        folderUrl
      );

    const url =
      `${webUrl}` +
      `/_api/web/GetFolderByServerRelativeUrl('${escapedFolderUrl}')` +
      `/Folders` +
      `?$select=Name,ServerRelativeUrl`;

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
      'Unable to load KQ Moments folders.'
    );

    const data:
      {
        value:
          ISharePointFolder[];
      } =
        await response.json();

    return (
      data.value || []
    )
      .filter(
        (
          folder:
            ISharePointFolder
        ) =>
          !!folder.Name &&
          !!folder.ServerRelativeUrl &&
          folder.Name !==
            'Forms'
      )
      .map(
        (
          folder:
            ISharePointFolder
        ): IKqMomentFolder => ({
          name:
            folder.Name || '',

          serverRelativeUrl:
            folder.ServerRelativeUrl || ''
        })
      )
      .sort(
        (
          first,
          second
        ) =>
          first.name.localeCompare(
            second.name
          )
      );
  }

  private async _getFiles(
    folderUrl:
      string
  ): Promise<IKqMoment[]> {

    const webUrl =
      this._context
        .pageContext
        .web
        .absoluteUrl;

    const escapedFolderUrl =
      this._escapeODataString(
        folderUrl
      );

    const url =
      `${webUrl}` +
      `/_api/web/GetFolderByServerRelativeUrl('${escapedFolderUrl}')` +
      `/Files` +
      `?$expand=ListItemAllFields`;

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
      'Unable to load images from this folder.'
    );

    const data:
      {
        value:
          ISharePointFile[];
      } =
        await response.json();

    return (
      data.value || []
    )
      .filter(
        (
          file:
            ISharePointFile
        ) =>
          this._isImageFile(
            file.Name || ''
          )
      )
      .map(
        (
          file:
            ISharePointFile
        ): IKqMoment => {

          const item =
            file.ListItemAllFields ||
            {};

          return {
            id:
              item.Id || 0,

            title:
              item.Title ||
              file.Name ||
              '',

            description:
              item.Description || '',

            isPublished:
              this._isPublished(
                item.IsPublished
              ),

            publishDate:
              item.PublishDate ||
              undefined,

            fileName:
              file.Name || '',

            fileUrl:
              this._toAbsoluteUrl(
                file.ServerRelativeUrl ||
                ''
              ),

            folderUrl
          };
        }
      )
      .sort(
        (
          first,
          second
        ) =>
          this._dateValue(
            second.publishDate
          ) -
          this._dateValue(
            first.publishDate
          )
      );
  }

  private async _uploadFile(
    folderUrl:
      string,

    fileName:
      string,

    file:
      File
  ): Promise<string> {

    const webUrl =
      this._context
        .pageContext
        .web
        .absoluteUrl;

    const escapedFolderUrl =
      this._escapeODataString(
        folderUrl
      );

    const escapedFileName =
      this._escapeODataString(
        fileName
      );

    const url =
      `${webUrl}` +
      `/_api/web/GetFolderByServerRelativeUrl('${escapedFolderUrl}')` +
      `/Files/add(` +
      `url='${escapedFileName}',` +
      `overwrite=false` +
      `)` +
      `?$select=ServerRelativeUrl`;

    const fileBuffer =
      await file.arrayBuffer();

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
                  'application/json;odata=nometadata'
              },

              body:
                fileBuffer
            }
          );

    await this._ensureSuccess(
      response,
      'Unable to upload the KQ Moment image.'
    );

    const data:
      {
        ServerRelativeUrl?:
          string;
      } =
        await response.json();

    if (
      !data.ServerRelativeUrl
    ) {
      throw new Error(
        'The image uploaded, but SharePoint did not return its file path.'
      );
    }

    return (
      data.ServerRelativeUrl
    );
  }

  private async _getFileItemId(
    fileUrl:
      string
  ): Promise<number> {

    const webUrl =
      this._context
        .pageContext
        .web
        .absoluteUrl;

    const escapedFileUrl =
      this._escapeODataString(
        fileUrl
      );

    const url =
      `${webUrl}` +
      `/_api/web/GetFileByServerRelativeUrl('${escapedFileUrl}')` +
      `/ListItemAllFields` +
      `?$select=Id`;

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
      'Unable to find the uploaded Moment metadata.'
    );

    const data:
      IListItemIdResponse =
        await response.json();

    if (
      !data.Id
    ) {
      throw new Error(
        'SharePoint did not return the uploaded Moment item ID.'
      );
    }

    return (
      data.Id
    );
  }

  private async _updateMetadata(
    id:
      number,

    metadata:
      IKqMomentMetadata
  ): Promise<void> {

    const webUrl =
      this._context
        .pageContext
        .web
        .absoluteUrl;

    const url =
      `${webUrl}` +
      `/_api/web/lists/getbytitle('${this._libraryName}')` +
      `/items(${id})`;

    const payload = {
      Title:
        metadata.title.trim(),

      Description:
        metadata.description.trim(),

      IsPublished:
        metadata.isPublished,

      PublishDate:
        metadata.publishDate
          ? new Date(
              metadata.publishDate
            ).toISOString()
          : null
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
      'Unable to update the KQ Moment.'
    );
  }

  private _validateMetadata(
    metadata:
      IKqMomentMetadata
  ): void {

    if (
      !metadata.title ||
      !metadata.title.trim()
    ) {
      throw new Error(
        'Moment title is required.'
      );
    }

    if (
      metadata.publishDate
    ) {
      const date =
        new Date(
          metadata.publishDate
        );

      if (
        isNaN(
          date.getTime()
        )
      ) {
        throw new Error(
          'Enter a valid publish date.'
        );
      }
    }
  }

  private _validateImage(
    file:
      File
  ): void {

    if (
      !file
    ) {
      throw new Error(
        'Select an image to upload.'
      );
    }

    const fileName =
      file.name.toLowerCase();

    const validExtension =
      /\.(jpg|jpeg|png|webp)$/i.test(
        fileName
      );

    const validMimeType =
      file.type ===
        'image/jpeg' ||
      file.type ===
        'image/png' ||
      file.type ===
        'image/webp' ||
      file.type ===
        '';

    if (
      !validExtension ||
      !validMimeType
    ) {
      throw new Error(
        'KQ Moments images must be JPG, PNG or WebP.'
      );
    }
  }

  private _isImageFile(
    fileName:
      string
  ): boolean {

    return (
      /\.(jpg|jpeg|png|webp)$/i.test(
        fileName
      )
    );
  }

  private _isPublished(
    value:
      | boolean
      | number
      | string
      | undefined
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

  private _dateValue(
    value?:
      string
  ): number {

    if (
      !value
    ) {
      return 0;
    }

    const date =
      new Date(
        value
      );

    const time =
      date.getTime();

    return (
      isNaN(
        time
      )
        ? 0
        : time
    );
  }

  private _toAbsoluteUrl(
    serverRelativeUrl:
      string
  ): string {

    if (
      !serverRelativeUrl
    ) {
      return '';
    }

    if (
      serverRelativeUrl.indexOf(
        'http://'
      ) === 0 ||
      serverRelativeUrl.indexOf(
        'https://'
      ) === 0
    ) {
      return (
        serverRelativeUrl
      );
    }

    return (
      window.location.origin +
      serverRelativeUrl
    );
  }

  private _safeFileName(
    fileName:
      string
  ): string {

    return (
      fileName
        .replace(
          /[#%&*:<>?\/\\{|}~"]/g,
          '_'
        )
        .trim()
    );
  }

  private _escapeODataString(
    value:
      string
  ): string {

    return (
      value.replace(
        /'/g,
        "''"
      )
    );
  }

  private async _ensureSuccess(
    response:
      SPHttpClientResponse,

    message:
      string
  ): Promise<void> {

    if (
      response.ok
    ) {
      return;
    }

    const responseText =
      await response.text();

    console.error(
      message,
      response.status,
      response.statusText,
      responseText
    );

    throw new Error(
      `${message} SharePoint returned ${response.status}.`
    );
  }
}