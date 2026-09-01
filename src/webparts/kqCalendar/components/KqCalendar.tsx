import * as React from 'react';

import {
  calendarEvents,
  IKqCalendarEvent
} from '../data/calendarEvents';

interface ICalendarDay {
  day: number;
  isCurrentMonth: boolean;
  dateKey: string;
}

const KqCalendar: React.FC = () => {
  const today = new Date();

  const [currentDate, setCurrentDate] =
    React.useState<Date>(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
    );

  const [selectedDate, setSelectedDate] =
    React.useState<string>('');

  const [selectedEvents, setSelectedEvents] =
    React.useState<IKqCalendarEvent[]>([]);

  const [drawerOpen, setDrawerOpen] =
    React.useState<boolean>(false);

  const monthNames: string[] = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  const weekDays: string[] = [
    'MO',
    'TU',
    'WE',
    'TH',
    'FR',
    'SA',
    'SU'
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const formatDateKey = (
    targetYear: number,
    targetMonth: number,
    day: number
  ): string => {
    const monthValue =
      ('0' + (targetMonth + 1)).slice(-2);

    const dayValue =
      ('0' + day).slice(-2);

    return `${targetYear}-${monthValue}-${dayValue}`;
  };

  const daysInMonth =
    new Date(year, month + 1, 0).getDate();

  const previousMonthDays =
    new Date(year, month, 0).getDate();

  const firstDay =
    new Date(year, month, 1).getDay();

  const mondayFirstOffset =
    firstDay === 0 ? 6 : firstDay - 1;

  const calendarDays: ICalendarDay[] = [];

  for (
    let i = mondayFirstOffset - 1;
    i >= 0;
    i--
  ) {
    const day =
      previousMonthDays - i;

    const previousMonthDate =
      new Date(year, month - 1, day);

    calendarDays.push({
      day,
      isCurrentMonth: false,
      dateKey: formatDateKey(
        previousMonthDate.getFullYear(),
        previousMonthDate.getMonth(),
        day
      )
    });
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      dateKey: formatDateKey(
        year,
        month,
        day
      )
    });
  }

  let nextMonthDay = 1;

  while (calendarDays.length < 42) {
    const nextMonthDate =
      new Date(
        year,
        month + 1,
        nextMonthDay
      );

    calendarDays.push({
      day: nextMonthDay,
      isCurrentMonth: false,
      dateKey: formatDateKey(
        nextMonthDate.getFullYear(),
        nextMonthDate.getMonth(),
        nextMonthDay
      )
    });

    nextMonthDay++;
  }

  const previousMonth = (): void => {
    setCurrentDate(
      new Date(year, month - 1, 1)
    );

    setSelectedDate('');
  };

  const nextMonth = (): void => {
    setCurrentDate(
      new Date(year, month + 1, 1)
    );

    setSelectedDate('');
  };

  const openDate = (
    calendarDay: ICalendarDay
  ): void => {
    if (!calendarDay.isCurrentMonth) {
      return;
    }

    setSelectedDate(
      calendarDay.dateKey
    );

    const eventsForDate =
      calendarEvents.filter(
        event =>
          event.date ===
          calendarDay.dateKey
      );

    if (eventsForDate.length > 0) {
      setSelectedEvents(
        eventsForDate
      );

      setDrawerOpen(true);
    }
  };

  const closeDrawer = (): void => {
    setDrawerOpen(false);
  };

  const getReadableDate = (): string => {
    if (!selectedDate) {
      return '';
    }

    const parts =
      selectedDate.split('-');

    const selected =
      new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
      );

    return selected.toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        weekday: 'short'
      }
    );
  };

  const getWeekday = (): string => {
    if (!selectedDate) {
      return '';
    }

    const parts =
      selectedDate.split('-');

    const selected =
      new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
      );

    return selected.toLocaleDateString(
      'en-GB',
      {
        weekday: 'long'
      }
    );
  };

  return (
    <>
      <section
        style={{
          width: '100%',
          boxSizing: 'border-box',
          fontFamily:
            '"Segoe UI", Arial, sans-serif'
        }}
      >
        <div
          style={{
            width: '100%',
            boxSizing: 'border-box',

            backgroundColor: '#ffffff',

            border: '1px solid #dedede',
            borderRadius: '12px',

            padding: '24px',

            boxShadow:
              '0 2px 8px rgba(0,0,0,0.08)'
          }}
        >
          <div
            style={{
              color: '#d71920',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              marginBottom: '18px'
            }}
          >
            Calendar
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems: 'center',
              marginBottom: '18px'
            }}
          >
            <div
              style={{
                fontSize: '19px',
                fontWeight: 700,
                color: '#171717'
              }}
            >
              {monthNames[month]} {year}
            </div>

            <div
              style={{
                display: 'flex',
                gap: '6px'
              }}
            >
              <button
                type="button"
                onClick={previousMonth}
                style={{
                  border: 0,
                  background: 'transparent',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
              >
                ‹
              </button>

              <button
                type="button"
                onClick={nextMonth}
                style={{
                  border: 0,
                  background: 'transparent',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
              >
                ›
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(7, 1fr)',
              marginBottom: '8px'
            }}
          >
            {weekDays.map(
              weekday => (
                <div
                  key={weekday}
                  style={{
                    textAlign: 'center',
                    color: '#888',
                    fontSize: '11px',
                    fontWeight: 600
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
                'repeat(7, 1fr)',
              rowGap: '7px'
            }}
          >
            {calendarDays.map(
              (
                calendarDay,
                index
              ) => {
                const eventsForDay =
                  calendarEvents.filter(
                    event =>
                      event.date ===
                      calendarDay.dateKey
                  );

                const hasEvent =
                  eventsForDay.length > 0;

                const isSelected =
                  selectedDate ===
                  calendarDay.dateKey;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() =>
                      openDate(
                        calendarDay
                      )
                    }
                    disabled={
                      !calendarDay.isCurrentMonth
                    }
                    style={{
                      position:
                        'relative',

                      width: '34px',
                      height: '34px',

                      justifySelf:
                        'center',

                      border: 0,
                      borderRadius:
                        '50%',

                      display: 'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center',

                      backgroundColor:
                        isSelected
                          ? '#d71920'
                          : hasEvent
                            ? '#fde9ea'
                            : 'transparent',

                      color:
                        isSelected
                          ? '#ffffff'
                          : calendarDay
                            .isCurrentMonth
                            ? '#222'
                            : '#c9c9c9',

                      cursor:
                        calendarDay
                          .isCurrentMonth
                          ? 'pointer'
                          : 'default',

                      fontSize: '13px'
                    }}
                  >
                    {calendarDay.day}

                    {hasEvent &&
                      !isSelected && (
                        <span
                          style={{
                            position:
                              'absolute',
                            bottom: '2px',

                            width: '4px',
                            height: '4px',

                            borderRadius:
                              '50%',

                            backgroundColor:
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
      </section>

      {drawerOpen && (
        <>
          <div
            onClick={closeDrawer}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9998,
              backgroundColor:
                'rgba(0,0,0,0.58)'
            }}
          />

          <aside
            style={{
              position: 'fixed',
              zIndex: 9999,

              top: 0,
              right: 0,

              width:
                'min(560px, 92vw)',
              height: '100vh',

              backgroundColor:
                '#ffffff',

              boxSizing: 'border-box',

              padding:
                '34px 74px 40px 74px',

              overflowY: 'auto',

              fontFamily:
                '"Segoe UI", Arial, sans-serif',

              borderRadius:
                '0 0 0 12px'
            }}
          >
            <button
              type="button"
              onClick={closeDrawer}
              aria-label="Close event details"
              style={{
                position: 'absolute',

                top: '35px',
                right: '70px',

                width: '42px',
                height: '42px',

                border: 0,
                borderRadius: '50%',

                backgroundColor:
                  '#f5f6fa',

                fontSize: '25px',

                cursor: 'pointer'
              }}
            >
              ×
            </button>

            <div
              style={{
                fontSize: '13px',
                color: '#888',
                marginBottom: '5px'
              }}
            >
              {getReadableDate()}
            </div>

            <div
              style={{
                fontSize: '20px',
                color: '#111',
                marginBottom: '16px'
              }}
            >
              {getWeekday()}
            </div>

            <div
              style={{
                borderTop:
                  '1px solid #d6d6d6'
              }}
            />

            {selectedEvents.map(
              event => (
                <div
                  key={event.id}
                  style={{
                    padding:
                      '18px 0 20px',

                    borderBottom:
                      '1px solid #d6d6d6'
                  }}
                >
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: 500,
                      marginBottom: '9px'
                    }}
                  >
                    {event.title}
                  </div>

                  {event.startTime && (
                    <div
                      style={{
                        color: '#7b7b7b',
                        fontSize: '13px',
                        marginBottom: '8px'
                      }}
                    >
                      ◷ {event.startTime}
                      {event.endTime
                        ? ` - ${event.endTime}`
                        : ''}
                    </div>
                  )}

                  {event.location && (
                    <div
                      style={{
                        color: '#7b7b7b',
                        fontSize: '13px',
                        marginBottom: '8px'
                      }}
                    >
                      ⌖ {event.location}
                    </div>
                  )}

                  {event.organizer && (
                    <div
                      style={{
                        color: '#7b7b7b',
                        fontSize: '13px',
                        marginBottom: '8px'
                      }}
                    >
                      ▷ {event.organizer}
                    </div>
                  )}

                  {event.recurrence && (
                    <div
                      style={{
                        color: '#7b7b7b',
                        fontSize: '13px',
                        marginBottom: '8px'
                      }}
                    >
                      ↻ {event.recurrence}
                    </div>
                  )}

                  {event.description && (
                    <div
                      style={{
                        color: '#777',
                        fontSize: '13px',
                        lineHeight: 1.35
                      }}
                    >
                      ☰ {event.description}
                    </div>
                  )}
                </div>
              )
            )}
          </aside>
        </>
      )}
    </>
  );
};

export default KqCalendar;