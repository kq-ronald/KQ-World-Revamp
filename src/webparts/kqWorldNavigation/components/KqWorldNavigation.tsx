import * as React from 'react';
import { kqSearchItems } from '../data/searchData';
import styles from './KqWorldNavigation.module.scss';
import type { IKqWorldNavigationProps } from './IKqWorldNavigationProps';
import { IKqNotification } from '../models/IKqNotification';
import { KqNotificationService } from '../services/KqNotificationService';
import { navigationItems } from '../data/navigationData';
import kqLogo from '../assets/kqwhitelogo.svg';
import navBgLeft from '../assets/kqworldbgleft.svg';
import navBgRight from '../assets/kqworldbgright.svg';
import kqWorldSmallLogo from '../assets/kqworldsmalllogo.svg';

import {
  Home24Regular,
  News24Regular,
  Alert24Regular,
  Megaphone24Regular,
  DocumentText24Regular,
  HatGraduation24Regular,
  Print24Regular,
  Edit24Regular,
  Image24Regular,
  Video24Regular,
  Folder24Regular,
  Briefcase24Regular,
  Color24Regular,
  Bookmark24Regular,
  DocumentEdit24Regular,
  Layer24Regular,
  BookOpen24Regular,
  People24Regular,
  Money24Regular,
  VehicleCar24Regular,
  Desktop24Regular,
  Person24Regular,
  ShoppingBag24Regular,
  Box24Regular,
  Wrench24Regular,
  Lightbulb24Regular,
  Airplane24Regular,
  WeatherSunny24Regular,
  WeatherMoon24Regular
} from '@fluentui/react-icons';

/* =========================================================
   ICON MAPPING
========================================================= */

const MEGA_MENU_ICONS: Record<string, React.ElementType> = {
  home: Home24Regular,
  news: News24Regular,
  alert: Alert24Regular,
  megaphone: Megaphone24Regular,
  documentText: DocumentText24Regular,
  hatGraduation: HatGraduation24Regular,
  print: Print24Regular,
  edit: Edit24Regular,
  image: Image24Regular,
  video: Video24Regular,
  folder: Folder24Regular,
  briefcase: Briefcase24Regular,
  color: Color24Regular,
  bookmark: Bookmark24Regular,
  documentEdit: DocumentEdit24Regular,
  layer: Layer24Regular,
  bookOpen: BookOpen24Regular,
  people: People24Regular,
  money: Money24Regular,
  vehicleCar: VehicleCar24Regular,
  desktop: Desktop24Regular,
  person: Person24Regular,
  shoppingBag: ShoppingBag24Regular,
  box: Box24Regular,
  wrench: Wrench24Regular,
  lightbulb: Lightbulb24Regular,
  airplane: Airplane24Regular
};

/*
 * Fallback mapping.
 * This makes the icons work even when navigationData.ts
 * does not contain an icon value.
 */
const MENU_ITEM_ICONS: Record<string, React.ElementType> = {
  /* Home */
  Dashboard: Home24Regular,
  'My Feed': News24Regular,
  Notifications: Alert24Regular,

  /* Staff Notices */
  'HR Notices': Megaphone24Regular,
  'Provident Fund': DocumentText24Regular,
  'IT Notices': DocumentText24Regular,
  'Wanandege Notices': Megaphone24Regular,
  'Brand Ambassador': HatGraduation24Regular,
  'Data Protection': Print24Regular,

  /* Brand Portal */
  'KQ Templates': Edit24Regular,
  'KQ Images': Image24Regular,
  'KQ Videos': Video24Regular,
  'KQ Brand Documents': Folder24Regular,
  'Sales Kit': Briefcase24Regular,
  'Brand Guidelines': Color24Regular,

  /* Departments */
  'Human Resource': People24Regular,
  Finance: Money24Regular,
  Commercial: ShoppingBag24Regular,
  'Flight Operations': Airplane24Regular,
  'Ground Services': VehicleCar24Regular,
  'Information Technology': Desktop24Regular,
  'Group CEO': Person24Regular,
  Cargo: Box24Regular,
  Technical: Wrench24Regular,
  Marketing: Megaphone24Regular,
  'Strategy & Innovation': Lightbulb24Regular,
  'Fahari Aviation': Airplane24Regular,

  /* Corporate News */
  'The Pride': News24Regular,
  'The Pride Newsletter': News24Regular,
  'Take 3': Bookmark24Regular,
  'KQ Blog': DocumentEdit24Regular,

  /* Knowledge Hub */
  'Knowledge Hub': Layer24Regular,
  'IATA Manuals': DocumentText24Regular,
  'iPride Manuals and User Guides': BookOpen24Regular,
  'Corporate Training Reading Materials': DocumentEdit24Regular,

  /* Printer icon */
  'Print Data Dashboard': Print24Regular,
  'Printing Data Dashboard': Print24Regular
};

/* =========================================================
   MEGA MENU DESCRIPTIONS
========================================================= */

const MENU_DESCRIPTIONS: Record<string, string> = {
  Home: 'Your dashboard, at a glance.',
  'Staff Notices': 'Stay informed on what matters.',
  'Brand Portal': 'Stay informed on what matters.',
  Departments: 'Every team, one directory.',
  'Corporate News': 'Latest stories from across KQ.',
  'Knowledge Hub': 'Essential Guides & Resources'
};
const inspirationItems = [
  'How to request annual leave',
  'New travel policy updates',
  'Employee benefits guide',
  'Office locations',
  'Upcoming staff events'
];


/* =========================================================
   COMPONENT
========================================================= */

const KqWorldNavigation: React.FC<IKqWorldNavigationProps> = (props) => {
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [mobileExpanded, setMobileExpanded] =
    React.useState<string | null>(null);
  const [contactOpen, setContactOpen] = React.useState(false);
  const [attachmentName, setAttachmentName] = React.useState('');
  const [notifications, setNotifications] = React.useState<IKqNotification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [notificationsLoading, setNotificationsLoading] = React.useState(true);
  const [notificationsError, setNotificationsError] = React.useState('');
  React.useEffect(() => {
    let isMounted = true;

    const loadNotifications = async (): Promise<void> => {
      try {
        setNotificationsLoading(true);
        setNotificationsError('');

        const notificationService =
          new KqNotificationService(props.context);

        const items =
          await notificationService.getNotifications();

        if (isMounted) {
          setNotifications(items);
        }
      } catch (error) {
        console.error('Failed to load KQ World notifications:', error);

        if (isMounted) {
          setNotificationsError(
            'Unable to load notifications.'
          );
        }
      } finally {
        if (isMounted) {
          setNotificationsLoading(false);
        }
      }
    };

    loadNotifications().catch((error) => {
      console.error(
        'Failed to initialise KQ World notifications:',
        error
      );
    });

    return () => {
      isMounted = false;
    };
  }, [props.context]);

  // Theme: follow the device until the user chooses an override.
  const [isDarkMode, setIsDarkMode] = React.useState<boolean>(() => {
    const savedTheme = localStorage.getItem('kqworld-theme');

    if (savedTheme === 'dark') {
      return true;
    }

    if (savedTheme === 'light') {
      return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleTheme = (): void => {
    const nextTheme = !isDarkMode;

    setIsDarkMode(nextTheme);

    localStorage.setItem(
      'kqworld-theme',
      nextTheme ? 'dark' : 'light'
    );
  };
  // SEARCH
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [selectedSearchIndex, setSelectedSearchIndex] = React.useState(-1);
  const searchRef = React.useRef<HTMLDivElement>(null);

  // Publish the active theme so the other KQ World web parts can respond to it.
  React.useEffect(() => {
    const theme = isDarkMode ? 'dark' : 'light';

    document.documentElement.setAttribute('data-kq-theme', theme);

    window.dispatchEvent(
      new CustomEvent('kqworld-theme-change', {
        detail: { theme }
      })
    );
  }, [isDarkMode]);
  // Keep following the operating-system theme while no manual preference exists.
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (event: MediaQueryListEvent): void => {
      const savedTheme = localStorage.getItem('kqworld-theme');

      if (!savedTheme) {
        setIsDarkMode(event.matches);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);
  // Close desktop search on outside click or Escape.
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
        setSelectedSearchIndex(-1);
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setNotificationsOpen(false);
        setSearchOpen(false);
        setSelectedSearchIndex(-1);
        setContactOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // SEARCH RESULTS
  const searchResults = React.useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    if (!query) {
      return [];
    }

    return kqSearchItems
      .map((item) => {
        const title = item.title.toLowerCase();

        const keywords = item.keywords
          .join(' ')
          .toLowerCase();

        const aliases = (item.aliases || [])
          .join(' ')
          .toLowerCase();

        let score = 0;

        if (title === query) {
          score += 100;
        }

        if (title.startsWith(query)) {
          score += 80;
        }

        if (title.includes(query)) {
          score += 60;
        }

        if (aliases.includes(query)) {
          score += 50;
        }

        if (keywords.includes(query)) {
          score += 40;
        }

        return {
          ...item,
          score
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [searchQuery]);

  const activeItem = navigationItems.find(
    (item) => item.title === activeMenu
  );


  /* ---------------------------------------------------------
     Resolve icon for a child menu item
  --------------------------------------------------------- */

  const getChildIcon = (
    child: {
      title: string;
      icon?: string;
    }
  ): React.ElementType | undefined => {
    const mappedIcon =
      typeof child.icon === 'string'
        ? MEGA_MENU_ICONS[child.icon]
        : undefined;

    return mappedIcon || MENU_ITEM_ICONS[child.title];
  };
  const getStartOfDay = (date: Date): Date => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);

    return result;
  };

  const getNotificationGroup = (
    publishDate: Date
  ): 'Today' | 'Yesterday' | 'Earlier' => {
    const today = getStartOfDay(new Date());
    const notificationDate = getStartOfDay(publishDate);

    const difference =
      today.getTime() - notificationDate.getTime();

    const daysDifference = Math.floor(
      difference / (1000 * 60 * 60 * 24)
    );

    if (daysDifference <= 0) {
      return 'Today';
    }

    if (daysDifference === 1) {
      return 'Yesterday';
    }

    return 'Earlier';
  };

  const getRelativeTime = (publishDate: Date): string => {
    const now = new Date();

    const difference =
      now.getTime() - publishDate.getTime();

    const minutes = Math.max(
      0,
      Math.floor(difference / (1000 * 60))
    );

    if (minutes < 1) {
      return 'JUST NOW';
    }

    if (minutes < 60) {
      return `${minutes} MIN${minutes === 1 ? '' : 'S'} AGO`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} HOUR${hours === 1 ? '' : 'S'} AGO`;
    }

    const days = Math.floor(hours / 24);

    return `${days} DAY${days === 1 ? '' : 'S'} AGO`;
  };

  const todayNotifications: IKqNotification[] =
    notifications.filter(
      (notification: IKqNotification) =>
        getNotificationGroup(notification.publishDate) === 'Today'
    );

  const yesterdayNotifications: IKqNotification[] =
    notifications.filter(
      (notification: IKqNotification) =>
        getNotificationGroup(notification.publishDate) === 'Yesterday'
    );

  const earlierNotifications: IKqNotification[] =
    notifications.filter(
      (notification: IKqNotification) =>
        getNotificationGroup(notification.publishDate) === 'Earlier'
    );
  return (
    <header
      className={`${styles.navigationRoot} ${isDarkMode ? styles.darkMode : ''}`}
      style={{
        width: '100%',
        maxWidth: 'none',
        boxSizing: 'border-box'
      }}
    >
      {/* =====================================================
          TOP RED BAR
      ====================================================== */}

      <div className={styles.topBar}>
        <img
          src={navBgLeft}
          alt=""
          className={styles.bgLeft}
        />

        <img
          src={navBgRight}
          alt=""
          className={styles.bgRight}
        />

        <div
          className={styles.topBarInner}
          style={{
            width: '100%',
            maxWidth: 'none',
            boxSizing: 'border-box'
          }}
        >
          <div className={styles.brandArea}>
            <img
              src={kqLogo}
              alt="Kenya Airways"
              className={styles.logo}
            />

            <span className={styles.internalLabel}>
              INTERNAL
            </span>

            <span className={styles.dateText}>
              Thursday, 20 August 2026 · Nairobi 12:28 EAT
            </span>
          </div>

          <div className={styles.utilityLinks}>
            <button
              type="button"
              className={styles.utilityAction}
              onClick={() => setContactOpen(true)}
            >
              Feedback &amp; IT Support
            </button>

            <span className={styles.systemStatus}>
              <span className={styles.statusDot} />
              All systems operational
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          DESKTOP NAVIGATION
      ====================================================== */}

      <div
        className={styles.desktopNav}
        onMouseLeave={() => setActiveMenu(null)}
        style={{
          width: '100%',
          maxWidth: 'none',
          boxSizing: 'border-box'
        }}
      >
        <div
          className={styles.desktopNavInner}
          style={{
            width: '100%',
            maxWidth: 'none',
            margin: 0,
            paddingLeft: '24px',
            paddingRight: '24px',
            boxSizing: 'border-box',

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',

            gap: '18px'
          }}
        >
          {/* NAV LINKS */}

          <nav
            className={styles.navLinks}
            style={{
              display: 'flex',
              alignItems: 'center',
              flex: '1 1 auto',
              minWidth: 0,
              gap: 'clamp(12px, 1.6vw, 26px)'
            }}
          >
            {navigationItems.map((item) => (
              <button
                key={item.title}
                type="button"
                className={`${styles.navButton} ${activeMenu === item.title
                  ? styles.activeNavButton
                  : ''
                  }`}
                style={{
                  flexShrink: 1
                }}
                onMouseEnter={() => {
                  if (item.children?.length) {
                    setActiveMenu(item.title);
                  } else {
                    setActiveMenu(null);
                  }
                }}
                onClick={() => {
                  if (item.url && item.url !== '#') {
                    window.location.href = item.url;
                    return;
                  }

                  if (item.children?.length) {
                    setActiveMenu(
                      activeMenu === item.title
                        ? null
                        : item.title
                    );
                  }
                }}
              >
                <span>
                  {item.title}
                </span>

                {item.children?.length ? (
                  <span
                    className={`${styles.chevron} ${activeMenu === item.title ? styles.chevronUp : ''
                      }`}
                  />
                ) : null}
              </button>
            ))}
          </nav>

          {/* DESKTOP ACTIONS */}

          <div
            className={styles.desktopActions}
            style={{
              display: 'flex',
              alignItems: 'center',
              flex: '0 1 auto',
              minWidth: 0,
              gap: '10px',
              marginLeft: '8px'
            }}
          >
            {/* SEARCH */}
            <div
              ref={searchRef}
              className={styles.searchBox}
              style={{
                width: '240px',
                minWidth: '200px',
                maxWidth: '240px',
                flexShrink: 0
              }}
            >
              <span className={styles.searchIcon}>
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search KQ World"
                value={searchQuery}
                onFocus={() => {
                  setSearchOpen(true);
                }}
                onChange={(e) => {
                  const value = e.target.value;

                  setSearchQuery(value);
                  setSelectedSearchIndex(-1);

                  if (value.trim()) {
                    setSearchOpen(true);
                  } else {
                    setSearchOpen(false);
                  }
                }}

              />
              {searchOpen && (
                <div className={styles.searchDropdown}>

                  {!searchQuery.trim() ? (
                    <>
                      <div className={styles.searchDropdownTitle}>
                        Need inspiration? Try searching for...
                      </div>

                      <div className={styles.searchSuggestionList}>
                        {inspirationItems.map((item) => (
                          <button
                            key={item}
                            type="button"
                            className={styles.searchSuggestion}
                            onClick={() => {
                              setSearchQuery(item);
                            }}
                          >
                            <span className={styles.searchSuggestionIcon}>
                              ⌕
                            </span>

                            <span className={styles.searchSuggestionText}>
                              {item}
                            </span>

                            <span className={styles.searchSuggestionArrow}>
                              →
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.searchDropdownTitle}>
                        Suggested results
                      </div>

                      <div className={styles.searchSuggestionList}>
                        {searchResults.length > 0 ? (
                          searchResults.map((item, index) => (
                            <button
                              key={item.id}
                              type="button"
                              className={`${styles.searchSuggestion} ${selectedSearchIndex === index
                                ? styles.searchSuggestionActive
                                : ''
                                }`}
                              onClick={() => {
                                window.location.href = item.url;
                              }}
                            >
                              <span className={styles.searchSuggestionIcon}>
                                ⌕
                              </span>

                              <span className={styles.searchSuggestionText}>
                                {item.title}
                              </span>

                              <span className={styles.searchSuggestionArrow}>
                                →
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className={styles.noSearchResults}>
                            No results found
                          </div>
                        )}
                      </div>
                    </>
                  )}

                </div>
              )}
            </div>

            {/* Notifications */}
            <button
              type="button"
              className={styles.iconButton}
              aria-label="Notifications"
              title="Notifications"
              onClick={() => setNotificationsOpen(true)}
            >
              <Alert24Regular className={styles.actionIcon} />
            </button>

            {/* Theme */}
            <button
              type="button"
              className={styles.iconButton}
              aria-label={isDarkMode ? 'Light mode' : 'Dark mode'}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-pressed={isDarkMode}
              onClick={toggleTheme}
            >
              {isDarkMode ? (
                <WeatherSunny24Regular className={styles.actionIcon} />
              ) : (
                <WeatherMoon24Regular className={styles.actionIcon} />
              )}
            </button>
          </div>
        </div>

        {/* =================================================
            DESKTOP MEGA MENU
        ================================================== */}

        {activeItem?.children?.length ? (
          <div
            className={styles.dropdown}
            onMouseEnter={() => setActiveMenu(activeItem.title)}
            style={{
              width: '100%',
              minHeight: 0,
              height: 'auto',
              boxSizing: 'border-box'
            }}
          >
            <div
              className={styles.dropdownInner}
              style={{
                display: 'grid',
                gridTemplateColumns: '250px minmax(0, 1fr)',
                columnGap: '40px',
                alignItems: 'center',
                width: '100%',
                maxWidth: 'none',
                minHeight: 0,
                paddingTop: '26px',
                paddingBottom: '28px',
                paddingLeft: '60px',
                paddingRight: '60px',
                boxSizing: 'border-box'
              }}
            >
              {/* Menu intro */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '4px minmax(0, 1fr)',
                  columnGap: '18px',
                  alignItems: 'stretch',
                  minWidth: 0
                }}
              >
                <div
                  style={{
                    width: '4px',
                    height: '150px',
                    minHeight: '150px',
                    borderRadius: '10px',
                    background: '#d71920'
                  }}
                />

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minWidth: 0
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '12px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '12px',
                        lineHeight: '1.2',
                        fontWeight: 700,
                        letterSpacing: '1px',
                        color: '#d71920',
                        textTransform: 'uppercase'
                      }}
                    >
                      {activeItem.heading || activeItem.title}
                    </div>

                    <img
                      src={kqWorldSmallLogo}
                      alt="KQ World"
                      style={{
                        display: 'block',
                        width: '82px',
                        height: 'auto',
                        flexShrink: 0,
                        filter: isDarkMode
                          ? 'brightness(0) invert(1)'
                          : 'none'
                      }}
                    />
                  </div>

                  <div
                    style={{
                      fontFamily:
                        '"Lucida Sans", "Lucida Grande", sans-serif',
                      fontWeight: 600,
                      fontStyle: 'italic',
                      fontSize: '24px',
                      lineHeight: '100%',
                      letterSpacing: '0',
                      color: isDarkMode ? '#ffffff' : '#171717',
                      maxWidth: '230px',
                      marginBottom: '16px'
                    }}
                  >
                    {MENU_DESCRIPTIONS[activeItem.title] ||
                      activeItem.description}
                  </div>

                  <a
                    href={activeItem.url || '#'}
                    style={{
                      display: 'inline-block',
                      width: 'fit-content',
                      color: '#d71920',
                      textDecoration: 'none',
                      fontSize: '12px',
                      fontWeight: 700
                    }}
                  >
                    Explore All ↗
                  </a>
                </div>
              </div>

              {/* Menu links */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  columnGap: 'clamp(24px, 3vw, 60px)',
                  rowGap: '22px',
                  alignItems: 'center',
                  width: '100%',
                  minWidth: 0
                }}
              >
                {activeItem.children.map((child) => {
                  const ChildIcon = getChildIcon(child);
                  return (
                    <a
                      key={child.title}
                      href={child.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        minWidth: 0,
                        color: isDarkMode ? '#ffffff' : '#242424',
                        textDecoration: 'none',
                        fontSize: '14px',
                        lineHeight: '1.25',
                        fontWeight: 500
                      }}
                    >
                      <span
                        style={{
                          width: '34px',
                          height: '34px',
                          minWidth: '34px',
                          flex: '0 0 34px',
                          borderRadius: '50%',
                          background: isDarkMode
                            ? '#171B21'
                            : '#eeeeee',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isDarkMode
                            ? '#ffffff'
                            : '#333333',
                          boxSizing: 'border-box'
                        }}
                      >
                        {ChildIcon ? (
                          <ChildIcon
                            style={{
                              width: '18px',
                              height: '18px',
                              color: isDarkMode
                                ? '#ffffff'
                                : '#333333',
                              display: 'block'
                            }}
                          />
                        ) : null}
                      </span>

                      <span
                        style={{
                          minWidth: 0,
                          overflowWrap: 'break-word'
                        }}
                      >
                        {child.title}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* =====================================================
          MOBILE HEADER
      ====================================================== */}

      <div className={styles.mobileHeader}>
        <button
          type="button"
          className={styles.mobileMenuButton}
          onClick={() =>
            setMobileOpen(
              (current) => !current
            )
          }
          aria-label="Toggle navigation"
        >
          {mobileOpen ? '×' : '☰'}
        </button>

        <div
          className={styles.mobileSearch}
        >
          <span className={styles.searchIcon}>
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search KQ World"
            value={searchQuery}
            onFocus={() => {
              setSearchOpen(true);
            }}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
              setSelectedSearchIndex(-1);
            }}
          />
        </div>

        {/* Theme */}
        <button
          type="button"
          className={styles.iconButton}
          aria-label={isDarkMode ? 'Light mode' : 'Dark mode'}
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-pressed={isDarkMode}
          onClick={toggleTheme}
        >
          {isDarkMode ? (
            <WeatherSunny24Regular className={styles.actionIcon} />
          ) : (
            <WeatherMoon24Regular className={styles.actionIcon} />
          )}
        </button>

        {/* Notifications */}
        <button
          type="button"
          className={styles.iconButton}
          aria-label="Notifications"
          title="Notifications"
          onClick={() => setNotificationsOpen(true)}
        >
          <Alert24Regular className={styles.actionIcon} />
        </button>

        {/* =====================================================
          MOBILE MENU
      ====================================================== */}

        {mobileOpen ? (
          <div className={styles.mobileMenu}>
            {navigationItems.map((item) => (
              <div
                key={item.title}
                className={styles.mobileMenuItem}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (item.children?.length) {
                      setMobileExpanded(
                        mobileExpanded === item.title
                          ? null
                          : item.title
                      );
                    } else if (item.url) {
                      window.location.href =
                        item.url;
                    }
                  }}
                >
                  <span>
                    {item.title}
                  </span>

                  {item.children?.length ? (
                    <span>
                      {mobileExpanded === item.title
                        ? '⌃'
                        : '⌄'}
                    </span>
                  ) : null}
                </button>

                {/* MOBILE SUBMENU */}

                {mobileExpanded === item.title &&
                  item.children?.length ? (
                  <div
                    className={
                      styles.mobileSubmenu
                    }
                  >
                    {item.children.map((child) => {
                      const ChildIcon =
                        getChildIcon(child);

                      return (
                        <a
                          key={child.title}
                          href={child.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',

                            gap: '10px'
                          }}
                        >
                          <span
                            style={{
                              width: '30px',
                              height: '30px',
                              minWidth: '30px',

                              flex: '0 0 30px',

                              borderRadius: '50%',

                              background: '#eeeeee',

                              display: 'flex',
                              alignItems: 'center',
                              justifyContent:
                                'center'
                            }}
                          >
                            {ChildIcon ? (
                              <ChildIcon
                                style={{
                                  width: '17px',
                                  height: '17px',

                                  color: '#333333',

                                  display: 'block'
                                }}
                              />
                            ) : null}
                          </span>

                          <span>
                            {child.title}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
      {notificationsOpen ? (
        <div
          className={styles.notificationOverlay}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setNotificationsOpen(false);
            }
          }}
        >
          <aside
            className={`${styles.notificationDrawer} ${isDarkMode ? styles.notificationDrawerDark : ''
              }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="kq-notification-title"
          >
            <div className={styles.notificationHeader}>
              <img
                src={navBgRight}
                alt=""
                aria-hidden="true"
                className={styles.notificationHeaderBackground}
              />

              <div className={styles.notificationHeaderTop}>
                <div>
                  <div className={styles.notificationBrand}>
                    KQ WORLD
                  </div>

                  <h2 id="kq-notification-title">
                    Notification Center
                  </h2>

                  <p>
                    {notifications.length}{' '}
                    {notifications.length === 1
                      ? 'unread notification'
                      : 'unread notifications'}
                  </p>
                </div>

                <button
                  type="button"
                  className={styles.notificationClose}
                  aria-label="Close notifications"
                  onClick={() => setNotificationsOpen(false)}
                >
                  ×
                </button>
              </div>

              <button
                type="button"
                className={styles.markAllRead}
              >
                Mark all as Read
              </button>
            </div>

            <div className={styles.notificationBody}>
              {notificationsLoading ? (
                <div className={styles.notificationState}>
                  <span className={styles.notificationSpinner} />
                  <p>Loading notifications...</p>
                </div>
              ) : notificationsError ? (
                <div className={styles.notificationState}>
                  <Alert24Regular />
                  <p>{notificationsError}</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className={styles.notificationState}>
                  <Alert24Regular />
                  <h3>You&apos;re all caught up</h3>
                  <p>There are no new notifications right now.</p>
                </div>
              ) : (
                <>
                  {todayNotifications.length > 0 ? (
                    <section className={styles.notificationSection}>
                      <h3>Today</h3>

                      {todayNotifications.map((notification) => (
                        <a
                          key={notification.id}
                          href={notification.link || '#'}
                          target={
                            notification.link ? '_blank' : undefined
                          }
                          rel={
                            notification.link
                              ? 'noopener noreferrer'
                              : undefined
                          }
                          className={styles.notificationItem}
                          onClick={(event) => {
                            if (!notification.link) {
                              event.preventDefault();
                            }
                          }}
                        >
                          <span
                            className={styles.notificationIcon}
                            aria-hidden="true"
                          >
                            <Alert24Regular />
                          </span>

                          <span className={styles.notificationContent}>
                            <span className={styles.notificationMeta}>
                              {getRelativeTime(notification.publishDate)}
                              {' · '}
                              {notification.notificationType.toUpperCase()}
                            </span>

                            <strong>{notification.title}</strong>

                            <span className={styles.notificationMessage}>
                              {notification.message}
                            </span>
                          </span>

                          <span
                            className={styles.unreadDot}
                            aria-label="Unread"
                          />
                        </a>
                      ))}
                    </section>
                  ) : null}

                  {yesterdayNotifications.length > 0 ? (
                    <section className={styles.notificationSection}>
                      <h3>Yesterday</h3>

                      {yesterdayNotifications.map((notification) => (
                        <a
                          key={notification.id}
                          href={notification.link || '#'}
                          target={
                            notification.link ? '_blank' : undefined
                          }
                          rel={
                            notification.link
                              ? 'noopener noreferrer'
                              : undefined
                          }
                          className={styles.notificationItem}
                          onClick={(event) => {
                            if (!notification.link) {
                              event.preventDefault();
                            }
                          }}
                        >
                          <span
                            className={styles.notificationIcon}
                            aria-hidden="true"
                          >
                            <Alert24Regular />
                          </span>

                          <span className={styles.notificationContent}>
                            <span className={styles.notificationMeta}>
                              {getRelativeTime(notification.publishDate)}
                              {' · '}
                              {notification.notificationType.toUpperCase()}
                            </span>

                            <strong>{notification.title}</strong>

                            <span className={styles.notificationMessage}>
                              {notification.message}
                            </span>
                          </span>

                          <span
                            className={styles.unreadDot}
                            aria-label="Unread"
                          />
                        </a>
                      ))}
                    </section>
                  ) : null}

                  {earlierNotifications.length > 0 ? (
                    <section className={styles.notificationSection}>
                      <h3>Earlier</h3>

                      {earlierNotifications.map((notification) => (
                        <a
                          key={notification.id}
                          href={notification.link || '#'}
                          target={
                            notification.link ? '_blank' : undefined
                          }
                          rel={
                            notification.link
                              ? 'noopener noreferrer'
                              : undefined
                          }
                          className={styles.notificationItem}
                          onClick={(event) => {
                            if (!notification.link) {
                              event.preventDefault();
                            }
                          }}
                        >
                          <span
                            className={styles.notificationIcon}
                            aria-hidden="true"
                          >
                            <Alert24Regular />
                          </span>

                          <span className={styles.notificationContent}>
                            <span className={styles.notificationMeta}>
                              {getRelativeTime(notification.publishDate)}
                              {' · '}
                              {notification.notificationType.toUpperCase()}
                            </span>

                            <strong>{notification.title}</strong>

                            <span className={styles.notificationMessage}>
                              {notification.message}
                            </span>
                          </span>

                          <span
                            className={styles.unreadDot}
                            aria-label="Unread"
                          />
                        </a>
                      ))}
                    </section>
                  ) : null}
                </>
              )}
            </div>
          </aside>
        </div>
      ) : null}
      {contactOpen ? (
        <div
          className={styles.contactOverlay}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setContactOpen(false);
            }
          }}
        >
          <section
            className={styles.contactModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="kq-contact-title"
          >
            <div className={styles.contactModalHeader}>
              <div className={styles.contactHeaderIcon} aria-hidden="true" />

              <div className={styles.contactHeaderCopy}>
                <h2 id="kq-contact-title">Contact Us</h2>
                <p>
                  Have questions or need assistance? Fill out the form below and
                  we&apos;ll get back to you as soon as possible.
                </p>
              </div>

              <button
                type="button"
                className={styles.contactCloseButton}
                onClick={() => setContactOpen(false)}
                aria-label="Close contact form"
              >
                ×
              </button>
            </div>

            <form
              className={styles.contactForm}
              onSubmit={(event) => event.preventDefault()}
            >
              <label className={styles.contactField}>
                <span>Email Address <strong>*</strong></span>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  required
                />
              </label>

              <label className={styles.contactField}>
                <span>Subject <strong>*</strong></span>
                <select defaultValue="" required>
                  <option value="" disabled>Select a subject</option>
                  <option value="it-support">IT Support</option>
                  <option value="general-feedback">General Feedback</option>
                  <option value="access-permissions">Access &amp; Permissions</option>
                  <option value="content-navigation">Content / Navigation</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label className={styles.contactField}>
                <span>Message <strong>*</strong></span>
                <textarea
                  placeholder="Enter your message"
                  rows={5}
                  required
                />
              </label>

              <label className={styles.contactField}>
                <span>Attachments (Optional)</span>
                <span className={styles.attachmentDropzone}>
                  <input
                    type="file"
                    onChange={(event) => {
                      const file = event.currentTarget.files?.[0];
                      setAttachmentName(file ? file.name : '');
                    }}
                  />
                  <span className={styles.attachmentIcon} aria-hidden="true">⌕</span>
                  <span>{attachmentName || 'Click to attach files'}</span>
                </span>
              </label>

              <div className={styles.contactFormActions}>
                <button
                  type="submit"
                  className={styles.contactSubmitButton}
                >
                  Send Message
                </button>
              </div>
            </form>

            <div className={styles.contactModalFooter}>
              You can also reach us directly at:{' '}
              <a href="tel:+254711024747">+254 711 024 747</a>
            </div>
          </section>
        </div>
      ) : null}
    </header>
  );
};

export default KqWorldNavigation;