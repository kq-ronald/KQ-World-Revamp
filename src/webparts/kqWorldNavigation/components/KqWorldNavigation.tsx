import * as React from 'react';

import styles from './KqWorldNavigation.module.scss';
import type { IKqWorldNavigationProps } from './IKqWorldNavigationProps';

import { navigationItems } from '../data/navigationData';

import kqLogo from '../assets/kqwhitelogo.svg';
import navBgLeft from '../assets/kqworldbgleft.svg';
import navBgRight from '../assets/kqworldbgright.svg';
import notificationIcon from '../assets/kqworldnotification.svg';
import darkModeIcon from '../assets/kqworlddarkmode.svg';
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
  Airplane24Regular
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
  'Ground Services': VehicleCar24Regular,
  'Information Technology': Desktop24Regular,
  'Group CEO': Person24Regular,
  Commercial: ShoppingBag24Regular,
  Cargo: Box24Regular,
  Technical: Wrench24Regular,
  'Strategy & Innovation': Lightbulb24Regular,
  'Fahari Aviation': Airplane24Regular,
  Marketing: Megaphone24Regular,

  /* Corporate News */
  'Take 3': Bookmark24Regular,
  'The Pride Newsletter': News24Regular,
  'KQ Blog': DocumentEdit24Regular,

  /* Knowledge Hub */
  'Knowledge Hub': Layer24Regular,
  'IATA Manuals': DocumentText24Regular,
  'iPride Manuals and User Guides': BookOpen24Regular,
  'Corporate Training Reading Materials': DocumentEdit24Regular,
  'Print Data Dashboard': Print24Regular,
  'Printing Data Dashboard': Print24Regular
};

/* =========================================================
   MEGA MENU DESCRIPTIONS
========================================================= */

const MENU_DESCRIPTIONS: Record<string, string> = {
  Home: 'Everything you need to start your day.',
  'Staff Notices': 'Stay informed on what matters.',
  'Brand Portal': 'Stay informed on what matters.',
  Departments: 'Connect with teams across KQ.',
  'Corporate News': 'The latest stories from across KQ.',
  'Knowledge Hub': 'Knowledge at your fingertips.'
};

/* =========================================================
   COMPONENT
========================================================= */

const KqWorldNavigation: React.FC<IKqWorldNavigationProps> = () => {
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [mobileExpanded, setMobileExpanded] =
    React.useState<string | null>(null);

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

  return (
    <header
      className={styles.navigationRoot}
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
            <a href="#">
              Help
            </a>

            <a href="#">
              Feedback
            </a>

            <a href="#">
              IT Support
            </a>

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
                className={`${styles.navButton} ${
                  activeMenu === item.title
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
                  if (item.children?.length) {
                    setActiveMenu(
                      activeMenu === item.title
                        ? null
                        : item.title
                    );
                  } else if (item.url) {
                    window.location.href = item.url;
                  }
                }}
              >
                <span>
                  {item.title}
                </span>

                {item.children?.length ? (
                  <span className={styles.chevron}>
                    {activeMenu === item.title ? '⌃' : '⌄'}
                  </span>
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
              className={styles.searchBox}
              style={{
                width: 'clamp(220px, 27vw, 420px)',
                minWidth: '180px',
                maxWidth: '420px',
                flexShrink: 1
              }}
            >
              <span className={styles.searchIcon}>
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search KQ World"
              />
            </div>

            {/* NOTIFICATIONS */}

            <button
              type="button"
              className={styles.iconButton}
              aria-label="Notifications"
              style={{
                flex: '0 0 auto'
              }}
            >
              <img
                src={notificationIcon}
                alt=""
              />
            </button>

            {/* DARK MODE */}

            <button
              type="button"
              className={styles.iconButton}
              aria-label="Dark mode"
              style={{
                flex: '0 0 auto'
              }}
            >
              <img
                src={darkModeIcon}
                alt=""
              />
            </button>
          </div>
        </div>

        {/* =================================================
            DESKTOP MEGA MENU
        ================================================== */}

        {activeItem?.children?.length ? (
          <div
            className={styles.dropdown}
            onMouseEnter={() =>
              setActiveMenu(activeItem.title)
            }
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

                gridTemplateColumns:
                  '250px minmax(0, 1fr)',

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
              {/* =============================================
                  LEFT INTRO
              ============================================== */}

              <div
                style={{
                  display: 'grid',

                  gridTemplateColumns:
                    '4px minmax(0, 1fr)',

                  columnGap: '18px',

                  alignItems: 'stretch',

                  minWidth: 0
                }}
              >
                {/* RED VERTICAL DIVIDER */}

                <div
                  style={{
                    width: '4px',
                    height: '150px',
                    minHeight: '150px',

                    borderRadius: '10px',

                    background: '#d71920'
                  }}
                />

                {/* INTRO CONTENT */}

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',

                    minWidth: 0
                  }}
                >
                  {/* SECTION HEADING */}

                  <div
                    style={{
                      fontSize: '12px',
                      lineHeight: '1.2',

                      fontWeight: 700,

                      letterSpacing: '1px',

                      color: '#d71920',

                      textTransform: 'uppercase',

                      marginBottom: '8px'
                    }}
                  >
                    {activeItem.heading ||
                      activeItem.title}
                  </div>

                  {/* KQ WORLD LOGO */}

                  <img
                    src={kqWorldSmallLogo}
                    alt="KQ World"
                    style={{
                      display: 'block',

                      width: '105px',
                      maxWidth: '100%',

                      height: 'auto',

                      marginBottom: '12px'
                    }}
                  />

                  {/* DESCRIPTION */}

                  <div
                    style={{
                      fontSize: '21px',
                      lineHeight: '1.08',

                      fontWeight: 700,
                      fontStyle: 'italic',

                      color: '#171717',

                      maxWidth: '210px',

                      marginBottom: '16px'
                    }}
                  >
                    {activeItem.description ||
                      MENU_DESCRIPTIONS[
                        activeItem.title
                      ]}
                  </div>

                  {/* EXPLORE ALL */}

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

              {/* =============================================
                  RIGHT MENU GRID
              ============================================== */}

              <div
                style={{
                  display: 'grid',

                  gridTemplateColumns:
                    'repeat(3, minmax(0, 1fr))',

                  columnGap:
                    'clamp(24px, 3vw, 60px)',

                  rowGap: '22px',

                  alignItems: 'center',

                  width: '100%',
                  minWidth: 0
                }}
              >
                {activeItem.children.map((child) => {
                  const ChildIcon =
                    getChildIcon(child);

                  return (
                    <a
                      key={child.title}
                      href={child.url || '#'}
                      style={{
                        display: 'flex',

                        alignItems: 'center',

                        gap: '12px',

                        minWidth: 0,

                        color: '#242424',

                        textDecoration: 'none',

                        fontSize: '14px',
                        lineHeight: '1.25',

                        fontWeight: 500
                      }}
                    >
                      {/* ICON CIRCLE */}

                      <span
                        style={{
                          width: '34px',
                          height: '34px',
                          minWidth: '34px',

                          flex: '0 0 34px',

                          borderRadius: '50%',

                          background: '#eeeeee',

                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',

                          color: '#333333',

                          boxSizing: 'border-box'
                        }}
                      >
                        {ChildIcon ? (
                          <ChildIcon
                            style={{
                              width: '18px',
                              height: '18px',

                              color: '#333333',

                              display: 'block'
                            }}
                          />
                        ) : null}
                      </span>

                      {/* TEXT */}

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

        <div className={styles.mobileSearch}>
          <span className={styles.searchIcon}>
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search KQ World"
          />
        </div>

        <button
          type="button"
          className={styles.iconButton}
          aria-label="Notifications"
        >
          <img
            src={notificationIcon}
            alt=""
          />
        </button>

        <button
          type="button"
          className={styles.iconButton}
          aria-label="Dark mode"
        >
          <img
            src={darkModeIcon}
            alt=""
          />
        </button>
      </div>

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
    </header>
  );
};

export default KqWorldNavigation;