import {
  SPHttpClient,
  SPHttpClientResponse
} from '@microsoft/sp-http';

import {
  WebPartContext
} from '@microsoft/sp-webpart-base';

import {
  IKqEvent
} from '../models/IKqEvent';

interface ISharePointEventItem {
  Id: number;
  Title?: string;
  Location?: string;
  EventDate?: string;
  EndDate?: string;
  Description?: string;
  Category?: string;
  fAllDayEvent?: boolean;
  fRecurrence?: boolean;
}

interface ISharePointEventsResponse {
  value?: ISharePointEventItem[];
}

export default class KqEventsService {

  private readonly context:
    WebPartContext;

  public constructor(
    context: WebPartContext
  ) {
    this.context = context;
  }

  public async getEvents():
    Promise<IKqEvent[]> {

    const webUrl =
      this.context
        .pageContext
        .web
        .absoluteUrl;

    const requestUrl =
      `${webUrl}` +
      `/_api/web/lists/getbytitle('Events')/items` +
      `?$select=` +
      `Id,` +
      `Title,` +
      `Location,` +
      `EventDate,` +
      `EndDate,` +
      `Description,` +
      `Category,` +
      `fAllDayEvent,` +
      `fRecurrence` +
      `&$orderby=EventDate asc`;

    const response:
      SPHttpClientResponse =
      await this.context.spHttpClient.get(
        requestUrl,
        SPHttpClient.configurations.v1,
        {
          headers: {
            Accept:
              'application/json;odata=nometadata'
          }
        }
      );

    if (!response.ok) {

      const responseText =
        await response.text();

      console.error(
        'Events REST error:',
        response.status,
        response.statusText,
        responseText
      );

      throw new Error(
        `SharePoint returned ${response.status}: ${responseText}`
      );
    }

    const data:
      ISharePointEventsResponse =
      await response.json();

    const events:
      IKqEvent[] =
      (data.value || [])
        .map(
          (
            item:
              ISharePointEventItem
          ):
            IKqEvent | undefined => {

            const date =
              this.parseEventDate(
                item.EventDate
              );

            if (!date) {

              console.warn(
                'Skipping event with invalid EventDate:',
                item
              );

              return undefined;
            }

            return {
              id: item.Id,

              title:
                item.Title ||
                'Untitled Event',

              date,

              dateText:
                item.EventDate || '',

              location:
                item.Location || '',

              imageUrl: ''
            };
          }
        )
        .filter(
          (
            event:
              IKqEvent | undefined
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

    const date =
      new Date(value);

    if (
      isNaN(
        date.getTime()
      )
    ) {
      return undefined;
    }

    return date;
  }
}