import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IKqVideo } from '../models/IKqVideo';
import { FolderVideoStore } from './FolderVideoStore';
export { corporateFolderUrl } from './VideoConfig';
export { linkPlayer } from './VideoRules';
export default class KqVideoService {
  private readonly store: FolderVideoStore;
  private corporateError = '';
  public constructor(context: WebPartContext) { this.store = new FolderVideoStore(context); }
  public getCorporateError(): string { return this.corporateError; }
  public async getVideos(): Promise<IKqVideo[]> {
    this.corporateError = '';
    const episodes = [
      { id: 'Vt7a4NbEFj4', title: '40 Years in the Skies | The Dickson Nyibule Story' },
      { id: 'c69quEwwK4M', title: 'Mid-Air Birth at 30,000 Feet' },
      { id: 'WGT3pgGSENU', title: 'Capt Bob on Life, Responsibility & Surviving COVID' },
      { id: '-QFyWSwI2bg', title: 'The Jack Maina Story: Passion, Grit & Purpose' }
    ];
    const youtube = episodes.map((episode): IKqVideo => ({
      id: 'youtube:' + episode.id, title: episode.title,
      videoUrl: `https://www.youtube.com/watch?v=${episode.id}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${episode.id}/hqdefault.jpg`, category: 'beyond-terminal'
    }));
    try {
      const snapshot = await this.store.getSnapshot();
      const corporate = snapshot.videos.filter((video) => video.isPublished).map((video): IKqVideo => ({
        id: video.id, title: video.title, videoUrl: video.videoUrl, thumbnailUrl: video.thumbnailUrl,
        category: 'corporate-stories', driveId: video.sourceType === 'file' ? video.file?.driveId : undefined,
        driveItemId: video.sourceType === 'file' ? video.file?.itemId : undefined, duration: video.duration
      }));
      return [...corporate, ...youtube];
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode;
      this.corporateError = status === 401 || status === 403
        ? 'Corporate Stories access was denied. Check Graph read approval and your access to the corporate folder.'
        : error instanceof Error ? error.message : 'Unable to load Corporate Stories.';
      return youtube;
    }
  }
  public async getPreviewUrl(video: IKqVideo): Promise<string> {
    if (!video.driveId || !video.driveItemId) throw new Error('Video file identifiers are missing.');
    return this.store.getPreviewUrl({ driveId: video.driveId, itemId: video.driveItemId, webUrl: video.videoUrl });
  }
}
