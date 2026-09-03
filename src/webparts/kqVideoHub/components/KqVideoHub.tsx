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

interface IKqVideoHubState {
  videos: IKqVideo[];
  selectedVideo?: IKqVideo;
  activeCategory:
    KqVideoCategory;
  isLoading: boolean;
  errorMessage: string;
  windowWidth: number;
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

    this.state = {
      videos: [],
      selectedVideo:
        undefined,
      activeCategory:
        'beyond-terminal',
      isLoading: true,
      errorMessage: '',
      windowWidth:
        window.innerWidth
    };
  }

  public async componentDidMount():
    Promise<void> {

    window.addEventListener(
      'resize',
      this._handleResize
    );

    await this._loadVideos();
  }

  public componentWillUnmount():
    void {

    window.removeEventListener(
      'resize',
      this._handleResize
    );
  }

  private _handleResize = ():
    void => {

    this.setState({
      windowWidth:
        window.innerWidth
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
        isLoading: false
      });

    } catch (error) {

      console.error(
        'KQ video hub error:',
        error
      );

      this.setState({
        isLoading: false,
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

    /*
     * If a category happens to have
     * no items, show the real video
     * collection rather than a blank box.
     */
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

    /*
     * YouTube normal links
     */
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

    /*
     * YouTube short links
     */
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
          style={{
            width: '100%',
            height: '100%',
            minHeight: 350,
            display: 'flex',
            alignItems:
              'center',
            justifyContent:
              'center',
            background:
              '#1b1b1b',
            color:
              '#ffffff'
          }}
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
        style={{
          position:
            'relative',
          width: '100%',
          height: '100%',
          minHeight:
            this.state.windowWidth <= 640
              ? 280
              : 440,
          background:
            '#111111',
          overflow:
            'hidden'
        }}
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
          style={{
            width: '100%',
            height: '100%',
            minHeight:
              this.state.windowWidth <= 640
                ? 280
                : 440,
            border: 'none'
          }}
        />

        <div
          style={{
            position:
              'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding:
              '80px 24px 22px',
            pointerEvents:
              'none',
            color:
              '#ffffff',
            background:
              'linear-gradient(to top, rgba(0,0,0,.86), rgba(0,0,0,0))'
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing:
                2,
              marginBottom: 8,
              opacity: 0.8
            }}
          >
            NOW PLAYING
          </div>

          <div
            style={{
              fontSize:
                this.state.windowWidth <= 640
                  ? 19
                  : 23,
              lineHeight: 1.25,
              fontWeight: 500
            }}
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
    this.state.selectedVideo.id === video.id;

  return (
    <button
      key={video.id}
      type="button"
      onClick={() =>
        this._selectVideo(video)
      }
      style={{
        width: '100%',
        border: 'none',
        borderRadius: 14,
        padding: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        textAlign: 'left',
        background:
          isSelected
            ? '#f0f1f4'
            : '#ffffff',
        transition:
          'all .2s ease'
      }}
    >
      <div
        style={{
          width:
            this.state.windowWidth <= 640
              ? 100
              : 108,
          minWidth:
            this.state.windowWidth <= 640
              ? 100
              : 108,
          height: 68,
          borderRadius: 12,
          overflow: 'hidden',
          background: '#e6e6e6',
          position: 'relative'
        }}
      >
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background:
                'linear-gradient(135deg,#8a8a8a,#d1d1d1)'
            }}
          />
        )}

        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              width: 27,
              height: 27,
              borderRadius: '50%',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ed1c24',
              fontSize: 11,
              boxShadow:
                '0 2px 8px rgba(0,0,0,.15)'
            }}
          >
            ▶
          </div>
        </div>
      </div>

      <div
        style={{
          minWidth: 0,
          flex: 1
        }}
      >
        <div
          style={{
            fontSize: 14,
            lineHeight: 1.3,
            fontWeight: 700,
            color:
              isSelected
                ? '#ed1c24'
                : '#17213a',
            marginBottom: 5,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden'
          }}
        >
          {video.title}
        </div>

        <div
          style={{
            fontSize: 11,
            color: '#8b909b'
          }}
        >
          {isSelected
            ? 'Now playing'
            : 'Play video'}
        </div>
      </div>
    </button>
  );
}

  private _getTabStyle(
    active: boolean
  ): React.CSSProperties {

    return {
      flex: 1,
      border: 'none',
      borderRadius: 999,
      padding:
        '12px 18px',
      cursor:
        'pointer',
      background:
        active
          ? '#ed1c24'
          : '#ffffff',
      color:
        active
          ? '#ffffff'
          : '#151515',
      fontWeight: 700,
      fontSize: 14,
      whiteSpace:
        'nowrap'
    };
  }

  public render():
  React.ReactElement<IKqVideoHubProps> {

  const {
    isLoading,
    errorMessage,
    activeCategory,
    windowWidth
  } = this.state;

  const mobile =
    windowWidth <= 768;

  const videos =
    this._getVisibleVideos();

  return (
    <section
      style={{
        width: '100%',
        boxSizing: 'border-box',
        padding: '24px 0 36px'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems:
            mobile
              ? 'flex-start'
              : 'flex-end',
          flexDirection:
            mobile
              ? 'column'
              : 'row',
          gap: 18,
          marginBottom: 26
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#151515',
              marginBottom: 9
            }}
          >
            WATCH
          </div>

          <h2
            style={{
              margin: 0,
              color: '#ed1c24',
              fontSize:
                mobile
                  ? 26
                  : 34,
              lineHeight: 1.1,
              fontStyle: 'italic',
              fontWeight: 700
            }}
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
          style={{
            width:
              mobile
                ? '100%'
                : 220,
            padding: '12px 20px',
            boxSizing: 'border-box',
            border:
              '1px solid #ed1c24',
            borderRadius: 999,
            color: '#ed1c24',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: 13,
            textAlign: 'center',
            background: '#ffffff'
          }}
        >
          Full Video Library
          &nbsp;&nbsp; →
        </a>
      </div>

      {isLoading && (
        <div
          style={{
            padding: 45,
            textAlign: 'center'
          }}
        >
          Loading videos...
        </div>
      )}

      {!isLoading &&
        errorMessage && (
          <div
            style={{
              padding: 20,
              border:
                '1px solid #f04438',
              borderRadius: 10,
              color: '#b42318',
              background: '#fef3f2'
            }}
          >
            {errorMessage}
          </div>
        )}

      {!isLoading &&
        !errorMessage && (
          <div
            style={{
              width: '100%',
              border:
                '1px solid #d7d7d7',
              borderRadius: 16,
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns:
                mobile
                  ? '1fr'
                  : '64% 36%',
              background: '#ffffff',
              boxShadow:
                '0 5px 16px rgba(0,0,0,.07)'
            }}
          >
            <div
              style={{
                minWidth: 0
              }}
            >
              {this._renderPlayer()}
            </div>

            <div
              style={{
                padding:
                  mobile
                    ? 16
                    : '18px 20px',
                boxSizing: 'border-box',
                minWidth: 0
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  border:
                    '1px solid #d9d9d9',
                  borderRadius: 999,
                  padding: 4,
                  marginBottom: 18,
                  boxShadow:
                    '0 3px 9px rgba(0,0,0,.06)',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    this._setCategory(
                      'beyond-terminal'
                    )
                  }
                  style={{
                    flex: 1,
                    minWidth: 0,
                    border: 'none',
                    borderRadius: 999,
                    padding: '10px 8px',
                    cursor: 'pointer',
                    background:
                      activeCategory ===
                      'beyond-terminal'
                        ? '#ed1c24'
                        : '#ffffff',
                    color:
                      activeCategory ===
                      'beyond-terminal'
                        ? '#ffffff'
                        : '#151515',
                    fontWeight: 700,
                    fontSize: 12,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  ✈ Beyond The Terminal
                </button>

                <button
                  type="button"
                  onClick={() =>
                    this._setCategory(
                      'corporate-stories'
                    )
                  }
                  style={{
                    flex: 1,
                    minWidth: 0,
                    border: 'none',
                    borderRadius: 999,
                    padding: '10px 8px',
                    cursor: 'pointer',
                    background:
                      activeCategory ===
                      'corporate-stories'
                        ? '#ed1c24'
                        : '#ffffff',
                    color:
                      activeCategory ===
                      'corporate-stories'
                        ? '#ffffff'
                        : '#151515',
                    fontWeight: 700,
                    fontSize: 12,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  ♫ Corporate Stories
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  maxHeight:
                    mobile
                      ? 'none'
                      : 315,
                  overflowY:
                    mobile
                      ? 'visible'
                      : 'auto',
                  paddingRight:
                    mobile
                      ? 0
                      : 3
                }}
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