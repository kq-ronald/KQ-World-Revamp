import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IKqEvent } from '../models/IKqEvent';

interface IGraphDateTime { dateTime: string; timeZone: string; }
interface IGraphEvent {
  id: string;
  subject?: string;
  start: IGraphDateTime;
  end: IGraphDateTime;
  isAllDay?: boolean;
  isCancelled?: boolean;
  sensitivity?: string;
  location?: { displayName?: string };
  categories?: string[];
  webLink?: string;
}
interface IGraphCalendarResponse {
  value?: IGraphEvent[];
  '@odata.nextLink'?: string;
}

export default class KqEventsService {
  public static readonly mailbox = 'kqintranet@kenya-airways.com';
  public constructor(private readonly context: WebPartContext) {}

  // Explicit UTC instants: calendarView expands recurring occurrences in this range.
  public async getEvents(
    startDate: Date = new Date(),
    endDate: Date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  ): Promise<IKqEvent[]> {
    if (!Number.isFinite(startDate.getTime()) || !Number.isFinite(endDate.getTime()) || endDate <= startDate) {
      throw new Error('The calendar date range is invalid.');
    }
    try {
      const client = await this.context.msGraphClientFactory.getClient('3');
      let nextUrl: string | undefined =
        `/users/${encodeURIComponent(KqEventsService.mailbox)}/calendarView` +
        `?startDateTime=${encodeURIComponent(startDate.toISOString())}` +
        `&endDateTime=${encodeURIComponent(endDate.toISOString())}` +
        '&$select=id,subject,start,end,isAllDay,isCancelled,sensitivity,location,categories,webLink' +
        '&$orderby=start/dateTime&$top=250';
      const items: IGraphEvent[] = [];
      const visited = new Set<string>();
      while (nextUrl) {
        if (visited.has(nextUrl)) throw new Error('The calendar returned a repeated page.');
        visited.add(nextUrl);
        const response: IGraphCalendarResponse = await client.api(nextUrl)
          .header('Prefer', 'outlook.timezone="UTC"').get();
        if (!Array.isArray(response.value)) throw new Error('The calendar response was invalid.');
        items.push(...response.value);
        nextUrl = response['@odata.nextLink'];
      }
      const unique = new Map<string, IKqEvent>();
      items.forEach((item) => {
        // Do not publish private/confidential appointments on the intranet.
        if (item.isCancelled || item.sensitivity === 'private' || item.sensitivity === 'confidential') return;
        const date = this.parseUtc(item.start?.dateTime);
        const end = this.parseUtc(item.end?.dateTime);
        if (!date || !end) return;
        unique.set(item.id, {
          id: item.id,
          title: item.subject || 'Untitled Event',
          date,
          endDate: end,
          dateText: date.toISOString(),
          location: item.location?.displayName || '',
          imageUrl: '',
          category: item.categories?.[0] || '',
          categories: item.categories || [],
          isAllDay: item.isAllDay === true,
          webLink: item.webLink || ''
        });
      });
      return Array.from(unique.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (error) {
      const graphError = error as { statusCode?: number; code?: string };
      if (graphError.statusCode === 401 || graphError.statusCode === 403 || graphError.code === 'ErrorAccessDenied') {
        throw new Error('Calendar access is unavailable. Ask IT to check Calendars.Read.Shared approval and your access to kqintranet@kenya-airways.com.');
      }
      throw new Error('Unable to load the KQ World Outlook calendar. Please try again or contact IT.');
    }
  }

  private parseUtc(value?: string): Date | undefined {
    if (!value) return undefined;
    // Graph returns offset-free dateTime values; the request explicitly asks for UTC.
    const normalized = value.replace(/(\.\d{3})\d+/, '$1');
    const date = new Date(/(?:Z|[+-]\d{2}:\d{2})$/i.test(normalized) ? normalized : `${normalized}Z`);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
}
