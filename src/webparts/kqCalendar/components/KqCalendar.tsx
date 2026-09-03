import * as React from 'react';

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

  private readonly eventsService:
    KqEventsService;

  public constructor(
    props: IKqCalendarProps
  ) {
    super(props);

    const today = new Date();

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
      error: ''
    };
  }

  public componentDidMount(): void {
    this.loadEvents().catch(
      (error: Error) => {
        console.error(
          'Calendar initialization failed:',
          error
        );
      }
    );
  }

  private async loadEvents():
    Promise<void> {
    try {
      const events =
        await this.eventsService
          .getEvents();

      this.setState({
        events,
        loading: false,
        error: ''
      });
    } catch (error) {
      console.error(
        'Failed loading calendar events:',
        error
      );

      this.setState({
        loading: false,
        error:
          'Unable to load calendar events.'
      });
    }
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

  private getEventsForDate(
    date: Date
  ): IKqEvent[] {
    const dateKey =
      this.formatDateKey(date);

    return this.state.events.filter(
      (event: IKqEvent) =>
        this.formatDateKey(
          event.date
        ) === dateKey
    );
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

    /*
     * JavaScript:
     * Sunday = 0
     * Monday = 1
     *
     * Our calendar is Monday-first.
     */
    const startOffset =
      (firstDay.getDay() + 6) %
      7;

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
          date.getMonth() ===
          month
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
      error
    } = this.state;

    const calendarDays =
      this.buildCalendarDays();

    const monthTitle =
      currentDate
        .toLocaleDateString(
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

    return (
      <section
        style={{
          width: '100%',
          boxSizing: 'border-box',
          fontFamily:
            "'Segoe UI', Arial, sans-serif"
        }}
      >
        <div
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: '#ffffff',
            border:
              '1px solid #dddddd',
            borderRadius: '12px',
            padding: '24px',
            boxShadow:
              '0 3px 12px rgba(0,0,0,0.08)'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems: 'center',
              marginBottom: '22px'
            }}
          >
            <div>
              <div
                style={{
                  color: '#777777',
                  fontSize: '10px',
                  letterSpacing:
                    '0.04em',
                  marginBottom: '6px'
                }}
              >
                COMPANY CALENDAR
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#111111'
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
                style={
                  this.navigationButtonStyle
                }
              >
                <ChevronLeft24Regular />
              </button>

              <button
                type="button"
                onClick={
                  this.nextMonth
                }
                aria-label="Next month"
                style={
                  this.navigationButtonStyle
                }
              >
                <ChevronRight24Regular />
              </button>
            </div>
          </div>

          {loading && (
            <div
              style={{
                padding: '30px 0',
                color: '#777777',
                fontSize: '12px'
              }}
            >
              Loading events...
            </div>
          )}

          {!loading && error && (
            <div
              style={{
                padding: '30px 0',
                color: '#d71920',
                fontSize: '12px'
              }}
            >
              {error}
            </div>
          )}

          {!loading &&
            !error && (
              <>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(7, minmax(0, 1fr))',
                    marginBottom: '8px'
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
                            '10px',
                          fontWeight:
                            600,
                          color:
                            '#8a8a8a',
                          padding:
                            '5px 2px'
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
                    gap: '4px'
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
                        dayEvents.length >
                        0;

                      const isToday =
                        this.formatDateKey(
                          day.date
                        ) ===
                        this.formatDateKey(
                          new Date()
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
                            minHeight:
                              '52px',
                            border:
                              isToday
                                ? '1px solid #d71920'
                                : '1px solid transparent',
                            borderRadius:
                              '8px',
                            background:
                              hasEvent
                                ? '#f7f7f7'
                                : 'transparent',
                            color:
                              day.currentMonth
                                ? '#222222'
                                : '#bbbbbb',
                            cursor:
                              hasEvent
                                ? 'pointer'
                                : 'default',
                            fontFamily:
                              'inherit',
                            fontSize:
                              '12px'
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
                                  '7px',
                                left: '50%',
                                transform:
                                  'translateX(-50%)',
                                width:
                                  '5px',
                                height:
                                  '5px',
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
              </>
            )}
        </div>

        {drawerOpen && (
          <>
            <div
              onClick={
                this.closeDrawer
              }
              style={{
                position: 'fixed',
                inset: 0,
                background:
                  'rgba(0,0,0,0.32)',
                zIndex: 9998
              }}
            />

            <aside
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width:
                  'min(420px, 92vw)',
                background:
                  '#ffffff',
                zIndex: 9999,
                boxShadow:
                  '-8px 0 30px rgba(0,0,0,0.16)',
                padding:
                  '28px 24px',
                boxSizing:
                  'border-box',
                overflowY: 'auto'
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
                        '#777777',
                      fontSize:
                        '10px',
                      marginBottom:
                        '7px'
                    }}
                  >
                    EVENTS
                  </div>

                  {selectedDate && (
                    <h3
                      style={{
                        margin: 0,
                        fontSize:
                          '19px'
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
                        '1px solid #eeeeee'
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
                          'flex-start'
                      }}
                    >
                      <Calendar24Regular />

                      <strong>
                        {event.title}
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
                            '#777777',
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
          </>
        )}
      </section>
    );
  }

  private readonly navigationButtonStyle:
    React.CSSProperties = {
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border:
        '1px solid #dddddd',
      borderRadius: '50%',
      background: '#ffffff',
      cursor: 'pointer'
    };
}