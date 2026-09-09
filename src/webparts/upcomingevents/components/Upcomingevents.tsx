import * as React from 'react';

import {
  Clock16Regular,
  Location16Regular
} from '@fluentui/react-icons';

import {
  upcomingEvents,
  IUpcomingEvent,
  UpcomingEventCategory
} from '../data/upcomingeventsData';


const FILTERS: UpcomingEventCategory[] = [
  'All',
  'Ops',
  'People',
  'Tech'
];


const Upcomingevents: React.FC = () => {

  const [activeFilter, setActiveFilter] =
    React.useState<UpcomingEventCategory>('All');

  const [isDarkMode, setIsDarkMode] =
    React.useState<boolean>(() => {

      if (typeof document === 'undefined') {
        return false;
      }

      return (
        document.documentElement.getAttribute('data-kq-theme') === 'dark'
      );
    });


  React.useEffect(() => {

    const handleThemeChange = (event: Event): void => {

      const customEvent = event as CustomEvent<{
        theme?: string;
      }>;

      setIsDarkMode(
        customEvent.detail?.theme === 'dark'
      );
    };


    const currentTheme =
      document.documentElement.getAttribute('data-kq-theme');

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


  const filteredEvents: IUpcomingEvent[] =
    React.useMemo(() => {

      if (activeFilter === 'All') {
        return upcomingEvents;
      }

      return upcomingEvents.filter(
        event => event.category === activeFilter
      );

    }, [activeFilter]);


  const formatDateParts = (
    dateString: string
  ): {
    month: string;
    day: string;
  } => {

    const date =
      new Date(`${dateString}T00:00:00`);

    return {

      month: date
        .toLocaleString(
          'en-US',
          { month: 'short' }
        )
        .toUpperCase(),

      day:
        ('0' + date.getDate()).slice(-2)

    };

  };


  const cardBackground =
    isDarkMode
      ? '#262F3D'
      : '#ffffff';

  const primaryText =
    isDarkMode
      ? '#ffffff'
      : '#202020';

  const secondaryText =
    isDarkMode
      ? '#ffffff'
      : '#666666';

  const borderColor =
    isDarkMode
      ? 'rgba(255,255,255,0.30)'
      : '#d7d7d7';


  return (

    <section
      className="kq-upcoming-events"
      style={{
        width: '100%',
        boxSizing: 'border-box',

        backgroundColor: cardBackground,

        border: `1px solid ${borderColor}`,
        borderRadius: '12px',

        padding: '20px 20px 18px 20px',

        boxShadow: 'none',

        fontFamily:
          "'Montserrat', 'Segoe UI', Arial, Helvetica, sans-serif",

        overflow: 'hidden'
      }}
    >

      <style>
        {`
          .kq-upcoming-events {
            height: 500px;
          }

          @media (max-width: 1100px) {
            .kq-upcoming-events {
              height: auto;
              min-height: 450px;
            }
          }

          @media (max-width: 600px) {
            .kq-upcoming-events {
              height: auto;
              min-height: 0;
              padding: 18px 16px !important;
            }
          }
        `}
      </style>


      {/* Header */}

      <div
        style={{
          marginBottom: '12px'
        }}
      >

        <div
          style={{
            color: primaryText,

            fontSize: '10px',
            lineHeight: 1,

            fontWeight: 500,

            letterSpacing: '0.02em',

            textTransform: 'uppercase',

            marginBottom: '7px'
          }}
        >
          COMING UP
        </div>


        <div
          style={{
            color: primaryText,

            fontSize: '14px',
            lineHeight: 1.15,

            fontWeight: 400
          }}
        >
          Next 30 days · {upcomingEvents.length} events
        </div>

      </div>


      {/* Filters */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',

          gap: '9px',

          flexWrap: 'wrap',

          marginBottom: '14px'
        }}
      >

        {FILTERS.map(filter => {

          const isActive =
            activeFilter === filter;

          return (

            <button
              key={filter}

              type="button"

              onClick={() =>
                setActiveFilter(filter)
              }

              style={{
                border: 'none',

                backgroundColor:
                  isActive
                    ? '#ffffff'
                    : 'transparent',

                color:
                  isActive
                    ? '#171B21'
                    : primaryText,

                borderRadius: '999px',

                padding:
                  isActive
                    ? '5px 13px'
                    : '5px 3px',

                fontFamily:
                  "'Montserrat', 'Segoe UI', sans-serif",

                fontSize: '10px',
                lineHeight: 1,

                fontWeight: 400,

                cursor: 'pointer'
              }}
            >
              {filter}
            </button>

          );

        })}

      </div>


      {/* Event list */}

      <div>

        {filteredEvents.length === 0 ? (

          <div
            style={{
              padding: '24px 0',

              textAlign: 'center',

              color: secondaryText,

              fontSize: '10px'
            }}
          >
            No upcoming events in this category.
          </div>

        ) : (

          filteredEvents.map(event => {

            const dateParts =
              formatDateParts(event.date);


            return (

              <div
                key={event.id}

                style={{
                  display: 'grid',

                  gridTemplateColumns:
                    '54px minmax(0, 1fr)',

                  columnGap: '12px',

                  alignItems: 'center',

                  minHeight: '57px',

                  padding: '3px 0',

                  boxSizing: 'border-box'
                }}
              >

                {/* Date */}

                <div
                  style={{
                    textAlign: 'center',

                    color: primaryText,

                    alignSelf: 'center'
                  }}
                >

                  <div
                    style={{
                      fontSize: '11px',

                      lineHeight: 1,

                      fontWeight: 400
                    }}
                  >
                    {dateParts.month}
                  </div>


                  <div
                    style={{
                      marginTop: '1px',

                      fontSize: '25px',

                      lineHeight: 0.95,

                      fontWeight: 300,

                      color: primaryText
                    }}
                  >
                    {dateParts.day}
                  </div>

                </div>


                {/* Event information */}

                <div
                  style={{
                    minWidth: 0
                  }}
                >

                  <div
                    style={{
                      color: primaryText,

                      fontSize: '11px',

                      lineHeight: 1.2,

                      fontWeight: 400,

                      marginBottom: '6px',

                      whiteSpace: 'normal'
                    }}
                  >
                    {event.title}
                  </div>


                  <div
                    style={{
                      display: 'flex',

                      alignItems: 'center',

                      flexWrap: 'wrap',

                      gap: '5px 13px',

                      color: secondaryText
                    }}
                  >

                    {/* Time */}

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',

                        gap: '5px',

                        fontSize: '9px',

                        lineHeight: 1
                      }}
                    >

                      <Clock16Regular
                        style={{
                          width: '13px',
                          height: '13px',

                          color: primaryText,

                          flexShrink: 0
                        }}
                      />

                      <span>
                        {event.time}
                      </span>

                    </div>


                    {/* Location */}

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',

                        gap: '5px',

                        fontSize: '9px',

                        lineHeight: 1
                      }}
                    >

                      <Location16Regular
                        style={{
                          width: '13px',
                          height: '13px',

                          color: primaryText,

                          flexShrink: 0
                        }}
                      />

                      <span>
                        {event.location}
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            );

          })

        )}

      </div>

    </section>

  );

};


export default Upcomingevents;