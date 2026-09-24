import * as React from 'react';

import styles from './KqWorldFooter.module.scss';
import type { IKqWorldFooterProps } from './IKqWorldFooterProps';

import {
  footerSections,
  legalLinks,
  appLinks,
  socialLinks
} from '../data/footerLinks';

import footerLogo from '../assets/kq-logo-white.svg';
import footerRed from '../assets/footerred.svg';

import awardAirline from
  '../assets/2025-winner-shields-africas-leading-airline.svg';

import awardBusinessClass from
  '../assets/2025-winner-shields-africas-leading-business-class.svg';

import awardInflightMagazine from
  '../assets/2025-winner-shields-africas-leading-inflight-magazine.svg';

import awardAirlineBrand from
  '../assets/2025-winner-shields-leading-airline.svg';

import {
  ArrowUp24Regular
} from '@fluentui/react-icons';

interface IAward {
  src: string;
  alt: string;
}

const awards: IAward[] = [
  {
    src: awardInflightMagazine,
    alt: "Africa's Leading Inflight Magazine"
  },
  {
    src: awardBusinessClass,
    alt: "Africa's Leading Airline - Business Class"
  },
  {
    src: awardAirlineBrand,
    alt: "Africa's Leading Airline Brand"
  },
  {
    src: awardAirline,
    alt: "Africa's Leading Airline"
  }
];

/* Apple mark used inside the App Store badge */
const AppleLogo: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={styles.storeLogo}
  >
    <path
      fill="currentColor"
      d="M17.05 12.54c-.03-3.17 2.59-4.71 2.71-4.78-1.48-2.16-3.78-2.45-4.59-2.48-1.93-.2-3.8 1.16-4.78 1.16-1 0-2.5-1.14-4.13-1.11-2.09.03-4.05 1.24-5.12 3.13-2.22 3.84-.56 9.49 1.56 12.59 1.06 1.52 2.3 3.22 3.93 3.16 1.6-.07 2.2-1.01 4.13-1.01 1.91 0 2.47 1.01 4.14.97 1.72-.03 2.8-1.52 3.82-3.05 1.22-1.74 1.71-3.45 1.73-3.54-.04-.01-3.37-1.28-3.4-5.04zM13.91 3.24A5.04 5.04 0 0015.06-.37a5.15 5.15 0 00-3.34 1.72 4.83 4.83 0 00-1.18 3.47 4.25 4.25 0 003.37-1.58z"
    />
  </svg>
);

/* Google Play triangle used inside the Play Store badge */
const GooglePlayLogo: React.FC = () => (
  <svg
    viewBox="0 0 28 31"
    aria-hidden="true"
    className={styles.playStoreLogo}
  >
    <path
      fill="#00d7fe"
      d="M1.2 1.4c-.5.6-.8 1.5-.8 2.6v23c0 1.1.3 2 .8 2.6l.1.1 12.9-14.1v-.3L1.3 1.3z"
    />

    <path
      fill="#ffce00"
      d="M18.5 20.3l-4.3-4.7v-.3l4.3-4.7.1.1 5.1 3c1.5.9 1.5 2.3 0 3.2l-5.1 3.5-.1-.1z"
    />

    <path
      fill="#ff3a44"
      d="M18.6 20.2l-4.4-4.8L1.2 29.6c.8.9 2.1 1 3.6.2l13.8-9.6z"
    />

    <path
      fill="#00f076"
      d="M18.6 10.7L4.8 1.1C3.3.3 2 .4 1.2 1.3l13 14.2 4.4-4.8z"
    />
  </svg>
);

const WhatsAppIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M12 2a9.8 9.8 0 00-8.42 14.82L2.2 22l5.3-1.39A9.9 9.9 0 1012 2zm0 17.8a7.75 7.75 0 01-3.95-1.08l-.28-.17-3.14.82.84-3.06-.18-.3A7.8 7.8 0 1112 19.8zm4.28-5.83c-.23-.12-1.39-.69-1.61-.77-.21-.08-.37-.12-.52.12-.16.23-.61.76-.75.92-.14.15-.27.17-.5.05-.24-.12-1-.36-1.89-1.16-.7-.62-1.17-1.39-1.31-1.63-.14-.23-.01-.36.1-.48.11-.1.24-.27.35-.41.12-.14.16-.24.24-.39.08-.16.04-.29-.02-.41-.06-.12-.53-1.27-.72-1.74-.19-.46-.38-.4-.52-.41h-.45c-.16 0-.41.06-.63.29-.21.23-.82.8-.82 1.96s.84 2.28.96 2.44c.12.15 1.65 2.52 4 3.53.56.24 1 .39 1.34.5.56.18 1.07.15 1.47.09.45-.07 1.39-.57 1.59-1.12.2-.55.2-1.02.14-1.12-.06-.1-.22-.16-.46-.27z"
    />
  </svg>
);

const YouTubeIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2 31 31 0 000 12a31 31 0 00.5 5.8 3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1A31 31 0 0024 12a31 31 0 00-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z"
    />
  </svg>
);

const XIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.48 22H3.36l7.25-8.29L2.96 2H9.36l4.42 5.84L18.9 2zm-1.1 17.84h1.73L8.42 4.05H6.57L17.8 19.84z"
    />
  </svg>
);

const ThreadsIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.6 8.7c-.7-3-2.6-4.7-5.2-4.7-3.5 0-5.8 2.8-5.8 7.8 0 5.3 2.5 8.2 6.2 8.2 3.1 0 5.4-2 5.4-4.8 0-2.6-2-4.1-4.6-4.1-2.4 0-4 1.2-4 3 0 1.5 1.2 2.6 2.9 2.6 2.8 0 5-2.4 5-5.7 0-1-.1-1.8-.3-2.7"
    />
  </svg>
);

const FacebookIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M14 8h3V4.2c-.52-.07-2.3-.2-4.42-.2C8.2 4 7 6.63 7 9.75V13H4v4h3v7h4v-7h3.3l.7-4H11V10c0-1.15.31-2 2-2h1z"
    />
  </svg>
);

const InstagramIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <circle
      cx="12"
      cy="12"
      r="4.2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <circle cx="17.4" cy="6.7" r="1.1" fill="currentColor" />
  </svg>
);

const LinkedInIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M5.34 7.66A2.34 2.34 0 115.34 3a2.34 2.34 0 010 4.66zM3.32 9.4h4.04V22H3.32V9.4zm6.47 0h3.88v1.72h.05c.54-1.02 1.86-2.1 3.83-2.1 4.1 0 4.86 2.7 4.86 6.2V22h-4.04v-6c0-1.43-.03-3.27-2-3.27-2 0-2.3 1.56-2.3 3.17V22H9.79V9.4z"
    />
  </svg>
);

const TikTokIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M16.7 3c.3 2.3 1.6 3.7 3.8 3.85v3.08a8.6 8.6 0 01-3.76-.87v6.23a5.71 5.71 0 11-4.93-5.66v3.15a2.62 2.62 0 102 2.55V3h2.89z"
    />
  </svg>
);

const getSocialIcon = (label: string): JSX.Element => {
  switch (label) {
    case 'WhatsApp':
      return <WhatsAppIcon />;

    case 'YouTube':
      return <YouTubeIcon />;

    case 'X':
      return <XIcon />;

    case 'Threads':
      return <ThreadsIcon />;

    case 'Facebook':
      return <FacebookIcon />;

    case 'Instagram':
      return <InstagramIcon />;

    case 'LinkedIn':
      return <LinkedInIcon />;

    case 'TikTok':
      return <TikTokIcon />;

    default:
      return <span />;
  }
};

const KqWorldFooter: React.FC<IKqWorldFooterProps> = () => {

  const rootRef = React.useRef<HTMLElement>(null);

  // Scope section width changes to this standalone footer only.
  React.useEffect(() => {
    const root = rootRef.current;
    const zone = root?.closest<HTMLElement>('[data-automation-id="CanvasZone"]');
    if (!root || !zone || zone.querySelector('.kqWorldNavigationHost') ||
        zone.querySelectorAll('[data-automation-id="CanvasControl"]').length !== 1) return;
    const marked: Array<{ element: HTMLElement; attribute: string; previous: string | null }> = [];
    const mark = (element: HTMLElement, attribute: string): void => {
      marked.push({ element, attribute, previous: element.getAttribute(attribute) });
      element.setAttribute(attribute, 'true');
    };
    mark(zone, 'data-kq-footer-zone');
    // Remove width caps on wrappers belonging only to this standalone section.
    const canvas = zone.closest<HTMLElement>('[data-automation-id="CanvasLayout"]');
    let outer = zone.parentElement;
    while (outer && outer !== canvas && canvas &&
           outer.querySelectorAll('[data-automation-id="CanvasZone"]').length === 1 &&
           !outer.querySelector('.kqWorldNavigationHost')) {
      mark(outer, 'data-kq-footer-wrapper');
      outer = outer.parentElement;
    }
    let wrapper = root.parentElement;
    while (wrapper && wrapper !== zone) {
      mark(wrapper, 'data-kq-footer-wrapper');
      wrapper = wrapper.parentElement;
    }
    return () => marked.forEach(({ element, attribute, previous }) => {
      if (previous === null) element.removeAttribute(attribute);
      else element.setAttribute(attribute, previous);
    });
  }, []);



  const scrollToTop = (): void => {
  const scrollContainer = rootRef.current?.closest(
    '[data-automation-id="contentScrollRegion"]'
  ) as HTMLElement | null;

  if (scrollContainer) {
    scrollContainer.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
    return;
  }

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  });
};

  return (
    <footer ref={rootRef} className={styles.footer}>

      <div className={styles.topCurve}>
        <svg className={styles.curveSurface} viewBox="0 0 1728 159" aria-hidden="true" focusable="false">
          <path d="M1992.02 50.5698C1523.91 80.1515 1026.34 128.521 645.212 110.763C264.083 93.0041 -306.423 23.9994 -687.8 15.0675L-687.8 159H1992.02Z" />
        </svg>
        <img src={footerRed} alt="" aria-hidden="true" className={styles.footerArtwork} />

        <button
          type="button"
          className={styles.backToTop}
          onClick={scrollToTop}
          aria-label="Back to top"
          title="Back to top"
        >
          <ArrowUp24Regular />
        </button>
      </div>

      <div className={styles.footerInner}>

        <div className={styles.linksGrid}>
          {footerSections.map((section) => (
            <section
              key={section.title}
              className={styles.linkSection}
            >
              <h3>{section.title}</h3>

              <ul>
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className={styles.primaryDivider} />

        <div className={styles.travelSocialRow}>

          <div className={styles.travelSection}>
            <h3>Travel made easier</h3>

            <p>Book and manage flights on the go!</p>

            <div className={styles.appButtons}>

              <a
                href={appLinks.appStore}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.storeBadge}
                aria-label="Download Kenya Airways on the App Store"
              >
                <AppleLogo />

                <span className={styles.storeCopy}>
                  <small>Download on the</small>
                  <strong>App Store</strong>
                </span>
              </a>

              <a
                href={appLinks.googlePlay}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.storeBadge}
                aria-label="Get Kenya Airways on Google Play"
              >
                <GooglePlayLogo />

                <span className={styles.storeCopy}>
                  <small>GET IT ON</small>
                  <strong>Google Play</strong>
                </span>
              </a>

            </div>
          </div>

          <div className={styles.socialSection}>

            <div className={styles.followRow}>
              <h3>Follow us</h3>

              <img
                src={footerLogo}
                alt="Kenya Airways"
                className={styles.footerLogo}
              />
            </div>

            <div className={styles.socialIcons}>
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                >
                  {getSocialIcon(social.label)}
                </a>
              ))}
            </div>

          </div>

        </div>

        <div className={styles.awardsRow}>
          {awards.map((award) => (
            <div
              className={styles.awardItem}
              key={award.alt}
            >
              <img
                src={award.src}
                alt={award.alt}
              />
            </div>
          ))}
        </div>

        <div className={styles.legalDivider} />

        <nav
          className={styles.legalLinks}
          aria-label="Kenya Airways legal links"
        >
          {legalLinks.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <p className={styles.copyright}>
          © 2026 Kenya Airways PLC. All rights reserved.
        </p>

      </div>

    </footer>
  );
};

export default KqWorldFooter;