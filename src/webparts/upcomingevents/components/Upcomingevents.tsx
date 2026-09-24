import * as React from 'react';
import styles from './Upcomingevents.module.scss';

import {
  Clock16Regular,
  Location16Regular
} from '@fluentui/react-icons';

import {
  IUpcomingeventsProps
} from './IUpcomingeventsProps';

import {
  IKqEvent
} from '../../../shared/models/IKqEvent';

import KqEventsService
  from '../../../shared/services/KqEventsService';

import {
  UpcomingEventCategory
} from '../data/upcomingeventsData';


const FILTERS: UpcomingEventCategory[] = [
  'All',
  'Ops',
  'People',
  'Tech'
];


const Upcomingevents: React.FC<IUpcomingeventsProps> = ({
  context
}) => {

  const [events, setEvents] =
    React.useState<IKqEvent[]>([]);

  const [isLoading, setIsLoading] =
    React.useState<boolean>(true);

  const [loadError, setLoadError] =
    React.useState<string>('');

  const [activeFilter, setActiveFilter] =
    React.useState<UpcomingEventCategory>('All');

  const [isDarkMode, setIsDarkMode] =
    React.useState<boolean>(() => {

      if (typeof document === 'undefined') {
        return false;
      }

      return (
        document.documentElement.getAttribute(
          'data-kq-theme'
        ) === 'dark'
      );
    });


  React.useEffect(() => {

    let isMounted = true;

    const loadEvents = async (): Promise<void> => {

      try {

        const eventsService =
          new KqEventsService(context);

        const loadedEvents =
          await eventsService.getEvents();

        const today =
          new Date();

        today.setHours(
          0,
          0,
          0,
          0
        );

        const thirtyDaysFromToday =
          new Date(today);

        thirtyDaysFromToday.setDate(
          thirtyDaysFromToday.getDate() + 30
        );

        thirtyDaysFromToday.setHours(
          23,
          59,
          59,
          999
        );

        const upcoming =
          loadedEvents
            .filter(
              (event: IKqEvent): boolean => {

                const eventDate =
                  new Date(event.date);

                return (
                  eventDate.getTime() >=
                    today.getTime() &&
                  eventDate.getTime() <=
                    thirtyDaysFromToday.getTime()
                );

              }
            )
            .sort(
              (
                first: IKqEvent,
                second: IKqEvent
              ): number =>
                first.date.getTime() -
                second.date.getTime()
            )
            .slice(0, 5);

        if (isMounted) {

          setEvents(upcoming);
          setLoadError('');
          setIsLoading(false);

        }

      } catch (error) {

        console.error(
          'Failed loading Upcoming Events:',
          error
        );

        if (isMounted) {

          setEvents([]);

          setLoadError(
            'Unable to load upcoming events.'
          );

          setIsLoading(false);

        }

      }

    };


    loadEvents().catch(
      (error: Error) => {

        console.error(
          'Upcoming Events initialization failed:',
          error
        );

      }
    );


    return () => {
      isMounted = false;
    };

  }, [context]);


  React.useEffect(() => {

    const handleThemeChange =
      (event: Event): void => {

        const customEvent =
          event as CustomEvent<{
            theme?: string;
          }>;

        setIsDarkMode(
          customEvent.detail?.theme === 'dark'
        );
      };


    const currentTheme =
      document.documentElement.getAttribute(
        'data-kq-theme'
      );

    setIsDarkMode(
      currentTheme === 'dark'
    );


    window.addEventListener(
      'kqworld-theme-change',
      handleThemeChange
    );


    return () => {

      window.removeEventListener(
        'kqworld-theme-change',
        handleThemeChange
      );

    };

  }, []);


  const filteredEvents: IKqEvent[] =
    React.useMemo(() => {

      if (activeFilter === 'All') {
        return events;
      }

      return events.filter(
        (event: IKqEvent): boolean =>
          event.category === activeFilter
      );

    }, [
      activeFilter,
      events
    ]);


  const formatDateParts = (
    date: Date
  ): {
    month: string;
    day: string;
  } => {

    return {

      month: date
        .toLocaleString(
          'en-US',
          {
            month: 'short'
          }
        )
        .toUpperCase(),

      day:
        ('0' + date.getDate()).slice(-2)

    };

  };


  const formatEventTime = (
    date: Date
  ): string => {

    return date.toLocaleTimeString(
      'en-KE',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Africa/Nairobi'
      }
    ) + ' EAT';

  };


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
      const quickActions = zone?.querySelector<HTMLElement>('[data-kq-quick-actions]');
      if (!zone || !quickActions || window.innerWidth <= 1100 ||
          zone.querySelector('.kqWorldNavigationHost')) {
        clear();
        return;
      }
      if (pairedLeft === quickActions && marked.every(({ element }) => element.isConnected)) return;
      clear();
      let row: HTMLElement | null = quickActions.parentElement;
      while (row && row !== zone && !row.contains(root)) row = row.parentElement;
      if (!row || !row.contains(root)) return;
      const branch = (element: HTMLElement): HTMLElement => {
        let result = element;
        while (result.parentElement && result.parentElement !== row) result = result.parentElement;
        return result;
      };
      const left = branch(quickActions);
      const right = branch(root);
      if (left === right) return;
      if (Array.from(row.children).some((child) => child !== left && child !== right &&
          child.querySelector('[data-automation-id="CanvasControl"]'))) return;
      mark(zone, 'data-kq-content-zone');
      let shell: HTMLElement | null = row;
      while (shell && shell !== zone) {
        mark(shell, 'data-kq-content-shell');
        shell = shell.parentElement;
      }
      mark(row, 'data-kq-content-row');
      mark(left, 'data-kq-content-left');
      mark(right, 'data-kq-content-right');
      [quickActions, root].forEach((element) => {
        let wrapper = element.parentElement;
        while (wrapper && wrapper !== row) {
          mark(wrapper, 'data-kq-content-wrapper');
          wrapper = wrapper.parentElement;
        }
      });
      pairedLeft = quickActions;
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

  return (
    <section
      ref={rootRef}
      className={`${styles.upcomingevents} ${isDarkMode ? styles.darkMode : ''}`}
      aria-label="Upcoming events"
    >
      <header className={styles.header}>
        <p className={styles.sectionLabel}>COMING UP</p>
        <h2 className={styles.title}>Next 30 days · {events.length} events</h2>
      </header>
      <div className={styles.filters} role="group" aria-label="Filter events by category">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            className={`${styles.filterButton} ${activeFilter === filter ? styles.activeFilter : ''}`}
            aria-pressed={activeFilter === filter}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
      <div className={styles.eventList} aria-live="polite" aria-busy={isLoading}>
        {isLoading ? (
          <p className={styles.statusMessage}>Loading upcoming events...</p>
        ) : loadError ? (
          <p className={styles.statusMessage} role="alert">{loadError}</p>
        ) : filteredEvents.length === 0 ? (
          <p className={styles.statusMessage}>No upcoming events in this category.</p>
        ) : filteredEvents.map((event) => {
          const dateParts = formatDateParts(event.date);
          return (
            <article key={event.id} className={styles.eventRow}>
              <div className={styles.dateBlock}>
                <span className={styles.month}>{dateParts.month}</span>
                <span className={styles.day}>{dateParts.day}</span>
              </div>
              <div className={styles.eventInformation}>
                <h3 className={styles.eventTitle}>{event.title}</h3>
                <div className={styles.eventMeta}>
                  <span><Clock16Regular aria-hidden="true" />{formatEventTime(event.date)}</span>
                  <span><Location16Regular aria-hidden="true" />{event.location}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default Upcomingevents;
