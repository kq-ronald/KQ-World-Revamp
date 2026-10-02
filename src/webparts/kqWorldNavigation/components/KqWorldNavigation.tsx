import * as React from 'react';
import { SPHttpClient } from '@microsoft/sp-http';
import KqSearch from './KqSearch';
import styles from './KqWorldNavigation.module.scss';
import type { IKqWorldNavigationProps } from './IKqWorldNavigationProps';
import { IKqNotification } from '../models/IKqNotification';
import { KqNotificationService } from '../services/KqNotificationService';
import { navigationItems } from '../data/navigationData';
import kqLogo from '../assets/kqwhitelogo.svg';
import navAnkaraBg from '../assets/KQWorldNavAnkara.png';
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
   LINK HELPERS
========================================================= */
// Fixes malformed absolute URLs such as "https\://..." (stray backslash),
// which browsers otherwise treat as a relative path on the current page.
const normalizeUrl = (url?: string): string => {
  if (!url) {
    return '#';
  }
  return url.trim().replace(/^(https?)\\+:/i, '$1:');
};

// Only open a new tab when there is a real destination.
const hasRealUrl = (url?: string): boolean => {
  const normalized = normalizeUrl(url);
  return normalized !== '#' && normalized !== '';
};

// SharePoint's modern page router can hijack link clicks and navigate in the
// same tab. Opening explicitly in a new tab avoids that.
const openInNewTab = (
  event: React.MouseEvent<HTMLAnchorElement>,
  url?: string
): void => {
  event.preventDefault();
  event.stopPropagation();
  if (!hasRealUrl(url)) {
    return;
  }
  window.open(normalizeUrl(url), '_blank', 'noopener,noreferrer');
};

const IT_SUPPORT_URL =
  'https://apps.powerapps.com/play/e/f32fe21b-3ac3-e27d-acb4-6c9bf2899443/a/b2e72ec1-f122-47d5-a66c-fb73d6142766?tenantId=dd74aad9-c569-463a-bc17-0ba25a8fa388&hint=6c48ccc0-3685-4d7c-86b1-4f14f6e3bce7&sourcetime=1725444731619&hidenavbar=true';

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
  const navigationRef = React.useRef<HTMLElement | null>(null);
  const [currentDateTime, setCurrentDateTime] = React.useState(new Date());
  React.useEffect(() => {
    const navigationElement = navigationRef.current;
    if (!navigationElement) {
      return;
    }
    const canvasLayout = navigationElement.closest<HTMLElement>(
      '[data-automation-id="CanvasLayout"]'
    );
    const canvasZone = navigationElement.closest<HTMLElement>(
      '[data-automation-id="CanvasZone"]'
    );
    let stickyHost: HTMLElement | null = null;
    if (canvasLayout) {
      let currentElement: HTMLElement = navigationElement;
      while (
        currentElement.parentElement &&
        currentElement.parentElement !== canvasLayout
      ) {
        currentElement = currentElement.parentElement;
      }
      if (currentElement.parentElement === canvasLayout) {
        stickyHost = currentElement;
      }
    }
    stickyHost?.classList.add('kqWorldNavigationStickyHost');
    canvasZone?.classList.add('kqWorldNavigationStickyZone');
    return () => {
      stickyHost?.classList.remove('kqWorldNavigationStickyHost');
      canvasZone?.classList.remove('kqWorldNavigationStickyZone');
    };
  }, []);
  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);
    return () => {
      window.clearInterval(timer);
    };
  }, []);
  const formattedDate = currentDateTime.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const timeWithZone = currentDateTime.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [mobileExpanded, setMobileExpanded] =
    React.useState<string | null>(null);
  const [contactOpen, setContactOpen] = React.useState(false);
  const [attachmentName, setAttachmentName] = React.useState('');
  const [feedbackEmail, setFeedbackEmail] = React.useState(props.context.pageContext.user.email || '');
  const [feedbackMessage, setFeedbackMessage] = React.useState('');
  const [feedbackFile, setFeedbackFile] = React.useState<File | null>(null);
  const [feedbackSending, setFeedbackSending] = React.useState(false);
  const [feedbackError, setFeedbackError] = React.useState('');
  const [feedbackSuccess, setFeedbackSuccess] = React.useState('');
  const [attachmentDragActive, setAttachmentDragActive] = React.useState(false);
  const feedbackBusyRef = React.useRef(false);
  const feedbackFileRef = React.useRef<HTMLInputElement | null>(null);

  // All three input methods share the same validation and selected-file state.
  const selectFeedbackFile = (file: File): void => {
    if (feedbackBusyRef.current) return;
    setFeedbackSuccess('');
    if (file.size > 10 * 1024 * 1024) {
      setFeedbackError('Please choose an attachment no larger than 10 MB.');
      return;
    }
    setFeedbackFile(file);
    setAttachmentName(file.name);
    setFeedbackError('');
  };

  const pasteFeedbackAttachment = (event: React.ClipboardEvent<HTMLFormElement>): void => {
    if (feedbackBusyRef.current) return;
    const files = event.clipboardData.files;
    if (files.length > 1) {
      event.preventDefault();
      setFeedbackError('Please paste one attachment at a time.');
      return;
    }
    let file: File | null = files.length === 1 ? files[0] : null;
    if (!file) {
      const items = event.clipboardData.items;
      for (let index = 0; index < items.length; index++) {
        if (items[index].kind === 'file') {
          file = items[index].getAsFile();
          if (file) break;
        }
      }
    }
    // Leave normal text paste unchanged in the email and message inputs.
    if (file) {
      event.preventDefault();
      selectFeedbackFile(file);
    }
  };

  React.useEffect(() => {
    if (!feedbackSuccess) return;
    const timer = window.setTimeout(() => setFeedbackSuccess(''), 6000);
    return () => window.clearTimeout(timer);
  }, [feedbackSuccess]);
  const releaseFeedbackLock = (): void => {
    feedbackBusyRef.current = false;
    setFeedbackSending(false);
  };

  const submitFeedback = async (): Promise<void> => {
    if (feedbackBusyRef.current) return;
    setFeedbackError('');
    setFeedbackSuccess('');
    if (!feedbackEmail.trim() || !feedbackMessage.trim()) {
      setFeedbackError('Please enter your email address and message.');
      return;
    }
    if (feedbackFile && feedbackFile.size > 10 * 1024 * 1024) {
      setFeedbackError('Please choose an attachment smaller than 10 MB.');
      return;
    }
    feedbackBusyRef.current = true;
    setFeedbackSending(true);
    let createdId: number | undefined;
    let stage = 'save';
    try {
      // The list must be in the same SharePoint web as this web part.
      const webUrl = props.context.pageContext.web.absoluteUrl.replace(/\/$/, '');
      const listUrl = `${webUrl}/_api/web/lists/getbytitle('KQ Feedback Dev')`;
      const headers = {
        Accept: 'application/json;odata=nometadata',
        'Content-Type': 'application/json;odata=nometadata',
        'odata-version': ''
      };
      const created = await props.context.spHttpClient.post(
        `${listUrl}/items`, SPHttpClient.configurations.v1,
        {
          headers,
          body: JSON.stringify({
            Title: 'KQ World Feedback',
            SenderEmail: feedbackEmail.trim(),
            Message: feedbackMessage.trim(),
            ReadyToSend: false
          })
        }
      );
      if (!created.ok) throw new Error(`Saving feedback failed (${created.status}).`);
      const item: { Id: number } = await created.json();
      createdId = item.Id;
      if (!createdId) throw new Error('SharePoint did not return a feedback ID.');

      if (feedbackFile) {
        stage = 'upload';
        const fileContent = await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = () => reject(new Error('Unable to read the attachment.'));
          reader.onabort = () => reject(new Error('Reading the attachment was cancelled.'));
          reader.readAsArrayBuffer(feedbackFile);
        });
        const fileName = encodeURIComponent(feedbackFile.name.replace(/'/g, "''"))
          .replace(/'/g, '%27');
        const upload = await props.context.spHttpClient.post(
          `${listUrl}/items(${createdId})/AttachmentFiles/add(FileName='${fileName}')`,
          SPHttpClient.configurations.v1,
          {
            headers: { ...headers, 'Content-Type': 'application/octet-stream' },
            body: fileContent
          }
        );
        if (!upload.ok) throw new Error(`Attachment upload failed (${upload.status}).`);
      }

      stage = 'queue';
      const queued = await props.context.spHttpClient.post(
        `${listUrl}/items(${createdId})`, SPHttpClient.configurations.v1,
        {
          headers: { ...headers, 'IF-MATCH': '*', 'X-HTTP-Method': 'MERGE' },
          body: JSON.stringify({ ReadyToSend: true })
        }
      );
      if (!queued.ok) throw new Error(`Queueing feedback failed (${queued.status}).`);
      setContactOpen(false);
      setAttachmentDragActive(false);
      setFeedbackSuccess('Thank you! Your feedback has been submitted.');
      setFeedbackMessage('');
      setFeedbackFile(null);
      setAttachmentName('');
      if (feedbackFileRef.current) feedbackFileRef.current.value = '';
    } catch (error) {
      console.error('KQ feedback submission failed:', error);
      setFeedbackError(stage === 'queue'
        ? `Feedback #${createdId} was saved, but submission could not be confirmed. Please ask support to check this item before resubmitting.`
        : createdId
          ? `Feedback #${createdId} was saved, but the attachment failed. It has not been queued for email. Please contact support or submit again.`
          : 'Feedback could not be confirmed. Please check your connection and list permissions before trying again.');
    } finally {
      releaseFeedbackLock();
    }
  };

  const [notifications, setNotifications] = React.useState<IKqNotification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [notificationsLoading, setNotificationsLoading] = React.useState(true);
  const [notificationsError, setNotificationsError] = React.useState('');
  const [notificationWarnings, setNotificationWarnings] = React.useState<string[]>([]);
  const notificationService = React.useMemo(
    () => new KqNotificationService(props.context), [props.context]
  );
  const unreadCount = notifications.filter(item => !item.isRead).length;
  React.useEffect(() => {
    let isMounted = true;
    const pendingRequests = new Set<string>();
    let lastAttempt = 0;
    setNotifications([]);
    setNotificationsLoading(true);
    setNotificationsError('');
    setNotificationWarnings([]);
    const loadNotifications = async (): Promise<void> => {
      if (
        !isMounted ||
        pendingRequests.has('refresh') ||
        document.visibilityState === 'hidden'
      ) {
        return;
      }
      // Avoid duplicate requests when focus, visibility and bell-click coincide.
      if (Date.now() - lastAttempt < 15000) return;
      pendingRequests.add('refresh');
      lastAttempt = Date.now();
      try {
        const items = await notificationService.getNotifications();
        if (isMounted) {
          setNotifications(items);
          setNotificationWarnings(notificationService.getWarnings());
          setNotificationsError('');
        }
      } catch (error) {
        console.error('Failed to load KQ World notifications:', error);
        if (isMounted) {
          setNotificationsError('Unable to refresh notifications. Please try again shortly.');
        }
      } finally {
        pendingRequests.delete('refresh');
        if (isMounted) setNotificationsLoading(false);
      }
    };
    const refresh = (): void => {
      loadNotifications().catch((error: unknown) => {
        console.error('Unexpected notification refresh error:', error);
      });
    };
    const syncReadState = (): void => {
      setNotifications(current => notificationService.applyReadState(current));
    };
    refresh();
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener('focus', refresh);
    window.addEventListener('kq-notifications-refresh', refresh);
    window.addEventListener('storage', syncReadState);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      isMounted = false;
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('kq-notifications-refresh', refresh);
      window.removeEventListener('storage', syncReadState);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [notificationService]);
  const markNotificationRead = (item: IKqNotification): void => {
    notificationService.markRead([item]);
    setNotifications(current => notificationService.applyReadState(current));
  };
  const markAllNotificationsRead = (): void => {
    notificationService.markRead(notifications);
    setNotifications(current => notificationService.applyReadState(current));
  };
  const openNotifications = (): void => {
    setNotificationsOpen(true);
    window.dispatchEvent(new Event('kq-notifications-refresh'));
  };
  const notificationBadge = unreadCount > 0 ? (
    <span aria-hidden="true" style={{
      position: 'absolute', top: -3, right: -3, minWidth: 18, height: 18,
      padding: '0 4px', borderRadius: 999, background: '#e30613', color: '#fff',
      border: '1px solid #fff', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: 10, fontWeight: 700, lineHeight: 1
    }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
  ) : null;
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
  // Close panels on Escape.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        setMobileExpanded(null);
        setNotificationsOpen(false);
        if (!feedbackBusyRef.current) { setContactOpen(false); setFeedbackFile(null); setAttachmentName(''); }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  // SEARCH RESULTS
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
    <>
      <header
        ref={navigationRef}
        className={[
          'kqWorldNavigationHost',
          styles.navigationRoot,
          isDarkMode ? styles.darkMode : ''
        ].filter(Boolean).join(' ')}
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
            src={navAnkaraBg}
            alt=""
            aria-hidden="true"
            className={styles.ankaraBackground}
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
                {formattedDate} · {timeWithZone}
              </span>
            </div>
            <div className={styles.utilityLinks}>
              <button
                type="button"
                className={styles.utilityAction}
                onClick={() => setContactOpen(true)}
              >
                Feedback
              </button>
              <a
                href={IT_SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
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
              paddingLeft: 'var(--kq-nav-gutter)',
              paddingRight: 'var(--kq-nav-gutter)',
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
                    if (hasRealUrl(item.url)) {
                      window.open(normalizeUrl(item.url), '_blank', 'noopener,noreferrer');
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
              <KqSearch variant="desktop" context={props.context} />
              {/* Notifications */}
              <button
                type="button"
                className={styles.iconButton}
                aria-label={`Notifications, ${unreadCount} unread`}
                style={{ position: 'relative' }}
                title="Notifications"
                onClick={openNotifications}
              >
                <Alert24Regular className={styles.actionIcon} />
                {notificationBadge}
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
                  paddingLeft: 'var(--kq-nav-gutter)',
                  paddingRight: 'var(--kq-nav-gutter)',
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
                      href={normalizeUrl(activeItem.url)}
 data-interception="off"
 onClick={(event) => openInNewTab(event, activeItem.url)}
                      target={hasRealUrl(activeItem.url) ? '_blank' : undefined}
                      rel={hasRealUrl(activeItem.url) ? 'noopener noreferrer' : undefined}
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
                        href={normalizeUrl(child.url)}
 data-interception="off"
 onClick={(event) => openInNewTab(event, child.url)}
                        target={hasRealUrl(child.url) ? '_blank' : undefined}
                        rel={hasRealUrl(child.url) ? 'noopener noreferrer' : undefined}
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
            onClick={() => {
              setMobileOpen((current) => !current);
            }}
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? '×' : '☰'}
          </button>
          <KqSearch
            variant="mobile"
            context={props.context}
            onFocus={() => setMobileOpen(false)}
          />
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
            aria-label={`Notifications, ${unreadCount} unread`}
            style={{ position: 'relative' }}
            title="Notifications"
            onClick={openNotifications}
          >
            <Alert24Regular className={styles.actionIcon} />
            {notificationBadge}
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
                  aria-expanded={item.children?.length ? mobileExpanded === item.title : undefined}
                  onClick={() => {
                    if (item.children?.length) {
                      setMobileExpanded(
                        mobileExpanded === item.title
                          ? null
                          : item.title
                      );
                    } else if (hasRealUrl(item.url)) {
                      window.open(normalizeUrl(item.url), '_blank', 'noopener,noreferrer');
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
                          href={normalizeUrl(child.url)}
 data-interception="off"
 onClick={(event) => openInNewTab(event, child.url)}
                          target={hasRealUrl(child.url) ? '_blank' : undefined}
                          rel={hasRealUrl(child.url) ? 'noopener noreferrer' : undefined}
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
            <div className={styles.mobileUtilities}>
              <button type="button" onClick={() => { setMobileOpen(false); setContactOpen(true); }}>Feedback</button>
              <a href="tel:+254711024747">IT Support</a>
            </div>
          </div>
        ) : null}
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
                  src={navAnkaraBg}
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
                      {unreadCount}{' '}
                      {unreadCount === 1
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
                  onClick={markAllNotificationsRead}
                  disabled={unreadCount === 0}
                >
                  Mark all as Read
                </button>
              </div>
              <div className={styles.notificationBody}>
                {(notificationWarnings.length > 0 || (notificationsError && notifications.length > 0)) && (
                  <p role="status" style={{ padding: '12px 16px', fontSize: 12, lineHeight: 1.5 }}>
                    {notificationsError || notificationWarnings.join(' ')}
                  </p>
                )}
                {notificationsLoading ? (
                  <div className={styles.notificationState}>
                    <span className={styles.notificationSpinner} />
                    <p>Loading notifications...</p>
                  </div>
                ) : notificationsError && notifications.length === 0 ? (
                  <div className={styles.notificationState}>
                    <Alert24Regular />
                    <p>{notificationsError}</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className={styles.notificationState}>
                    <Alert24Regular />
                    <h3>You're all caught up</h3>
                    <p>Share your thoughts on the content presented, and we'll get back to you as soon as possible.</p>
                  </div>
                ) : (
                  <>
                    {todayNotifications.length > 0 ? (
                      <section className={styles.notificationSection}>
                        <h3>Today</h3>
                        {todayNotifications.map((notification) => (
                          <a
                            key={notification.id}
                            href={notification.link ? normalizeUrl(notification.link) : '#'}
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
                              markNotificationRead(notification);
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
                            {!notification.isRead && (
                              <span className={styles.unreadDot} aria-label="Unread" />
                            )}
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
                            href={notification.link ? normalizeUrl(notification.link) : '#'}
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
                              markNotificationRead(notification);
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
                            {!notification.isRead && (
                              <span className={styles.unreadDot} aria-label="Unread" />
                            )}
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
                            href={notification.link ? normalizeUrl(notification.link) : '#'}
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
                              markNotificationRead(notification);
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
                            {!notification.isRead && (
                              <span className={styles.unreadDot} aria-label="Unread" />
                            )}
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
        {feedbackSuccess && (
          <div role="status" style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 2147483647,
            maxWidth: 'calc(100vw - 48px)', padding: '16px 20px',
            borderRadius: 12, background: '#17633b', color: '#fff',
            boxShadow: '0 8px 28px rgba(0,0,0,0.2)', fontFamily: 'Montserrat, Arial, sans-serif'
          }}>{feedbackSuccess}</div>
        )}
        {contactOpen ? (
          <div
            className={`${styles.contactOverlay} ${isDarkMode ? styles.darkMode : ''}`}
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                if (!feedbackBusyRef.current) { setContactOpen(false); setFeedbackFile(null); setAttachmentName(''); }
              }
            }}
          >
            <section
              className={styles.contactModal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="kq-contact-title"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => { event.preventDefault(); setAttachmentDragActive(false); }}
            >
              <div className={styles.contactModalHeader}>
                <div className={styles.contactHeaderIcon} aria-hidden="true" />
                <div className={styles.contactHeaderCopy}>
                  <h2 id="kq-contact-title">Feedback</h2>
                  <p>
                    Share your feedback with us and we'll get back to you as soon
                    as possible.
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.contactCloseButton}
                  onClick={() => { if (!feedbackBusyRef.current) { setContactOpen(false); setFeedbackFile(null); setAttachmentName(''); } }}
                  aria-label="Close contact form"
                >
                  ×
                </button>
              </div>
              <form
                className={styles.contactForm}
                onPaste={pasteFeedbackAttachment}
                onSubmit={(event) => {
                  event.preventDefault();
                  submitFeedback().catch((error: unknown) => console.error(error));
                }}
              >
                <label className={styles.contactField}>
                  <span>Email Address <strong>*</strong></span>
                  <input
                    type="email"
                    name="feedbackEmail"
                    value={feedbackEmail}
                    disabled={feedbackSending}
                    onChange={(event) => { setFeedbackEmail(event.currentTarget.value); setFeedbackSuccess(''); }}
                    placeholder="Enter your email address"
                    required
                  />
                </label>
                <label className={styles.contactField}>
                  <span>Message <strong>*</strong></span>
                  <textarea
                    name="feedbackMessage"
                    value={feedbackMessage}
                    disabled={feedbackSending}
                    onChange={(event) => { setFeedbackMessage(event.currentTarget.value); setFeedbackSuccess(''); }}
                    placeholder="Enter your message"
                    rows={5}
                    required
                  />
                </label>
                <div className={styles.contactField}>
                  <span>Attachment (optional)</span>
                  <input
                    type="file"
                    name="feedbackAttachment"
                    ref={feedbackFileRef}
                    disabled={feedbackSending}
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    onChange={(event) => {
                      const file = event.currentTarget.files?.[0];
                      if (file) selectFeedbackFile(file);
                      // Allow selecting the same file again after removing it.
                      event.currentTarget.value = '';
                    }}
                  />
                  <button
                    type="button"
                    disabled={feedbackSending}
                    onClick={() => feedbackFileRef.current?.click()}
                    onDragEnter={(event) => {
                      event.preventDefault();
                      if (!feedbackBusyRef.current) setAttachmentDragActive(true);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = feedbackBusyRef.current ? 'none' : 'copy';
                    }}
                    onDragLeave={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                        setAttachmentDragActive(false);
                      }
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setAttachmentDragActive(false);
                      if (feedbackBusyRef.current) return;
                      if (event.dataTransfer.files.length !== 1) {
                        setFeedbackError('Please drop one file at a time.');
                        return;
                      }
                      selectFeedbackFile(event.dataTransfer.files[0]);
                    }}
                    style={{
                      width: '100%', minHeight: 110, padding: '20px 16px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                      border: `2px dashed ${attachmentDragActive ? '#d71920' : '#999'}`,
                      borderRadius: 12, fontFamily: 'inherit',
                      color: 'inherit', background: attachmentDragActive ? 'rgba(215,25,32,0.08)' : 'transparent',
                      cursor: feedbackSending ? 'wait' : 'pointer'
                    }}
                  >
                    <strong>{attachmentDragActive ? 'Drop your file here' : attachmentName ? 'Replace attachment' : 'Choose a file'}</strong>
                    <span style={{ fontSize: 12 }}>or drag and drop here · paste with Ctrl+V / ⌘V</span>
                    <span style={{ fontSize: 12 }}>One file, up to 10 MB</span>
                  </button>
                  {feedbackFile && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
                      <span role="status" style={{ flex: 1, minWidth: 0, overflowWrap: 'break-word', fontSize: 13 }}>
                        {attachmentName} · {Math.max(1, Math.round(feedbackFile.size / 1024))} KB
                      </span>
                      <button
                        type="button"
                        disabled={feedbackSending}
                        aria-label="Remove attachment"
                        onClick={() => { setFeedbackFile(null); setAttachmentName(''); setFeedbackError(''); }}
                        style={{ border: 0, background: 'transparent', color: '#d71920', cursor: 'pointer', fontFamily: 'inherit' }}
                      >Remove</button>
                    </div>
                  )}
                </div>
                {feedbackError && <p role="alert" style={{ color: '#d71920', margin: '12px 0' }}>{feedbackError}</p>}
                <div className={styles.contactFormActions}>
                  <button
                    type="submit"
                    className={styles.contactSubmitButton}
                    disabled={feedbackSending}
                  >
                    {feedbackSending ? 'Submitting...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </section>
          </div>
        ) : null}
      </header>
    </>
  );
};
export default KqWorldNavigation;
