import * as React from 'react';

import {
  CalendarLtr24Regular,
  Airplane24Regular,
  TicketDiagonal24Regular,
  Send24Regular,
  DocumentText24Regular,
  Shield24Regular,
  ArrowUpRight20Regular
} from '@fluentui/react-icons';

import {
  quickActions,
  QuickActionIcon
} from '../data/quickActionsData';

import quickActionsBg from '../assets/quick-actions-bg.svg';
import kqLogoBlack from '../assets/kqlogoblack.svg';

import type { IKqquickactionsProps } from './IKqquickactionsProps';


const QUICK_ACTION_ICONS: Record<QuickActionIcon, React.ElementType> = {
  calendar: CalendarLtr24Regular,
  airplane: Airplane24Regular,
  ticket: TicketDiagonal24Regular,
  expense: Send24Regular,
  payslip: DocumentText24Regular,
  safety: Shield24Regular
};


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


const getFirstName = (displayName?: string): string => {
  if (!displayName) {
    return 'Amina';
  }

  const cleanedName = displayName.trim();

  if (!cleanedName) {
    return 'Amina';
  }

  if (cleanedName.indexOf(',') !== -1) {
    const parts = cleanedName.split(',');

    if (parts.length > 1 && parts[1].trim()) {
      return parts[1].trim().split(/\s+/)[0];
    }
  }

  return cleanedName.split(/\s+/)[0];
};


interface IKqquickactionsState {
  hoveredActionId: number | null;
  isDarkMode: boolean;
}


export default class Kqquickactions
  extends React.Component<
    IKqquickactionsProps,
    IKqquickactionsState
  > {

  public constructor(props: IKqquickactionsProps) {
    super(props);

    const currentTheme =
      typeof document !== 'undefined'
        ? document.documentElement.getAttribute('data-kq-theme')
        : 'light';

    this.state = {
      hoveredActionId: null,
      isDarkMode: currentTheme === 'dark'
    };
  }


  public componentDidMount(): void {
    window.addEventListener(
      'kqworld-theme-change',
      this.handleThemeChange as EventListener
    );

    const currentTheme =
      document.documentElement.getAttribute('data-kq-theme');

    this.setState({
      isDarkMode: currentTheme === 'dark'
    });
  }


  public componentWillUnmount(): void {
    window.removeEventListener(
      'kqworld-theme-change',
      this.handleThemeChange as EventListener
    );
  }


  private handleThemeChange = (event: CustomEvent): void => {
    const theme = event.detail?.theme;

    this.setState({
      isDarkMode: theme === 'dark'
    });
  };


  public render(): React.ReactElement<IKqquickactionsProps> {

    const { userDisplayName } = this.props;
    const { isDarkMode } = this.state;

    const greeting = getGreeting();
    const firstName = getFirstName(userDisplayName);

    const pageText = isDarkMode ? '#ffffff' : '#1d1d1d';
    const secondaryText = isDarkMode ? '#c7ccd4' : '#929292';

    const cardBackground = isDarkMode
      ? '#262F3D'
      : '#ffffff';

    const cardText = isDarkMode
      ? '#ffffff'
      : '#292929';

    const cardBorder = isDarkMode
      ? '1px solid rgba(255, 255, 255, 0.08)'
      : '1px solid rgba(0, 0, 0, 0.13)';


    return (

      <section
        className="kq-quick-actions-root"
        style={{
          boxSizing: 'border-box',
          overflow: 'visible',
          fontFamily: '"Segoe UI", Arial, Helvetica, sans-serif'
        }}
      >

        <style>
          {`
            .kq-quick-actions-root {
              width: calc(100% + 70px);
              max-width: none;
              margin-left: -50px;
              margin-right: 0;
            }

            .kq-quick-actions-grid {
              display: grid;
              grid-template-columns: repeat(6, minmax(0, 1fr));
              gap: 14px;
              width: 100%;
              box-sizing: border-box;
            }

            .kq-quick-action-card {
              min-width: 0;
            }

            @media (max-width: 1100px) {
              .kq-quick-actions-root {
                width: calc(100% + 16px);
                margin-left: -16px;
              }

              .kq-quick-actions-grid {
                grid-template-columns: repeat(3, minmax(0, 1fr));
              }
            }

            @media (max-width: 700px) {
              .kq-quick-actions-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 10px;
              }
            }

            @media (max-width: 600px) {
              .kq-quick-actions-root {
                width: 100%;
                margin-left: 0;
              }
            }

            @media (max-width: 430px) {
              .kq-quick-actions-grid {
                grid-template-columns: 1fr;
              }
            }
          `}
        </style>


        {/* Welcome */}

        <div
          style={{
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            marginBottom: '22px'
          }}
        >

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '13px'
            }}
          >

            <span
              style={{
                color: pageText,
                fontSize: '10px',
                lineHeight: 1,
                fontWeight: 600,
                letterSpacing: '0.03em',
                whiteSpace: 'nowrap'
              }}
            >
              KARIBU · WELCOME BACK
            </span>


            <span
              style={{
                display: 'block',
                width: '1px',
                height: '20px',
                flexShrink: 0,
                backgroundColor:
                  isDarkMode
                    ? 'rgba(255,255,255,0.65)'
                    : '#333333'
              }}
            />


            <img
              src={kqLogoBlack}
              alt="KQ World"
              style={{
                display: 'block',
                width: '72px',
                height: 'auto',
                objectFit: 'contain',

                /*
                 * The supplied asset is the black KQ World logo.
                 * In dark mode this turns it white without changing
                 * the source asset.
                 */
                filter: isDarkMode
                  ? 'brightness(0) invert(1)'
                  : 'none'
              }}
            />

          </div>


          <h2
            style={{
              margin: 0,
              padding: 0,

              color:
                isDarkMode
                  ? '#ffffff'
                  : '#ed1111',

              fontSize: 'clamp(17px, 1.35vw, 21px)',
              lineHeight: 1.2,

              fontWeight: 600,
              fontStyle: 'italic',

              letterSpacing: 0
            }}
          >
            {greeting}, {firstName}. Here&apos;s what&apos;s happening across KQ today.
          </h2>


          <p
            style={{
              margin: '10px 0 0 0',
              padding: 0,

              color: secondaryText,

              fontSize: '12px',
              lineHeight: 1.45,

              fontWeight: 400
            }}
          >
            Your calm, single view of everything at the Pride of Africa — from the flight line to the front office.
          </p>

        </div>


        {/* Quick Actions hero */}

        <div
          style={{
            position: 'relative',

            width: '100%',
            maxWidth: '100%',

            minHeight: '300px',

            boxSizing: 'border-box',

            overflow: 'hidden',

            borderRadius: '14px',

            backgroundImage: `url(${quickActionsBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center right',
            backgroundRepeat: 'no-repeat',

            padding: '30px 38px 34px 38px'
          }}
        >

          <div
            style={{
              position: 'relative',
              zIndex: 2,

              width: '100%',
              maxWidth: '100%',

              boxSizing: 'border-box'
            }}
          >

            <div
              style={{
                marginBottom: '8px',

                color: '#171717',

                fontSize: '10px',
                lineHeight: 1,

                fontWeight: 600,
                letterSpacing: '0.06em'
              }}
            >
              QUICK ACTIONS
            </div>


            <h3
              style={{
                margin: 0,
                padding: 0,

                color: '#111111',

                fontSize: 'clamp(17px, 1.35vw, 21px)',
                lineHeight: 1.15,

                fontWeight: 600,
                fontStyle: 'italic'
              }}
            >
              What can we get done today?
            </h3>


            <div
              className="kq-quick-actions-grid"
              style={{
                marginTop: '25px'
              }}
            >

              {quickActions.map((action) => {

                const Icon = QUICK_ACTION_ICONS[action.icon];

                const isHovered =
                  this.state.hoveredActionId === action.id;


                return (

                  <a
                    className="kq-quick-action-card"

                    key={action.id}

                    href={action.url}

                    title={action.title}

                    onMouseEnter={() => {
                      this.setState({
                        hoveredActionId: action.id
                      });
                    }}

                    onMouseLeave={() => {
                      this.setState({
                        hoveredActionId: null
                      });
                    }}

                    onFocus={() => {
                      this.setState({
                        hoveredActionId: action.id
                      });
                    }}

                    onBlur={() => {
                      this.setState({
                        hoveredActionId: null
                      });
                    }}

                    style={{
                      display: 'block',

                      width: '100%',
                      minWidth: 0,

                      boxSizing: 'border-box',

                      color: 'inherit',
                      textDecoration: 'none',

                      outline: 'none'
                    }}
                  >

                    <div
                      style={{
                        width: '100%',

                        aspectRatio: '1 / 1.05',

                        minHeight: '140px',
                        maxHeight: '158px',

                        boxSizing: 'border-box',

                        padding: '13px',

                        backgroundColor:
                          isHovered
                            ? action.accent
                            : cardBackground,

                        border:
                          isHovered
                            ? `1px solid ${action.accent}`
                            : cardBorder,

                        borderRadius: '13px',

                        boxShadow:
                          isHovered
                            ? '0 6px 14px rgba(0,0,0,0.18)'
                            : isDarkMode
                              ? '0 3px 10px rgba(0,0,0,0.18)'
                              : '0 3px 8px rgba(0,0,0,0.11)',

                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',

                        overflow: 'hidden',

                        cursor: 'pointer',

                        transition:
                          'background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease',

                        transform:
                          isHovered
                            ? 'translateY(-2px)'
                            : 'translateY(0)'
                      }}
                    >

                      <div
                        style={{
                          minWidth: 0
                        }}
                      >

                        {/* Icon */}

                        <div
                          style={{
                            width: '34px',
                            height: '34px',

                            flexShrink: 0,

                            borderRadius: '50%',

                            backgroundColor:
                              isHovered
                                ? '#ffffff'
                                : isDarkMode
                                  ? '#ffffff'
                                  : action.accent,

                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',

                            marginBottom: '12px',

                            transition:
                              'background-color 180ms ease'
                          }}
                        >

                          <Icon
                            style={{
                              width: '17px',
                              height: '17px',

                              color:
                                isHovered
                                  ? action.accent
                                  : isDarkMode
                                    ? '#262F3D'
                                    : '#ffffff',

                              transition:
                                'color 180ms ease'
                            }}
                          />

                        </div>


                        {/* Card title */}

                        <div
                          style={{
                            color:
                              isHovered
                                ? '#ffffff'
                                : cardText,

                            fontSize: '11px',
                            lineHeight: 1.2,

                            fontWeight: 400,

                            overflowWrap: 'break-word',
                            wordBreak: 'normal',

                            transition:
                              'color 180ms ease'
                          }}
                        >
                          {action.title}
                        </div>

                      </div>


                      {/* Start */}

                      <div
                        style={{
                          width: '100%',

                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',

                          color:
                            isHovered || isDarkMode
                              ? '#ffffff'
                              : action.accent,

                          transition:
                            'color 180ms ease'
                        }}
                      >

                        <span
                          style={{
                            fontSize: '10px',
                            lineHeight: 1,
                            fontWeight: 500
                          }}
                        >
                          Start
                        </span>


                        <ArrowUpRight20Regular
                          style={{
                            width: '16px',
                            height: '16px',
                            flexShrink: 0
                          }}
                        />

                      </div>

                    </div>

                  </a>

                );

              })}

            </div>

          </div>

        </div>

      </section>

    );

  }

}