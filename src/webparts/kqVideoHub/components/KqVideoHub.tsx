import * as React from 'react';
import { IKqVideoHubProps } from './IKqVideoHubProps';
import { IKqVideo, KqVideoCategory } from '../models/IKqVideo';
import KqVideoService, { corporateFolderUrl, linkPlayer } from '../services/KqVideoService';
import styles from './KqVideoHub.module.scss';
interface IKqVideoHubState {
  previewUrl: string; previewLoading: boolean; previewError: string;
  videos: IKqVideo[]; selectedVideo?: IKqVideo; activeCategory: KqVideoCategory;
  isLoading: boolean; errorMessage: string; isDarkMode: boolean;
}
export default class KqVideoHub extends React.Component<IKqVideoHubProps, IKqVideoHubState> {
  private readonly rootRef = React.createRef<HTMLElement>();
  private readonly videoService: KqVideoService;
  private layoutCleanup?: () => void;
  private disposed = false;
  private previewRequest = 0;
  public constructor(props: IKqVideoHubProps) {
    super(props);
    this.videoService = new KqVideoService(props.context);
    this.state = { previewUrl: '', previewLoading: false, previewError: '', videos: [],
      selectedVideo: undefined, activeCategory: 'corporate-stories', isLoading: true,
      errorMessage: '', isDarkMode: typeof document !== 'undefined' && document.documentElement.getAttribute('data-kq-theme') === 'dark' };
  }
  private setupLayout(): void {
    const root = this.rootRef.current;
    const zone = root?.closest<HTMLElement>('[data-automation-id="CanvasZone"]');
    if (!root || !zone || zone.querySelector('.kqWorldNavigationHost') ||
      zone.querySelectorAll('[data-automation-id="CanvasControl"]').length !== 1) return;
    const marked: Array<{ element: HTMLElement; attribute: string; previous: string | null }> = [];
    const mark = (element: HTMLElement, attribute: string): void => {
      marked.push({ element, attribute, previous: element.getAttribute(attribute) });
      element.setAttribute(attribute, 'true');
    };
    mark(zone, 'data-kq-video-zone');
    const canvas = zone.closest<HTMLElement>('[data-automation-id="CanvasLayout"]');
    let outer = canvas ? zone.parentElement : null;
    while (outer && outer !== canvas && outer.querySelectorAll('[data-automation-id="CanvasZone"]').length === 1 && !outer.querySelector('.kqWorldNavigationHost')) {
      mark(outer, 'data-kq-video-wrapper'); outer = outer.parentElement;
    }
    let wrapper = root.parentElement;
    while (wrapper && wrapper !== zone) { mark(wrapper, 'data-kq-video-wrapper'); wrapper = wrapper.parentElement; }
    this.layoutCleanup = () => marked.forEach(({ element, attribute, previous }) => {
      if (previous === null) element.removeAttribute(attribute); else element.setAttribute(attribute, previous);
    });
  }
  public async componentDidMount(): Promise<void> {
    window.addEventListener('kqworld-theme-change', this.handleThemeChange as EventListener);
    this.setupLayout();
    try {
      const videos = await this.videoService.getVideos();
      if (this.disposed) return;
      this.setState({ videos, errorMessage: this.videoService.getCorporateError(), isLoading: false }, () => {
        if (!this.disposed) this.setCategory('corporate-stories');
      });
    } catch (error) {
      if (!this.disposed) this.setState({ isLoading: false, errorMessage: error instanceof Error ? error.message : 'Unable to load videos.' });
    }
  }
  public componentWillUnmount(): void {
    this.disposed = true; ++this.previewRequest; this.layoutCleanup?.();
    window.removeEventListener('kqworld-theme-change', this.handleThemeChange as EventListener);
  }
  private handleThemeChange = (): void => {
    this.setState({ isDarkMode: document.documentElement.getAttribute('data-kq-theme') === 'dark' });
  };
  private selectVideo(video: IKqVideo): void {
    const request = ++this.previewRequest;
    const needsPreview = !!video.driveId && !!video.driveItemId;
    this.setState({ selectedVideo: video, previewUrl: '', previewError: '', previewLoading: needsPreview });
    if (needsPreview) {
      this.videoService.getPreviewUrl(video).then((url) => {
        if (!this.disposed && request === this.previewRequest) this.setState({ previewUrl: url, previewLoading: false });
      }).catch(() => {
        if (!this.disposed && request === this.previewRequest) this.setState({ previewLoading: false,
          previewError: 'The embedded preview is unavailable. Open the video in a new tab or retry.' });
      });
    }
  }
  private setCategory(category: KqVideoCategory): void {
    const first = this.state.videos.find((video) => video.category === category);
    this.setState({ activeCategory: category });
    if (first) this.selectVideo(first);
    else { ++this.previewRequest; this.setState({ selectedVideo: undefined, previewUrl: '', previewError: '', previewLoading: false }); }
  }
  private renderPlayer(): React.ReactElement {
    const video = this.state.selectedVideo;
    if (!video) return <div className={styles.playerEmpty}>No video selected.</div>;
    const isFile = !!video.driveId && !!video.driveItemId;
    let player: { kind: 'embed' | 'media' | 'external'; url: string } = { kind: 'external', url: video.videoUrl };
    if (isFile) player = { kind: 'embed', url: this.state.previewUrl };
    else { try { player = linkPlayer(video.videoUrl); } catch { /* Show the fallback message. */ } }
    return <div className={styles.player}>
      {this.state.previewLoading && <div className={styles.playerEmpty} role="status">Loading video preview…</div>}
      {this.state.previewError && <div className={styles.playerEmpty} role="status"><p>{this.state.previewError}</p>
        <button type="button" onClick={() => this.selectVideo(video)}>Retry preview</button></div>}
      {player.kind === 'external' && <div className={styles.playerEmpty}>
        <p>This video opens on its hosting site.</p>
        <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" data-interception="off">Open video ↗</a>
      </div>}
      {player.url && player.kind === 'media' && <video key={player.url} src={player.url} controls playsInline poster={video.thumbnailUrl || undefined} className={styles.playerFrame} />}
      {player.url && player.kind === 'embed' && <iframe key={player.url} src={player.url} title={video.title}
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowFullScreen frameBorder="0" className={styles.playerFrame} />}
      <div className={styles.playerOverlay} style={{ pointerEvents: 'none' }}>
        <div className={styles.nowPlaying}>SELECTED VIDEO</div><div className={styles.playerTitle}>{video.title}</div>
      </div>
    </div>;
  }
  private renderVideoItem(video: IKqVideo): React.ReactElement {
    const selected = this.state.selectedVideo?.id === video.id;
    return <button key={video.id} type="button" onClick={() => this.selectVideo(video)}
      className={[styles.videoItem, selected ? styles.videoItemSelected : ''].join(' ')}>
      <div className={styles.videoThumbnail}>
        {video.thumbnailUrl ? <img src={video.thumbnailUrl} alt="" className={styles.thumbnailImage} /> : <div className={styles.thumbnailFallback} />}
        <div className={styles.thumbnailPlayOverlay}><div className={styles.thumbnailPlayButton}>▶</div></div>
      </div>
      <div className={styles.videoItemContent}>
        <div className={[styles.videoItemTitle, selected ? styles.videoItemTitleSelected : ''].join(' ')}>{video.title}</div>
        <div className={styles.videoItemMeta}>{selected ? 'Selected video' : 'Play video'}</div>
      </div>
    </button>;
  }
  public render(): React.ReactElement<IKqVideoHubProps> {
    const { activeCategory, isDarkMode, isLoading, errorMessage, selectedVideo } = this.state;
    const videos = this.state.videos.filter((video) => video.category === activeCategory);
    return <section ref={this.rootRef} className={[styles.kqVideoHub, isDarkMode ? styles.darkMode : ''].join(' ')}>
      <div className={styles.header}>
        <div><div className={styles.eyebrow}>WATCH</div><h2 className={styles.sectionTitle}>Videos... Watch what&apos;s happening</h2></div>
        <a href={activeCategory === 'corporate-stories' ? corporateFolderUrl : 'https://corporate.kenya-airways.com/en/press-room/beyond-the-terminal-podcast/'}
          target="_blank" rel="noopener noreferrer" data-interception="off" className={styles.libraryLink}>Full Video Library <span>→</span></a>
      </div>
      {isLoading && <div className={styles.message}>Loading videos…</div>}
      {!isLoading && activeCategory === 'corporate-stories' && errorMessage && <div className={styles.error}>{errorMessage}</div>}
      {!isLoading && <div className={styles.videoHubCard}>
        <div className={styles.playerColumn}>
          {this.renderPlayer()}
          {selectedVideo && <a href={selectedVideo.videoUrl} target="_blank" rel="noopener noreferrer" data-interception="off"
            className={styles.libraryLink} style={{ marginTop: 8 }}>Open video in a new tab ↗</a>}
        </div>
        <div className={styles.playlistColumn}>
          <div className={styles.tabBar}>
            <button type="button" aria-pressed={activeCategory === 'corporate-stories'} onClick={() => this.setCategory('corporate-stories')}
              className={[styles.tab, activeCategory === 'corporate-stories' ? styles.tabActive : ''].join(' ')}>♫ Corporate Stories</button>
            <button type="button" aria-pressed={activeCategory === 'beyond-terminal'} onClick={() => this.setCategory('beyond-terminal')}
              className={[styles.tab, activeCategory === 'beyond-terminal' ? styles.tabActive : ''].join(' ')}>✈ Beyond The Terminal</button>
          </div>
          <div className={styles.videoList}>{videos.length ? videos.map((video) => this.renderVideoItem(video)) : <div className={styles.message}>No videos found in this category.</div>}</div>
        </div>
      </div>}
    </section>;
  }
}
