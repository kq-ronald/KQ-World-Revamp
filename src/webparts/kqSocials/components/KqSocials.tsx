import * as React from 'react';
import { IKqSocialsProps } from './IKqSocialsProps';
import { ISocialCommunityLink, SocialCommunityType, SocialCommunityIcon } from '../models/ISocialCommunityLink';
import { socialCommunityLinks } from '../data/socialCommunityLinks';
import styles from './KqSocials.module.scss';

// Inline vector icons: no external icon fonts or image requests.
function renderIcon(icon: SocialCommunityIcon): React.ReactElement {
  let artwork: React.ReactNode;
  let background = '#17213a';
  switch (icon) {
    case 'facebook':
      background = '#1877f2';
      artwork = <path fill="currentColor" d="M14 21v-8h3l.5-4H14V7c0-1 .3-2 2-2h2V1.5A22 22 0 0 0 15 1c-3 0-5 2-5 5v3H7v4h3v8z" />;
      break;
    case 'twitter':
      background = '#000000';
      artwork = <path fill="currentColor" d="M3 3h5l5 6.7L19 3h2l-7 8.2L22 21h-5l-5.5-7.3L5 21H3l7.5-8.8L3 3zm3 1.5 12 15h1L7 4.5H6z" />;
      break;
    case 'youtube':
      background = '#ff001f';
      artwork = <><rect x="2" y="5" width="20" height="14" rx="4" fill="currentColor" /><path d="m10 9 6 3-6 3z" fill={background} /></>;
      break;
    case 'linkedin':
      background = '#0a66c2';
      artwork = <><circle cx="5" cy="5" r="2" fill="currentColor" /><path fill="currentColor" d="M3 9h4v12H3zm7 0h4v1.5C15 9 16 9 17 9c3 0 4 2 4 5v7h-4v-7c0-1-.5-2-1.5-2S14 13 14 14v7h-4z" /></>;
      break;
    case 'whatsapp':
      background = '#00a884';
      artwork = <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 11.5a8.5 8.5 0 0 1-12.7 7.4L3 20l1.2-4.2A8.5 8.5 0 1 1 20 11.5z" /><path d="m8 7 2 3-1 1c1 2 2 3 4 3l1-1 3 2c-1 3-4 2-6 1-3-2-5-5-3-9z" /></g>;
      break;
    case 'viva':
      background = '#08162f';
      artwork = <g fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="9" r="6" /><circle cx="15" cy="15" r="6" /></g>;
      break;
    case 'broadcast':
      background = '#1769ff';
      artwork = <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9h5l10-5v16l-10-5H4zM7 15l2 6h3l-2-6M22 9v6" /></g>;
      break;
    default:
      background = '#ef001b';
      artwork = <g fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18M5 7h14M5 17h14" /></g>;
  }
  return <span className={styles.socialIcon} style={{ '--icon-bg': background } as React.CSSProperties} aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">{artwork}</svg></span>;
}

const KqSocials: React.FC<IKqSocialsProps> = () => {
  const [activeTab, setActiveTab] = React.useState<SocialCommunityType>('internal');
  const [isDarkMode, setDarkMode] = React.useState(false);
  React.useEffect(() => {
    const update = (): void => setDarkMode(document.documentElement.getAttribute('data-kq-theme') === 'dark');
    update();
    window.addEventListener('kqworld-theme-change', update);
    return () => window.removeEventListener('kqworld-theme-change', update);
  }, []);
  const rootRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const canvas = root.closest<HTMLElement>('[data-automation-id="CanvasLayout"]');
    let frame = 0;
    let stopped = false;
    let pairedLeft: HTMLElement | null = null;
    let marked: Array<{ element: HTMLElement; name: string; previous: string | null }> = [];
    const clear = (): void => {
      marked.forEach(({ element, name, previous }) => {
        if (previous === null) element.removeAttribute(name);
        else element.setAttribute(name, previous);
      });
      marked = [];
      pairedLeft = null;
    };
    const mark = (element: HTMLElement, name: string): void => {
      marked.push({ element, name, previous: element.getAttribute(name) });
      element.setAttribute(name, 'true');
    };
    const sync = (): void => {
      frame = 0;
      if (stopped) return;
      const zone = root.closest<HTMLElement>('[data-automation-id="CanvasZone"]');
      const viva = zone?.querySelector<HTMLElement>('[data-kq-viva]');
      if (!zone || !viva ||
          zone.querySelector('.kqWorldNavigationHost')) {
        clear();
        return;
      }
      if (pairedLeft === viva && marked.every(({ element }) => element.isConnected)) return;
      clear();
      let row: HTMLElement | null = viva.parentElement;
      while (row && row !== zone && !row.contains(root)) row = row.parentElement;
      if (!row || !row.contains(root)) return;
      const branch = (element: HTMLElement): HTMLElement => {
        let result = element;
        while (result.parentElement && result.parentElement !== row) result = result.parentElement;
        return result;
      };
      const left = branch(viva);
      const right = branch(root);
      if (left === right) return;
      if (Array.from(row.children).some((child) => child !== left && child !== right &&
          child.querySelector('[data-automation-id="CanvasControl"]'))) return;
      mark(zone, 'data-kq-social-zone');
      let shell: HTMLElement | null = row;
      while (shell && shell !== zone) {
        mark(shell, 'data-kq-social-shell');
        shell = shell.parentElement;
      }
      mark(row, 'data-kq-social-row');
      mark(left, 'data-kq-social-left');
      mark(right, 'data-kq-social-right');
      [viva, root].forEach((element) => {
        let wrapper = element.parentElement;
        while (wrapper && wrapper !== row) {
          mark(wrapper, 'data-kq-social-wrapper');
          wrapper = wrapper.parentElement;
        }
      });
      pairedLeft = viva;
    };
    const queue = (): void => {
      if (!frame && !stopped) frame = window.requestAnimationFrame(sync);
    };
    const observer = new MutationObserver(queue);
    if (canvas) observer.observe(canvas, { childList: true, subtree: true });
    window.addEventListener('resize', queue);
    queue();
    return () => {
      stopped = true;
      observer.disconnect();
      window.removeEventListener('resize', queue);
      window.cancelAnimationFrame(frame);
      clear();
    };
  }, []);


  const filteredLinks = socialCommunityLinks.filter((item: ISocialCommunityLink) => item.type === activeTab);
  return (
    <section ref={rootRef} className={`${styles.kqSocials} ${isDarkMode ? styles.darkMode : ''}`}>
      <div className={styles.header}>
        <div><div className={styles.eyebrow}>SOCIAL &amp; COMMUNITY</div><h2 className={styles.title}>Stay connected</h2></div>
        <div className={styles.tabBar} role="group" aria-label="Community category">
          <button type="button" aria-pressed={activeTab === 'internal'} onClick={() => setActiveTab('internal')} className={`${styles.tab} ${activeTab === 'internal' ? styles.tabActive : ''}`}>Internal</button>
          <button type="button" aria-pressed={activeTab === 'external'} onClick={() => setActiveTab('external')} className={`${styles.tab} ${activeTab === 'external' ? styles.tabActive : ''}`}>External</button>
        </div>
      </div>
      <div className={`${styles.linksList} ${activeTab === 'external' ? styles.externalList : ''}`}>
        {filteredLinks.map(item => (
          <a key={item.id} href={item.url || undefined} target="_blank" rel="noopener noreferrer" className={activeTab === 'internal' ? styles.internalItem : styles.externalItem}>
            {renderIcon(item.iconType)}
            <span className={styles.itemContent}><span className={styles.itemTitle}>{item.title}</span><span className={styles.itemSubtitle}>{item.subtitle}</span></span>
            <svg className={styles.itemArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" /></svg>
          </a>
        ))}
      </div>
    </section>
  );
};
export default KqSocials;
