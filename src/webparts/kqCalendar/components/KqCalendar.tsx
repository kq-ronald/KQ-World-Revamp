import * as React from 'react';
import * as ReactDOM from 'react-dom';
import styles from './KqCalendar.module.scss';
import {
  ChevronLeft24Regular,
  ChevronRight24Regular,
  Dismiss24Regular,
  Calendar24Regular,
  Location24Regular
} from '@fluentui/react-icons';
import {
  IKqCalendarProps
} from './IKqCalendarProps';
import {
  IKqEvent
} from '../../../shared/models/IKqEvent';
import KqEventsService
  from '../../../shared/services/KqEventsService';
interface IKqCalendarState {
  events: IKqEvent[];
  currentDate: Date;
  selectedDate?: Date;
  selectedEvents: IKqEvent[];
  drawerOpen: boolean;
  loading: boolean;
  error: string;
  isDarkMode: boolean;
}
interface ICalendarDay {
  date: Date;
  currentMonth: boolean;
}
export default class KqCalendar
  extends React.Component<
    IKqCalendarProps,
    IKqCalendarState
  > {
  private eventRequest = 0;
  private eventRefreshTimer: number | undefined;
  private readonly eventsService:
    KqEventsService;
  private readonly calendarRef = React.createRef<HTMLElement>();
  private bannerObserver?: ResizeObserver;
  private layoutObserver?: MutationObserver;
  private observedBanner: HTMLElement | null = null;
  private layoutFrame = 0;
  private disposed = false;
  // Only the section containing BOTH cards is resized. Never the navigation.
  private markedElements: Array<{ element: HTMLElement; name: string; previous: string | null }> = [];
  private pairedZone: HTMLElement | null = null;
  private mark(element: HTMLElement, name: string): void {
    this.markedElements.push({ element, name, previous: element.getAttribute(name) });
    element.setAttribute(name, 'true');
  }
  private clearPairLayout = (): void => {
    this.markedElements.forEach(({ element, name, previous }) => {
      if (previous === null) element.removeAttribute(name);
      else element.setAttribute(name, previous);
    });
    this.markedElements = [];
    this.pairedZone = null;
    this.calendarRef.current?.style.removeProperty('--calendar-banner-height');
  };
  private queueLayout = (): void => {
    if (!this.layoutFrame && !this.disposed) {
      this.layoutFrame = window.requestAnimationFrame(this.syncBannerLayout);
    }
  };
  private mobileMarked: HTMLElement[] = [];
  private applyMobileOrder = (): void => {
    this.mobileMarked.forEach((el) => {
      el.removeAttribute('data-kq-flat');
      el.removeAttribute('data-kq-o');
      el.removeAttribute('data-kq-stack');
      el.removeAttribute('data-kq-tail');
    });
    this.mobileMarked = [];
    const root = this.calendarRef.current;
    const zone = root?.closest<HTMLElement>('[data-automation-id="CanvasZone"]');
    // Climb to the element that contains every section on the page.
    const allZones = Array.from(
      document.querySelectorAll<HTMLElement>('[data-automation-id="CanvasZone"]')
    );
    let stack: HTMLElement | null | undefined = zone?.parentElement;
    while (stack && !allZones.every((z) => (stack as HTMLElement).contains(z))) {
      stack = stack.parentElement;
    }
    if (!root || !zone || !stack || window.innerWidth > 1100) return;
    const order: Array<[string, string]> = [
      ['[class*="intranetBanner_"]', '1'],
      ['[class*="kqCalendar_"]', '3'],
      ['[class*="upcomingevents_"]', '4'],
      ['[class*="kqquickactions_"]', '5'],
      ['[class*="onlineProcesses_"]', '6'],
      ['[class*="kqCompanyNews_"]', '7']
    ];
    stack.setAttribute('data-kq-stack', 'true');
    this.mobileMarked.push(stack);
    stack.querySelectorAll<HTMLElement>('[data-automation-id="CanvasControl"]').forEach((control) => {
      const controlZone = control.closest<HTMLElement>('[data-automation-id="CanvasZone"]');
      // Leave the navigation zone alone; it stays first.
      if (controlZone?.querySelector('.kqWorldNavigationHost')) return;
      // Placeholder IDs exist before SPFx renders a web part.
      const webPartIds = Array.from(control.querySelectorAll<HTMLElement>('[id]'))
        .map((element) => element.id.toLowerCase()).join(' ');
      const metadataElements = [control, ...Array.from(
        control.querySelectorAll<HTMLElement>('[data-sp-webpartdata]')
      )];
      const metadata = metadataElements
        .map((element) => element.getAttribute('data-sp-webpartdata') || '')
        .join(' ').toLowerCase();
      const renderedWelcome = control.querySelector('[data-kq-quick-mode="welcome"]') !== null;
      const configuredWelcome = metadata.includes('"displaymode":"welcome"') ||
        metadata.includes('&quot;displaymode&quot;:&quot;welcome&quot;');
      let assignedOrder = '9';
      if (webPartIds.includes('intranetbannerwebpart')) assignedOrder = '1';
      else if (webPartIds.includes('kqcalendarwebpart')) assignedOrder = '3';
      else if (webPartIds.includes('upcomingeventswebpart')) assignedOrder = '4';
      else if (webPartIds.includes('onlineprocesseswebpart')) assignedOrder = '6';
      else if (webPartIds.includes('kqcompanynewswebpart')) assignedOrder = '7';
      else if (webPartIds.includes('kqquickactionswebpart')) {
        assignedOrder = (configuredWelcome || renderedWelcome) ? '2' : '5';
      } else {
        const match = order.find(([selector]) => control.querySelector(selector));
        if (match) assignedOrder = match[1];
      }
      // Identify the Welcome Back-only web part before SharePoint renders it.
      const welcomeBackInstanceId =
        'f8194541-7651-4728-b366-cab7ca373341';

      const isWelcomeBackInstance =
        webPartIds.includes(welcomeBackInstanceId);

      if (isWelcomeBackInstance) {
        assignedOrder = '2';
      }
      control.setAttribute('data-kq-o', assignedOrder);
      this.mobileMarked.push(control);
      let wrapper = control.parentElement;
      while (wrapper && wrapper !== stack) {
        wrapper.setAttribute('data-kq-flat', 'true');
        this.mobileMarked.push(wrapper);
        wrapper = wrapper.parentElement;
      }
    });
    // Keep SharePoint sections containing only lower-priority web parts
    // as flex items. Flattening them can place their controls before the hero.
    Array.from(stack.children).forEach((child) => {
      const controls = Array.from(
        child.querySelectorAll<HTMLElement>(
          '[data-automation-id="CanvasControl"]'
        )
      );
      if (
        controls.length > 0 &&
        controls.every((control) => control.getAttribute('data-kq-o') === '9')
      ) {
        child.setAttribute('data-kq-tail', 'true');
        this.mobileMarked.push(child as HTMLElement);
      }
    });
  };
  private syncBannerLayout = (): void => {
    this.layoutFrame = 0;
    this.applyMobileOrder();
    const root = this.calendarRef.current;
    if (!root || this.disposed) return;
    const zone = root.closest<HTMLElement>('[data-automation-id="CanvasZone"]');
    const banner = zone?.querySelector<HTMLElement>('[data-kq-banner]') || null;
    if (banner !== this.observedBanner) {
      this.clearPairLayout();
      if (this.observedBanner) this.bannerObserver?.unobserve(this.observedBanner);
      this.observedBanner = banner;
      if (banner) this.bannerObserver?.observe(banner);
    }
    if (!zone || !banner || window.innerWidth <= 1100 ||
      zone.querySelector('.kqWorldNavigationHost')) {
      this.clearPairLayout();
      return;
    }
    if (this.pairedZone !== zone || this.markedElements.some(({ element }) => !element.isConnected)) {
      this.clearPairLayout();
      // Find the actual common row and its two column branches.
      let row: HTMLElement | null = banner.parentElement;
      while (row && row !== zone && !row.contains(root)) row = row.parentElement;
      if (!row || !row.contains(root)) return;
      const branch = (element: HTMLElement): HTMLElement => {
        let result = element;
        while (result.parentElement && result.parentElement !== row) result = result.parentElement;
        return result;
      };
      const left = branch(banner);
      const right = branch(root);
      if (left === right) return;
      // Avoid changing a section with a third content column.
      const otherContent = Array.from(row.children).some((child) =>
        child !== left && child !== right &&
        child.querySelector('[data-automation-id="CanvasControl"]') !== null
      );
      if (otherContent) return;
      this.mark(zone, 'data-kq-hero-zone');
      let shell: HTMLElement | null = row;
      while (shell && shell !== zone) {
        this.mark(shell, 'data-kq-hero-shell');
        shell = shell.parentElement;
      }
      this.mark(row, 'data-kq-hero-row');
      this.mark(left, 'data-kq-hero-left');
      this.mark(right, 'data-kq-hero-right');
      // Remove nested column/control gutters only along these two paths.
      [banner, root].forEach((element) => {
        let wrapper = element.parentElement;
        while (wrapper && wrapper !== row) {
          this.mark(wrapper, 'data-kq-hero-wrapper');
          wrapper = wrapper.parentElement;
        }
      });
      this.pairedZone = zone;
    }
    const height = banner.getBoundingClientRect().height;
    if (height > 0) {
      const value = `${Math.round(height * 100) / 100}px`;
      if (root.style.getPropertyValue('--calendar-banner-height') !== value) {
        root.style.setProperty('--calendar-banner-height', value);
      }
    }
  };
  public constructor(
    props: IKqCalendarProps
  ) {
    super(props);
    const today = this.getNairobiToday();
    const isDarkMode =
      document.documentElement.getAttribute(
        'data-kq-theme'
      ) === 'dark';
    this.eventsService =
      new KqEventsService(
        props.context
      );
    this.state = {
      events: [],
      currentDate: new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      ),
      selectedEvents: [],
      drawerOpen: false,
      loading: true,
      error: '',
      isDarkMode
    };
  }
  private refreshOutlookEvents = (): void => {
    this.loadEvents().catch((error: unknown) => console.error(error));
  };
  public componentDidMount(): void {
    this.eventRefreshTimer = window.setInterval(this.refreshOutlookEvents, 5 * 60 * 1000);
    window.addEventListener('focus', this.refreshOutlookEvents);
    this.bannerObserver = new ResizeObserver(this.queueLayout);
    const root = this.calendarRef.current;
    if (root) {
      this.bannerObserver.observe(root);
      const canvas = root.closest<HTMLElement>('[data-automation-id="CanvasLayout"]');
      if (canvas) {
        this.bannerObserver.observe(canvas);
        this.layoutObserver = new MutationObserver(this.queueLayout);
        this.layoutObserver.observe(canvas, { childList: true, subtree: true });
      }
    }
    window.addEventListener('resize', this.queueLayout);
    this.queueLayout();
    window.addEventListener(
      'kqworld-theme-change',
      this.handleThemeChange
    );
    this.loadEvents().catch(
      (error: Error) => {
        console.error(
          'Calendar initialization failed:',
          error
        );
      }
    );
  }
  public componentDidUpdate(_previousProps: IKqCalendarProps, previousState: IKqCalendarState): void {
    if (previousState.currentDate.getTime() !== this.state.currentDate.getTime()) {
      this.refreshOutlookEvents();
    }
  }
  public componentWillUnmount(): void {
    window.clearInterval(this.eventRefreshTimer);
    window.removeEventListener('focus', this.refreshOutlookEvents);
    this.disposed = true;
    this.clearPairLayout();
    this.mobileMarked.forEach((el) => {
      el.removeAttribute('data-kq-flat');
      el.removeAttribute('data-kq-o');
      el.removeAttribute('data-kq-stack');
      el.removeAttribute('data-kq-tail');
    });
    this.bannerObserver?.disconnect();
    this.layoutObserver?.disconnect();
    window.cancelAnimationFrame(this.layoutFrame);
    window.removeEventListener('resize', this.queueLayout);
    window.removeEventListener(
      'kqworld-theme-change',
      this.handleThemeChange
    );
  }
  private handleThemeChange = (
    event: Event
  ): void => {
    const customEvent =
      event as CustomEvent<{
        theme: 'light' | 'dark';
      }>;
    this.setState({
      isDarkMode:
        customEvent.detail.theme === 'dark'
    });
  };
  private async loadEvents(): Promise<void> {
    const request = ++this.eventRequest;
    const days = this.buildCalendarDays();
    const firstDay = days[0].date;
    const lastDay = days[days.length - 1].date;
    const afterLastDay = new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate() + 1);
    const start = new Date(`${this.formatDateKey(firstDay)}T00:00:00+03:00`);
    const end = new Date(`${this.formatDateKey(afterLastDay)}T00:00:00+03:00`);
    this.setState({ loading: true, error: '', drawerOpen: false, selectedEvents: [] });
    try {
      const events = await this.eventsService.getEvents(start, end);
      if (this.disposed || request !== this.eventRequest) return;
      this.setState({ events, loading: false, error: '' });
    } catch (error) {
      if (this.disposed || request !== this.eventRequest) return;
      this.setState({
        events: [], loading: false,
        error: error instanceof Error ? error.message : 'Unable to load calendar events.'
      });
    }
  }
  private getNairobiToday(): Date {
    const now = new Date();
    const shifted = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    return new Date(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate());
  }
  private formatDateKey(
    date: Date
  ): string {
    const year =
      date.getFullYear();
    const month =
      ('0' +
        (date.getMonth() + 1))
        .slice(-2);
    const day =
      ('0' + date.getDate())
        .slice(-2);
    return (
      year +
      '-' +
      month +
      '-' +
      day
    );
  }
  private getEventsForDate(date: Date): IKqEvent[] {
    const dayStart = new Date(`${this.formatDateKey(date)}T00:00:00+03:00`).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    return this.state.events.filter((event) => {
      const start = event.date.getTime();
      const end = event.endDate?.getTime() || start;
      return end > start ? start < dayEnd && end > dayStart : start >= dayStart && start < dayEnd;
    });
  }
  private buildCalendarDays():
    ICalendarDay[] {
    const { currentDate } =
      this.state;
    const year =
      currentDate.getFullYear();
    const month =
      currentDate.getMonth();
    const firstDay =
      new Date(year, month, 1);
    const startOffset =
      (firstDay.getDay() + 6) % 7;
    const gridStart =
      new Date(
        year,
        month,
        1 - startOffset
      );
    const days:
      ICalendarDay[] = [];
    for (
      let i = 0;
      i < 42;
      i++
    ) {
      const date =
        new Date(
          gridStart.getFullYear(),
          gridStart.getMonth(),
          gridStart.getDate() + i
        );
      days.push({
        date,
        currentMonth:
          date.getMonth() === month
      });
    }
    return days;
  }
  private previousMonth = (): void => {
    this.setState(
      (
        previousState:
          IKqCalendarState
      ) => ({
        currentDate:
          new Date(
            previousState
              .currentDate
              .getFullYear(),
            previousState
              .currentDate
              .getMonth() - 1,
            1
          )
      })
    );
  };
  private nextMonth = (): void => {
    this.setState(
      (
        previousState:
          IKqCalendarState
      ) => ({
        currentDate:
          new Date(
            previousState
              .currentDate
              .getFullYear(),
            previousState
              .currentDate
              .getMonth() + 1,
            1
          )
      })
    );
  };
  private selectDate(
    date: Date
  ): void {
    const selectedEvents =
      this.getEventsForDate(date);
    if (
      selectedEvents.length === 0
    ) {
      return;
    }
    this.setState({
      selectedDate: date,
      selectedEvents,
      drawerOpen: true
    });
  }
  private closeDrawer = (): void => {
    this.setState({
      drawerOpen: false
    });
  };
  private formatDrawerDate(
    date: Date
  ): string {
    return date.toLocaleDateString(
      'en-GB',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }
    );
  }
  public render():
    React.ReactElement<
      IKqCalendarProps
    > {
    const {
      currentDate,
      selectedDate,
      selectedEvents,
      drawerOpen,
      loading,
      error,
      isDarkMode
    } = this.state;
    const calendarDays =
      this.buildCalendarDays();
    const monthTitle =
      currentDate.toLocaleDateString(
        'en-GB',
        {
          month: 'long',
          year: 'numeric'
        }
      );
    const weekdays = [
      'MON',
      'TUE',
      'WED',
      'THU',
      'FRI',
      'SAT',
      'SUN'
    ];
    const cardBackground =
      isDarkMode
        ? '#262F3D'
        : '#ffffff';
    const primaryText =
      isDarkMode
        ? '#ffffff'
        : '#111111';
    const secondaryText =
      isDarkMode
        ? '#c7ccd4'
        : '#777777';
    const mutedText =
      isDarkMode
        ? '#8f98a5'
        : '#bbbbbb';
    const eventTileBackground =
      isDarkMode
        ? '#313B4B'
        : '#f7f7f7';
    const borderColor =
      isDarkMode
        ? '#3A4555'
        : '#dddddd';
    return (
      <section
        ref={this.calendarRef}
        className={styles.kqCalendar}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          fontFamily:
            "'Montserrat', Arial, sans-serif"
        }}
      >
        <div
          className={styles.calendarCard}
          style={{
            boxSizing: 'border-box',
            background: cardBackground,
            border:
              `1px solid ${borderColor}`,
            borderRadius: '12px',
            padding: '20px',
            boxShadow:
              isDarkMode
                ? 'none'
                : '0 3px 12px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems: 'center',
              marginBottom: '12px',
              flexShrink: 0
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '12px',
                  lineHeight: '1.4',
                  letterSpacing: '0',
                  color: isDarkMode
                    ? '#ffffff'
                    : '#d71920',
                  marginBottom: '8px'
                }}
              >
                CALENDAR
              </div>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '20px',
                  lineHeight: '100%',
                  letterSpacing: '0',
                  color: primaryText
                }}
              >
                {monthTitle}
              </h2>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '6px'
              }}
            >
              <button
                type="button"
                onClick={
                  this.previousMonth
                }
                aria-label="Previous month"
                style={{
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border:
                    `1px solid ${borderColor}`,
                  borderRadius: '50%',
                  background:
                    isDarkMode
                      ? '#313B4B'
                      : '#ffffff',
                  color: primaryText,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <ChevronLeft24Regular />
              </button>
              <button
                type="button"
                onClick={
                  this.nextMonth
                }
                aria-label="Next month"
                style={{
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border:
                    `1px solid ${borderColor}`,
                  borderRadius: '50%',
                  background:
                    isDarkMode
                      ? '#313B4B'
                      : '#ffffff',
                  color: primaryText,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <ChevronRight24Regular />
              </button>
            </div>
          </div>
          {loading && (
            <div
              style={{
                padding: '20px 0',
                color: secondaryText,
                fontSize: '12px'
              }}
            >
              Loading events...
            </div>
          )}
          {!loading && error && (
            <div
              style={{
                padding: '20px 0',
                color: '#d71920',
                fontSize: '12px'
              }}
            >
              {error}
            </div>
          )}
          {!loading &&
            !error && (
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(7, minmax(0, 1fr))',
                    marginBottom: '4px',
                    flexShrink: 0
                  }}
                >
                  {weekdays.map(
                    (
                      weekday: string
                    ) => (
                      <div
                        key={weekday}
                        style={{
                          textAlign:
                            'center',
                          fontSize:
                            '9px',
                          fontWeight:
                            600,
                          color:
                            secondaryText,
                          padding:
                            '3px 1px'
                        }}
                      >
                        {weekday}
                      </div>
                    )
                  )}
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(7, minmax(0, 1fr))',
                    gridTemplateRows:
                      'repeat(6, minmax(0, 1fr))',
                    gap: '3px',
                    flex: 1,
                    minHeight: 0
                  }}
                >
                  {calendarDays.map(
                    (
                      day:
                        ICalendarDay
                    ) => {
                      const dayEvents =
                        this
                          .getEventsForDate(
                            day.date
                          );
                      const hasEvent =
                        dayEvents.length > 0;
                      const isToday =
                        this.formatDateKey(
                          day.date
                        ) ===
                        this.formatDateKey(
                          this.getNairobiToday()
                        );
                      return (
                        <button
                          key={
                            this.formatDateKey(
                              day.date
                            )
                          }
                          type="button"
                          onClick={() =>
                            this.selectDate(
                              day.date
                            )
                          }
                          disabled={
                            !hasEvent
                          }
                          title={
                            hasEvent
                              ? dayEvents
                                .map(
                                  (
                                    event:
                                      IKqEvent
                                  ) =>
                                    event.title
                                )
                                .join(
                                  ', '
                                )
                              : undefined
                          }
                          style={{
                            position:
                              'relative',
                            minWidth: 0,
                            minHeight: 0,
                            border:
                              isToday
                                ? '1px solid #d71920'
                                : '1px solid transparent',
                            borderRadius:
                              '6px',
                            background:
                              hasEvent
                                ? eventTileBackground
                                : 'transparent',
                            color:
                              day.currentMonth
                                ? primaryText
                                : mutedText,
                            cursor:
                              hasEvent
                                ? 'pointer'
                                : 'default',
                            fontFamily:
                              'inherit',
                            fontSize:
                              '11px',
                            padding: 0
                          }}
                        >
                          <span>
                            {day.date
                              .getDate()}
                          </span>
                          {hasEvent && (
                            <span
                              style={{
                                position:
                                  'absolute',
                                bottom:
                                  '4px',
                                left: '50%',
                                transform:
                                  'translateX(-50%)',
                                width:
                                  '4px',
                                height:
                                  '4px',
                                borderRadius:
                                  '50%',
                                background:
                                  '#d71920'
                              }}
                            />
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}
        </div>
        {drawerOpen && ReactDOM.createPortal(
          <>
            <div
              onClick={this.closeDrawer}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.45)',
                zIndex: 100000
              }}
            />
            <aside
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: 'min(420px, 92vw)',
                background: cardBackground,
                color: primaryText,
                zIndex: 100001,
                boxShadow: '-8px 0 30px rgba(0,0,0,0.22)',
                padding: '28px 24px',
                boxSizing: 'border-box',
                overflowY: 'auto',
                fontFamily: "'Montserrat', Arial, sans-serif"
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems:
                    'flex-start',
                  marginBottom:
                    '26px'
                }}
              >
                <div>
                  <div
                    style={{
                      color:
                        '#d71920',
                      fontSize:
                        '10px',
                      marginBottom:
                        '7px',
                      fontWeight: 600
                    }}
                  >
                    EVENTS
                  </div>
                  {selectedDate && (
                    <h3
                      style={{
                        margin: 0,
                        fontSize:
                          '19px',
                        color:
                          primaryText
                      }}
                    >
                      {this
                        .formatDrawerDate(
                          selectedDate
                        )}
                    </h3>
                  )}
                </div>
                <button
                  type="button"
                  onClick={
                    this.closeDrawer
                  }
                  aria-label="Close"
                  style={{
                    border: 'none',
                    background:
                      'transparent',
                    color:
                      primaryText,
                    cursor:
                      'pointer',
                    padding: '4px'
                  }}
                >
                  <Dismiss24Regular />
                </button>
              </div>
              {selectedEvents.map(
                (
                  event: IKqEvent
                ) => (
                  <div
                    key={event.id}
                    style={{
                      padding:
                        '18px 0',
                      borderBottom:
                        `1px solid ${borderColor}`
                    }}
                  >
                    {event.imageUrl && (
                      <img
                        src={
                          event.imageUrl
                        }
                        alt=""
                        style={{
                          display:
                            'block',
                          width: '100%',
                          height:
                            '150px',
                          objectFit:
                            'cover',
                          borderRadius:
                            '8px',
                          marginBottom:
                            '15px'
                        }}
                      />
                    )}
                    <div
                      style={{
                        display:
                          'flex',
                        gap: '8px',
                        alignItems:
                          'flex-start',
                        color:
                          primaryText
                      }}
                    >
                      <Calendar24Regular />
                      <strong>
                        {event.webLink ? <a href={event.webLink} target="_blank" rel="noopener noreferrer" data-interception="off" style={{ color: 'inherit' }}>{event.title}</a> : event.title}
                      </strong>
                    </div>
                    {event.location && (
                      <div
                        style={{
                          display:
                            'flex',
                          gap: '8px',
                          alignItems:
                            'center',
                          marginTop:
                            '10px',
                          color:
                            secondaryText,
                          fontSize:
                            '12px'
                        }}
                      >
                        <Location24Regular />
                        <span>
                          {
                            event.location
                          }
                        </span>
                      </div>
                    )}
                  </div>
                )
              )}
            </aside>
          </>,
          document.body
        )}
      </section>
    );
  }
}
