import * as React from 'react';
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

  const filteredEvents: IUpcomingEvent[] = React.useMemo(() => {
    if (activeFilter === 'All') {
      return upcomingEvents;
    }

    return upcomingEvents.filter(
      event => event.category === activeFilter
    );
  }, [activeFilter]);

  const formatDateParts = (dateString: string): {
    month: string;
    day: string;
  } => {
    const date = new Date(`${dateString}T00:00:00`);

    return {
      month: date
        .toLocaleString('en-US', { month: 'short' })
        .toUpperCase(),
     day: ('0' + date.getDate()).slice(-2)
    };
  };

  return (
    <section
      style={{
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        border: '1px solid #dedede',
        borderRadius: '12px',
        padding: '26px 18px 24px 18px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        fontFamily:
          '"Segoe UI", Arial, Helvetica, sans-serif'
      }}
    >
      <div
        style={{
          marginBottom: '18px'
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.14em',
            color: '#8b8b8b',
            textTransform: 'uppercase',
            marginBottom: '6px'
          }}
        >
          Coming up
        </div>

        <div
          style={{
            fontSize: '14px',
            color: '#4d4d4d'
          }}
        >
          Next 30 days · {upcomingEvents.length} events
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '22px',
          flexWrap: 'wrap'
        }}
      >
        {FILTERS.map(filter => {
          const isActive = activeFilter === filter;

          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              style={{
                border: isActive
                  ? '1px solid #111111'
                  : '1px solid #d8d8d8',
                backgroundColor: isActive
                  ? '#111111'
                  : '#ffffff',
                color: isActive
                  ? '#ffffff'
                  : '#444444',
                borderRadius: '999px',
                padding: '7px 14px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                lineHeight: 1
              }}
            >
              {filter}
            </button>
          );
        })}
      </div>

      <div>
        {filteredEvents.length === 0 ? (
          <div
            style={{
              padding: '24px 0',
              textAlign: 'center',
              color: '#8a8a8a',
              fontSize: '13px'
            }}
          >
            No upcoming events in this category.
          </div>
        ) : (
          filteredEvents.map((event, index) => {
            const dateParts = formatDateParts(event.date);

            return (
              <div
                key={event.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '62px 1fr',
                  gap: '16px',
                  alignItems: 'center',
                  padding: '16px 0',
                  borderBottom:
                    index !== filteredEvents.length - 1
                      ? '1px solid #eeeeee'
                      : 'none'
                }}
              >
                <div
                  style={{
                    textAlign: 'center',
                    borderRight: '1px solid #eeeeee',
                    paddingRight: '12px'
                  }}
                >
                  <div
                    style={{
                      color: '#d71920',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      lineHeight: 1.2
                    }}
                  >
                    {dateParts.month}
                  </div>

                  <div
                    style={{
                      fontSize: '30px',
                      fontWeight: 300,
                      color: '#777777',
                      lineHeight: 1.1,
                      marginTop: '4px'
                    }}
                  >
                    {dateParts.day}
                  </div>
                </div>

                <div
                  style={{
                    minWidth: 0
                  }}
                >
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#202020',
                      lineHeight: 1.35,
                      marginBottom: '5px'
                    }}
                  >
                    {event.title}
                  </div>

                  <div
                    style={{
                      fontSize: '12px',
                      color: '#8a8a8a',
                      lineHeight: 1.4
                    }}
                  >
                    {event.time}
                    {' · '}
                    {event.location}
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