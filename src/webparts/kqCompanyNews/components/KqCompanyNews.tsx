import * as React from 'react';

import {
  IKqCompanyNewsProps
} from './IKqCompanyNewsProps';

import KqCompanyNewsService
  from '../services/KqCompanyNewsService';

import {
  IKqCompanyNewsItem,
  KqCompanyNewsType
} from '../models/IKqCompanyNewsItem';

type ActiveTab =
  KqCompanyNewsType;

interface IKqCompanyNewsState {
  activeTab: ActiveTab;
  take3: IKqCompanyNewsItem[];
  blogs: IKqCompanyNewsItem[];
  pride: IKqCompanyNewsItem[];
  isLoading: boolean;
  errorMessage: string;
  windowWidth: number;
}

export default class KqCompanyNews
  extends React.Component<
    IKqCompanyNewsProps,
    IKqCompanyNewsState
  > {

  private readonly _newsService:
    KqCompanyNewsService;

  public constructor(
    props: IKqCompanyNewsProps
  ) {
    super(props);

    this._newsService =
      new KqCompanyNewsService(
        this.props.context
      );

    this.state = {
      activeTab: 'take3',
      take3: [],
      blogs: [],
      pride: [],
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

    await this._loadNews();
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

    switch (
      this.state.activeTab
    ) {

      case 'blog':
        return this.state.blogs;

      case 'pride':
        return this.state.pride;

      case 'take3':
      default:
        return this.state.take3;
    }
  }

  private _getViewMoreUrl():
    string {

    switch (
      this.state.activeTab
    ) {

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

  private _getGridColumns():
    string {

    const {
      activeTab,
      windowWidth
    } = this.state;

    if (
      windowWidth <= 640
    ) {
      return (
        'repeat(1, ' +
        'minmax(0, 1fr))'
      );
    }

    if (
      windowWidth <= 1024
    ) {
      return (
        'repeat(2, ' +
        'minmax(0, 1fr))'
      );
    }

    if (
      activeTab ===
      'pride'
    ) {
      return (
        'repeat(4, ' +
        'minmax(0, 1fr))'
      );
    }

    return (
      'repeat(3, ' +
      'minmax(0, 1fr))'
    );
  }

  private _formatDate(
    date: Date
  ): string {

    if (!date) {
      return '';
    }

    return (
      date.toLocaleDateString(
        'en-GB',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }
      )
    );
  }

  private _getTabStyle(
    isActive: boolean
  ): React.CSSProperties {

    return {
      border: 'none',
      borderRadius: 999,
      padding:
        '13px 28px',
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: 16,
      background:
        isActive
          ? '#ff1616'
          : 'transparent',
      color:
        isActive
          ? '#ffffff'
          : '#111111',
      display: 'flex',
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: 10,
      transition:
        'all 0.2s ease'
    };
  }

  private _renderTake3Card(
    item: IKqCompanyNewsItem
  ): React.ReactElement {

    return (
      <article
        key={`take3-${item.id}`}
        style={{
          border:
            '1px solid #dedede',
          borderRadius: 14,
          overflow: 'hidden',
          background:
            '#ffffff',
          minHeight: 355,
          display: 'flex',
          flexDirection:
            'column',
          boxShadow:
            '0 4px 14px rgba(16,24,40,0.08)'
        }}
      >
        <div
          style={{
            height: 180,
            overflow: 'hidden',
            background:
              'linear-gradient(135deg,#3496d3,#5168c7)'
          }}
        >
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit:
                  'cover'
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems:
                  'flex-end',
                padding: 22,
                boxSizing:
                  'border-box',
                color:
                  '#ffffff',
                fontSize: 42,
                fontWeight: 800
              }}
            >
              Take 3
            </div>
          )}
        </div>

        <div
          style={{
            padding: 20,
            flex: 1,
            display: 'flex',
            flexDirection:
              'column'
          }}
        >
          <div
            style={{
              color:
                '#ff1616',
              fontWeight: 800,
              fontSize: 12,
              letterSpacing: 2,
              marginBottom: 12
            }}
          >
            TAKE 3
          </div>

          <h3
            style={{
              margin: 0,
              fontSize: 20,
              lineHeight: 1.3,
              fontWeight: 800,
              color: '#111827'
            }}
          >
            {item.title}
          </h3>

          {item.description && (
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.5,
                color: '#667085'
              }}
            >
              {item.description}
            </p>
          )}

          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems:
                'center',
              paddingTop: 20
            }}
          >
            <span
              style={{
                color:
                  '#667085',
                fontSize: 13
              }}
            >
              {this._formatDate(
                item.publishedDate
              )}
            </span>

            <a
              href={item.itemUrl}
              style={{
                color:
                  '#ff1616',
                fontWeight: 800,
                textDecoration:
                  'none'
              }}
            >
              Read story →
            </a>
          </div>
        </div>
      </article>
    );
  }

  private _renderBlogEmptyState():
    React.ReactElement {

    return (
      <div
        style={{
          gridColumn:
            '1 / -1',
          minHeight: 220,
          border:
            '1px solid #e5e7eb',
          borderRadius: 14,
          display: 'flex',
          flexDirection:
            'column',
          alignItems:
            'center',
          justifyContent:
            'center',
          padding: 32,
          textAlign:
            'center',
          background:
            '#ffffff'
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            marginBottom: 8
          }}
        >
          KQ Blogs
        </div>

        <div
          style={{
            color:
              '#667085',
            maxWidth: 500,
            lineHeight: 1.5,
            marginBottom: 18
          }}
        >
          Browse the latest
          Kenya Airways external
          articles on the corporate
          website.
        </div>

        <a
          href={
            this._getViewMoreUrl()
          }
          target="_blank"
          rel="noreferrer"
          style={{
            color:
              '#ff1616',
            fontWeight: 800,
            textDecoration:
              'none'
          }}
        >
          View Blogs →
        </a>
      </div>
    );
  }

  private _renderBlogCard(
    item: IKqCompanyNewsItem
  ): React.ReactElement {

    return (
      <article
        key={`blog-${item.id}`}
        style={{
          border:
            '1px solid #dedede',
          borderRadius: 14,
          overflow: 'hidden',
          background:
            '#ffffff',
          boxShadow:
            '0 4px 14px rgba(16,24,40,0.08)'
        }}
      >
        <div
          style={{
            height: 180,
            overflow: 'hidden',
            background:
              'linear-gradient(135deg,#646ff2,#5144d5)'
          }}
        >
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit:
                  'cover'
              }}
            />
          )}
        </div>

        <div
          style={{
            padding: 20
          }}
        >
          <div
            style={{
              color:
                '#ff1616',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 2,
              marginBottom: 12
            }}
          >
            BLOG
          </div>

          <h3
            style={{
              margin: 0,
              fontSize: 20,
              lineHeight: 1.3,
              fontWeight: 800
            }}
          >
            {item.title}
          </h3>

          <div
            style={{
              marginTop: 20,
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems:
                'center'
            }}
          >
            <span
              style={{
                color:
                  '#667085',
                fontSize: 13
              }}
            >
              {item.readTimeMinutes
                ? `${item.readTimeMinutes} min`
                : ''}
            </span>

            <a
              href={item.itemUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                color:
                  '#ff1616',
                fontWeight: 800,
                textDecoration:
                  'none'
              }}
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
        style={{
          border:
            '1px solid #dedede',
          borderRadius: 14,
          overflow: 'hidden',
          background:
            '#ffffff',
          boxShadow:
            '0 4px 14px rgba(16,24,40,0.08)'
        }}
      >
        <div
          style={{
            height: 320,
            padding: 22,
            boxSizing:
              'border-box',
            color:
              '#ffffff',
            background:
              'linear-gradient(145deg,#f12632,#ad101d)',
            display: 'flex',
            flexDirection:
              'column'
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 3
            }}
          >
            QUARTERLY NEWSLETTER
          </div>

          <div
            style={{
              marginTop:
                'auto',
              fontSize: 50,
              fontWeight: 800,
              lineHeight: 0.9
            }}
          >
            The
            <br />
            Pride
          </div>

          {item.issueNumber && (
            <div
              style={{
                marginTop: 16
              }}
            >
              Issue No.{' '}
              {item.issueNumber}
            </div>
          )}
        </div>

        <div
          style={{
            padding: 20
          }}
        >
          <h3
            style={{
              margin:
                '0 0 20px',
              fontSize: 18,
              fontWeight: 800
            }}
          >
            {item.title}
          </h3>

          <a
            href={item.itemUrl}
            style={{
              color:
                '#ff1616',
              fontWeight: 800,
              textDecoration:
                'none'
            }}
          >
            Read newsletter →
          </a>
        </div>
      </article>
    );
  }

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
          item.type ===
          'pride'
        ) {
          return (
            this._renderPrideCard(
              item
            )
          );
        }

        if (
          item.type ===
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

  public render():
    React.ReactElement<
      IKqCompanyNewsProps
    > {

    const {
      activeTab,
      isLoading,
      errorMessage,
      windowWidth
    } = this.state;

    return (
      <section
        style={{
          width: '100%',
          boxSizing:
            'border-box',
          padding:
            '24px 0 40px'
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 1.5,
            marginBottom: 16
          }}
        >
          STAY INFORMED
        </div>

        <h2
          style={{
            margin:
              '0 0 36px',
            fontSize:
              windowWidth <= 640
                ? 30
                : 40,
            fontStyle:
              'italic',
            color:
              '#ff1616'
          }}
        >
          Company News &amp;
          Updates
        </h2>

        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems:
              'center',
            flexWrap: 'wrap',
            gap: 20,
            marginBottom: 36
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 6,
              padding: 6,
              border:
                '1px solid #d0d5dd',
              borderRadius: 999,
              background:
                '#ffffff',
              boxShadow:
                '0 5px 16px rgba(16,24,40,0.09)'
            }}
          >
            <button
              type="button"
              onClick={() =>
                this._setActiveTab(
                  'take3'
                )
              }
              style={
                this._getTabStyle(
                  activeTab ===
                    'take3'
                )
              }
            >
              ▣ Take 3
            </button>

            <button
              type="button"
              onClick={() =>
                this._setActiveTab(
                  'blog'
                )
              }
              style={
                this._getTabStyle(
                  activeTab ===
                    'blog'
                )
              }
            >
              ◇ Blogs
            </button>

            <button
              type="button"
              onClick={() =>
                this._setActiveTab(
                  'pride'
                )
              }
              style={
                this._getTabStyle(
                  activeTab ===
                    'pride'
                )
              }
            >
              ▤ The Pride
            </button>
          </div>

          <a
            href={
              this._getViewMoreUrl()
            }
            target="_blank"
            rel="noreferrer"
            style={{
              minWidth: 250,
              padding:
                '15px 28px',
              border:
                '1px solid #ff1616',
              borderRadius: 999,
              textDecoration:
                'none',
              color:
                '#ff1616',
              fontSize: 16,
              fontWeight: 700,
              textAlign:
                'center',
              boxSizing:
                'border-box'
            }}
          >
            View More Stories
            &nbsp;&nbsp; →
          </a>
        </div>

        {isLoading && (
          <div
            style={{
              padding: 40,
              textAlign:
                'center'
            }}
          >
            Loading company news...
          </div>
        )}

        {!isLoading &&
          errorMessage && (
            <div
              style={{
                padding: 20,
                color:
                  '#b42318',
                background:
                  '#fef3f2',
                borderRadius: 8
              }}
            >
              {errorMessage}
            </div>
          )}

        {!isLoading &&
          !errorMessage && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  this._getGridColumns(),
                gap: 22
              }}
            >
              {this._renderActiveCards()}
            </div>
          )}
      </section>
    );
  }
}