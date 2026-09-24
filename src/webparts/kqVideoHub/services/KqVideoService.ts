import { SPHttpClient } from '@microsoft/sp-http';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IKqVideo } from '../models/IKqVideo';

type UrlField = string | { Url?: string; Description?: string } | undefined;
interface ISharePointVideoItem {
  Id: number;
  Title?: string;
  VideoUrl?: UrlField;
  Thumbnail?: UrlField;
  Category?: string;
  IsPublished?: boolean | number | string;
  DisplayOrder?: number;
}

export default class KqVideoService {
  private readonly _context: WebPartContext;
  private _corporateError = '';

  public constructor(context: WebPartContext) { this._context = context; }
  public getCorporateError(): string { return this._corporateError; }

  // Verified Kenya Airways episodes. This is a maintained selection,
  // not an automatic channel feed. Add further official episode IDs here.
  private _getBeyondTerminalVideos(): IKqVideo[] {
    const episodes = [
      { id: 'Vt7a4NbEFj4', title: '40 Years in the Skies | The Dickson Nyibule Story' },
      { id: 'c69quEwwK4M', title: 'Mid-Air Birth at 30,000 Feet' },
      { id: 'WGT3pgGSENU', title: 'Capt Bob on Life, Responsibility & Surviving COVID' },
      { id: '-QFyWSwI2bg', title: 'The Jack Maina Story: Passion, Grit & Purpose' }
    ];
    return episodes.map((episode, index): IKqVideo => ({
      id: -(index + 1),
      title: episode.title,
      videoUrl: `https://www.youtube.com/watch?v=${episode.id}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${episode.id}/hqdefault.jpg`,
      category: 'beyond-terminal'
    }));
  }

  public async getVideos(): Promise<IKqVideo[]> {
    this._corporateError = '';
    const youtube = this._getBeyondTerminalVideos();
    try {
      return [...youtube, ...await this._getCorporateVideos()];
    } catch (error) {
      console.error('Corporate Stories loading failed:', error);
      this._corporateError = 'Unable to load Corporate Stories from KQ Videos Dev.';
      return youtube;
    }
  }

  private async _getCorporateVideos(): Promise<IKqVideo[]> {
    // Uses the signed-in user's access to the current SharePoint site.
    const webUrl = this._context.pageContext.web.absoluteUrl;
    const url = `${webUrl}/_api/web/lists/getbytitle('KQ Videos Dev')/items?$top=100`;
    const response = await this._context.spHttpClient.get(url, SPHttpClient.configurations.v1, {
      headers: { Accept: 'application/json;odata=nometadata' }
    });
    if (!response.ok) throw new Error(`SharePoint returned ${response.status}.`);
    const data: { value?: ISharePointVideoItem[] } = await response.json();
    return (data.value || [])
      .filter((item) => {
        const published = String(item.IsPublished).trim().toLowerCase();
        const category = (item.Category || '').trim().toLowerCase().replace(/\s+/g, '-');
        return (published === 'true' || published === '1') && category === 'corporate-stories';
      })
      .sort((a, b) => (a.DisplayOrder ?? 9999) - (b.DisplayOrder ?? 9999))
      .map((item): IKqVideo => ({
        id: item.Id,
        title: item.Title || 'Corporate Story',
        videoUrl: this._getUrl(item.VideoUrl),
        thumbnailUrl: this._getImageUrl(item.Thumbnail),
        category: 'corporate-stories'
      }))
      .filter((item) => !!item.videoUrl);
  }

  private _getUrl(value: UrlField): string {
    const raw = typeof value === 'string' ? value : value?.Url;
    if (!raw) return '';
    try {
      const url = new URL(raw, this._context.pageContext.web.absoluteUrl + '/');
      return ['https:', 'http:'].indexOf(url.protocol) !== -1 ? url.href : '';
    } catch { return ''; }
  }

  private _getImageUrl(value: UrlField): string {
    if (typeof value !== 'string') return this._getUrl(value);
    try {
      const parsed: { serverUrl?: string; serverRelativeUrl?: string; Url?: string; url?: string } = JSON.parse(value);
      if (!parsed || typeof parsed !== 'object') return '';
      if (parsed.serverRelativeUrl) return this._getUrl((parsed.serverUrl || '') + parsed.serverRelativeUrl);
      return this._getUrl(parsed.Url || parsed.url);
    } catch { return this._getUrl(value); }
  }
}
