import {
  SPHttpClient,
  SPHttpClientResponse
} from '@microsoft/sp-http';

import { WebPartContext } from '@microsoft/sp-webpart-base';

import { IKqEvent } from '../models/IKqEvent';

interface ISharePointEventItem {
  Id: number;
  Title?: string;
  CardTitle?: string;
  CardDate?: string;
  CardLocation?: string;
  CardImage?:
    | string
    | {
        Url?: string;
        Description?: string;
      };
}

interface ISharePointEventsResponse {
  value?: ISharePointEventItem[];
}

export default class KqEventsService {
  private readonly context: WebPartContext;

  public constructor(context: WebPartContext) {
    this.context = context;
  }

  public async getEvents(): Promise<IKqEvent[]> {
    const webUrl = `${window.location.origin}/homepage`;

    const requestUrl =
      `${webUrl}` +
      `/_api/web/lists/getbytitle('Upcoming Events')/items` +
      `?$select=Id,Title,CardImage,CardDate,CardTitle,CardLocation` +
      `&$orderby=CardDate asc`;

    const response: SPHttpClientResponse =
      await this.context.spHttpClient.get(
        requestUrl,
        SPHttpClient.configurations.v1,
        {
          headers: {
            Accept: 'application/json;odata=nometadata'
          }
        }
      );

    if (!response.ok) {
      const responseText: string =
        await response.text();

      console.error(
        'Upcoming Events REST error:',
        response.status,
        response.statusText,
        responseText
      );

      throw new Error(
        `SharePoint returned ${response.status}: ${responseText}`
      );
    }

    const data: ISharePointEventsResponse =
      await response.json();

    const events: IKqEvent[] =
      (data.value || [])
        .map(
          (
            item: ISharePointEventItem
          ): IKqEvent | undefined => {
            const date =
              this.parseEventDate(
                item.CardDate
              );

            if (!date) {
              console.warn(
                'Skipping event with invalid CardDate:',
                item
              );

              return undefined;
            }

            let imageUrl = '';

            if (
              typeof item.CardImage ===
              'string'
            ) {
              imageUrl = item.CardImage;
            } else if (
              item.CardImage &&
              typeof item.CardImage ===
                'object'
            ) {
              imageUrl =
                item.CardImage.Url || '';
            }

            return {
              id: item.Id,

              title:
                item.CardTitle ||
                item.Title ||
                'Untitled Event',

              date,

              dateText:
                item.CardDate || '',

              location:
                item.CardLocation || '',

              imageUrl
            };
          }
        )
        .filter(
          (
            event:
              | IKqEvent
              | undefined
          ): event is IKqEvent =>
            event !== undefined
        );

    events.sort(
      (
        first: IKqEvent,
        second: IKqEvent
      ): number =>
        first.date.getTime() -
        second.date.getTime()
    );

    return events;
  }

  private parseEventDate(
    value?: string
  ): Date | undefined {
    if (!value) {
      return undefined;
    }

    /*
     * First try the standard SharePoint /
     * JavaScript date format.
     */
    const standardDate =
      new Date(value);

    if (
      !isNaN(
        standardDate.getTime()
      )
    ) {
      return standardDate;
    }

    /*
     * The legacy KQ World stored CardDate
     * as display text in some cases.
     *
     * Support dd/mm/yyyy as a fallback.
     */
    const parts =
      value
        .trim()
        .split(/[\/\-]/);

    if (parts.length === 3) {
      const day =
        parseInt(parts[0], 10);

      const month =
        parseInt(parts[1], 10);

      const year =
        parseInt(parts[2], 10);

      if (
        !isNaN(day) &&
        !isNaN(month) &&
        !isNaN(year)
      ) {
        return new Date(
          year,
          month - 1,
          day
        );
      }
    }

    return undefined;
  }
}