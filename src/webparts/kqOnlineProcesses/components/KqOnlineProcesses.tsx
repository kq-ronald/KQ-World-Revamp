import * as React from 'react';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { Search24Regular } from '@fluentui/react-icons';

import styles from './KqOnlineProcesses.module.scss';
import { IKqOnlineProcessesProps } from './IKqOnlineProcessesProps';

type FilterType = 'All' | 'Processes' | 'Automations';

interface IOnlineProcess {
  id: number;
  title: string;
  url: string;
  processType: string;
}

interface ISharePointOnlineProcessItem {
  Id: number;
  Title?: string;
  Content_x0020_Link?:
    | string
    | {
        Url?: string;
        Description?: string;
      };
  ProcessType?: string;
}

interface IOnlineProcessesState {
  items: IOnlineProcess[];
  activeFilter: FilterType;
  searchText: string;
  loading: boolean;
  error: string;
}

export default class KqOnlineProcesses extends React.Component<
  IKqOnlineProcessesProps,
  IOnlineProcessesState
> {
  public constructor(props: IKqOnlineProcessesProps) {
    super(props);

    this.state = {
      items: [],
      activeFilter: 'All',
      searchText: '',
      loading: true,
      error: ''
    };
  }

  public componentDidMount(): void {
    this.loadOnlineProcesses().catch((error: Error) => {
      console.error('Unexpected Online Processes error', error);
    });
  }

  private async loadOnlineProcesses(): Promise<void> {
    try {
      this.setState({
        loading: true,
        error: ''
      });

      const webUrl = `${window.location.origin}/homepage`;

      const requestUrl =
        `${webUrl}` +
        `/_api/web/lists/getbytitle('Online Processes')/items` +
        `?$select=Id,Title,Content_x0020_Link,ProcessType` +
        `&$orderby=Title asc`;

      const response: SPHttpClientResponse =
        await this.props.context.spHttpClient.get(
          requestUrl,
          SPHttpClient.configurations.v1,
          {
            headers: {
              Accept: 'application/json;odata=nometadata'
            }
          }
        );

      if (!response.ok) {
        const errorBody: string = await response.text();

        console.error(
          'Online Processes REST error:',
          response.status,
          response.statusText,
          errorBody
        );

        throw new Error(
          `SharePoint returned ${response.status}: ${errorBody}`
        );
      }

      const data = await response.json();

      const items: IOnlineProcess[] = (
        data.value || []
      ).map(
        (
          item: ISharePointOnlineProcessItem
        ): IOnlineProcess => {
          let link = '';

          if (
            typeof item.Content_x0020_Link ===
            'string'
          ) {
            link = item.Content_x0020_Link;
          } else if (
            item.Content_x0020_Link &&
            typeof item.Content_x0020_Link ===
              'object'
          ) {
            link =
              item.Content_x0020_Link.Url || '';
          }

          return {
            id: item.Id,
            title: item.Title || '',
            url: link,
            processType:
              item.ProcessType || ''
          };
        }
      );

      this.setState({
        items,
        loading: false,
        error: ''
      });
    } catch (error) {
      console.error(
        'Failed loading Online Processes',
        error
      );

      this.setState({
        loading: false,
        error:
          'Unable to load online processes at the moment.'
      });
    }
  }

  private getSearchScore(
    title: string,
    query: string
  ): number {
    const normalizedTitle =
      title.toLowerCase();

    const normalizedQuery = query
      .toLowerCase()
      .trim();

    if (!normalizedQuery) {
      return 1;
    }

    if (
      normalizedTitle === normalizedQuery
    ) {
      return 100;
    }

    if (
      normalizedTitle.startsWith(
        normalizedQuery
      )
    ) {
      return 90;
    }

    if (
      normalizedTitle.includes(
        normalizedQuery
      )
    ) {
      return 80;
    }

    const cleanedTitle =
      normalizedTitle.replace(
        /[()\/\-_,.]/g,
        ' '
      );

    const words = cleanedTitle
      .split(/\s+/)
      .filter(Boolean);

    const acronym = words
      .map((word: string) =>
        word.charAt(0)
      )
      .join('');

    if (
      acronym.startsWith(
        normalizedQuery
      )
    ) {
      return 85;
    }

    if (
      acronym.includes(
        normalizedQuery
      )
    ) {
      return 70;
    }

    let queryIndex = 0;

    for (
      let i = 0;
      i < normalizedTitle.length &&
      queryIndex <
        normalizedQuery.length;
      i++
    ) {
      if (
        normalizedTitle.charAt(i) ===
        normalizedQuery.charAt(
          queryIndex
        )
      ) {
        queryIndex++;
      }
    }

    if (
      queryIndex ===
      normalizedQuery.length
    ) {
      return 40;
    }

    return 0;
  }

  private getFilteredItems(): IOnlineProcess[] {
    const {
      items,
      activeFilter,
      searchText
    } = this.state;

    const query = searchText.trim();

    return items
      .filter(
        (
          item: IOnlineProcess
        ): boolean => {
          const processType =
            item.processType
              .trim()
              .toLowerCase();

          if (
            activeFilter ===
            'Automations'
          ) {
            return (
              processType ===
              'automation'
            );
          }

          if (
            activeFilter ===
            'Processes'
          ) {
            return (
              processType !==
              'automation'
            );
          }

          return true;
        }
      )
      .map(
        (
          item: IOnlineProcess
        ): {
          item: IOnlineProcess;
          score: number;
        } => ({
          item,
          score:
            this.getSearchScore(
              item.title,
              query
            )
        })
      )
      .filter(
        (
          result: {
            item: IOnlineProcess;
            score: number;
          }
        ): boolean =>
          !query || result.score > 0
      )
      .sort(
        (
          a: {
            item: IOnlineProcess;
            score: number;
          },
          b: {
            item: IOnlineProcess;
            score: number;
          }
        ): number => {
          if (query) {
            if (
              b.score !== a.score
            ) {
              return (
                b.score - a.score
              );
            }
          }

          return a.item.title.localeCompare(
            b.item.title
          );
        }
      )
      .map(
        (
          result: {
            item: IOnlineProcess;
            score: number;
          }
        ): IOnlineProcess =>
          result.item
      );
  }

  private openProcess(
    item: IOnlineProcess
  ): void {
    if (!item.url) {
      console.warn(
        `No URL configured for ${item.title}`
      );

      return;
    }

    window.open(
      item.url,
      '_blank',
      'noopener,noreferrer'
    );
  }

  private setFilter(
    filter: FilterType
  ): void {
    this.setState({
      activeFilter: filter
    });
  }

  private onSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    this.setState({
      searchText:
        event.target.value
    });
  };

  public render(): React.ReactElement<
    IKqOnlineProcessesProps
  > {
    const {
      items,
      activeFilter,
      searchText,
      loading,
      error
    } = this.state;

    const filteredItems =
      this.getFilteredItems();

    return (
      <section
        className={
          styles.onlineProcesses
        }
      >
        <div
          className={styles.card}
        >
          <p
            className={
              styles.eyebrow
            }
          >
            STREAMLINED WORKFLOWS
          </p>

          <h2
            className={styles.title}
          >
            Online Processes &
            Automations
          </h2>

          <div
            className={
              styles.searchContainer
            }
          >
            <Search24Regular
              className={
                styles.searchIcon
              }
            />

            <input
              type="search"
              value={searchText}
              onChange={
                this.onSearchChange
              }
              placeholder="Search KQ World"
              className={
                styles.searchInput
              }
              aria-label="Search online processes and automations"
            />
          </div>

          <div
            className={
              styles.filterRow
            }
          >
            <div
              className={
                styles.filterButtons
              }
            >
              {(
                [
                  'All',
                  'Processes',
                  'Automations'
                ] as FilterType[]
              ).map(
                (
                  filter: FilterType
                ) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() =>
                      this.setFilter(
                        filter
                      )
                    }
                    className={
                      activeFilter ===
                      filter
                        ? styles.filterButtonActive
                        : styles.filterButton
                    }
                  >
                    {filter}
                  </button>
                )
              )}
            </div>

            <span
              className={
                styles.appCount
              }
            >
              {items.length} Apps
            </span>
          </div>

          {loading && (
            <div
              className={
                styles.message
              }
            >
              Loading applications...
            </div>
          )}

          {!loading &&
            error && (
              <div
                className={
                  styles.error
                }
              >
                {error}
              </div>
            )}

          {!loading &&
            !error &&
            filteredItems.length ===
              0 && (
              <div
                className={
                  styles.message
                }
              >
                No applications found.
              </div>
            )}

          {!loading &&
            !error &&
            filteredItems.length >
              0 && (
              <div
                className={
                  styles.list
                }
              >
                {filteredItems.map(
                  (
                    item: IOnlineProcess
                  ) => (
                    <button
                      key={item.id}
                      type="button"
                      className={
                        styles.processItem
                      }
                      onClick={() =>
                        this.openProcess(
                          item
                        )
                      }
                    >
                      {item.title}
                    </button>
                  )
                )}
              </div>
            )}
        </div>
      </section>
    );
  }
}