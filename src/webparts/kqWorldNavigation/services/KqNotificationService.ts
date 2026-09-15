import {
  SPHttpClient,
  SPHttpClientResponse
} from '@microsoft/sp-http';

import { WebPartContext } from '@microsoft/sp-webpart-base';

import { IKqNotification } from '../models/IKqNotification';

interface ISharePointNotificationItem {
  Id: number;
  Title?: string;
  Message?: string;
  Link?: {
    Url?: string;
    Description?: string;
  };
  NotificationType?: string;
  PublishDate?: string;
  IsActive?: boolean;
}

interface ISharePointNotificationResponse {
  value: ISharePointNotificationItem[];
}

export class KqNotificationService {
  private readonly context: WebPartContext;

  public constructor(context: WebPartContext) {
    this.context = context;
  }

  public async getNotifications(): Promise<IKqNotification[]> {
    const webUrl = this.context.pageContext.web.absoluteUrl;

    const endpoint =
      `${webUrl}/_api/web/lists/getbytitle('KQ World Notifications')/items` +
      `?$select=Id,Title,Message,Link,NotificationType,PublishDate,IsActive` +
      `&$filter=IsActive eq 1` +
      `&$orderby=PublishDate desc`;

    const response: SPHttpClientResponse =
      await this.context.spHttpClient.get(
        endpoint,
        SPHttpClient.configurations.v1
      );

    if (!response.ok) {
      throw new Error(
        `Unable to load notifications. ${response.status} ${response.statusText}`
      );
    }

    const data =
      (await response.json()) as ISharePointNotificationResponse;

    return data.value.map(
      (item: ISharePointNotificationItem): IKqNotification => ({
        id: item.Id,
        title: item.Title || '',
        message: item.Message || '',
        link: item.Link?.Url,
        notificationType: item.NotificationType || 'General',
        publishDate: item.PublishDate
          ? new Date(item.PublishDate)
          : new Date(),
        isActive: item.IsActive === true
      })
    );
  }
}