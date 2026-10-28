import { SPHttpClient } from '@microsoft/sp-http';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IKqNotification } from '../models/IKqNotification';
import { getKqDataConfig } from '../../../config/environment';

type UrlField = string | { Url?: string } | undefined;
interface IItem {
  Id: number;
  Title?: string;
  Created?: string;
  Modified?: string;
  IsPublished?: boolean | number | string;
  StartDate?: string;
  EndDate?: string;
  CTAUrl?: UrlField;
  EventDate?: string;
  EventUrl?: UrlField;
  Poster?: UrlField;
  Content_x0020_Link?: UrlField;
  NavigationUrl?: UrlField;
  VideoUrl?: UrlField;
  Category?: string;
  FileLeafRef?: string;
  FileRef?: string;
  File?: { Name?: string; ServerRelativeUrl?: string; Level?: number };
  IsActive?: boolean | number | string;
  Message?: string;
  Link?: UrlField;
  NotificationType?: string;
  PublishDate?: string;
}
interface ISource {
  key: string;
  label: string;
  web: string;
  list: string;
  fields: string;
  expand?: string;
  optional?: boolean;
  displayForm?: string;
}
interface IPage {
  value?: IItem[];
  'odata.nextLink'?: string;
  '@odata.nextLink'?: string;
}

/** Read-only activity feed. No notification-list writes or elevated access. */
export class KqNotificationService {
  private readonly context: WebPartContext;
  private warnings: string[] = [];
  private memoryRead: Record<string, number> = {};
  private readonly storageKey: string;
  private readonly days = 30;
  private readonly forms: Record<string, string> = {};

  public constructor(context: WebPartContext) {
    this.context = context;
    this.storageKey = `kq-notifications-v2:${context.pageContext.web.absoluteUrl}:${context.pageContext.user.loginName}`;
  }
  public getWarnings(): string[] { return this.warnings.slice(); }

  public async getNotifications(): Promise<IKqNotification[]> {
    const config = getKqDataConfig(
      this.context.pageContext.web.absoluteUrl
    );
    const web = config.siteUrl.replace(/\/$/, '');
    const home = new URL('/homepage', web).href;
    const sources: ISource[] = [
      {
  key: 'banner',
  label: 'Intranet Banner',
  web,
  list: config.bannersLibrary,
  fields: 'IsPublished,StartDate,EndDate,CTAUrl,File/Name,File/ServerRelativeUrl',
  expand: 'File'
},
      { key: 'calendar', label: 'Calendar', web, list: 'Events', fields: 'EventDate,EndDate' },
      { key: 'moments', label: 'KQ Moments', web: home, list: 'Events', fields: 'EventUrl,Poster' },
      { key: 'processes', label: 'Online Processes', web: home, list: 'Online Processes', fields: 'Content_x0020_Link' },
      {
  key: 'quick',
  label: 'Quick Actions',
  web,
  list: config.quickActionsList,
  fields: 'IsPublished,NavigationUrl'
},
      { key: 'video', label: 'Corporate Stories', web, list: 'KQ Videos Dev', fields: 'IsPublished,VideoUrl,Category' },
      { key: 'news', label: 'Company News', web: home, list: 'Site Pages', fields: 'FileLeafRef,FileRef,File/Level', expand: 'File' },
      {
  key: 'manual',
  label: 'Announcements',
  web,
  list: config.environment === 'PROD'
    ? config.notificationsList
    : 'KQ World Notifications',
  fields: 'Message,Link,NotificationType,PublishDate,IsActive',
  optional: true
}
    ];
    const now = Date.now();
    const cutoff = now - this.days * 86400000;
    // Each failure is isolated so another site's missing list cannot blank the feed.
    const results = await Promise.all(sources.map(async source => {
      try {
        const items = await this.loadSource(source, cutoff);
        const notifications: IKqNotification[] = [];
        items.forEach(item => {
          const notification = this.convert(source, item, now, cutoff);
          if (notification) notifications.push(notification);
        });
        return { notifications, warning: '', ok: true };
      } catch (error) {
        console.error(`Notification source ${source.label}:`, error);
        return { notifications: [] as IKqNotification[], warning: `${source.label} updates could not be loaded.`, ok: false };
      }
    }));
    this.warnings = results.map(result => result.warning).filter(Boolean);
    if (!results.some((result, index) => result.ok && (!sources[index].optional || result.notifications.length > 0))) throw new Error('Unable to load notification sources.');
    const combined: IKqNotification[] = [];
    const seen: Record<string, boolean> = {};
    results.forEach(result => result.notifications.forEach(item => {
      const key = String(item.id);
      if (!seen[key]) { seen[key] = true; combined.push(item); }
    }));
    return this.applyReadState(combined.sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime()).slice(0, 200));
  }

  private async loadSource(source: ISource, cutoff: number): Promise<IItem[]> {
    const title = source.list.replace(/'/g, "''");
    const listUrl = `${source.web}/_api/web/lists/getbytitle('${encodeURIComponent(title)}')`;
    if (source.key === 'calendar') {
      if (!this.forms[listUrl]) {
        const metadataResponse = await this.context.spHttpClient.get(
          `${listUrl}?$select=DefaultDisplayFormUrl`, SPHttpClient.configurations.v1,
          { headers: { Accept: 'application/json;odata=nometadata' } }
        );
        if (!metadataResponse.ok) throw new Error('Unable to resolve the calendar display form.');
        const metadata: { DefaultDisplayFormUrl?: string } = await metadataResponse.json();
        const form = this.url(metadata.DefaultDisplayFormUrl, source.web);
        if (!form) throw new Error('Calendar display form is missing.');
        this.forms[listUrl] = form;
      }
      source.displayForm = this.forms[listUrl];
    }
    const since = `datetime'${new Date(cutoff).toISOString()}'`;
    let filter = `Modified ge ${since}`;
    if (source.key === 'banner') filter += ` or StartDate ge ${since}`;
    if (source.key === 'manual') filter += ` or PublishDate ge ${since}`;
    let url = `${source.web}/_api/web/lists/getbytitle('${encodeURIComponent(title)}')/items` +
      `?$select=Id,Title,Created,Modified,${source.fields}&$filter=${encodeURIComponent(filter)}&$orderby=Modified desc&$top=100` +
      (source.expand ? `&$expand=${source.expand}` : '');
    const items: IItem[] = [];
    // Bounded requests: latest 500 changed records per source in the lookback.
    for (let page = 0; url && page < 5; page++) {
      const response = await this.context.spHttpClient.get(url, SPHttpClient.configurations.v1, {
        headers: { Accept: 'application/json;odata=nometadata' }
      });
      if (response.status === 404 && source.optional) return [];
      if (!response.ok) throw new Error(`SharePoint returned ${response.status} for ${source.list}.`);
      const data: IPage = await response.json();
      items.push(...(data.value || []));
      const next = data['@odata.nextLink'] || data['odata.nextLink'];
      url = next ? new URL(next, source.web + '/').href : '';
      if (url && new URL(url).origin !== new URL(source.web).origin) throw new Error('Unexpected paging host.');
    }
    return items;
  }

  private convert(source: ISource, item: IItem, now: number, cutoff: number): IKqNotification | undefined {
    let changed = this.timestamp(item.Modified) || this.timestamp(item.Created);
    let label = source.label;
    let link: string | undefined;
    const title = item.Title || item.File?.Name || item.FileLeafRef || source.label;
    switch (source.key) {
      case 'banner': {
        if (!this.yes(item.IsPublished) || !/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(item.File?.Name || '')) return undefined;
        const start = this.timestamp(item.StartDate);
        const end = this.timestamp(item.EndDate);
        if ((item.StartDate && !start) || (item.EndDate && !end) || (start && start > now) || (end && end < now)) return undefined;
        if (start) changed = Math.max(changed || 0, start);
        link = this.url(item.CTAUrl, source.web) || this.url(item.File?.ServerRelativeUrl, source.web);
        break;
      }
      case 'calendar':
        if (!this.timestamp(item.EventDate)) return undefined;
        // EventDate is not the update time: Created/Modified drive notifications.
        if (source.displayForm) {
          const form = new URL(source.displayForm);
          form.searchParams.set('ID', String(item.Id));
          link = form.href;
        }
        break;
      case 'moments':
        if (!this.url(item.Poster, source.web)) return undefined;
        link = this.url(item.EventUrl, source.web) || this.url(item.Poster, source.web);
        break;
      case 'processes':
        link = this.url(item.Content_x0020_Link, source.web);
        if (!link) return undefined;
        break;
      case 'quick':
        if (!this.yes(item.IsPublished)) return undefined;
        link = this.url(item.NavigationUrl, source.web);
        if (!link) return undefined;
        break;
      case 'video':
        if (!this.yes(item.IsPublished) || (item.Category || '').trim().toLowerCase().replace(/\s+/g, '-') !== 'corporate-stories') return undefined;
        link = this.url(item.VideoUrl, source.web);
        if (!link) return undefined;
        break;
      case 'news': {
        // SP.FileLevel.Published = 1. Do not notify editors about draft pages.
        if (item.File?.Level !== 1) return undefined;
        const name = `${title} ${item.FileLeafRef || ''}`.toLowerCase();
        if (/take[\s_-]*3/.test(name)) label = 'Take 3';
        else if (name.indexOf('the pride') !== -1 || /the[-_]pride/.test(name)) label = 'The Pride';
        else return undefined;
        link = this.url(item.FileRef, source.web);
        break;
      }
      case 'manual': {
        if (!this.yes(item.IsActive)) return undefined;
        const scheduled = this.timestamp(item.PublishDate);
        if (item.PublishDate && (!scheduled || scheduled > now)) return undefined;
        changed = Math.max(changed || 0, scheduled || 0);
        label = item.NotificationType || 'General';
        link = this.url(item.Link, source.web);
        break;
      }
      default: return undefined;
    }
    if (!changed || changed < cutoff || changed > now) return undefined;
    const id = `${source.key}:${source.web.toLowerCase()}:${item.Id}`;
    const updated = changed > (this.timestamp(item.Created) || changed) + 1000;
    return {
      id, title, link,
      message: source.key === 'manual' && item.Message ? item.Message : `${updated ? 'Updated' : 'New'} in ${label}: ${title}`,
      notificationType: label,
      publishDate: new Date(changed),
      isActive: true,
      revisionKey: `${id}:${changed}`,
      isRead: false
    };
  }

  private timestamp(value?: string): number | undefined {
    if (!value) return undefined;
    const number = new Date(value).getTime();
    return isNaN(number) ? undefined : number;
  }
  private yes(value: unknown): boolean { return value === true || value === 1 || /^(true|1)$/i.test(String(value).trim()); }
  private url(value: UrlField, base: string): string | undefined {
    const raw = typeof value === 'string' ? value : value?.Url;
    if (!raw) return undefined;
    try { const url = new URL(raw, base + '/'); return /^https?:$/.test(url.protocol) ? url.href : undefined; }
    catch { return undefined; }
  }
  private readState(): Record<string, number> {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const result: Record<string, number> = {};
        Object.keys(parsed).forEach(key => {
          const value = (parsed as Record<string, unknown>)[key];
          if (typeof value === 'number') result[key] = value;
        });
        this.memoryRead = { ...result, ...this.memoryRead };
      }
    } catch { /* Storage blocked: retain this session's read state. */ }
    return this.memoryRead;
  }
  public applyReadState(items: IKqNotification[]): IKqNotification[] {
    const read = this.readState();
    return items.map(item => ({ ...item, isRead: !!read[item.revisionKey || String(item.id)] }));
  }
  public markRead(items: IKqNotification[]): void {
    const read = this.readState();
    items.forEach(item => { read[item.revisionKey || String(item.id)] = Date.now(); });
    const cutoff = Date.now() - 45 * 86400000;
    Object.keys(read).forEach(key => { if (read[key] < cutoff) delete read[key]; });
    this.memoryRead = read;
    try { localStorage.setItem(this.storageKey, JSON.stringify(read)); } catch { /* Session-only fallback. */ }
  }
}
