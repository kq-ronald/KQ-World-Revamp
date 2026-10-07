import {
  SPHttpClient,
  SPHttpClientResponse,
  MSGraphClientV3
} from '@microsoft/sp-http';

import {
  WebPartContext
} from '@microsoft/sp-webpart-base';

import {
  IKqMoment,
  IKqGalleryImage
} from '../models/IKqMoment';


interface ISharePointMomentItem {

  Id:
    number;

  Title:
    string;

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


interface IGraphDriveItem {

  id:
    string;

  name:
    string;

  webUrl?:
    string;

  '@microsoft.graph.downloadUrl'?:
    string;

  file?: {
    mimeType?:
      string;
  };

  folder?: {
    childCount?:
      number;
  };
}


interface IGraphChildrenResponse {

  value?:
    IGraphDriveItem[];

  '@odata.nextLink'?:
    string;
}


export default class KqMomentsService {

  private readonly _context:
    WebPartContext;

  private readonly _parentWebUrl:
    string;


  public constructor(
    context:
      WebPartContext
  ) {

    this._context =
      context;


    /*
     * Your Events list lives here.
     */

    this._parentWebUrl =
      `${window.location.origin}/homepage`;
  }


  /* ============================================================
     LOAD KQ MOMENTS
     ============================================================ */

  public async getMoments():
    Promise<IKqMoment[]> {

    const url =
      `${this._parentWebUrl}` +
      `/_api/web/lists/getbytitle('Events')/items` +
      `?$select=Id,Title,EventUrl,Poster` +
      `&$orderby=Created desc` +
      `&$top=20`;


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


    if (
      !response.ok
    ) {

      const errorText =
        await response.text();


      console.error(
        'KQ Moments list request failed:',
        {
          status:
            response.status,

          statusText:
            response.statusText,

          url,

          response:
            errorText
        }
      );


      throw new Error(
        `Unable to load KQ Moments. ` +
        `${response.status}`
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


  /* ============================================================
     LOAD GALLERY
     ============================================================ */

  public async getGalleryImages(
    galleryUrl:
      string
  ): Promise<IKqGalleryImage[]> {

    if (
      !galleryUrl
    ) {

      console.warn(
        'KQ Moments: gallery URL is empty.'
      );

      return [];
    }


    console.log(
      'KQ Moments EventUrl:',
      galleryUrl
    );


    /*
     * Your EventUrl is a SharePoint sharing link:
     *
     * https://tenant.sharepoint.com/:f:/g/...
     *
     * It is NOT a normal folder URL.
     *
     * Graph /shares lets us resolve it.
     */

    if (
      this._isSharingUrl(
        galleryUrl
      )
    ) {

      return this._loadSharedFolderImages(
        galleryUrl
      );
    }


    /*
     * Keep REST support for future CMS galleries
     * that save a normal SharePoint folder URL.
     */

    return this._loadNormalFolderImages(
      galleryUrl
    );
  }


  /* ============================================================
     SHAREPOINT SHARING LINK
     ============================================================ */

  private _isSharingUrl(
    url:
      string
  ): boolean {

    return (
      url.indexOf(
        '/:f:/'
      ) !== -1 ||
      url.indexOf(
        '/:i:/'
      ) !== -1 ||
      url.indexOf(
        '/:u:/'
      ) !== -1
    );
  }


  /* ============================================================
     LOAD SHARED FOLDER THROUGH GRAPH
     ============================================================ */

  private async _loadSharedFolderImages(
    sharingUrl:
      string
  ): Promise<IKqGalleryImage[]> {

    try {

      const graphClient:
        MSGraphClientV3 =
        await this._context
          .msGraphClientFactory
          .getClient('3');


      /*
       * Graph requires a sharing URL to be encoded as:
       *
       * u!{base64url}
       */

      const shareId =
        this._encodeSharingUrl(
          sharingUrl
        );


      console.log(
        'KQ Moments Graph share ID:',
        shareId
      );


      /*
       * First resolve the shared link itself.
       */

      const sharedItem:
        IGraphDriveItem =
        await graphClient
          .api(
            `/shares/${shareId}/driveItem`
          )
          .select(
            'id,name,webUrl,folder,file'
          )
          .get();


      console.log(
        'KQ Moments resolved shared item:',
        sharedItem
      );


      if (
        !sharedItem ||
        !sharedItem.id
      ) {

        throw new Error(
          'The shared gallery could not be resolved.'
        );
      }


      /*
       * The EventUrl should point to a folder.
       */

      if (
        !sharedItem.folder
      ) {

        console.warn(
          'KQ Moments EventUrl did not resolve to a folder:',
          sharedItem
        );


        return [];
      }


      /*
       * Graph can address children directly through
       * the sharing resource.
       */

      return this._loadSharedFolderChildren(
        graphClient,
        shareId
      );


    } catch (
      error
    ) {

      console.error(
        'KQ Moments Graph gallery error:',
        error
      );


      const message =
        this._getErrorMessage(
          error
        );


      throw new Error(
        `Unable to load gallery. ${message}`
      );
    }
  }


  /* ============================================================
     LOAD ALL CHILDREN
     ============================================================ */

  private async _loadSharedFolderChildren(
    graphClient:
      MSGraphClientV3,

    shareId:
      string
  ): Promise<IKqGalleryImage[]> {

    const images:
      IKqGalleryImage[] =
      [];


    let request:
      string |
      undefined =
      `/shares/${shareId}/driveItem/children`;


    while (
      request
    ) {

      const response:
        IGraphChildrenResponse =
        await graphClient
          .api(
            request
          )
          .select(
            'id,name,webUrl,file,folder,@microsoft.graph.downloadUrl'
          )
          .top(
            200
          )
          .get();


      const children =
        response.value ||
        [];


      children.forEach(
        (
          child:
            IGraphDriveItem
        ) => {

          if (
            !child.file ||
            !this._isImage(
              child.name
            )
          ) {

            return;
          }


          const imageUrl =
            child[
              '@microsoft.graph.downloadUrl'
            ] ||
            child.webUrl ||
            '';


          if (
            !imageUrl
          ) {

            return;
          }


          images.push({

            name:
              child.name,

            url:
              imageUrl,

            serverRelativeUrl:
              child.webUrl ||
              imageUrl

          });
        }
      );


      request =
        response[
          '@odata.nextLink'
        ];
    }


    console.log(
      'KQ Moments gallery images:',
      images
    );


    return images;
  }


  /* ============================================================
     NORMAL SHAREPOINT FOLDER FALLBACK
     ============================================================ */

  private async _loadNormalFolderImages(
    galleryUrl:
      string
  ): Promise<IKqGalleryImage[]> {

    try {

      const parsedUrl =
        new URL(
          galleryUrl,
          window.location.origin
        );


      const id =
        parsedUrl.searchParams.get(
          'id'
        );


      const rootFolder =
        parsedUrl.searchParams.get(
          'RootFolder'
        );


      let folderPath =
        id ||
        rootFolder ||
        parsedUrl.pathname;


      folderPath =
        this._safeDecode(
          folderPath
        );


      /*
       * Remove SharePoint Forms/AllItems.aspx.
       */

      const formsIndex =
        folderPath
          .toLowerCase()
          .indexOf(
            '/forms/'
          );


      if (
        formsIndex !==
          -1
      ) {

        folderPath =
          folderPath.substring(
            0,
            formsIndex
          );
      }


      if (
        !folderPath.startsWith(
          '/'
        )
      ) {

        folderPath =
          `/${folderPath}`;
      }


      while (
        folderPath.length >
          1 &&
        folderPath.endsWith(
          '/'
        )
      ) {

        folderPath =
          folderPath.substring(
            0,
            folderPath.length - 1
          );
      }


      const webUrl =
        this._resolveWebUrl(
          folderPath,
          parsedUrl.origin
        );


      const escapedFolder =
        folderPath.replace(
          /'/g,
          "''"
        );


      const requestUrl =
        `${webUrl}` +
        `/_api/web/GetFolderByServerRelativePath(` +
        `decodedUrl='${escapedFolder}')/Files` +
        `?$select=Name,ServerRelativeUrl`;


      console.log(
        'KQ Moments REST gallery request:',
        requestUrl
      );


      const response:
        SPHttpClientResponse =
        await this._context
          .spHttpClient
          .get(
            requestUrl,

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


      if (
        !response.ok
      ) {

        const errorText =
          await response.text();


        console.error(
          'KQ Moments REST gallery failed:',
          {
            status:
              response.status,

            requestUrl,

            response:
              errorText
          }
        );


        throw new Error(
          `${response.status}`
        );
      }


      const data =
        await response.json();


      const files:
        Array<{
          Name:
            string;

          ServerRelativeUrl:
            string;
        }> =
        data.value || [];


      return files

        .filter(
          file =>
            this._isImage(
              file.Name
            )
        )

        .map(
          file => ({

            name:
              file.Name,

            serverRelativeUrl:
              file.ServerRelativeUrl,

            url:
              `${window.location.origin}` +
              file.ServerRelativeUrl

          })
        );


    } catch (
      error
    ) {

      console.error(
        'KQ Moments normal gallery error:',
        error
      );


      throw new Error(
        `Unable to load gallery. ` +
        this._getErrorMessage(
          error
        )
      );
    }
  }


  /* ============================================================
     RESOLVE SHAREPOINT WEB
     ============================================================ */

  private _resolveWebUrl(
    folderPath:
      string,

    origin:
      string
  ): string {

    const sitesMatch =
      folderPath.match(
        /^\/sites\/[^/]+/i
      );


    if (
      sitesMatch &&
      sitesMatch[0]
    ) {

      return (
        origin +
        sitesMatch[0]
      );
    }


    const teamsMatch =
      folderPath.match(
        /^\/teams\/[^/]+/i
      );


    if (
      teamsMatch &&
      teamsMatch[0]
    ) {

      return (
        origin +
        teamsMatch[0]
      );
    }


    if (
      folderPath
        .toLowerCase()
        .indexOf(
          '/homepage'
        ) ===
        0
    ) {

      return (
        origin +
        '/homepage'
      );
    }


    return this._parentWebUrl;
  }


  /* ============================================================
     GRAPH SHARING URL ENCODING
     ============================================================ */

  private _encodeSharingUrl(
    sharingUrl:
      string
  ): string {

    /*
     * Graph sharing token format:
     *
     * u! + base64url(url)
     *
     * Browser btoa() only accepts byte-safe strings,
     * so first convert the URL into UTF-8 bytes.
     */

    const utf8 =
      unescape(
        encodeURIComponent(
          sharingUrl
        )
      );


    const base64 =
      window.btoa(
        utf8
      );


    return (
      'u!' +
      base64
        .replace(
          /=+$/g,
          ''
        )
        .replace(
          /\//g,
          '_'
        )
        .replace(
          /\+/g,
          '-'
        )
    );
  }


  /* ============================================================
     IMAGE CHECK
     ============================================================ */

  private _isImage(
    fileName:
      string
  ): boolean {

    const extension =
      fileName
        .split('.')
        .pop()
        ?.toLowerCase();


    return [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'webp',
      'bmp',
      'svg'
    ].indexOf(
      extension ||
      ''
    ) !==
      -1;
  }


  /* ============================================================
     SAFE DECODE
     ============================================================ */

  private _safeDecode(
    value:
      string
  ): string {

    try {

      return decodeURIComponent(
        value
      );

    } catch {

      return value;
    }
  }


  /* ============================================================
     ERROR MESSAGE
     ============================================================ */

  private _getErrorMessage(
    error:
      unknown
  ): string {

    if (
      error instanceof
        Error
    ) {

      return error.message;
    }


    if (
      typeof error ===
        'string'
    ) {

      return error;
    }


    return 'The gallery could not be loaded.';
  }


  /* ============================================================
     SHAREPOINT URL FIELD
     ============================================================ */

  private _getUrlValue(
    value:
      | string
      | {
          Url?: string;
        }
      | undefined
  ): string {

    if (
      !value
    ) {

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