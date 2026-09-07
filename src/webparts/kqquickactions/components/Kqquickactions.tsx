import * as React from 'react';

import {
  CalendarLtr24Regular,
  Airplane24Regular,
  TicketDiagonal24Regular,
  Send24Regular,
  DocumentText24Regular,
  Shield24Regular,
  ArrowUpRight20Regular
} from '@fluentui/react-icons';

import {
  quickActions,
  QuickActionIcon
} from '../data/quickActionsData';

import quickActionsBg from '../assets/quick-actions-bg.svg';
import kqLogoBlack from '../assets/kqlogoblack.svg';

import type { IKqquickactionsProps } from './IKqquickactionsProps';


/* ============================================================
   ICON MAP
============================================================ */

const QUICK_ACTION_ICONS: Record<QuickActionIcon, React.ElementType> = {
  calendar: CalendarLtr24Regular,
  airplane: Airplane24Regular,
  ticket: TicketDiagonal24Regular,
  expense: Send24Regular,
  payslip: DocumentText24Regular,
  safety: Shield24Regular
};


/* ============================================================
   GREETING
============================================================ */

const getGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good morning';
  }

  if (hour < 17) {
    return 'Good afternoon';
  }

  return 'Good evening';
};


const getFirstName = (displayName?: string): string => {

  if (!displayName) {
    return 'Amina';
  }

  const cleanedName = displayName.trim();

  if (!cleanedName) {
    return 'Amina';
  }

  /*
   * Supports:
   * Ronald Ekajul
   * Ekajul, Ronald
   */
  if (cleanedName.indexOf(',') !== -1) {

    const parts = cleanedName.split(',');

    if (parts.length > 1 && parts[1].trim()) {
      return parts[1].trim().split(/\s+/)[0];
    }

  }

  return cleanedName.split(/\s+/)[0];
};


/* ============================================================
   COMPONENT STATE
============================================================ */

interface IKqquickactionsState {
  hoveredActionId: number | null;
}


/* ============================================================
   COMPONENT
============================================================ */

export default class Kqquickactions
  extends React.Component<
    IKqquickactionsProps,
    IKqquickactionsState
  > {

  public constructor(props: IKqquickactionsProps) {
    super(props);

    this.state = {
      hoveredActionId: null
    };
  }


  public render(): React.ReactElement<IKqquickactionsProps> {

    const { userDisplayName } = this.props;

    const greeting = getGreeting();
    const firstName = getFirstName(userDisplayName);


    return (

      <section
        style={{
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden',
          fontFamily: '"Segoe UI", Arial, Helvetica, sans-serif'
        }}
      >


        {/* ====================================================
            WELCOME
        ==================================================== */}

        <div
          style={{
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            marginBottom: '22px'
          }}
        >


          {/* Small heading + logo */}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '13px'
            }}
          >

            <span
              style={{
                color: '#1d1d1d',
                fontSize: '11px',
                lineHeight: 1,
                fontWeight: 700,
                letterSpacing: '0.03em',
                whiteSpace: 'nowrap'
              }}
            >
              KARIBU · WELCOME BACK
            </span>


            <span
              style={{
                display: 'block',
                width: '1px',
                height: '22px',
                flexShrink: 0,
                backgroundColor: '#333333'
              }}
            />


            <img
              src={kqLogoBlack}
              alt="KQ World"
              style={{
                display: 'block',
                width: '76px',
                height: 'auto',
                objectFit: 'contain'
              }}
            />

          </div>


          {/* Greeting */}

          <h2
            style={{
              margin: 0,
              padding: 0,

              color: '#ed1111',

              fontSize: 'clamp(18px, 1.6vw, 24px)',
              lineHeight: 1.2,

              fontWeight: 700,
              fontStyle: 'italic',

              letterSpacing: 0
            }}
          >
            {greeting}, {firstName}. Here&apos;s what&apos;s happening across KQ today.
          </h2>


          {/* Subtitle */}

          <p
            style={{
              margin: '12px 0 0 0',
              padding: 0,

              color: '#929292',

              fontSize: '13px',
              lineHeight: 1.45,

              fontWeight: 400
            }}
          >
            Your calm, single view of everything at the Pride of Africa — from the flight line to the front office.
          </p>

        </div>



        {/* ====================================================
            QUICK ACTIONS HERO
        ==================================================== */}

        <div
          style={{
            position: 'relative',

            width: '100%',
            maxWidth: '100%',

            minHeight: '315px',

            boxSizing: 'border-box',

            overflow: 'hidden',

            borderRadius: '14px',

            backgroundImage: `url(${quickActionsBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center right',
            backgroundRepeat: 'no-repeat',

            padding: '34px 38px 36px 38px'
          }}
        >


          <div
            style={{
              position: 'relative',
              zIndex: 2,

              width: '100%',
              maxWidth: '100%',

              boxSizing: 'border-box'
            }}
          >


            {/* QUICK ACTIONS */}

            <div
              style={{
                marginBottom: '9px',

                color: '#171717',

                fontSize: '10px',
                lineHeight: 1,

                fontWeight: 700,
                letterSpacing: '0.07em'
              }}
            >
              QUICK ACTIONS
            </div>


            {/* Heading */}

            <h3
              style={{
                margin: 0,
                padding: 0,

                color: '#111111',

                fontSize: 'clamp(19px, 1.6vw, 25px)',
                lineHeight: 1.15,

                fontWeight: 700,
                fontStyle: 'italic'
              }}
            >
              What can we get done today?
            </h3>



            {/* =================================================
                ACTION CARDS
            ================================================= */}

            <div
              style={{
                width: '100%',
                maxWidth: '100%',

                boxSizing: 'border-box',

                display: 'grid',

                gridTemplateColumns:
                  'repeat(6, minmax(0, 1fr))',

                gap: '14px',

                marginTop: '29px'
              }}
            >


              {quickActions.map((action) => {

                const Icon = QUICK_ACTION_ICONS[action.icon];

                const isHovered =
                  this.state.hoveredActionId === action.id;


                return (

                  <a
                    key={action.id}

                    href={action.url}

                    title={action.title}

                    onMouseEnter={() => {
                      this.setState({
                        hoveredActionId: action.id
                      });
                    }}

                    onMouseLeave={() => {
                      this.setState({
                        hoveredActionId: null
                      });
                    }}

                    onFocus={() => {
                      this.setState({
                        hoveredActionId: action.id
                      });
                    }}

                    onBlur={() => {
                      this.setState({
                        hoveredActionId: null
                      });
                    }}

                    style={{
                      display: 'block',

                      width: '100%',
                      minWidth: 0,

                      boxSizing: 'border-box',

                      color: 'inherit',
                      textDecoration: 'none',

                      outline: 'none'
                    }}
                  >


                    {/* CARD */}

                    <div
                      style={{
                        width: '100%',

                        aspectRatio: '1 / 1.05',

                        minHeight: '145px',
                        maxHeight: '165px',

                        boxSizing: 'border-box',

                        padding: '14px',

                        /*
                         * NORMAL = WHITE
                         * HOVER = ACTION COLOUR
                         */
                        backgroundColor:
                          isHovered
                            ? action.accent
                            : '#ffffff',

                        border:
                          isHovered
                            ? `1px solid ${action.accent}`
                            : '1px solid rgba(0, 0, 0, 0.13)',

                        borderRadius: '13px',

                        boxShadow:
                          isHovered
                            ? '0 6px 14px rgba(0,0,0,0.18)'
                            : '0 3px 8px rgba(0,0,0,0.11)',

                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',

                        overflow: 'hidden',

                        cursor: 'pointer',

                        /*
                         * Smooth Figma-style transition
                         */
                        transition:
                          'background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease',

                        transform:
                          isHovered
                            ? 'translateY(-2px)'
                            : 'translateY(0)'
                      }}
                    >


                      {/* TOP */}

                      <div
                        style={{
                          minWidth: 0
                        }}
                      >


                        {/* Icon circle */}

                        <div
                          style={{
                            width: '36px',
                            height: '36px',

                            flexShrink: 0,

                            borderRadius: '50%',

                            /*
                             * NORMAL:
                             * coloured circle
                             *
                             * HOVER:
                             * white circle
                             */
                            backgroundColor:
                              isHovered
                                ? '#ffffff'
                                : action.accent,

                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',

                            marginBottom: '14px',

                            transition:
                              'background-color 180ms ease'
                          }}
                        >

                          <Icon
                            style={{
                              width: '18px',
                              height: '18px',

                              /*
                               * NORMAL:
                               * white icon
                               *
                               * HOVER:
                               * coloured icon
                               */
                              color:
                                isHovered
                                  ? action.accent
                                  : '#ffffff',

                              transition:
                                'color 180ms ease'
                            }}
                          />

                        </div>


                        {/* Title */}

                        <div
                          style={{
                            /*
                             * NORMAL:
                             * dark title
                             *
                             * HOVER:
                             * white title
                             */
                            color:
                              isHovered
                                ? '#ffffff'
                                : '#292929',

                            fontSize: '12px',
                            lineHeight: 1.2,

                            fontWeight: 400,

                            overflowWrap: 'break-word',
                            wordBreak: 'normal',

                            transition:
                              'color 180ms ease'
                          }}
                        >
                          {action.title}
                        </div>

                      </div>



                      {/* START */}

                      <div
                        style={{
                          width: '100%',

                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',

                          /*
                           * NORMAL:
                           * action colour
                           *
                           * HOVER:
                           * white
                           */
                          color:
                            isHovered
                              ? '#ffffff'
                              : action.accent,

                          transition:
                            'color 180ms ease'
                        }}
                      >

                        <span
                          style={{
                            fontSize: '11px',
                            lineHeight: 1,
                            fontWeight: 500
                          }}
                        >
                          Start
                        </span>


                        <ArrowUpRight20Regular
                          style={{
                            width: '17px',
                            height: '17px',
                            flexShrink: 0
                          }}
                        />

                      </div>


                    </div>

                  </a>

                );

              })}

            </div>

          </div>

        </div>

      </section>

    );

  }

}