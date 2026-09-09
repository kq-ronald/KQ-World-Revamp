import * as React from 'react';

import { IKqCompanyNewsProps } from './IKqCompanyNewsProps';

import KqCompanyNewsService from '../services/KqCompanyNewsService';

import {
  IKqCompanyNewsItem,
  KqCompanyNewsType
} from '../models/IKqCompanyNewsItem';

import styles from './KqCompanyNews.module.scss';

type ActiveTab = KqCompanyNewsType;

interface IKqCompanyNewsState {
  activeTab: ActiveTab;

  take3: IKqCompanyNewsItem[];
  blogs: IKqCompanyNewsItem[];
  pride: IKqCompanyNewsItem[];

  isLoading: boolean;
  errorMessage: string;

  isDarkMode: boolean;
}

export default class KqCompanyNews
  extends React.Component<
    IKqCompanyNewsProps,
    IKqCompanyNewsState
  > {

  private readonly _newsService: KqCompanyNewsService;

  public constructor(props: IKqCompanyNewsProps) {
    super(props);

    this._newsService =
      new KqCompanyNewsService(
        this.props.context
      );

    const currentTheme =
      typeof document !== 'undefined'
        ? document.documentElement.getAttribute(
          'data-kq-theme'
        )
        : 'light';

    this.state = {
      activeTab: 'take3',

      take3: [],
      blogs: [],
      pride: [],

      isLoading: true,
      errorMessage: '',

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
      document.documentElement.getAttribute(
        'data-kq-theme'
      );

    this.setState({
      isDarkMode:
        currentTheme === 'dark'
    });

    await this._loadNews();
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
        take3: result.take3,
        blogs: result.blogs,
        pride: result.pride,
        isLoading: false
      });

    } catch (error) {

      console.error(
        'KQ Company News error:',
        error
      );

      this.setState({
        isLoading: false,

        errorMessage:
          error instanceof Error
            ? error.message
            : 'Unable to load company news.'
      });
    }
  }

  private _setActiveTab(
    tab: ActiveTab
  ): void {

    this.setState({
      activeTab: tab
    });
  }

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
        return blogs.slice(0, 3);

      case 'pride':
        return pride.slice(0, 4);

      case 'take3':
      default:
        return take3.slice(0, 6);
    }
  }

  private _getViewMoreUrl():
    string {

    switch (this.state.activeTab) {

      case 'blog':
        return (
          'https://corporate.kenya-airways.com' +
          '/en/press-room/kq-blog/' +
          '?types=External+Articles'
        );

      case 'pride':
      case 'take3':
      default:
        return (
          `${window.location.origin}` +
          '/homepage/SitePages/' +
          'Forms/AllPages.aspx'
        );
    }
  }

  private _formatDate(
    date: Date
  ): string {

    if (!date) {
      return '';
    }

    return date.toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short'
      }
    );
  }

  private _renderTake3Card(
    item: IKqCompanyNewsItem
  ): React.ReactElement {

    return (
      <article
        key={`take3-${item.id}`}
        className={styles.newsCard}
      >

        <div className={styles.cardImage}>

          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt=""
              className={
                styles.cardImageElement
              }
            />
          ) : (
            <div
              className={
                styles.imageFallback
              }
            >
              TAKE 3
            </div>
          )}

        </div>

        <div className={styles.cardBody}>

          <div className={styles.cardLabel}>
            TAKE 3
          </div>

          <h3 className={styles.cardTitle}>
            {item.title}
          </h3>

          {item.description && (
            <p
              className={
                styles.cardDescription
              }
            >
              {item.description}
            </p>
          )}

          <div className={styles.cardFooter}>

            <span
              className={
                styles.cardMeta
              }
            >
              {this._formatDate(
                item.publishedDate
              )}
            </span>

            <a
              href={item.itemUrl}
              target="_blank"
              rel="noreferrer"
              className={styles.readLink}
            >
              Read story →
            </a>

          </div>

        </div>

      </article>
    );
  }

  private _renderBlogCard(
    item: IKqCompanyNewsItem
  ): React.ReactElement {

    return (
      <article
        key={`blog-${item.id}`}
        className={styles.newsCard}
      >

        <div className={styles.cardImage}>

          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt=""
              className={
                styles.cardImageElement
              }
            />
          ) : (
            <div
              className={
                styles.blogFallback
              }
            >
              BLOG
            </div>
          )}

        </div>

        <div className={styles.cardBody}>

          <div className={styles.cardLabel}>
            BLOG
          </div>

          <h3 className={styles.cardTitle}>
            {item.title}
          </h3>

          {item.description && (
            <p
              className={
                styles.cardDescription
              }
            >
              {item.description}
            </p>
          )}

          <div className={styles.cardFooter}>

            <span
              className={
                styles.cardMeta
              }
            >
              {item.readTimeMinutes
                ? `${item.readTimeMinutes} min read`
                : ''}
            </span>

            <a
              href={item.itemUrl}
              target="_blank"
              rel="noreferrer"
              className={
                styles.readLink
              }
            >
              Read story →
            </a>

          </div>

        </div>

      </article>
    );
  }

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

        <div
          className={
            styles.prideArtwork
          }
        >

          <div
            className={
              styles.prideEyebrow
            }
          >
            QUARTERLY NEWSLETTER
          </div>

          <div
            className={
              styles.prideLogoText
            }
          >
            The
            <br />
            Pride
          </div>

          {item.issueNumber && (
            <div
              className={
                styles.issueNumber
              }
            >
              Issue No.{' '}
              {item.issueNumber}
            </div>
          )}

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

          <a
            href={item.itemUrl}
            target="_blank"
            rel="noreferrer"
            className={styles.readLink}
          >
            Read newsletter →
          </a>

        </div>

      </article>
    );
  }

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
          Browse the latest Kenya Airways
          external articles on the corporate
          website.
        </div>

        <a
          href={
            this._getViewMoreUrl()
          }
          target="_blank"
          rel="noreferrer"
          className={
            styles.readLink
          }
        >
          View Blogs →
        </a>

      </div>
    );
  }

  private _renderActiveCards():
    React.ReactNode {

    const items =
      this._getActiveItems();

    if (
      this.state.activeTab === 'blog' &&
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

        if (item.type === 'pride') {
          return (
            this._renderPrideCard(
              item
            )
          );
        }

        if (item.type === 'blog') {
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
      <section
        className={[
          styles.kqCompanyNews,
          isDarkMode
            ? styles.darkMode
            : ''
        ].join(' ')}
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
              onClick={() =>
                this._setActiveTab(
                  'take3'
                )
              }
              className={
                activeTab === 'take3'
                  ? styles.tabActive
                  : styles.tab
              }
            >
              ▣&nbsp;&nbsp;Take 3
            </button>

            <button
              type="button"
              onClick={() =>
                this._setActiveTab(
                  'blog'
                )
              }
              className={
                activeTab === 'blog'
                  ? styles.tabActive
                  : styles.tab
              }
            >
              ◇&nbsp;&nbsp;Blogs
            </button>

            <button
              type="button"
              onClick={() =>
                this._setActiveTab(
                  'pride'
                )
              }
              className={
                activeTab === 'pride'
                  ? styles.tabActive
                  : styles.tab
              }
            >
              ▤&nbsp;&nbsp;The Pride
            </button>

          </div>

          <a
            href={
              this._getViewMoreUrl()
            }
            target="_blank"
            rel="noreferrer"
            className={
              styles.viewMore
            }
          >
            View More Stories
            <span>→</span>
          </a>

        </div>

        {isLoading && (
          <div
            className={
              styles.message
            }
          >
            Loading company news...
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
              className={[
                styles.newsGrid,
                gridClass
              ].join(' ')}
            >
              {this._renderActiveCards()}
            </div>
          )}

      </section>
    );
  }
}