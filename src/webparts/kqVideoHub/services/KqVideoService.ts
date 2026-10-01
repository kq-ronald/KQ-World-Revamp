import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IKqVideo } from '../models/IKqVideo';

const corporateOwnerUpn = 'corpcom1@kenya-airways.com';
const corporateFolderPath =
  'Corporate Communications Documents/CORPORATE CONTENT/Sharepoint videos';

export const corporateFolderUrl =
  'https://kenyaairwaysplc-my.sharepoint.com/shared?listurl=' +
  encodeURIComponent('https://kenyaairwaysplc-my.sharepoint.com/personal/corpcom1_kenya-airways_com/Documents') +
  '&id=' + encodeURIComponent('/personal/corpcom1_kenya-airways_com/Documents/' + corporateFolderPath);

interface IDriveItem {
  id: string;
  name?: string;
  webUrl?: string;
  folder?: { childCount?: number };
  file?: { mimeType?: string };
  video?: { duration?: number };
  parentReference?: { driveId?: string };
  lastModifiedDateTime?: string;
  thumbnails?: Array<{
    medium?: { url?: string };
    small?: { url?: string };
    large?: { url?: string };
  }>;
  remoteItem?: IDriveItem;
}

interface IDrivePage {
  value?: IDriveItem[];
  '@odata.nextLink'?: string;
}

export default class KqVideoService {
  private readonly _context: WebPartContext;
  private _corporateError = '';

  public constructor(context: WebPartContext) {
    this._context = context;
  }

  public getCorporateError(): string {
    return this._corporateError;
  }

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
      const corporate = await this._getCorporateVideos();
      return [...youtube, ...corporate];
    } catch (error) {
      const status = (error as { statusCode?: number } | undefined)?.statusCode;
      this._corporateError = status === 401 || status === 403
        ? 'Corporate Stories access was denied. Check Microsoft Graph Files.Read.All approval and your access to the Corporate Stories folder.'
        : status === 404
          ? 'The Corporate Stories folder could not be found. Check the corporate account sign-in name and configured folder path.'
          : 'Unable to load Corporate Stories. Check folder access and try refreshing the page.';
      return youtube;
    }
  }

  private async _getCorporateVideos(): Promise<IKqVideo[]> {
    const client = await this._context.msGraphClientFactory.getClient('3');
    const encodedPath = corporateFolderPath.split('/').map((part) => encodeURIComponent(part)).join('/');
    const folder: IDriveItem = await client.api(
      `/users/${encodeURIComponent(corporateOwnerUpn)}/drive/root:/${encodedPath}`
    ).get();
    const driveId = folder.parentReference?.driveId;
    if (!folder.folder || !driveId || !folder.id) {
      throw new Error('The configured path did not resolve to a folder.');
    }

    const queue = [{ driveId, itemId: folder.id }];
    const visited = new Set<string>();
    const files = new Map<string, { item: IDriveItem; driveId: string }>();
    let inspected = 0;
    let requests = 0;

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) break;
      const key = current.driveId + ':' + current.itemId;
      if (visited.has(key)) continue;
      visited.add(key);
      let next = `/drives/${encodeURIComponent(current.driveId)}/items/${encodeURIComponent(current.itemId)}/children?$top=200&$expand=thumbnails`;
      const pages = new Set<string>();
      while (next) {
        if (pages.has(next) || ++requests > 100) {
          throw new Error('Folder traversal limit exceeded.');
        }
        pages.add(next);
        const page: IDrivePage = await client.api(next).get();
        for (const item of page.value || []) {
          if (++inspected > 5000) throw new Error('Folder item limit exceeded.');
          if (item.remoteItem) continue;
          const itemDriveId = item.parentReference?.driveId || current.driveId;
          if (item.folder) {
            queue.push({ driveId: itemDriveId, itemId: item.id });
          } else if (item.file && (
            !!item.video || (item.file.mimeType || '').indexOf('video/') === 0 ||
            /\.(mp4|m4v|mov|webm|wmv|avi|mkv|mpeg|mpg|ogg|ogv)$/i.test(item.name || '')
          )) {
            files.set(itemDriveId + ':' + item.id, { item, driveId: itemDriveId });
          }
        }
        next = page['@odata.nextLink'] || '';
        if (next && !next.startsWith('https://graph.microsoft.com/v1.0/')) {
          throw new Error('Unexpected pagination URL.');
        }
      }
    }

    return Array.from(files.values())
      .sort((a, b) => (b.item.lastModifiedDateTime || '').localeCompare(a.item.lastModifiedDateTime || '') ||
        (a.item.name || '').localeCompare(b.item.name || ''))
      .map(({ item, driveId: fileDriveId }, index): IKqVideo => {
        const thumbnail = item.thumbnails?.[0];
        const seconds = Math.floor((item.video?.duration || 0) / 1000);
        return {
          id: index + 1,
          title: (item.name || 'Corporate Story').replace(/\.[^.]+$/, '').replace(/[_]+/g, ' '),
          videoUrl: this._httpsUrl(item.webUrl),
          thumbnailUrl: this._httpsUrl(thumbnail?.medium?.url || thumbnail?.small?.url || thumbnail?.large?.url),
          category: 'corporate-stories',
          driveId: fileDriveId,
          driveItemId: item.id,
          duration: seconds ? `${Math.floor(seconds / 60)}:${('0' + seconds % 60).slice(-2)}` : undefined
        };
      })
      .filter((item) => !!item.videoUrl);
  }

  public async getPreviewUrl(video: IKqVideo): Promise<string> {
    if (!video.driveId || !video.driveItemId) {
      throw new Error('Video file identifiers are missing.');
    }
    const client = await this._context.msGraphClientFactory.getClient('3');
    const preview: { getUrl?: string } = await client.api(
      `/drives/${encodeURIComponent(video.driveId)}/items/${encodeURIComponent(video.driveItemId)}/preview`
    ).post({});
    const url = this._httpsUrl(preview.getUrl);
    if (!url) throw new Error('An embeddable preview is not available for this video.');
    return url;
  }

  private _httpsUrl(value?: string): string {
    if (!value) return '';
    try {
      const url = new URL(value);
      return url.protocol === 'https:' ? url.href : '';
    } catch {
      return '';
    }
  }
}
