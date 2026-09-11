import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  SPHttpClient,
  SPHttpClientResponse
} from '@microsoft/sp-http';

import { IBanner } from '../models/IBanner';

export interface IBannerMetadataInput {
  title: string;
  ctaText: string;
  ctaUrl: string;
  displayOrder: number;
  isPublished: boolean;
  startDate?: string;
  endDate?: string;
}

export interface IAddBannerInput
  extends IBannerMetadataInput {
  imageFile: File;
}

export interface IUpdateBannerInput
  extends IBannerMetadataInput {
  id: number;
}

interface ISharePointBannerItem {
  Id: number;
  Title?: string;
  FileLeafRef?: string;
  FileRef?: string;
  CTAText?: string;
  CTAUrl?:
    | {
        Url?: string;
        Description?: string;
      }
    | string;
  DisplayOrder?: number;
  IsPublished?: boolean;
  StartDate?: string;
  EndDate?: string;
}

interface IRootFolderResponse {
  ServerRelativeUrl: string;
}

interface IUploadResponse {
  ListItemAllFields?: {
    Id?: number;
  };
}

export class KqCmsService {
  private readonly context: WebPartContext;
  private readonly webUrl: string;

  private readonly bannerLibraryName =
    'KQ Intranet Banners Dev';

  public constructor(context: WebPartContext) {
    this.context = context;
    this.webUrl =
      context.pageContext.web.absoluteUrl;
  }

  public async getBanners(): Promise<IBanner[]> {
    const endpoint =
      `${this.webUrl}/_api/web/lists/getbytitle(` +
      `'${this.bannerLibraryName}')/items` +
      `?$select=` +
      `Id,` +
      `Title,` +
      `FileLeafRef,` +
      `FileRef,` +
      `CTAText,` +
      `CTAUrl,` +
      `DisplayOrder,` +
      `IsPublished,` +
      `StartDate,` +
      `EndDate` +
      `&$orderby=DisplayOrder asc`;

    const response =
      await this.context.spHttpClient.get(
        endpoint,
        SPHttpClient.configurations.v1
      );

    await this.ensureSuccess(
      response,
      'Unable to load banners'
    );

    const data: {
      value: ISharePointBannerItem[];
    } = await response.json();

    return data.value.map(
      (item): IBanner => ({
        id: item.Id,

        fileName:
          item.FileLeafRef || '',

        fileUrl:
          item.FileRef || '',

        title:
          item.Title ||
          item.FileLeafRef ||
          '',

        description: '',

        ctaText:
          item.CTAText || '',

        ctaUrl:
          this.getUrlValue(item.CTAUrl),

        displayOrder:
          item.DisplayOrder || 0,

        isPublished:
          item.IsPublished === true,

        startDate:
          item.StartDate,

        endDate:
          item.EndDate
      })
    );
  }

  public async addBanner(
    input: IAddBannerInput
  ): Promise<void> {
    this.validateBannerMetadata(input);

    const currentBanners =
      await this.getBanners();

    if (currentBanners.length >= 10) {
      throw new Error(
        'A maximum of 10 hero banners is allowed.'
      );
    }

    const duplicateOrder =
      currentBanners.some(
        (banner) =>
          banner.displayOrder ===
          input.displayOrder
      );

    if (duplicateOrder) {
      throw new Error(
        `Display order ${input.displayOrder} is already being used by another banner.`
      );
    }

    const rootFolderUrl =
      await this.getBannerLibraryRootFolder();

    const itemId =
      await this.uploadBannerFile(
        rootFolderUrl,
        input.imageFile
      );

    try {
      await this.updateBannerMetadata(
        itemId,
        input
      );
    } catch (error) {
      console.error(
        'Banner image uploaded but metadata update failed:',
        error
      );

      throw error;
    }
  }

  public async updateBanner(
    input: IUpdateBannerInput
  ): Promise<void> {
    this.validateBannerMetadata(input);

    await this.ensureUniqueDisplayOrder(
      input.displayOrder,
      input.id
    );

    await this.updateBannerMetadata(
      input.id,
      input
    );
  }

  public async setBannerPublished(
    itemId: number,
    isPublished: boolean
  ): Promise<void> {
    const endpoint =
      `${this.webUrl}/_api/web/lists/getbytitle(` +
      `'${this.bannerLibraryName}')/items(${itemId})`;

    const response =
      await this.context.spHttpClient.post(
        endpoint,
        SPHttpClient.configurations.v1,
        {
          headers: {
            Accept:
              'application/json;odata=nometadata',

            'Content-Type':
              'application/json;odata=nometadata',

            'IF-MATCH': '*',
            'X-HTTP-Method': 'MERGE'
          },

          body: JSON.stringify({
            IsPublished: isPublished
          })
        }
      );

    await this.ensureSuccess(
      response,
      isPublished
        ? 'Unable to publish banner'
        : 'Unable to unpublish banner'
    );
  }

  private async getBannerLibraryRootFolder():
    Promise<string> {
    const endpoint =
      `${this.webUrl}/_api/web/lists/getbytitle(` +
      `'${this.bannerLibraryName}')/RootFolder` +
      `?$select=ServerRelativeUrl`;

    const response =
      await this.context.spHttpClient.get(
        endpoint,
        SPHttpClient.configurations.v1
      );

    await this.ensureSuccess(
      response,
      'Unable to locate the banner library'
    );

    const data: IRootFolderResponse =
      await response.json();

    return data.ServerRelativeUrl;
  }

  private async uploadBannerFile(
    rootFolderUrl: string,
    imageFile: File
  ): Promise<number> {
    const safeFolderUrl =
      rootFolderUrl.replace(/'/g, "''");

    const safeFileName =
      imageFile.name.replace(/'/g, "''");

    const endpoint =
      `${this.webUrl}` +
      `/_api/web/GetFolderByServerRelativeUrl(` +
      `'${safeFolderUrl}')` +
      `/Files/add(` +
      `url='${safeFileName}',` +
      `overwrite=false)` +
      `?$expand=ListItemAllFields`;

    const fileBuffer =
      await imageFile.arrayBuffer();

    const response =
      await this.context.spHttpClient.post(
        endpoint,
        SPHttpClient.configurations.v1,
        {
          body: fileBuffer
        }
      );

    await this.ensureSuccess(
      response,
      'Unable to upload banner image'
    );

    const data: IUploadResponse =
      await response.json();

    const itemId =
      data.ListItemAllFields?.Id;

    if (!itemId) {
      throw new Error(
        'The banner image uploaded, but SharePoint did not return the new item ID.'
      );
    }

    return itemId;
  }

  private async updateBannerMetadata(
    itemId: number,
    input: IBannerMetadataInput
  ): Promise<void> {
    const endpoint =
      `${this.webUrl}/_api/web/lists/getbytitle(` +
      `'${this.bannerLibraryName}')/items(${itemId})`;

    const payload =
      this.buildBannerPayload(input);

    const response =
      await this.context.spHttpClient.post(
        endpoint,
        SPHttpClient.configurations.v1,
        {
          headers: {
            Accept:
              'application/json;odata=nometadata',

            'Content-Type':
              'application/json;odata=nometadata',

            'IF-MATCH': '*',
            'X-HTTP-Method': 'MERGE'
          },

          body: JSON.stringify(payload)
        }
      );

    await this.ensureSuccess(
      response,
      'Unable to save banner metadata'
    );
  }

  private buildBannerPayload(
    input: IBannerMetadataInput
  ): {
    Title: string;
    CTAText: string;
    CTAUrl:
      | {
          Url: string;
          Description: string;
        }
      | null;
    DisplayOrder: number;
    IsPublished: boolean;
    StartDate: string | null;
    EndDate: string | null;
  } {
    return {
      Title:
        input.title.trim(),

      CTAText:
        input.ctaText.trim(),

      CTAUrl:
        input.ctaUrl.trim()
          ? {
              Url: input.ctaUrl.trim(),

              Description:
                input.ctaText.trim()
            }
          : null,

      DisplayOrder:
        input.displayOrder,

      IsPublished:
        input.isPublished,

      StartDate:
        input.startDate
          ? new Date(
              `${input.startDate}T00:00:00`
            ).toISOString()
          : null,

      EndDate:
        input.endDate
          ? new Date(
              `${input.endDate}T23:59:59`
            ).toISOString()
          : null
    };
  }

  private validateBannerMetadata(
    input: IBannerMetadataInput
  ): void {
    if (!input.title.trim()) {
      throw new Error(
        'Banner title is required.'
      );
    }

    if (
      !Number.isInteger(input.displayOrder) ||
      input.displayOrder < 1 ||
      input.displayOrder > 10
    ) {
      throw new Error(
        'Display order must be a whole number between 1 and 10.'
      );
    }

    if (
      input.startDate &&
      input.endDate &&
      input.endDate < input.startDate
    ) {
      throw new Error(
        'End date cannot be earlier than start date.'
      );
    }

    if (
      input.ctaUrl.trim() &&
      !this.isValidUrl(input.ctaUrl.trim())
    ) {
      throw new Error(
        'CTA URL must be a valid web address.'
      );
    }
  }

  private async ensureUniqueDisplayOrder(
    displayOrder: number,
    excludeItemId?: number
  ): Promise<void> {
    const banners =
      await this.getBanners();

    const duplicate =
      banners.some(
        (banner) =>
          banner.displayOrder ===
            displayOrder &&
          banner.id !==
            excludeItemId
      );

    if (duplicate) {
      throw new Error(
        `Display order ${displayOrder} is already being used by another banner.`
      );
    }
  }

  private isValidUrl(
    value: string
  ): boolean {
    try {
      const url =
        new URL(
          value,
          window.location.origin
        );

      return (
        url.protocol === 'http:' ||
        url.protocol === 'https:'
      );
    } catch {
      return false;
    }
  }

  private getUrlValue(
    value: ISharePointBannerItem['CTAUrl']
  ): string {
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    return value.Url || '';
  }

  private async ensureSuccess(
    response: SPHttpClientResponse,
    message: string
  ): Promise<void> {
    if (response.ok) {
      return;
    }

    const errorText =
      await response.text();

    console.error(
      `KQ CMS: ${message}`,
      response.status,
      errorText
    );

    throw new Error(
      `${message}. SharePoint returned ` +
      `${response.status}. ${errorText}`
    );
  }
}