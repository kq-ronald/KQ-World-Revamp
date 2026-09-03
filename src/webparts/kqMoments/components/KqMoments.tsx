import * as React from 'react';

import {
  IKqMomentsProps
} from './IKqMomentsProps';

import {
  IKqMoment
} from '../models/IKqMoment';

import KqMomentsService
  from '../services/KqMomentsService';

interface IKqMomentsState {
  items: IKqMoment[];
  isLoading: boolean;
  errorMessage: string;
  windowWidth: number;
  hoveredId?: number;
}

export default class KqMoments
  extends React.Component<
    IKqMomentsProps,
    IKqMomentsState
  > {

  private readonly _momentsService:
    KqMomentsService;

  public constructor(
    props: IKqMomentsProps
  ) {
    super(props);

    this._momentsService =
      new KqMomentsService(
        this.props.context
      );

    this.state = {
      items: [],
      isLoading: true,
      errorMessage: '',
      windowWidth:
        window.innerWidth,
      hoveredId:
        undefined
    };
  }

  public async componentDidMount():
    Promise<void> {

    window.addEventListener(
      'resize',
      this._handleResize
    );

    await this._loadMoments();
  }

  public componentWillUnmount():
    void {

    window.removeEventListener(
      'resize',
      this._handleResize
    );
  }

  private _handleResize = ():
    void => {

    this.setState({
      windowWidth:
        window.innerWidth
    });
  };

  private async _loadMoments():
    Promise<void> {

    try {
      this.setState({
        isLoading: true,
        errorMessage: ''
      });

      const items =
        await this._momentsService
          .getMoments();

      this.setState({
        items,
        isLoading: false
      });

    } catch (error) {

      console.error(
        'KQ Moments error:',
        error
      );

      this.setState({
        isLoading: false,
        errorMessage:
          error instanceof Error
            ? error.message
            : 'Unable to load KQ Moments.'
      });
    }
  }

  private _openMoment(
    item: IKqMoment
  ): void {

    if (!item.galleryUrl) {
      return;
    }

    window.open(
      item.galleryUrl,
      '_blank',
      'noopener,noreferrer'
    );
  }

  private _renderMomentCard(
    item: IKqMoment,
    layout:
      'tall'
      | 'wide'
  ): React.ReactElement {

    const isHovered =
      this.state.hoveredId ===
      item.id;

    return (
      <button
        key={item.id}
        type="button"
        aria-label={
          item.title
        }
        onClick={() =>
          this._openMoment(
            item
          )
        }
        onMouseEnter={() =>
          this.setState({
            hoveredId:
              item.id
          })
        }
        onMouseLeave={() =>
          this.setState({
            hoveredId:
              undefined
          })
        }
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight:
            layout === 'tall'
              ? 500
              : 240,
          border: 'none',
          padding: 0,
          margin: 0,
          borderRadius: 16,
          overflow: 'hidden',
          cursor:
            item.galleryUrl
              ? 'pointer'
              : 'default',
          background: '#f4f4f4',
          display: 'block',
          boxShadow:
            isHovered
              ? '0 14px 30px rgba(0,0,0,.15)'
              : 'none',
          transform:
            isHovered
              ? 'translateY(-3px)'
              : 'translateY(0)',
          transition:
            'transform .2s ease, box-shadow .2s ease'
        }}
      >
        <img
          src={item.imageUrl}
          alt={item.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition:
              'transform .35s ease',
            transform:
              isHovered
                ? 'scale(1.025)'
                : 'scale(1)'
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              isHovered
                ? 'linear-gradient(to top, rgba(0,0,0,.58), rgba(0,0,0,.02) 55%)'
                : 'linear-gradient(to top, rgba(0,0,0,.22), rgba(0,0,0,0) 45%)',
            transition:
              'background .2s ease'
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: 20,
            right: 20,
            bottom: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'space-between',
            gap: 12,
            color: '#ffffff',
            opacity:
              isHovered
                ? 1
                : 0,
            transform:
              isHovered
                ? 'translateY(0)'
                : 'translateY(8px)',
            transition:
              'opacity .2s ease, transform .2s ease',
            textAlign: 'left'
          }}
        >
          <span
            style={{
              fontSize: 15,
              lineHeight: 1.3,
              fontWeight: 700
            }}
          >
            {item.title}
          </span>

          <span
            style={{
              width: 30,
              height: 30,
              minWidth: 30,
              borderRadius:
                '50%',
              display: 'flex',
              alignItems:
                'center',
              justifyContent:
                'center',
              background:
                '#ffffff',
              color:
                '#ed1c24',
              fontSize: 15
            }}
          >
            →
          </span>
        </div>
      </button>
    );
  }

  private _getGalleryUrl():
    string {

    /*
     * Replace this once the exact
     * internal gallery URL is confirmed.
     *
     * For now this safely opens the
     * underlying Events list.
     */
    return (
      `${window.location.origin}` +
      '/homepage/Lists/Events/AllItems.aspx'
    );
  }

  public render():
    React.ReactElement<
      IKqMomentsProps
    > {

    const {
      items,
      isLoading,
      errorMessage,
      windowWidth
    } = this.state;

    const mobile =
      windowWidth <= 640;

    const tablet =
      windowWidth > 640 &&
      windowWidth <= 1024;

    const first =
      items[0];

    const second =
      items[1];

    const third =
      items[2];

    const fourth =
      items[3];

    return (
      <section
        style={{
          width: '100%',
          boxSizing:
            'border-box',
          padding:
            '28px 0 42px'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems:
              mobile
                ? 'flex-start'
                : 'flex-end',
            justifyContent:
              'space-between',
            flexDirection:
              mobile
                ? 'column'
                : 'row',
            gap: 18,
            marginBottom: 30
          }}
        >
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color:
                  '#111111',
                marginBottom: 12
              }}
            >
              #KQMOMENTS
            </div>

            <h2
              style={{
                margin: 0,
                color:
                  '#ed1c24',
                fontSize:
                  mobile
                    ? 27
                    : 32,
                lineHeight: 1.1,
                fontWeight: 700,
                fontStyle:
                  'italic'
              }}
            >
              Life at Kenya Airways
            </h2>
          </div>

          <a
            href={
              this._getGalleryUrl()
            }
            target="_blank"
            rel="noreferrer"
            style={{
              width:
                mobile
                  ? '100%'
                  : 220,
              padding:
                '12px 22px',
              border:
                '1px solid #ed1c24',
              borderRadius: 999,
              boxSizing:
                'border-box',
              color:
                '#ed1c24',
              background:
                '#ffffff',
              textDecoration:
                'none',
              textAlign:
                'center',
              fontSize: 14,
              fontWeight: 700
            }}
          >
            Open Gallery
            &nbsp;&nbsp; →
          </a>
        </div>

        {isLoading && (
          <div
            style={{
              padding: 50,
              textAlign:
                'center',
              color:
                '#667085'
            }}
          >
            Loading KQ Moments...
          </div>
        )}

        {!isLoading &&
          errorMessage && (
            <div
              style={{
                padding: 20,
                color:
                  '#b42318',
                background:
                  '#fef3f2',
                border:
                  '1px solid #f04438',
                borderRadius: 10
              }}
            >
              {errorMessage}
            </div>
          )}

        {!isLoading &&
          !errorMessage &&
          items.length === 0 && (
            <div
              style={{
                padding: 50,
                textAlign:
                  'center',
                color:
                  '#667085'
              }}
            >
              No KQ Moments found.
            </div>
          )}

        {!isLoading &&
          !errorMessage &&
          items.length > 0 && (

            mobile ? (

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '1fr',
                  gap: 14
                }}
              >
                {items.map(
                  (
                    item:
                      IKqMoment
                  ) => (
                    <div
                      key={item.id}
                      style={{
                        minHeight:
                          280
                      }}
                    >
                      {this._renderMomentCard(
                        item,
                        'wide'
                      )}
                    </div>
                  )
                )}
              </div>

            ) : tablet ? (

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(2, minmax(0, 1fr))',
                  gap: 16
                }}
              >
                {items.map(
                  (
                    item:
                      IKqMoment
                  ) => (
                    <div
                      key={item.id}
                      style={{
                        minHeight:
                          310
                      }}
                    >
                      {this._renderMomentCard(
                        item,
                        'wide'
                      )}
                    </div>
                  )
                )}
              </div>

            ) : (

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '1.05fr 1fr 1fr 1.05fr',
                  gridTemplateRows:
                    '260px 260px',
                  gap: 16,
                  width: '100%'
                }}
              >
                {first && (
                  <div
                    style={{
                      gridColumn:
                        '1',
                      gridRow:
                        '1 / span 2',
                      minWidth: 0
                    }}
                  >
                    {this._renderMomentCard(
                      first,
                      'tall'
                    )}
                  </div>
                )}

                {second && (
                  <div
                    style={{
                      gridColumn:
                        '2',
                      gridRow:
                        '1',
                      minWidth: 0
                    }}
                  >
                    {this._renderMomentCard(
                      second,
                      'wide'
                    )}
                  </div>
                )}

                {third && (
                  <div
                    style={{
                      gridColumn:
                        '2 / span 2',
                      gridRow:
                        '2',
                      minWidth: 0
                    }}
                  >
                    {this._renderMomentCard(
                      third,
                      'wide'
                    )}
                  </div>
                )}

                {fourth && (
                  <div
                    style={{
                      gridColumn:
                        '4',
                      gridRow:
                        '1 / span 2',
                      minWidth: 0
                    }}
                  >
                    {this._renderMomentCard(
                      fourth,
                      'tall'
                    )}
                  </div>
                )}

                {items.length >= 3 && (
                  <div
                    style={{
                      gridColumn:
                        '3',
                      gridRow:
                        '1',
                      minWidth: 0
                    }}
                  >
                    {this._renderMomentCard(
                      third,
                      'wide'
                    )}
                  </div>
                )}
              </div>
            )
          )}
      </section>
    );
  }
}