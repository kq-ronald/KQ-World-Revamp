import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  SPHttpClient,
  SPHttpClientResponse
} from '@microsoft/sp-http';

import { IQuickAction } from '../models/IQuickAction';

export interface IQuickActionInput {
  title: string;
  navigationUrl: string;
  icon: string;
  displayOrder: number;
  isPublished: boolean;
}

export interface IUpdateQuickActionInput
  extends IQuickActionInput {
  id: number;
}

interface ISharePointQuickActionItem {
  Id: number;
  Title?: string;
  NavigationUrl?:
    | string
    | {
        Url?: string;
        Description?: string;
      };
  Icon?: string;
  DisplayOrder?: number;
  IsPublished?: boolean;
}

export class QuickActionService {
  private readonly context: WebPartContext;
  private readonly webUrl: string;

  private readonly listName =
    'KQ Quick Actions Dev';

  public constructor(context: WebPartContext) {
    this.context = context;
    this.webUrl =
      context.pageContext.web.absoluteUrl;
  }

  public async getQuickActions():
    Promise<IQuickAction[]> {
    const endpoint =
      `${this.webUrl}/_api/web/lists/getbytitle(` +
      `'${this.listName}')/items` +
      `?$select=` +
      `Id,` +
      `Title,` +
      `NavigationUrl,` +
      `Icon,` +
      `DisplayOrder,` +
      `IsPublished` +
      `&$orderby=DisplayOrder asc`;

    const response =
      await this.context.spHttpClient.get(
        endpoint,
        SPHttpClient.configurations.v1
      );

    await this.ensureSuccess(
      response,
      'Unable to load quick actions'
    );

    const data: {
      value: ISharePointQuickActionItem[];
    } = await response.json();

    return data.value.map(
      (item): IQuickAction => ({
        id: item.Id,
        title: item.Title || '',
        navigationUrl:
          this.getUrlValue(
            item.NavigationUrl
          ),
        icon: item.Icon || '',
        displayOrder:
          item.DisplayOrder || 0,
        isPublished:
          item.IsPublished === true
      })
    );
  }

  public async addQuickAction(
    input: IQuickActionInput
  ): Promise<void> {
    this.validateQuickAction(input);

    await this.ensureUniqueDisplayOrder(
      input.displayOrder
    );

    const endpoint =
      `${this.webUrl}/_api/web/lists/getbytitle(` +
      `'${this.listName}')/items`;

    const payload =
      this.buildQuickActionPayload(input);

    const response =
      await this.context.spHttpClient.post(
        endpoint,
        SPHttpClient.configurations.v1,
        {
          headers: {
            Accept:
              'application/json;odata=nometadata',

            'Content-Type':
              'application/json;odata=nometadata'
          },

          body: JSON.stringify(payload)
        }
      );

    await this.ensureSuccess(
      response,
      'Unable to add quick action'
    );
  }

  public async updateQuickAction(
    input: IUpdateQuickActionInput
  ): Promise<void> {
    this.validateQuickAction(input);

    await this.ensureUniqueDisplayOrder(
      input.displayOrder,
      input.id
    );

    const endpoint =
      `${this.webUrl}/_api/web/lists/getbytitle(` +
      `'${this.listName}')/items(${input.id})`;

    const payload =
      this.buildQuickActionPayload(input);

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
      'Unable to update quick action'
    );
  }

  public async setQuickActionPublished(
    itemId: number,
    isPublished: boolean
  ): Promise<void> {
    const endpoint =
      `${this.webUrl}/_api/web/lists/getbytitle(` +
      `'${this.listName}')/items(${itemId})`;

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
            IsPublished:
              isPublished
          })
        }
      );

    await this.ensureSuccess(
      response,
      isPublished
        ? 'Unable to publish quick action'
        : 'Unable to unpublish quick action'
    );
  }

  private buildQuickActionPayload(
    input: IQuickActionInput
  ): {
    Title: string;
    NavigationUrl:
      | {
          Url: string;
          Description: string;
        }
      | null;
    Icon: string;
    DisplayOrder: number;
    IsPublished: boolean;
  } {
    return {
      Title:
        input.title.trim(),

      NavigationUrl:
        input.navigationUrl.trim()
          ? {
              Url:
                input.navigationUrl.trim(),

              Description:
                input.title.trim()
            }
          : null,

      Icon:
        input.icon.trim(),

      DisplayOrder:
        input.displayOrder,

      IsPublished:
        input.isPublished
    };
  }

  private validateQuickAction(
    input: IQuickActionInput
  ): void {
    if (!input.title.trim()) {
      throw new Error(
        'Quick Action title is required.'
      );
    }

    if (
      !Number.isInteger(
        input.displayOrder
      ) ||
      input.displayOrder < 1
    ) {
      throw new Error(
        'Display order must be a whole number greater than 0.'
      );
    }

    if (
      input.navigationUrl.trim() &&
      !this.isValidUrl(
        input.navigationUrl.trim()
      )
    ) {
      throw new Error(
        'Navigation URL must be a valid web address.'
      );
    }
  }

  private async ensureUniqueDisplayOrder(
    displayOrder: number,
    excludeItemId?: number
  ): Promise<void> {
    const quickActions =
      await this.getQuickActions();

    const duplicate =
      quickActions.some(
        (item) =>
          item.displayOrder ===
            displayOrder &&
          item.id !==
            excludeItemId
      );

    if (duplicate) {
      throw new Error(
        `Display order ${displayOrder} is already being used by another Quick Action.`
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
    value:
      ISharePointQuickActionItem['NavigationUrl']
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