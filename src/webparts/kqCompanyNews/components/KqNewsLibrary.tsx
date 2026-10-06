import * as React from 'react';

import {
  IKqCompanyNewsItem,
  KqCompanyNewsType
} from '../models/IKqCompanyNewsItem';

import styles from './KqNewsLibrary.module.scss';

export interface IKqNewsLibraryProps {
  take3: IKqCompanyNewsItem[];
  blogs: IKqCompanyNewsItem[];
  pride: IKqCompanyNewsItem[];

  initialTab: KqCompanyNewsType;

  isDarkMode: boolean;

  onBack: () => void;

  onOpenStory: (
    item: IKqCompanyNewsItem
  ) => void;

  /**
   * Optional callback used by the parent Company News component
   * to keep the URL route in sync with the selected library tab.
   */
  onTabChange?: (
    tab: KqCompanyNewsType
  ) => void;
}

interface IKqNewsLibraryState {
  activeTab: KqCompanyNewsType;

  searchText: string;

  sortOrder:
    | 'latest'
    | 'oldest';
}

export default class KqNewsLibrary
  extends React.Component<
    IKqNewsLibraryProps,
    IKqNewsLibraryState
  > {

  public constructor(
    props: IKqNewsLibraryProps
  ) {
    super(props);

    this.state = {
      activeTab: props.initialTab,
      searchText: '',
      sortOrder: 'latest'
    };
  }

  public componentDidUpdate(
    previousProps: IKqNewsLibraryProps
  ): void {
    if (
      previousProps.initialTab !==
        this.props.initialTab &&
      this.props.initialTab !==
        this.state.activeTab
    ) {
      this.setState({
        activeTab:
          this.props.initialTab
      });
    }
  }

  private _setActiveTab = (
    activeTab: KqCompanyNewsType
  ): void => {
    this.setState({
      activeTab,
      searchText: ''
    });

    if (this.props.onTabChange) {
      this.props.onTabChange(
        activeTab
      );
    }
  };

  private _getItems():
    IKqCompanyNewsItem[] {

    const {
      take3,
      blogs,
      pride
    } = this.props;

    const {
      activeTab,
      searchText,
      sortOrder
    } = this.state;

    let items:
      IKqCompanyNewsItem[];

    switch (activeTab) {
      case 'blog':
        items = [
          ...blogs
        ];
        break;

      case 'pride':
        items = [
          ...pride
        ];
        break;

      case 'take3':
        items = [
          ...take3
        ];
        break;

      default:
        items = [
          ...take3
        ];
        break;
    }

    const query =
      searchText
        .trim()
        .toLowerCase();

    if (query) {
      items =
        items.filter(
          (item) => {

            const searchableText =
              [
                item.title,
                item.moreInfo,
                item.authorName,
                item.category
              ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return (
              searchableText
                .indexOf(query) !== -1
            );
          }
        );
    }

    items.sort(
      (
        first,
        second
      ) => {

        const firstTime =
          first.publishedDate
            .getTime();

        const secondTime =
          second.publishedDate
            .getTime();

        return (
          sortOrder === 'latest'
            ? secondTime -
              firstTime
            : firstTime -
              secondTime
        );
      }
    );

    return items;
  }

  private _getTabName(
    type: KqCompanyNewsType
  ): string {

    switch (type) {
      case 'blog':
        return 'Blogs';

      case 'pride':
        return 'The Pride';

      case 'take3':
        return 'Take 3';

      default:
        return 'Take 3';
    }
  }

  private _formatDate(
    value: Date
  ): string {

    if (
      !value ||
      Number.isNaN(
        value.getTime()
      )
    ) {
      return '';
    }

    return value
      .toLocaleDateString(
        'en-GB',
        {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }
      );
  }

  private _renderImage(
    item: IKqCompanyNewsItem
  ): React.ReactNode {

    if (item.imageUrl) {
      return (
        <img
          src={item.imageUrl}
          alt=""
          className={
            styles.cardImageElement
          }
        />
      );
    }

    return (
      <div
        className={
          styles.imageFallback
        }
      >
        <span>
          {
            this._getTabName(
              item.type
            )
          }
        </span>
      </div>
    );
  }

  private _renderCard(
    item: IKqCompanyNewsItem
  ): React.ReactNode {

    return (
      <article
        key={
          `${item.type}-${item.id}`
        }
        className={
          styles.newsCard
        }
      >
        <button
          type="button"
          className={
            styles.cardButton
          }
          onClick={
            () =>
              this.props
                .onOpenStory(
                  item
                )
          }
          aria-label={
            `Read ${item.title}`
          }
        >
          <div
            className={
              styles.cardImage
            }
          >
            {
              this._renderImage(
                item
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
              {
                item.category ||
                this._getTabName(
                  item.type
                )
              }
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
                    styles.cardDescription
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

              <span
                className={
                  styles.readStory
                }
              >
                {
                  item.type ===
                    'pride'
                    ? 'Read newsletter'
                    : 'Read story'
                }

                <span
                  aria-hidden="true"
                >
                  {' '}→
                </span>
              </span>
            </div>
          </div>
        </button>
      </article>
    );
  }

  public render():
    React.ReactElement<
      IKqNewsLibraryProps
    > {

    const {
      isDarkMode,
      onBack
    } = this.props;

    const {
      activeTab,
      searchText,
      sortOrder
    } = this.state;

    const items =
      this._getItems();

    const rootClassName =
      [
        styles.newsLibrary,
        isDarkMode
          ? styles.darkMode
          : ''
      ]
        .filter(Boolean)
        .join(' ');

    return (
      <main
        className={
          rootClassName
        }
      >
        <div
          className={
            styles.pageContainer
          }
        >
          <button
            type="button"
            className={
              styles.backButton
            }
            onClick={
              onBack
            }
          >
            <span
              aria-hidden="true"
            >
              ←
            </span>

            Back to KQ World
          </button>

          <header
            className={
              styles.pageHeader
            }
          >
            <p
              className={
                styles.eyebrow
              }
            >
              STAY INFORMED
            </p>

            <h1
              className={
                styles.pageTitle
              }
            >
              Company News &amp; Updates
            </h1>

            <p
              className={
                styles.pageDescription
              }
            >
              Stay connected with the latest
              stories, updates and publications
              from across Kenya Airways.
            </p>
          </header>

          <div
            className={
              styles.controls
            }
          >
            <div
              className={
                styles.tabBar
              }
              role="tablist"
              aria-label={
                'Company news categories'
              }
            >
              <button
                type="button"
                role="tab"
                aria-selected={
                  activeTab ===
                  'take3'
                }
                className={
                  activeTab ===
                    'take3'
                    ? styles.tabActive
                    : styles.tab
                }
                onClick={
                  () =>
                    this._setActiveTab(
                      'take3'
                    )
                }
              >
                Take 3
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={
                  activeTab ===
                  'blog'
                }
                className={
                  activeTab ===
                    'blog'
                    ? styles.tabActive
                    : styles.tab
                }
                onClick={
                  () =>
                    this._setActiveTab(
                      'blog'
                    )
                }
              >
                Blogs
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={
                  activeTab ===
                  'pride'
                }
                className={
                  activeTab ===
                    'pride'
                    ? styles.tabActive
                    : styles.tab
                }
                onClick={
                  () =>
                    this._setActiveTab(
                      'pride'
                    )
                }
              >
                The Pride
              </button>
            </div>

            <div
              className={
                styles.filterBar
              }
            >
              <label
                className={
                  styles.searchBox
                }
              >
                <span
                  className={
                    styles.searchIcon
                  }
                  aria-hidden="true"
                >
                  ⌕
                </span>

                <input
                  type="search"
                  value={
                    searchText
                  }
                  placeholder={
                    'Search stories...'
                  }
                  aria-label={
                    'Search stories'
                  }
                  onChange={
                    (
                      event:
                        React.ChangeEvent<
                          HTMLInputElement
                        >
                    ) =>
                      this.setState({
                        searchText:
                          event
                            .target
                            .value
                      })
                  }
                />
              </label>

              <select
                className={
                  styles.sortSelect
                }
                value={
                  sortOrder
                }
                aria-label={
                  'Sort stories'
                }
                onChange={
                  (
                    event:
                      React.ChangeEvent<
                        HTMLSelectElement
                      >
                  ) =>
                    this.setState({
                      sortOrder:
                        event
                          .target
                          .value as
                            | 'latest'
                            | 'oldest'
                    })
                }
              >
                <option
                  value="latest"
                >
                  Latest
                </option>

                <option
                  value="oldest"
                >
                  Oldest
                </option>
              </select>
            </div>
          </div>

          <div
            className={
              styles.resultHeader
            }
          >
            <h2>
              {
                this._getTabName(
                  activeTab
                )
              }
            </h2>

            <span>
              {
                items.length === 1
                  ? '1 story'
                  : `${items.length} stories`
              }
            </span>
          </div>

          {
            items.length > 0
              ? (
                <div
                  className={
                    styles.newsGrid
                  }
                >
                  {
                    items.map(
                      (item) =>
                        this._renderCard(
                          item
                        )
                    )
                  }
                </div>
              )
              : (
                <div
                  className={
                    styles.emptyState
                  }
                >
                  <h3>
                    No stories found
                  </h3>

                  <p>
                    Try another search
                    or choose a different news
                    category.
                  </p>
                </div>
              )
          }
        </div>
      </main>
    );
  }
}