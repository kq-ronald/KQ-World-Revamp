import * as React from 'react';

import {
  Calendar24Regular,
  Location24Regular
} from '@fluentui/react-icons';

import {
  IUpcomingeventsProps
} from './IUpcomingeventsProps';

import {
  IKqEvent
} from '../../../shared/models/IKqEvent';

import KqEventsService
  from '../../../shared/services/KqEventsService';

interface IUpcomingeventsState {
  events: IKqEvent[];
  loading: boolean;
  error: string;
}

export default class Upcomingevents
  extends React.Component<
    IUpcomingeventsProps,
    IUpcomingeventsState
  > {

  private readonly eventsService:
    KqEventsService;

  public constructor(
    props: IUpcomingeventsProps
  ) {
    super(props);

    this.eventsService =
      new KqEventsService(
        props.context
      );

    this.state = {
      events: [],
      loading: true,
      error: ''
    };
  }

  public componentDidMount(): void {
    this.loadEvents().catch(
      (error: Error) => {
        console.error(
          'Upcoming Events initialization failed:',
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

      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      const upcoming =
        events
          .filter(
            (
              event: IKqEvent
            ): boolean => {
              const eventDate =
                new Date(
                  event.date
                );

              eventDate.setHours(
                0,
                0,
                0,
                0
              );

              return (
                eventDate.getTime() >=
                today.getTime()
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

      this.setState({
        events: upcoming,
        loading: false,
        error: ''
      });
    } catch (error) {
      console.error(
        'Failed loading Upcoming Events:',
        error
      );

      this.setState({
        loading: false,
        error:
          'Unable to load upcoming events.'
      });
    }
  }

  private getMonth(
    date: Date
  ): string {
    return date
      .toLocaleDateString(
        'en-GB',
        {
          month: 'short'
        }
      )
      .toUpperCase();
  }

  private getDay(
    date: Date
  ): string {
    return (
      '0' + date.getDate()
    ).slice(-2);
  }

  public render():
    React.ReactElement<
      IUpcomingeventsProps
    > {

    const {
      events,
      loading,
      error
    } = this.state;

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
            boxSizing:
              'border-box',
            background:
              '#ffffff',
            border:
              '1px solid #dddddd',
            borderRadius:
              '12px',
            padding:
              '24px',
            boxShadow:
              '0 3px 12px rgba(0,0,0,0.08)'
          }}
        >
          <div
            style={{
              marginBottom:
                '20px'
            }}
          >
            <div
              style={{
                color:
                  '#777777',
                fontSize:
                  '10px',
                letterSpacing:
                  '0.04em',
                marginBottom:
                  '6px'
              }}
            >
              WHAT'S HAPPENING
            </div>

            <h2
              style={{
                margin: 0,
                color:
                  '#111111',
                fontSize:
                  '20px',
                fontWeight:
                  600
              }}
            >
              Upcoming Events
            </h2>
          </div>

          {loading && (
            <div
              style={{
                padding:
                  '20px 0',
                color:
                  '#777777',
                fontSize:
                  '12px'
              }}
            >
              Loading events...
            </div>
          )}

          {!loading &&
            error && (
              <div
                style={{
                  padding:
                    '20px 0',
                  color:
                    '#d71920',
                  fontSize:
                    '12px'
                }}
              >
                {error}
              </div>
            )}

          {!loading &&
            !error &&
            events.length ===
              0 && (
              <div
                style={{
                  padding:
                    '20px 0',
                  color:
                    '#777777',
                  fontSize:
                    '12px'
                }}
              >
                No upcoming events.
              </div>
            )}

          {!loading &&
            !error &&
            events.map(
              (
                event:
                  IKqEvent
              ) => (
                <div
                  key={event.id}
                  style={{
                    display:
                      'flex',
                    gap: '15px',
                    alignItems:
                      'center',
                    padding:
                      '14px 0',
                    borderBottom:
                      '1px solid #eeeeee'
                  }}
                >
                  <div
                    style={{
                      width:
                        '48px',
                      minWidth:
                        '48px',
                      textAlign:
                        'center'
                    }}
                  >
                    <div
                      style={{
                        color:
                          '#d71920',
                        fontSize:
                          '10px',
                        fontWeight:
                          700
                      }}
                    >
                      {this.getMonth(
                        event.date
                      )}
                    </div>

                    <div
                      style={{
                        color:
                          '#111111',
                        fontSize:
                          '20px',
                        fontWeight:
                          600,
                        lineHeight:
                          1.1
                      }}
                    >
                      {this.getDay(
                        event.date
                      )}
                    </div>
                  </div>

                  {event.imageUrl && (
                    <img
                      src={
                        event.imageUrl
                      }
                      alt=""
                      style={{
                        width:
                          '58px',
                        height:
                          '58px',
                        flexShrink:
                          0,
                        objectFit:
                          'cover',
                        borderRadius:
                          '8px'
                      }}
                    />
                  )}

                  <div
                    style={{
                      minWidth: 0,
                      flex: 1
                    }}
                  >
                    <div
                      style={{
                        color:
                          '#111111',
                        fontSize:
                          '13px',
                        fontWeight:
                          600,
                        marginBottom:
                          '6px'
                      }}
                    >
                      {event.title}
                    </div>

                    <div
                      style={{
                        display:
                          'flex',
                        flexWrap:
                          'wrap',
                        gap:
                          '10px',
                        color:
                          '#777777',
                        fontSize:
                          '11px'
                      }}
                    >
                      <span
                        style={{
                          display:
                            'flex',
                          alignItems:
                            'center',
                          gap: '4px'
                        }}
                      >
                        <Calendar24Regular
                          style={{
                            width:
                              '14px',
                            height:
                              '14px'
                          }}
                        />

                        {event.date
                          .toLocaleDateString(
                            'en-GB',
                            {
                              day:
                                'numeric',
                              month:
                                'short',
                              year:
                                'numeric'
                            }
                          )}
                      </span>

                      {event.location && (
                        <span
                          style={{
                            display:
                              'flex',
                            alignItems:
                              'center',
                            gap:
                              '4px'
                          }}
                        >
                          <Location24Regular
                            style={{
                              width:
                                '14px',
                              height:
                                '14px'
                            }}
                          />

                          {
                            event.location
                          }
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
        </div>
      </section>
    );
  }
}