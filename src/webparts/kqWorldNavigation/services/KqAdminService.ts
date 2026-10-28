
import {
  WebPartContext
} from '@microsoft/sp-webpart-base';

import {
  SPHttpClient
} from '@microsoft/sp-http';

import {
  getKqDataConfig
} from '../../../config/environment';

export default class KqAdminService {

  constructor(
    private readonly context: WebPartContext
  ) {}

  public async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const config = getKqDataConfig(
        this.context.pageContext.web.absoluteUrl
      );

      const webUrl = config.siteUrl;

      const currentUserId =
        this.context.pageContext.legacyPageContext.userId;

      if (!currentUserId) {
        return false;
      }

      const listName = config.adminsList.replace(
        /'/g,
        "''"
      );

      const url =
        `${webUrl}/_api/web/lists/getbytitle('${encodeURIComponent(listName)}')/items` +
        `?$select=Id,AdminUserId` +
        `&$filter=AdminUserId eq ${currentUserId}` +
        `&$top=1`;

      const response = await this.context.spHttpClient.get(
        url,
        SPHttpClient.configurations.v1
      );

      if (!response.ok) {
        console.error(
          'Admin verification failed:',
          response.status
        );
        return false;
      }

      const data: {
        value?: Array<{ Id: number }>;
      } = await response.json();

      return (data.value?.length ?? 0) > 0;

    } catch (error) {
      console.error(
        'Unable to verify KQ World admin:',
        error
      );

      return false;
    }
  }
}
