import * as React from 'react';

import {
  ArrowUpRight20Regular
} from '@fluentui/react-icons';

import {
  SPHttpClient,
  SPHttpClientResponse
} from '@microsoft/sp-http';

import kqLogoBlack from '../assets/kqlogoblack.svg';

import type {
  IKqquickactionsProps
} from './IKqquickactionsProps';

import {
  QUICK_ACTION_ICONS,
  getQuickActionIcon
} from '../data/quickActionIcons';

import type {
  QuickActionIcon
} from '../data/quickActionIcons';

import styles from './Kqquickactions.module.scss';


interface IQuickAction {
  id: number;
  title: string;
  url: string;
  icon: QuickActionIcon;
  displayOrder: number;
}

interface ISharePointQuickAction {
  Id: number;
  Title?: string;

  NavigationUrl?:
    | string
    | {
        Url?: string;
        Description?: string;
      };

  Icon?: string;
  DisplayOrder?: number;
  IsPublished?: boolean;
}

interface IKqquickactionsState {
  isDarkMode: boolean;
  quickActions: IQuickAction[];
  isLoading: boolean;
  errorMessage: string;
}



const getGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good morning';
  }

  if (hour < 17) {
    return 'Good afternoon';
  }

  return 'Good evening';
};

const getFirstName = (
  displayName?: string
): string => {
  if (!displayName) {
    return 'there';
  }

  const cleanedName =
    displayName.trim();

  if (!cleanedName) {
    return 'there';
  }

  if (
    cleanedName.indexOf(',') !== -1
  ) {
    const parts =
      cleanedName.split(',');

    if (
      parts.length > 1 &&
      parts[1].trim()
    ) {
      return parts[1]
        .trim()
        .split(/\s+/)[0];
    }
  }

  return cleanedName.split(/\s+/)[0];
};



const getUrlValue = (
  value:
    ISharePointQuickAction['NavigationUrl']
): string => {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  return value.Url || '';
};

const getAccentClass = (
  icon: QuickActionIcon
): string => {
  switch (icon) {
    case 'calendar':
      return styles.accentCalendar;

    case 'airplane':
      return styles.accentAirplane;

    case 'ticket':
      return styles.accentTicket;

    case 'expense':
      return styles.accentExpense;

    case 'payslip':
      return styles.accentPayslip;

    case 'safety':
      return styles.accentSafety;

    default:
      return styles.accentCalendar;
  }
};

export default class Kqquickactions
  extends React.Component<
    IKqquickactionsProps,
    IKqquickactionsState
  > {

  public constructor(
    props: IKqquickactionsProps
  ) {
    super(props);

    const currentTheme =
      typeof document !== 'undefined'
        ? document.documentElement.getAttribute(
            'data-kq-theme'
          )
        : 'light';

    this.state = {
      isDarkMode:
        currentTheme === 'dark',

      quickActions: [],

      isLoading: true,

      errorMessage: ''
    };
  }

  public componentDidMount(): void {
    window.addEventListener(
      'kqworld-theme-change',
      this.handleThemeChange as EventListener
    );

    const currentTheme =
      document.documentElement.getAttribute(
        'data-kq-theme'
      );

    this.setState({
      isDarkMode:
        currentTheme === 'dark'
    });

    void this.loadQuickActions();
  }

  public componentWillUnmount(): void {
    window.removeEventListener(
      'kqworld-theme-change',
      this.handleThemeChange as EventListener
    );
  }

  private handleThemeChange = (
    event: CustomEvent
  ): void => {
    const theme =
      event.detail?.theme;

    this.setState({
      isDarkMode:
        theme === 'dark'
    });
  };

  private async ensureSuccess(
    response: SPHttpClientResponse,
    message: string
  ): Promise<void> {
    if (response.ok) {
      return;
    }

    const errorText =
      await response.text();

    console.error(
      message,
      response.status,
      errorText
    );

    throw new Error(message);
  }

  private loadQuickActions =
    async (): Promise<void> => {
      try {
        this.setState({
          isLoading: true,
          errorMessage: ''
        });

        const {
          context
        } = this.props;

        const webUrl =
          context.pageContext.web.absoluteUrl;

        const listName =
          'KQ Quick Actions Dev';

        const endpoint =
          `${webUrl}/_api/web/lists/getbytitle(` +
          `'${listName}')/items` +
          `?$select=` +
          `Id,` +
          `Title,` +
          `NavigationUrl,` +
          `Icon,` +
          `DisplayOrder,` +
          `IsPublished` +
          `&$filter=IsPublished eq 1` +
          `&$orderby=DisplayOrder asc`;

        const response =
          await context.spHttpClient.get(
            endpoint,
            SPHttpClient.configurations.v1
          );

        await this.ensureSuccess(
          response,
          'Unable to load Quick Actions.'
        );

        const data: {
          value: ISharePointQuickAction[];
        } = await response.json();

        const quickActions =
          data.value
            .map(
              (
                item
              ): IQuickAction => ({
                id:
                  item.Id,

                title:
                  item.Title || '',

                url:
                  getUrlValue(
                    item.NavigationUrl
                  ),

                icon:
                  getQuickActionIcon(
                    item.Icon
                  ),

                displayOrder:
                  item.DisplayOrder || 0
              })
            )
            .filter(
              (item) =>
                item.title.trim().length > 0
            );

        this.setState({
          quickActions,
          isLoading: false,
          errorMessage: ''
        });
      } catch (error) {
        this.setState({
          quickActions: [],
          isLoading: false,

          errorMessage:
            error instanceof Error
              ? error.message
              : 'Unable to load Quick Actions.'
        });
      }
    };

  public render():
    React.ReactElement<IKqquickactionsProps> {

    const {
      userDisplayName
    } = this.props;

    const {
      isDarkMode,
      quickActions,
      isLoading,
      errorMessage
    } = this.state;

    const greeting =
      getGreeting();

    const firstName =
      getFirstName(
        userDisplayName
      );

    const rootClassName =
      isDarkMode
        ? `${styles.kqquickactions} ${styles.darkMode}`
        : styles.kqquickactions;

    return (
      <section className={rootClassName}>
        <div className={styles.welcomeSection}>
          <div className={styles.welcomeTop}>
            <span className={styles.welcomeLabel}>
              KARIBU · WELCOME BACK
            </span>

            <span className={styles.welcomeDivider} />

            <img
              src={kqLogoBlack}
              alt="KQ World"
              className={styles.kqLogo}
            />
          </div>

          <h2 className={styles.greeting}>
            {greeting}, {firstName}. Here&apos;s what&apos;s happening across KQ today.
          </h2>

          <p className={styles.welcomeText}>
            Your calm, single view of everything at the Pride of Africa,
            from the flight line to the front office.
          </p>
        </div>

        <div className={styles.quickActionsHero}>
          <div className={styles.heroContent}>
            <p className={styles.sectionLabel}>
              QUICK ACTIONS
            </p>

            <h3 className={styles.heroTitle}>
              What can we get done today?
            </h3>

            {isLoading && (
              <div className={styles.statusMessage}>
                Loading Quick Actions...
              </div>
            )}

            {!isLoading &&
              errorMessage && (
                <div className={styles.errorMessage}>
                  Quick Actions are currently unavailable.
                </div>
              )}

            {!isLoading &&
              !errorMessage &&
              quickActions.length === 0 && (
                <div className={styles.statusMessage}>
                  No Quick Actions are currently available.
                </div>
              )}

            {!isLoading &&
              !errorMessage &&
              quickActions.length > 0 && (
                <div className={styles.quickActionsGrid}>
                  {quickActions.map((action) => {
                    const Icon =
                      QUICK_ACTION_ICONS[
                        action.icon
                      ];

                    const accentClass =
                      getAccentClass(
                        action.icon
                      );

                    return (
                      <a
                        key={action.id}
                        href={action.url || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={action.title}
                        className={
                          `${styles.quickActionCard} ${accentClass}`
                        }
                      >
                        <div className={styles.cardTop}>
                          <div className={styles.iconCircle}>
                            <Icon
                              className={styles.cardIcon}
                            />
                          </div>

                          <div className={styles.cardTitle}>
                            {action.title}
                          </div>
                        </div>

                        <div className={styles.cardFooter}>
                          <span>
                            Start
                          </span>

                          <ArrowUpRight20Regular
                            className={styles.arrowIcon}
                          />
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
          </div>
        </div>
      </section>
    );
  }
}