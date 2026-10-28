import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {
  IKqCompanyNewsProps
} from './IKqCompanyNewsProps';

import KqCompanyNewsService
  from '../services/KqCompanyNewsService';

import {
  IKqCompanyNewsItem,
  KqCompanyNewsType
} from '../models/IKqCompanyNewsItem';

import KqNewsLibrary
  from './KqNewsLibrary';

import KqStoryViewer
  from './KqStoryViewer';

import styles
  from './KqCompanyNews.module.scss';

type ActiveTab =
  KqCompanyNewsType;

type KqNewsView =
  | 'home'
  | 'news'
  | 'story';

type KqStoryReturnView =
  | 'home'
  | 'news';

interface IKqCompanyNewsState {
  failedBlogImages: string[];

  activeTab: ActiveTab;

  take3: IKqCompanyNewsItem[];
  blogs: IKqCompanyNewsItem[];
  pride: IKqCompanyNewsItem[];

  isLoading: boolean;
  errorMessage: string;
  isDarkMode: boolean;

  currentView: KqNewsView;

  routeType:
    KqCompanyNewsType;

  selectedStory?:
    IKqCompanyNewsItem;

  storyReturnView:
    KqStoryReturnView;

  portalTop: number;
}

interface IKqParsedRoute {
  view: KqNewsView;
  type: KqCompanyNewsType;
  id?: number;
  from: KqStoryReturnView;
}

export default class KqCompanyNews
  extends React.Component<
    IKqCompanyNewsProps,
    IKqCompanyNewsState
  > {

  private readonly _newsService:
    KqCompanyNewsService;

  private _previousBodyOverflow:
    string = '';

  private _previousHtmlOverflow:
    string = '';

  private _pageScrollLocked:
    boolean = false;

  public constructor(
    props: IKqCompanyNewsProps
  ) {
    super(props);

    this._newsService =
      new KqCompanyNewsService(
        this.props.context
      );

    const currentTheme =
      typeof document !== 'undefined'
        ? document.documentElement
            .getAttribute(
              'data-kq-theme'
            )
        : 'light';

    const initialRoute =
      this._readRouteFromUrl();

    this.state = {
      failedBlogImages: [],

      activeTab:
        initialRoute.type,

      take3: [],
      blogs: [],
      pride: [],

      isLoading: true,

      errorMessage: '',

      isDarkMode:
        currentTheme === 'dark',

      currentView:
        initialRoute.view,

      routeType:
        initialRoute.type,

      selectedStory:
        undefined,

      storyReturnView:
        initialRoute.from,

      portalTop: 134
    };
  }

  /*
   * ==========================================================
   * COMPONENT LIFECYCLE
   * ==========================================================
   */

  public async componentDidMount():
    Promise<void> {

    window.addEventListener(
      'kqworld-theme-change',
      this._handleThemeChange as EventListener
    );

    window.addEventListener(
      'popstate',
      this._handlePopState
    );

    window.addEventListener(
      'resize',
      this._updatePortalOffset
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

    this._updatePortalOffset();

    await this._loadNews();

    await this._syncRouteFromUrl();
  }

  public componentDidUpdate(
    previousProps: IKqCompanyNewsProps,
    previousState: IKqCompanyNewsState
  ): void {

    if (
      previousState.currentView !==
      this.state.currentView
    ) {
      if (
        this.state.currentView ===
        'home'
      ) {
        this._restorePageScroll();
      } else {
        this._lockPageScroll();
        this._updatePortalOffset();
      }
    }
  }

  public componentWillUnmount():
    void {

    window.removeEventListener(
      'kqworld-theme-change',
      this._handleThemeChange as EventListener
    );

    window.removeEventListener(
      'popstate',
      this._handlePopState
    );

    window.removeEventListener(
      'resize',
      this._updatePortalOffset
    );

    this._restorePageScroll();
  }

  /*
   * ==========================================================
   * THEME
   * ==========================================================
   */

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

  /*
   * ==========================================================
   * LOAD DATA
   * ==========================================================
   */

  private async _loadNews():
    Promise<void> {

    try {
      this.setState({
        isLoading: true,
        errorMessage: ''
      });

      const result =
        await this._newsService
          .getAllCompanyNews();

      this.setState({
        take3:
          result.take3,

        blogs:
          result.blogs,

        pride:
          result.pride,

        isLoading:
          false
      });

      // Render cards immediately, then enhance covers in the background.
      // The homepage only displays three Take 3 cards at a time.
      void this._newsService.getTake3CoverImages(result.take3.slice(0, 3))
        .then(covers => {
          this.setState(previous => ({
            take3: previous.take3.map(item =>
              covers[item.id] ? { ...item, imageUrl: covers[item.id] } : item
            )
          }));
        })
        .catch(error => console.warn('Take 3 cover loading failed', error));

    } catch (error) {
      console.error(
        'KQ Company News error:',
        error
      );

      this.setState({
        isLoading:
          false,

        errorMessage:
          error instanceof Error
            ? error.message
            : 'Unable to load company news.'
      });
    }
  }

  /*
   * ==========================================================
   * ROUTING
   * ==========================================================
   */

  private _isValidType(
    value: string | null
  ): value is KqCompanyNewsType {

    return (
      value === 'take3' ||
      value === 'blog' ||
      value === 'pride'
    );
  }

  private _readRouteFromUrl():
    IKqParsedRoute {

    if (
      typeof window ===
      'undefined'
    ) {
      return {
        view: 'home',
        type: 'take3',
        from: 'home'
      };
    }

    const params =
      new URLSearchParams(
        window.location.search
      );

    const rawView =
      params.get('kqView');

    const rawType =
      params.get('type');

    const rawId =
      params.get('id');

    const rawFrom =
      params.get('from');

    const type:
      KqCompanyNewsType =
        this._isValidType(
          rawType
        )
          ? rawType
          : 'take3';

    const from:
      KqStoryReturnView =
        rawFrom === 'news'
          ? 'news'
          : 'home';

    if (
      rawView === 'story' &&
      rawId
    ) {
      const id =
        Number(rawId);

      if (
        Number.isFinite(id)
      ) {
        return {
          view: 'story',
          type,
          id,
          from
        };
      }
    }

    if (
      rawView === 'news'
    ) {
      return {
        view: 'news',
        type,
        from: 'home'
      };
    }

    return {
      view: 'home',
      type,
      from: 'home'
    };
  }

  private _buildUrl(
    view: KqNewsView,
    type: KqCompanyNewsType,
    id?: number,
    from: KqStoryReturnView = 'home'
  ): string {

    const url =
      new URL(
        window.location.href
      );

    url.searchParams.delete(
      'kqView'
    );

    url.searchParams.delete(
      'type'
    );

    url.searchParams.delete(
      'id'
    );

    url.searchParams.delete(
      'from'
    );

    if (
      view === 'news'
    ) {
      url.searchParams.set(
        'kqView',
        'news'
      );

      url.searchParams.set(
        'type',
        type
      );
    }

    if (
      view === 'story' &&
      typeof id === 'number'
    ) {
      url.searchParams.set(
        'kqView',
        'story'
      );

      url.searchParams.set(
        'type',
        type
      );

      url.searchParams.set(
        'id',
        String(id)
      );

      url.searchParams.set(
        'from',
        from
      );
    }

    return (
      url.pathname +
      url.search +
      url.hash
    );
  }

  private _pushRoute(
    view: KqNewsView,
    type: KqCompanyNewsType,
    id?: number,
    from: KqStoryReturnView = 'home'
  ): void {

    const url =
      this._buildUrl(
        view,
        type,
        id,
        from
      );

    window.history.pushState(
      {
        kqView: view,
        type,
        id,
        from
      },
      '',
      url
    );
  }

  private _replaceRoute(
    view: KqNewsView,
    type: KqCompanyNewsType,
    id?: number,
    from: KqStoryReturnView = 'home'
  ): void {

    const url =
      this._buildUrl(
        view,
        type,
        id,
        from
      );

    window.history.replaceState(
      {
        kqView: view,
        type,
        id,
        from
      },
      '',
      url
    );
  }

  private _findStory(
    type: KqCompanyNewsType,
    id: number
  ):
    IKqCompanyNewsItem |
    undefined {

    let items:
      IKqCompanyNewsItem[];

    switch (type) {
      case 'blog':
        items =
          this.state.blogs;
        break;

      case 'pride':
        items =
          this.state.pride;
        break;

      case 'take3':
        items =
          this.state.take3;
        break;

      default:
        items =
          this.state.take3;
        break;
    }

    return items.find(
      (item) =>
        item.id === id
    );
  }

  private async _syncRouteFromUrl():
    Promise<void> {

    const route =
      this._readRouteFromUrl();

    if (
      route.view === 'home'
    ) {
      this.setState({
        currentView: 'home',
        activeTab:
          route.type,
        routeType:
          route.type,
        selectedStory:
          undefined,
        storyReturnView:
          'home'
      });

      return;
    }

    if (
      route.view === 'news'
    ) {
      this.setState({
        currentView: 'news',
        activeTab:
          route.type,
        routeType:
          route.type,
        selectedStory:
          undefined,
        storyReturnView:
          'home'
      });

      return;
    }

    if (
      route.view === 'story' &&
      typeof route.id ===
        'number'
    ) {
      let story =
        this._findStory(
          route.type,
          route.id
        );

      if (!story) {
        try {
          story =
            await this
              ._newsService
              .getStoryById(
                route.id,
                route.type
              );
        } catch (error) {
          console.error(
            'Unable to resolve KQ story route:',
            error
          );
        }
      }

      if (story) {
        this.setState({
          currentView:
            'story',

          activeTab:
            route.type,

          routeType:
            route.type,

          selectedStory:
            story,

          storyReturnView:
            route.from
        });

        return;
      }

      this._replaceRoute(
        'home',
        route.type
      );

      this.setState({
        currentView:
          'home',

        activeTab:
          route.type,

        routeType:
          route.type,

        selectedStory:
          undefined,

        storyReturnView:
          'home'
      });
    }
  }

  private _handlePopState = ():
    void => {

    this._syncRouteFromUrl()
      .catch(
        (error: unknown) => {
          console.error(
            'Unable to restore KQ Company News route:',
            error
          );
        }
      );
  };

  /*
   * ==========================================================
   * FULL PAGE PORTAL
   * ==========================================================
   */

  private _updatePortalOffset = ():
    void => {

    if (
      typeof document ===
      'undefined'
    ) {
      return;
    }

    const navigation =
      document.querySelector(
        '.kqWorldNavigationStickyHost'
      ) as HTMLElement | null;

    let portalTop =
      0;

    if (navigation) {
      const rect =
        navigation
          .getBoundingClientRect();

      portalTop =
        Math.max(
          0,
          Math.round(
            rect.bottom
          )
        );
    }

    if (
      portalTop <= 0
    ) {
      portalTop =
        window.innerWidth <= 1100
          ? 126
          : 134;
    }

    if (
      portalTop !==
      this.state.portalTop
    ) {
      this.setState({
        portalTop
      });
    }
  };

  private _lockPageScroll():
    void {

    if (
      this._pageScrollLocked
    ) {
      return;
    }

    this._previousBodyOverflow =
      document.body.style
        .overflow;

    this._previousHtmlOverflow =
      document.documentElement
        .style.overflow;

    document.body.style
      .overflow =
        'hidden';

    document.documentElement
      .style.overflow =
        'hidden';

    this._pageScrollLocked =
      true;
  }

  private _restorePageScroll():
    void {

    if (
      !this._pageScrollLocked
    ) {
      return;
    }

    document.body.style
      .overflow =
        this._previousBodyOverflow;

    document.documentElement
      .style.overflow =
        this._previousHtmlOverflow;

    this._pageScrollLocked =
      false;
  }

  /*
   * ==========================================================
   * INTERNAL NAVIGATION
   * ==========================================================
   */

  private _openAllStories = ():
    void => {

    const type =
      this.state.activeTab;

    this._pushRoute(
      'news',
      type
    );

    this.setState(
      {
        currentView:
          'news',

        routeType:
          type,

        selectedStory:
          undefined,

        storyReturnView:
          'home'
      },
      this._updatePortalOffset
    );
  };

  private _openStoryFromHome = (
    item: IKqCompanyNewsItem
  ): void => {

    this._pushRoute(
      'story',
      item.type,
      item.id,
      'home'
    );

    this.setState(
      {
        currentView:
          'story',

        activeTab:
          item.type,

        routeType:
          item.type,

        selectedStory:
          item,

        storyReturnView:
          'home'
      },
      this._updatePortalOffset
    );
  };

  private _openStoryFromLibrary = (
    item: IKqCompanyNewsItem
  ): void => {

    this._pushRoute(
      'story',
      item.type,
      item.id,
      'news'
    );

    this.setState(
      {
        currentView:
          'story',

        activeTab:
          item.type,

        routeType:
          item.type,

        selectedStory:
          item,

        storyReturnView:
          'news'
      },
      this._updatePortalOffset
    );
  };

  private _handleLibraryTabChange = (
    tab: KqCompanyNewsType
  ): void => {

    this._replaceRoute(
      'news',
      tab
    );

    this.setState({
      routeType:
        tab,
      activeTab:
        tab
    });
  };

  private _backToHome = ():
    void => {

    const type =
      this.state.routeType;

    this._replaceRoute(
      'home',
      type
    );

    this.setState({
      currentView:
        'home',

      activeTab:
        type,

      selectedStory:
        undefined,

      storyReturnView:
        'home'
    });
  };

  private _backFromStory = ():
    void => {

    const {
      storyReturnView,
      routeType
    } = this.state;

    if (
      storyReturnView ===
      'news'
    ) {
      this._replaceRoute(
        'news',
        routeType
      );

      this.setState(
        {
          currentView:
            'news',

          selectedStory:
            undefined,

          storyReturnView:
            'home'
        },
        this._updatePortalOffset
      );

      return;
    }

    this._replaceRoute(
      'home',
      routeType
    );

    this.setState({
      currentView:
        'home',

      activeTab:
        routeType,

      selectedStory:
        undefined,

      storyReturnView:
        'home'
    });
  };

  /*
   * ==========================================================
   * TABS
   * ==========================================================
   */

  private _setActiveTab(
    tab: ActiveTab
  ): void {

    this.setState({
      activeTab:
        tab
    });
  }

  /*
   * Homepage counts remain:
   *
   * Take 3    = 3
   * Blogs     = 3
   * The Pride = 4
   */
  private _getActiveItems():
    IKqCompanyNewsItem[] {

    const {
      activeTab,
      take3,
      blogs,
      pride
    } = this.state;

    switch (activeTab) {
      case 'blog':
        return blogs.slice(
          0,
          3
        );

      case 'pride':
        return pride.slice(
          0,
          4
        );

      case 'take3':
        return take3.slice(
          0,
          3
        );

      default:
        return take3.slice(
          0,
          3
        );
    }
  }

  /*
   * ==========================================================
   * DATE
   * ==========================================================
   */

  private _formatDate(
    date: Date
  ): string {

    if (!date) {
      return '';
    }

    return date
      .toLocaleDateString(
        'en-GB',
        {
          day:
            '2-digit',

          month:
            'short',

          year:
            'numeric'
        }
      );
  }

  /*
   * ==========================================================
   * TAKE 3 CARD
   * ==========================================================
   */

  private _renderTake3Card(
    item: IKqCompanyNewsItem
  ): React.ReactElement {

    return (
      <article
        key={`take3-${item.id}`}
        className={
          styles.newsCard
        }
      >
        <div
          className={
            styles.cardImage
          }
        >
          {
            item.imageUrl
              ? (
                <img
                  src={
                    item.imageUrl
                  }
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className={
                    styles
                      .cardImageElement
                  }
                />
              )
              : (
                <div
                  className={
                    styles
                      .imageFallback
                  }
                >
                  TAKE 3
                </div>
              )
          }
        </div>

        <div
          className={
            styles.cardBody
          }
        >
          <div
            className={
              styles.cardLabel
            }
          >
            TAKE 3
          </div>

          <h3
            className={
              styles.cardTitle
            }
          >
            {item.title}
          </h3>

          {
            item.moreInfo && (
              <p
                className={
                  styles
                    .cardDescription
                }
              >
                {item.moreInfo}
              </p>
            )
          }

          <div
            className={
              styles.cardFooter
            }
          >
            <span
              className={
                styles.cardMeta
              }
            >
              {
                this._formatDate(
                  item.publishedDate
                )
              }
            </span>

            <button
              type="button"
              className={
                styles.readLink
              }
              onClick={
                () =>
                  this
                    ._openStoryFromHome(
                      item
                    )
              }
              aria-label={
                `Read ${item.title}`
              }
            >
              Read story →
            </button>
          </div>
        </div>
      </article>
    );
  }

  /*
   * ==========================================================
   * BLOG CARD
   * ==========================================================
   */

  private _renderBlogCard(
    item: IKqCompanyNewsItem
  ): React.ReactElement {

    return (
      <article
        key={`blog-${item.id}`}
        className={
          styles.newsCard
        }
      >
        <div
          className={
            styles.cardImage
          }
        >
          {
            item.imageUrl &&
            this.state
              .failedBlogImages
              .indexOf(
                item.imageUrl
              ) === -1
              ? (
                <img
                  src={
                    item.imageUrl
                  }
                  referrerPolicy={
                    'no-referrer'
                  }
                  loading="lazy"
                  decoding="async"
                  onError={
                    () => {
                      console.warn(
                        'Blog image failed to load:',
                        item.title,
                        item.imageUrl
                      );

                      this.setState(
                        (
                          previous
                        ) => ({
                          failedBlogImages:
                            previous
                              .failedBlogImages
                              .indexOf(
                                item.imageUrl
                              ) === -1
                              ? [
                                  ...previous
                                    .failedBlogImages,
                                  item.imageUrl
                                ]
                              : previous
                                  .failedBlogImages
                        })
                      );
                    }
                  }
                  alt=""
                  className={
                    styles
                      .cardImageElement
                  }
                />
              )
              : (
                <div
                  className={
                    styles
                      .blogFallback
                  }
                >
                  BLOG
                </div>
              )
          }
        </div>

        <div
          className={
            styles.cardBody
          }
        >
          <div
            className={
              styles.cardLabel
            }
          >
            BLOG
          </div>

          <h3
            className={
              styles.cardTitle
            }
          >
            {item.title}
          </h3>

          {
            item.moreInfo && (
              <p
                className={
                  styles
                    .cardDescription
                }
              >
                {item.moreInfo}
              </p>
            )
          }

          <div
            className={
              styles.cardFooter
            }
          >
            <span
              className={
                styles.cardMeta
              }
            >
              {
                item.readTimeMinutes
                  ? `${item.readTimeMinutes} min read`
                  : this._formatDate(
                      item.publishedDate
                    )
              }
            </span>

            <button
              type="button"
              className={
                styles.readLink
              }
              onClick={
                () =>
                  this
                    ._openStoryFromHome(
                      item
                    )
              }
              aria-label={
                `Read ${item.title}`
              }
            >
              Read story →
            </button>
          </div>
        </div>
      </article>
    );
  }

  /*
   * ==========================================================
   * THE PRIDE CARD
   * ==========================================================
   */

  private _renderPrideCard(
    item: IKqCompanyNewsItem
  ): React.ReactElement {

    return (
      <article
        key={`pride-${item.id}`}
        className={
          styles.prideCard
        }
      >
        <div className={styles.prideArtwork}>
          <>
            <div className={styles.prideEyebrow}>
              QUARTERLY NEWSLETTER
            </div>
            <div className={styles.prideLogoText}>
              The<br />Pride
            </div>
            {item.issueNumber && (
              <div className={styles.issueNumber}>
                Issue No. {item.issueNumber}
              </div>
            )}
          </>
        </div>

        <div
          className={
            styles.prideBody
          }
        >
          <h3
            className={
              styles.prideTitle
            }
          >
            {item.title}
          </h3>

          <button
            type="button"
            className={
              styles.readLink
            }
            onClick={
              () =>
                this
                  ._openStoryFromHome(
                    item
                  )
            }
            aria-label={
              `Read ${item.title}`
            }
          >
            Read newsletter →
          </button>
        </div>
      </article>
    );
  }

  /*
   * ==========================================================
   * BLOG EMPTY STATE
   * ==========================================================
   */

  private _renderBlogEmptyState():
    React.ReactElement {

    return (
      <div
        className={
          styles.emptyState
        }
      >
        <div
          className={
            styles.emptyTitle
          }
        >
          KQ Blogs
        </div>

        <div
          className={
            styles.emptyText
          }
        >
          No blog stories are
          currently available.
        </div>

        <button
          type="button"
          className={
            styles.readLink
          }
          onClick={
            this._openAllStories
          }
        >
          View Blogs →
        </button>
      </div>
    );
  }

  /*
   * ==========================================================
   * ACTIVE CARDS
   * ==========================================================
   */

  private _renderActiveCards():
    React.ReactNode {

    const items =
      this._getActiveItems();

    if (
      this.state.activeTab ===
        'blog' &&
      items.length === 0
    ) {
      return (
        this._renderBlogEmptyState()
      );
    }

    return items.map(
      (
        item:
          IKqCompanyNewsItem
      ) => {

        if (
          this.state.activeTab ===
          'pride'
        ) {
          return (
            this._renderPrideCard(
              item
            )
          );
        }

        if (
          this.state.activeTab ===
          'blog'
        ) {
          return (
            this._renderBlogCard(
              item
            )
          );
        }

        return (
          this._renderTake3Card(
            item
          )
        );
      }
    );
  }

  /*
   * ==========================================================
   * FULL PAGE EXPERIENCE
   * ==========================================================
   */

  private _renderFullPagePortal():
    React.ReactPortal |
    null {

    const {
      currentView,
      routeType,
      selectedStory,
      take3,
      blogs,
      pride,
      isDarkMode,
      portalTop
    } = this.state;

    if (
      currentView === 'home' ||
      typeof document ===
        'undefined'
    ) {
      return null;
    }

    let content:
      React.ReactNode;

    if (
      currentView === 'story' &&
      selectedStory
    ) {
      content = (
        <KqStoryViewer
          item={
            selectedStory
          }
          service={
            this._newsService
          }
          isDarkMode={
            isDarkMode
          }
          onBack={
            this._backFromStory
          }
        />
      );
    } else {
      content = (
        <KqNewsLibrary
          take3={
            take3
          }
          blogs={
            blogs
          }
          pride={
            pride
          }
          initialTab={
            routeType
          }
          isDarkMode={
            isDarkMode
          }
          onBack={
            this._backToHome
          }
          onOpenStory={
            this
              ._openStoryFromLibrary
          }
          onTabChange={
            this
              ._handleLibraryTabChange
          }
        />
      );
    }

    return ReactDOM.createPortal(
      <div
        className={[
          styles.fullPagePortal,
          isDarkMode
            ? styles
                .fullPagePortalDark
            : ''
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          top:
            `${portalTop}px`
        }}
        data-kq-news-portal="true"
      >
        {content}
      </div>,
      document.body
    );
  }

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  public render():
    React.ReactElement<
      IKqCompanyNewsProps
    > {

    const {
      activeTab,
      isLoading,
      errorMessage,
      isDarkMode
    } = this.state;

    const gridClass =
      activeTab === 'pride'
        ? styles.prideGrid
        : styles.standardGrid;

    return (
      <>
        <section
          data-kq-company-news="true"
          className={[
            styles.kqCompanyNews,
            isDarkMode
              ? styles.darkMode
              : ''
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div
            className={
              styles.eyebrow
            }
          >
            STAY INFORMED
          </div>

          <h2
            className={
              styles.sectionTitle
            }
          >
            Company News &amp; Updates
          </h2>

          <div
            className={
              styles.toolbar
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
                    this
                      ._setActiveTab(
                        'take3'
                      )
                }
                className={
                  activeTab ===
                    'take3'
                    ? styles
                        .tabActive
                    : styles.tab
                }
              >
                ▣&nbsp;&nbsp;Take 3
              </button>

              <button
                type="button"
                onClick={
                  () =>
                    this
                      ._setActiveTab(
                        'blog'
                      )
                }
                className={
                  activeTab ===
                    'blog'
                    ? styles
                        .tabActive
                    : styles.tab
                }
              >
                ◇&nbsp;&nbsp;Blogs
              </button>

              <button
                type="button"
                onClick={
                  () =>
                    this
                      ._setActiveTab(
                        'pride'
                      )
                }
                className={
                  activeTab ===
                    'pride'
                    ? styles
                        .tabActive
                    : styles.tab
                }
              >
                ▤&nbsp;&nbsp;The Pride
              </button>
            </div>

            <button
              type="button"
              className={
                styles.viewMore
              }
              onClick={
                this._openAllStories
              }
            >
              View More Stories

              <span
                aria-hidden="true"
              >
                →
              </span>
            </button>
          </div>

          {
            isLoading && (
              <div
                className={
                  styles.message
                }
              >
                Loading company news...
              </div>
            )
          }

          {
            !isLoading &&
            errorMessage && (
              <div
                className={
                  styles.error
                }
              >
                {errorMessage}
              </div>
            )
          }

          {
            !isLoading &&
            !errorMessage && (
              <div
                className={[
                  styles.newsGrid,
                  gridClass
                ].join(' ')}
              >
                {
                  this
                    ._renderActiveCards()
                }
              </div>
            )
          }
        </section>

        {
          this
            ._renderFullPagePortal()
        }
      </>
    );
  }
}