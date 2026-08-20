import * as React from 'react';

import styles from './KqWorldNavigation.module.scss';
import type { IKqWorldNavigationProps } from './IKqWorldNavigationProps';

import { navigationItems } from '../data/navigationData';

import kqLogo from '../assets/kqwhitelogo.svg';
import navBgLeft from '../assets/kqworldbgleft.svg';
import navBgRight from '../assets/kqworldbgright.svg';
import notificationIcon from '../assets/kqworldnotification.svg';
import darkModeIcon from '../assets/kqworlddarkmode.svg';

const KqWorldNavigation: React.FC<IKqWorldNavigationProps> = () => {
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [mobileExpanded, setMobileExpanded] = React.useState<string | null>(null);

  const activeItem = navigationItems.find(
    (item) => item.title === activeMenu
  );

  return (
    <header className={styles.navigationRoot}>

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

        <div className={styles.topBarInner}>

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
            <a href="#">Help</a>
            <a href="#">Feedback</a>
            <a href="#">IT Support</a>

            <span className={styles.systemStatus}>
              <span className={styles.statusDot} />
              All systems operational
            </span>
          </div>

        </div>
      </div>


      <div
        className={styles.desktopNav}
        onMouseLeave={() => setActiveMenu(null)}
      >
        <div className={styles.desktopNavInner}>

          <nav className={styles.navLinks}>
            {navigationItems.map((item) => (
              <button
                key={item.title}
                type="button"
                className={`${styles.navButton} ${
                  activeMenu === item.title ? styles.activeNavButton : ''
                }`}
                onMouseEnter={() => setActiveMenu(item.title)}
                onClick={() => setActiveMenu(item.title)}
              >
                <span>{item.title}</span>
                <span className={styles.chevron}>
                  {activeMenu === item.title ? '⌃' : '⌄'}
                </span>
              </button>
            ))}
          </nav>

          <div className={styles.desktopActions}>

            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>⌕</span>

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
              <img src={notificationIcon} alt="" />
            </button>

            <button
              type="button"
              className={styles.iconButton}
              aria-label="Dark mode"
            >
              <img src={darkModeIcon} alt="" />
            </button>

          </div>

        </div>

        {activeItem?.children && (
          <div
            className={styles.dropdown}
            onMouseEnter={() => setActiveMenu(activeItem.title)}
          >
            <div className={styles.dropdownInner}>

              {activeItem.children.map((child) => (
                <a
                  key={child.title}
                  href={child.url}
                  className={styles.dropdownItem}
                >
                  {child.title}
                </a>
              ))}

            </div>
          </div>
        )}
      </div>


      <div className={styles.mobileHeader}>

        <button
          type="button"
          className={styles.mobileMenuButton}
          onClick={() => setMobileOpen((current) => !current)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? '×' : '☰'}
        </button>

        <div className={styles.mobileSearch}>
          <span className={styles.searchIcon}>⌕</span>

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
          <img src={notificationIcon} alt="" />
        </button>

        <button
          type="button"
          className={styles.iconButton}
          aria-label="Dark mode"
        >
          <img src={darkModeIcon} alt="" />
        </button>

      </div>


      {mobileOpen && (
        <div className={styles.mobileMenu}>

          {navigationItems.map((item) => (
            <div
              key={item.title}
              className={styles.mobileMenuItem}
            >

              <button
                type="button"
                onClick={() =>
                  setMobileExpanded(
                    mobileExpanded === item.title
                      ? null
                      : item.title
                  )
                }
              >
                <span>{item.title}</span>

                <span>
                  {mobileExpanded === item.title ? '⌃' : '⌄'}
                </span>
              </button>

              {mobileExpanded === item.title && item.children && (
                <div className={styles.mobileSubmenu}>

                  {item.children.map((child) => (
                    <a
                      key={child.title}
                      href={child.url}
                    >
                      {child.title}
                    </a>
                  ))}

                </div>
              )}

            </div>
          ))}

        </div>
      )}

    </header>
  );
};

export default KqWorldNavigation;