import * as React from 'react';

import {
  IKqVideoHubProps
} from './IKqVideoHubProps';

import {
  IKqVideo,
  KqVideoCategory
} from '../models/IKqVideo';

import KqVideoService
  from '../services/KqVideoService';

import styles
  from './KqVideoHub.module.scss';


interface IKqVideoHubState {
  videos: IKqVideo[];
  selectedVideo?: IKqVideo;

  activeCategory:
    KqVideoCategory;

  isLoading: boolean;
  errorMessage: string;

  isDarkMode: boolean;
}


export default class KqVideoHub
  extends React.Component<
    IKqVideoHubProps,
    IKqVideoHubState
  > {

  private readonly _videoService:
    KqVideoService;


  public constructor(
    props: IKqVideoHubProps
  ) {

    super(props);

    this._videoService =
      new KqVideoService(
        this.props.context
      );

    const currentTheme =
      typeof document !== 'undefined'
        ? document.documentElement
            .getAttribute(
              'data-kq-theme'
            )
        : 'light';

    this.state = {
      videos: [],

      selectedVideo:
        undefined,

      activeCategory:
        'beyond-terminal',

      isLoading:
        true,

      errorMessage:
        '',

      isDarkMode:
        currentTheme === 'dark'
    };
  }


  public async componentDidMount():
    Promise<void> {

    window.addEventListener(
      'kqworld-theme-change',
      this._handleThemeChange as EventListener
    );

    const currentTheme =
      document.documentElement
        .getAttribute(
          'data-kq-theme'
        );

    this.setState({
      isDarkMode:
        currentTheme === 'dark'
    });

    await this._loadVideos();
  }


  public componentWillUnmount():
    void {

    window.removeEventListener(
      'kqworld-theme-change',
      this._handleThemeChange as EventListener
    );
  }


  private _handleThemeChange = (
    event: CustomEvent
  ): void => {

    const theme =
      event.detail?.theme;

    this.setState({
      isDarkMode:
        theme === 'dark'
    });
  };


  private async _loadVideos():
    Promise<void> {

    try {

      this.setState({
        isLoading: true,
        errorMessage: ''
      });

      const results =
        await Promise.all([
          this._videoService
            .getVideos(),

          this._videoService
            .getFeaturedVideo()
        ]);

      const videos =
        results[0];

      const featured =
        results[1];

      let selected:
        IKqVideo | undefined =
          featured;

      if (
        !selected &&
        videos.length > 0
      ) {

        selected =
          videos[0];
      }

      this.setState({
        videos,

        selectedVideo:
          selected,

        isLoading:
          false
      });

    } catch (error) {

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


  private _selectVideo(
    video: IKqVideo
  ): void {

    this.setState({
      selectedVideo:
        video
    });
  }


  private _setCategory(
    category:
      KqVideoCategory
  ): void {

    this.setState({
      activeCategory:
        category
    });
  }


  private _getVisibleVideos():
    IKqVideo[] {

    const filtered =
      this.state.videos.filter(
        (
          video:
            IKqVideo
        ) =>
          video.category ===
          this.state.activeCategory
      );

    return filtered.length > 0
      ? filtered
      : this.state.videos;
  }


  private _getVideoEmbedUrl(
    url: string
  ): string {

    if (!url) {
      return '';
    }

    const youtubeWatch =
      url.match(
        /youtube\.com\/watch\?v=([^&]+)/i
      );

    if (
      youtubeWatch &&
      youtubeWatch[1]
    ) {

      return (
        'https://www.youtube.com/embed/' +
        youtubeWatch[1] +
        '?autoplay=1'
      );
    }

    const youtubeShort =
      url.match(
        /youtu\.be\/([^?&/]+)/i
      );

    if (
      youtubeShort &&
      youtubeShort[1]
    ) {

      return (
        'https://www.youtube.com/embed/' +
        youtubeShort[1] +
        '?autoplay=1'
      );
    }

    return url;
  }


  private _renderPlayer():
    React.ReactElement {

    const {
      selectedVideo
    } = this.state;

    if (!selectedVideo) {

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

    const embedUrl =
      this._getVideoEmbedUrl(
        selectedVideo.videoUrl
      );

    return (

      <div
        className={
          styles.player
        }
      >

        <iframe
          key={embedUrl}
          src={embedUrl}
          title={
            selectedVideo.title
          }
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          frameBorder="0"
          className={
            styles.playerFrame
          }
        />

        <div
          className={
            styles.playerOverlay
          }
        >

          <div
            className={
              styles.nowPlaying
            }
          >
            NOW PLAYING
          </div>

          <div
            className={
              styles.playerTitle
            }
          >
            {selectedVideo.title}
          </div>

        </div>

      </div>
    );
  }


  private _renderVideoItem(
    video: IKqVideo
  ): React.ReactElement {

    const isSelected =
      !!this.state.selectedVideo &&
      this.state.selectedVideo.id ===
        video.id;

    return (

      <button
        key={video.id}
        type="button"
        onClick={() =>
          this._selectVideo(
            video
          )
        }
        className={[
          styles.videoItem,
          isSelected
            ? styles.videoItemSelected
            : ''
        ].join(' ')}
      >

        <div
          className={
            styles.videoThumbnail
          }
        >

          {video.thumbnailUrl ? (

            <img
              src={
                video.thumbnailUrl
              }
              alt=""
              className={
                styles.thumbnailImage
              }
            />

          ) : (

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
                ? styles.videoItemTitleSelected
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
    } = this.state;

    const videos =
      this._getVisibleVideos();

    return (

      <section
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
              Videos... Watch what's happening
            </h2>

          </div>


          <a
            href={
              `${window.location.origin}` +
              '/homepage/Lists/Videos/AllItems.aspx'
            }
            target="_blank"
            rel="noreferrer"
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
          errorMessage && (

          <div
            className={
              styles.error
            }
          >
            {errorMessage}
          </div>

        )}


        {!isLoading &&
          !errorMessage && (

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
                  onClick={() =>
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
                  onClick={() =>
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

                {videos
                  .slice(0, 4)
                  .map(
                    (
                      video:
                        IKqVideo
                    ) =>
                      this._renderVideoItem(
                        video
                      )
                  )}

              </div>

            </div>

          </div>

        )}

      </section>
    );
  }
}