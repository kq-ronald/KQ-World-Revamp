import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IFileReference, IVideo, IVideoEntry, IVideoInput, IVideoSnapshot } from '../models/IVideo';
import { corporateOwnerUpn, corporateFolderPath, settingsFileName } from './VideoConfig';
import { applyOrder, httpsUrl, insertAtPosition } from './VideoRules';

interface IDriveItem {
  id: string; name?: string; webUrl?: string; eTag?: string;
  folder?: { childCount?: number }; file?: { mimeType?: string };
  video?: { duration?: number }; remoteItem?: unknown;
  parentReference?: { driveId?: string };
  lastModifiedDateTime?: string;
  '@microsoft.graph.downloadUrl'?: string;
  thumbnails?: Array<{ medium?: { url?: string }; small?: { url?: string }; large?: { url?: string } }>;
}
interface ISettings { version: 1; entries: IVideoEntry[]; }
interface IFolder { driveId: string; itemId: string; }
interface IReadResult extends IVideoSnapshot {
  folder: IFolder;
  settingsItem?: IDriveItem;
  settings: ISettings;
}

export class FolderVideoStore {
  public constructor(private readonly context: WebPartContext) {}

  public async getSnapshot(): Promise<IVideoSnapshot> {
  const data = await this.read();
  const videos: IVideo[] = [];

  for (let start = 0; start < data.videos.length; start += 4) {
    const batch = await Promise.all(
      data.videos.slice(start, start + 4).map(
        async (video): Promise<IVideo> => {
          const result = { ...video };
          const thumbnail = result.thumbnail;

          if (!thumbnail) {
            return result;
          }

          try {
            const client =
              await this.context.msGraphClientFactory.getClient('3');

            const item: IDriveItem = await client
              .api(this.itemPath(thumbnail))
              .get();

            return {
              ...result,
              thumbnailUrl:
                item['@microsoft.graph.downloadUrl'] ||
                result.thumbnailUrl
            };
          } catch {
            return result;
          }
        }
      )
    );

    videos.push(...batch);
  }

  return {
    videos,
    revision: data.revision
  };
}

  // Explicit CMS initialization preserves the existing folder playlist once.
  // Later unregistered files default to draft, including interrupted uploads.
  public async initialize(): Promise<void> {
    const data = await this.read();
    if (!data.settingsItem) await this.write(data, data.videos.map((video) => this.entry(video)));
  }

  public async save(input: IVideoInput, originalId?: string): Promise<void> {
    if (!input.title.trim() || input.title.length > 255) throw new Error('Enter a title of 1–255 characters.');
    httpsUrl(input.videoUrl);
    if (input.sourceType === 'file' && !input.file) throw new Error('Select a video file.');
    if (input.sourceType !== 'file' && input.sourceType !== 'link') throw new Error('Select upload or link.');
    const data = await this.read();
    this.checkRevision(input.revision, data.revision);
    if (!data.settingsItem) throw new Error('Open Video Manager first to initialize the folder settings.');
    const item = this.entry(input);
    const managed = data.settings.entries.find((entry) => entry.id === item.id);
    if (managed && item.id !== originalId) throw new Error('This video already exists. Edit its entry in the manager.');
    let existing = data.videos.map((video) => this.entry(video));
    // A replaced source remains in the folder as a draft; it is not deleted.
    if (originalId && originalId !== item.id) {
      existing = existing.map((entry) => entry.id === originalId ? { ...entry, isPublished: false } : entry);
    }
    const entries = insertAtPosition(existing, item);
    await this.write(data, entries);
  }

  public async setPublished(video: IVideo, published: boolean): Promise<void> {
    const data = await this.read();
    this.checkRevision(video.revision, data.revision);
    const entries = data.videos.map((item) => this.entry(item.id === video.id ? { ...item, isPublished: published } : item));
    await this.write(data, entries);
  }

  public async saveOrder(videos: IVideo[]): Promise<void> {
    if (!videos.length) return;
    const data = await this.read();
    this.checkRevision(videos[0].revision, data.revision);
    await this.write(data, applyOrder(data.videos.map((video) => this.entry(video)), videos.map((video) => video.id)));
  }

  public async uploadVideo(file: File, progress: (percent: number) => void): Promise<IFileReference> {
    if (!/\.(mp4|m4v|mov|webm|wmv|avi|mkv|mpeg|mpg|ogg|ogv)$/i.test(file.name)) {
      throw new Error('Choose a video file. MP4 is recommended for browser playback.');
    }
    await this.initialize();
    return this.uploadFile(file, progress);
  }

  public async uploadThumbnail(file: File): Promise<IFileReference> {
    if (!/\.(jpg|jpeg|png|webp)$/i.test(file.name) || file.size > 10 * 1024 * 1024) {
      throw new Error('Choose a JPG, PNG or WebP thumbnail of 10 MB or less.');
    }
    return this.uploadFile(file, () => undefined);
  }

  public async getPreviewUrl(file: IFileReference): Promise<string> {
    const client = await this.context.msGraphClientFactory.getClient('3');
    const preview: { getUrl?: string } = await client.api(this.itemPath(file) + '/preview').post({});
    if (!preview.getUrl) throw new Error('No embedded preview is available.');
    return httpsUrl(preview.getUrl);
  }

  private itemPath(file: IFileReference): string {
    return `/drives/${encodeURIComponent(file.driveId)}/items/${encodeURIComponent(file.itemId)}`;
  }

  private async folder(): Promise<IFolder> {
    const client = await this.context.msGraphClientFactory.getClient('3');
    const path = corporateFolderPath.split('/').map(encodeURIComponent).join('/');
    const item: IDriveItem = await client.api(`/users/${encodeURIComponent(corporateOwnerUpn)}/drive/root:/${path}`).get();
    if (!item.folder || !item.parentReference?.driveId) throw new Error('The Corporate Communications video folder could not be found.');
    return { driveId: item.parentReference.driveId, itemId: item.id };
  }

  private async read(): Promise<IReadResult> {
    const client = await this.context.msGraphClientFactory.getClient('3');
    const folder = await this.folder();
    let settingsItem: IDriveItem | undefined;
    try {
      settingsItem = await client.api(`/drives/${encodeURIComponent(folder.driveId)}/items/${encodeURIComponent(folder.itemId)}:/${settingsFileName}`).get();
    } catch (error) {
      if ((error as { statusCode?: number }).statusCode !== 404) throw error;
    }
    let settings: ISettings = { version: 1, entries: [] };
    if (settingsItem) {
      const download = settingsItem['@microsoft.graph.downloadUrl'];
      if (!download) throw new Error('The folder settings download URL is unavailable.');
      const response = await fetch(httpsUrl(download), { credentials: 'omit', cache: 'no-store' });
      if (!response.ok) throw new Error('Unable to read the folder settings.');
      settings = this.parseSettings(await response.json());
      if (!settingsItem.eTag) throw new Error('The folder settings version is missing.');
    }
    const revision = settingsItem?.eTag || 'uninitialized';
    const queue = [folder];
    const visited = new Set<string>();
    const files = new Map<string, { item: IDriveItem; driveId: string }>();
    let requests = 0;
    let inspected = 0;
    while (queue.length) {
      const current = queue.shift();
      if (!current) break;
      const key = current.driveId + ':' + current.itemId;
      if (visited.has(key)) continue;
      visited.add(key);
      let next = `/drives/${encodeURIComponent(current.driveId)}/items/${encodeURIComponent(current.itemId)}/children?$top=200&$expand=thumbnails`;
      while (next) {
        if (++requests > 100) throw new Error('Folder traversal limit reached.');
        const page: { value?: IDriveItem[]; '@odata.nextLink'?: string } = await client.api(next).get();
        for (const item of page.value || []) {
          if (++inspected > 5000) throw new Error('Folder item limit reached.');
          if (item.remoteItem) continue;
          const driveId = item.parentReference?.driveId || current.driveId;
          if (item.folder) queue.push({ driveId, itemId: item.id });
          else if (item.file && (item.video || /\.(mp4|m4v|mov|webm|wmv|avi|mkv|mpeg|mpg|ogg|ogv)$/i.test(item.name || ''))) {
            files.set(this.fileKey(driveId, item.id), { item, driveId });
          }
        }
        next = page['@odata.nextLink'] || '';
        if (next && !next.startsWith('https://graph.microsoft.com/v1.0/')) throw new Error('Unexpected folder pagination URL.');
      }
    }
    const videos: IVideo[] = [];
    const claimed = new Set<string>();
    for (const entry of settings.entries) {
      if (entry.sourceType === 'link') videos.push({ ...entry, thumbnailUrl: '', revision });
      else if (entry.file) {
        const key = this.fileKey(entry.file.driveId, entry.file.itemId);
        const found = files.get(key);
        if (found) {
          claimed.add(key);
          const video = this.fromFile(found.item, found.driveId, revision, entry.isPublished, entry.displayOrder);
          videos.push({ ...video, ...entry, videoUrl: video.videoUrl, file: video.file, revision });
        }
        // Missing/deleted/moved-out files are not presented as playable entries.
      }
    }
    const unmanaged = Array.from(files.entries()).filter(([key]) => !claimed.has(key))
      .sort((a, b) => (b[1].item.lastModifiedDateTime || '').localeCompare(a[1].item.lastModifiedDateTime || '') ||
        (a[1].item.name || '').localeCompare(b[1].item.name || ''));
    const maxOrder = videos.reduce((max, video) => Math.max(max, video.displayOrder), 0);
    unmanaged.forEach(([, found], index) => {
      videos.push(this.fromFile(found.item, found.driveId, revision, !settingsItem, maxOrder + index + 1));
    });
    videos.sort((a, b) => a.displayOrder - b.displayOrder || a.id.localeCompare(b.id));
    return { videos, revision, settings, settingsItem, folder };
  }

  private fromFile(item: IDriveItem, driveId: string, revision: string, published: boolean, order: number): IVideo {
    const thumbnail = item.thumbnails?.[0];
    const seconds = Math.floor((item.video?.duration || 0) / 1000);
    const webUrl = item.webUrl ? httpsUrl(item.webUrl) : '';
    return {
      id: this.fileKey(driveId, item.id), sourceType: 'file',
      title: (item.name || 'Corporate Story').replace(/\.[^.]+$/, '').replace(/_+/g, ' '),
      file: { driveId, itemId: item.id, webUrl }, videoUrl: webUrl,
      thumbnailUrl: thumbnail?.medium?.url || thumbnail?.small?.url || thumbnail?.large?.url || '',
      duration: seconds ? `${Math.floor(seconds / 60)}:${('0' + seconds % 60).slice(-2)}` : undefined,
      isPublished: published, displayOrder: order, revision
    };
  }

  private fileKey(driveId: string, itemId: string): string { return 'file:' + driveId + ':' + itemId; }
  private entry(video: IVideoEntry): IVideoEntry {
    return { id: video.id, title: video.title.trim(), sourceType: video.sourceType,
      videoUrl: video.videoUrl, file: video.sourceType === 'file' ? video.file : undefined,
      thumbnail: video.thumbnail, isPublished: video.isPublished, displayOrder: video.displayOrder };
  }
  private checkRevision(expected: string, actual: string): void {
    if (expected !== actual) throw new Error('Another editor changed the playlist. Refresh the manager and reopen this form.');
  }

  private parseSettings(value: unknown): ISettings {
    const data = value as Partial<ISettings> | null;
    if (!data || data.version !== 1 || !Array.isArray(data.entries)) throw new Error('The folder settings file is invalid. Restore its previous version before editing.');
    const ids = new Set<string>();
    for (const item of data.entries) {
      if (!item || typeof item.id !== 'string' || !item.id || ids.has(item.id) ||
        typeof item.title !== 'string' || typeof item.videoUrl !== 'string' ||
        typeof item.isPublished !== 'boolean' || !Number.isInteger(item.displayOrder) || item.displayOrder < 1 ||
        (item.sourceType !== 'file' && item.sourceType !== 'link')) throw new Error('The folder settings contain an invalid video entry.');
      httpsUrl(item.videoUrl);
      if (item.sourceType === 'file' && !this.validReference(item.file)) throw new Error('A video file reference is invalid.');
      if (item.thumbnail && !this.validReference(item.thumbnail)) throw new Error('A thumbnail reference is invalid.');
      ids.add(item.id);
    }
    return data as ISettings;
  }
  private validReference(value?: IFileReference): boolean {
    return !!value && typeof value.driveId === 'string' && !!value.driveId &&
      typeof value.itemId === 'string' && !!value.itemId && typeof value.webUrl === 'string';
  }

  private async write(data: IReadResult, entries: IVideoEntry[]): Promise<void> {
    // Keep metadata for temporarily missing files, so restoring a file doesn't lose its draft state.
    const retained = data.settings.entries.filter((old) => !data.videos.some((video) => video.id === old.id) && !entries.some((video) => video.id === old.id));
    const body = new Blob([JSON.stringify({ version: 1, entries: [...entries, ...retained] }, null, 2)], { type: 'application/json' });
    const client = await this.context.msGraphClientFactory.getClient('3');
    const path = data.settingsItem
      ? `/drives/${encodeURIComponent(data.folder.driveId)}/items/${encodeURIComponent(data.settingsItem.id)}/createUploadSession`
      : `/drives/${encodeURIComponent(data.folder.driveId)}/items/${encodeURIComponent(data.folder.itemId)}:/${settingsFileName}:/createUploadSession`;
    let request = client.api(path);
    if (data.settingsItem?.eTag) request = request.header('If-Match', data.settingsItem.eTag);
    try {
      const session: { uploadUrl?: string } = await request.post({ item: {
        name: settingsFileName, '@microsoft.graph.conflictBehavior': data.settingsItem ? 'replace' : 'fail'
      } });
      if (!session.uploadUrl) throw new Error('Unable to create a folder settings upload session.');
      await this.sendChunks(session.uploadUrl, body, () => undefined);
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode;
      if (status === 409 || status === 412) throw new Error('The playlist changed. Refresh before saving again.');
      throw error;
    }
  }

  private async uploadFile(file: File, progress: (percent: number) => void): Promise<IFileReference> {
    if (!file.size) throw new Error('The selected file is empty.');
    const folder = await this.folder();
    const client = await this.context.msGraphClientFactory.getClient('3');
    const name = file.name.replace(/["*:<>?\/\\|#%]/g, '_');
    const session: { uploadUrl?: string } = await client.api(
      `/drives/${encodeURIComponent(folder.driveId)}/items/${encodeURIComponent(folder.itemId)}:/${encodeURIComponent(name)}:/createUploadSession`
    ).post({ item: { name, '@microsoft.graph.conflictBehavior': 'rename' } });
    if (!session.uploadUrl) throw new Error('Unable to start the upload.');
    const item = await this.sendChunks(session.uploadUrl, file, progress);
    if (!item.id || !item.webUrl) throw new Error('The upload completed but its file details are missing. Check the folder before retrying.');
    return { driveId: folder.driveId, itemId: item.id, webUrl: item.webUrl };
  }

  private async sendChunks(uploadUrl: string, body: Blob, progress: (percent: number) => void): Promise<IDriveItem> {
    httpsUrl(uploadUrl);
    const size = 10 * 327680;
    try {
      for (let offset = 0; offset < body.size; offset += size) {
        const end = Math.min(offset + size, body.size);
        const response = await fetch(uploadUrl, { method: 'PUT', credentials: 'omit',
          headers: { 'Content-Type': 'application/octet-stream', 'Content-Range': `bytes ${offset}-${end - 1}/${body.size}` },
          body: body.slice(offset, end) });
        if (!response.ok) throw new Error(`Upload failed (${response.status}). Refresh or retry; check the folder if the last upload response was lost.`);
        progress(Math.round(end / body.size * 100));
        if (response.status === 200 || response.status === 201) return await response.json() as IDriveItem;
        if (response.status !== 202) throw new Error('Unexpected upload response.');
      }
      throw new Error('The upload did not return a completed file.');
    } catch (error) {
      try { await fetch(uploadUrl, { method: 'DELETE', credentials: 'omit' }); } catch { /* Session will expire. */ }
      throw error;
    }
  }
}
