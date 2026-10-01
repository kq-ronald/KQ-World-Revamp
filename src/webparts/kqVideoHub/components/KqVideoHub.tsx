import * as React from 'react';
import {
  IKqVideoHubProps
} from './IKqVideoHubProps';
import {
  IKqVideo,
  KqVideoCategory
} from '../models/IKqVideo';
import KqVideoService, { corporateFolderUrl }
  from '../services/KqVideoService';
import styles
  from './KqVideoHub.module.scss';
interface IKqVideoHubState {
  previewUrl: string;
  previewLoading: boolean;
  previewError: string;
  videos:
    IKqVideo[];
  selectedVideo?:
    IKqVideo;
  activeCategory:
    KqVideoCategory;
  isLoading:
    boolean;
  errorMessage:
    string;
  isDarkMode:
    boolean;
}
export default class KqVideoHub
  extends React.Component<
    IKqVideoHubProps,
    IKqVideoHubState
  > {
  private readonly rootRef = React.createRef<HTMLElement>();
  private layoutCleanup?: () => void;
  private disposed = false;
  private previewRequest = 0;
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
    // Remove width caps on wrappers belonging only to this standalone section.
    const canvas = zone.closest<HTMLElement>('[data-automation-id="CanvasLayout"]');
    let outer = canvas ? zone.parentElement : null;
    while (outer && outer !== canvas &&
           outer.querySelectorAll('[data-automation-id="CanvasZone"]').length === 1 &&
           !outer.querySelector('.kqWorldNavigationHost')) {
      mark(outer, 'data-kq-video-wrapper');
      outer = outer.parentElement;
    }
    let wrapper = root.parentElement;
    while (wrapper && wrapper !== zone) {
      mark(wrapper, 'data-kq-video-wrapper');
      wrapper = wrapper.parentElement;
    }
    this.layoutCleanup = () => marked.forEach(({ element, attribute, previous }) => {
      if (previous === null) element.removeAttribute(attribute);
      else element.setAttribute(attribute, previous);
    });
  }
  private readonly _videoService:
    KqVideoService;
  public constructor(
    props:
      IKqVideoHubProps
  ) {
    super(
      props
    );
    this._videoService =
      new KqVideoService(
        this.props.context
      );
    const currentTheme =
      typeof document !==
      'undefined'
        ? document
            .documentElement
            .getAttribute(
              'data-kq-theme'
            )
        : 'light';
    this.state = {
      previewUrl: '',
      previewLoading: false,
      previewError: '',
      videos:
        [],
      selectedVideo:
        undefined,
      activeCategory:
        'beyond-terminal',
      isLoading:
        true,
      errorMessage:
        '',
      isDarkMode:
        currentTheme ===
        'dark'
    };
  }
  public async componentDidMount():
    Promise<void> {
    window.addEventListener(
      'kqworld-theme-change',
      this._handleThemeChange as EventListener
    );
    const currentTheme =
      document
        .documentElement
        .getAttribute(
          'data-kq-theme'
        );
    this.setState({
      isDarkMode:
        currentTheme ===
        'dark'
    });
    this.setupLayout();
    await this._loadVideos();
  }
  public componentWillUnmount():
    void {
    this.disposed = true;
    this.layoutCleanup?.();
    window.removeEventListener(
      'kqworld-theme-change',
      this._handleThemeChange as EventListener
    );
  }
  private _handleThemeChange = (
    event:
      CustomEvent
  ): void => {
    const theme =
      event.detail?.theme;
    this.setState({
      isDarkMode:
        theme ===
        'dark'
    });
  };
  private async _loadVideos():
    Promise<void> {
    try {
      this.setState({
        isLoading:
          true,
        errorMessage:
          ''
      });
      const videos =
        await this
          ._videoService
          .getVideos();
      if (this.disposed) return;
      const beyondTerminalVideos =
        videos.filter(
          (
            video:
              IKqVideo
          ) =>
            video.category ===
            'beyond-terminal'
        );
      const selectedVideo =
        beyondTerminalVideos.length > 0
          ? beyondTerminalVideos[0]
          : videos.length > 0
            ? videos[0]
            : undefined;
      const activeCategory:
        KqVideoCategory =
          selectedVideo?.category ||
          'beyond-terminal';
      this.setState({
        videos,
        errorMessage: this._videoService.getCorporateError(),
        selectedVideo,
        activeCategory,
        isLoading:
          false
      });
    } catch (
      error
    ) {
      if (this.disposed) return;
      console.error(
        'KQ video hub error:',
        error
      );
      this.setState({
        isLoading:
          false,
        errorMessage:
          error instanceof Error
            ? error.message
            : 'Unable to load videos.'
      });
    }
  }
  private _selectVideo(video: IKqVideo): void {
    const request = ++this.previewRequest;
    this.setState({
      selectedVideo: video,
      previewUrl: '',
      previewError: '',
      previewLoading: video.category === 'corporate-stories'
    });
    if (video.category === 'corporate-stories') {
      this._loadPreview(video, request).catch(() => {
        if (!this.disposed && request === this.previewRequest) {
          this.setState({ previewLoading: false, previewError: 'Unable to prepare this video.' });
        }
      });
    }
  }

  private async _loadPreview(video: IKqVideo, request: number): Promise<void> {
    try {
      const previewUrl = await this._videoService.getPreviewUrl(video);
      if (this.disposed || request !== this.previewRequest) return;
      this.setState({ previewUrl, previewLoading: false, previewError: '' });
    } catch {
      if (this.disposed || request !== this.previewRequest) return;
      this.setState({
        previewLoading: false,
        previewError: 'The embedded preview is unavailable. You can open the video in a new tab.'
      });
    }
  }

  private _setCategory(category: KqVideoCategory): void {
    const first = this.state.videos.find((video) => video.category === category);
    this.setState({ activeCategory: category });
    if (first) {
      this._selectVideo(first);
    } else {
      ++this.previewRequest;
      this.setState({ selectedVideo: undefined, previewUrl: '', previewError: '', previewLoading: false });
    }
  }

  private _getVisibleVideos():
    IKqVideo[] {
    return this.state
      .videos
      .filter(
        (
          video:
            IKqVideo
        ) =>
          video.category ===
          this.state
            .activeCategory
      );
  }
  private _getVideoEmbedUrl(value: string): string {
    try {
      const url = new URL(value, this.props.context.pageContext.web.absoluteUrl + '/');
      if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
      const host = url.hostname.toLowerCase();
      let id = '';
      if (host === 'youtu.be') id = url.pathname.split('/')[1] || '';
      if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'www.youtube-nocookie.com'].indexOf(host) !== -1) {
        id = url.searchParams.get('v') || '';
        if (!id && /^\/(embed|shorts|live)\//.test(url.pathname)) id = url.pathname.split('/')[2] || '';
      }
      if (/^[A-Za-z0-9_-]{11}$/.test(id)) {
        return `https://www.youtube.com/embed/${id}?rel=0`;
      }
      return url.href;
    } catch { return ''; }
  }
  private _renderPlayer():
    React.ReactElement {
    const {
      selectedVideo
    } =
      this.state;
    if (
      !selectedVideo
    ) {
      return (
        <div
          className={
            styles.playerEmpty
          }
        >
          No video selected.
        </div>
      );
    }
    const corporate = selectedVideo.category === 'corporate-stories';
    const embedUrl = corporate
      ? this.state.previewUrl
      : this._getVideoEmbedUrl(selectedVideo.videoUrl);

    return (
      <div className={styles.player}>
        {corporate && this.state.previewLoading && (
          <div className={styles.playerEmpty} role="status">Loading video preview...</div>
        )}
        {corporate && this.state.previewError && (
          <div className={styles.playerEmpty} role="status">
            <p>{this.state.previewError}</p>
            <button type="button" onClick={() => this._selectVideo(selectedVideo)}>Retry preview</button>
          </div>
        )}
        {embedUrl && (
          !corporate && /\.(mp4|webm|ogg)(?:[?#]|$)/i.test(embedUrl) ? (
            <video key={embedUrl} src={embedUrl} controls playsInline
              poster={selectedVideo.thumbnailUrl || undefined} className={styles.playerFrame} />
          ) : (
            <iframe key={embedUrl} src={embedUrl} title={selectedVideo.title}
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen frameBorder="0" className={styles.playerFrame} />
          )
        )}
        <div className={styles.playerOverlay} style={{ pointerEvents: 'none' }}>
          <div className={styles.nowPlaying}>SELECTED VIDEO</div>
          <div className={styles.playerTitle}>{selectedVideo.title}</div>
        </div>
      </div>
    );
  }

  private _renderVideoItem(
    video:
      IKqVideo
  ): React.ReactElement {
    const isSelected =
      !!this.state
        .selectedVideo &&
      this.state
        .selectedVideo
        .id ===
      video.id;
    return (
      <button
        key={
          video.id
        }
        type="button"
        onClick={
          () =>
            this._selectVideo(
              video
            )
        }
        className={[
          styles.videoItem,
          isSelected
            ? styles
                .videoItemSelected
            : ''
        ].join(' ')}
      >
        <div
          className={
            styles.videoThumbnail
          }
        >
          {video.thumbnailUrl
            ? (
              <img
                src={
                  video.thumbnailUrl
                }
                alt=""
                className={
                  styles.thumbnailImage
                }
              />
            )
            : (
              <div
                className={
                  styles.thumbnailFallback
                }
              />
            )}
          <div
            className={
              styles.thumbnailPlayOverlay
            }
          >
            <div
              className={
                styles.thumbnailPlayButton
              }
            >
              ▶
            </div>
          </div>
        </div>
        <div
          className={
            styles.videoItemContent
          }
        >
          <div
            className={[
              styles.videoItemTitle,
              isSelected
                ? styles
                    .videoItemTitleSelected
                : ''
            ].join(' ')}
          >
            {video.title}
          </div>
          <div
            className={
              styles.videoItemMeta
            }
          >
            {isSelected
              ? 'Now playing'
              : 'Play video'}
          </div>
        </div>
      </button>
    );
  }
  public render():
    React.ReactElement<
      IKqVideoHubProps
    > {
    const {
      isLoading,
      errorMessage,
      activeCategory,
      isDarkMode
    } =
      this.state;
    const videos =
      this._getVisibleVideos();
    const videoLibraryUrl = corporateFolderUrl;
    return (
      <section
        ref={this.rootRef}
        className={[
          styles.kqVideoHub,
          isDarkMode
            ? styles.darkMode
            : ''
        ].join(' ')}
      >
        <div
          className={
            styles.header
          }
        >
          <div>
            <div
              className={
                styles.eyebrow
              }
            >
              WATCH
            </div>
            <h2
              className={
                styles.sectionTitle
              }
            >
              Videos... Watch what&apos;s happening
            </h2>
          </div>
          <a
            href={
              activeCategory === 'beyond-terminal'
                ? 'https://corporate.kenya-airways.com/en/press-room/beyond-the-terminal-podcast/'
                : videoLibraryUrl
            }
            target="_blank"
            rel="noopener noreferrer"
            className={
              styles.libraryLink
            }
          >
            Full Video Library
            <span>
              →
            </span>
          </a>
        </div>
        {isLoading && (
          <div
            className={
              styles.message
            }
          >
            Loading videos...
          </div>
        )}
        {!isLoading &&
          activeCategory === 'corporate-stories' && errorMessage && (
            <div
              className={
                styles.error
              }
            >
              {errorMessage}
            </div>
          )}
        {!isLoading && (
            <div
              className={
                styles.videoHubCard
              }
            >
              <div
                className={
                  styles.playerColumn
                }
              >
                {this._renderPlayer()}
                {this.state.selectedVideo?.category === 'corporate-stories' && (
                  <a href={this.state.selectedVideo.videoUrl} target="_blank" rel="noopener noreferrer"
                    className={styles.libraryLink} style={{ marginTop: 8 }}>
                    Open video in a new tab ↗
                  </a>
                )}
              </div>
              <div
                className={
                  styles.playlistColumn
                }
              >
                <div
                  className={
                    styles.tabBar
                  }
                >
                  <button
                    type="button"
                    onClick={
                      () =>
                        this._setCategory(
                          'beyond-terminal'
                        )
                    }
                    className={[
                      styles.tab,
                      activeCategory ===
                        'beyond-terminal'
                        ? styles.tabActive
                        : ''
                    ].join(' ')}
                  >
                    ✈&nbsp;&nbsp;Beyond The Terminal
                  </button>
                  <button
                    type="button"
                    onClick={
                      () =>
                        this._setCategory(
                          'corporate-stories'
                        )
                    }
                    className={[
                      styles.tab,
                      activeCategory ===
                        'corporate-stories'
                        ? styles.tabActive
                        : ''
                    ].join(' ')}
                  >
                    ♫&nbsp;&nbsp;Corporate Stories
                  </button>
                </div>
                <div
                  className={
                    styles.videoList
                  }
                >
                  {videos.length > 0
                    ? videos
                        .map(
                          (
                            video:
                              IKqVideo
                          ) =>
                            this._renderVideoItem(
                              video
                            )
                        )
                    : (
                      <div
                        className={
                          styles.message
                        }
                      >
                        No videos found in this category.
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}
      </section>
    );
  }
}
