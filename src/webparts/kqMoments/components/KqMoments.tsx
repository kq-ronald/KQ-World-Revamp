import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {
  IKqMomentsProps
} from './IKqMomentsProps';

import {
  IKqMoment
} from '../models/IKqMoment';

import KqMomentsService
  from '../services/KqMomentsService';

import KqMomentsLanding
  from './KqMomentsLanding';

import KqGalleryViewer
  from './KqGalleryViewer';

import styles
  from './KqMoments.module.scss';


type KqMomentsView =
  'home' |
  'moments' |
  'gallery';


interface IKqMomentsState {

  items:
    IKqMoment[];

  isLoading:
    boolean;

  errorMessage:
    string;

  hoveredId?:
    number;

  isDarkMode:
    boolean;

  currentView:
    KqMomentsView;

  selectedGallery?:
    IKqMoment;

  portalTop:
    number;
}


export default class KqMoments
  extends React.Component<
    IKqMomentsProps,
    IKqMomentsState
  > {

  private readonly rootRef =
    React.createRef<HTMLElement>();

  private layoutCleanup?:
    () => void;

  private disposed =
    false;

  private readonly _momentsService:
    KqMomentsService;


  public constructor(
    props:
      IKqMomentsProps
  ) {

    super(props);


    this._momentsService =
      new KqMomentsService(
        this.props.context
      );


    const currentTheme =
      typeof document !==
        'undefined'
        ? document.documentElement
            .getAttribute(
              'data-kq-theme'
            )
        : 'light';


    const currentView =
      this._getViewFromUrl();


    this.state = {

      items:
        [],

      isLoading:
        true,

      errorMessage:
        '',

      hoveredId:
        undefined,

      isDarkMode:
        currentTheme ===
          'dark',

      currentView,

      selectedGallery:
        undefined,

      portalTop:
        0

    };
  }


  /* ============================================================
     SHAREPOINT LAYOUT
     ============================================================ */

  private setupLayout():
    void {

    const root =
      this.rootRef.current;

    const zone =
      root?.closest<HTMLElement>(
        '[data-automation-id="CanvasZone"]'
      );


    if (
      !root ||
      !zone ||
      zone.querySelector(
        '.kqWorldNavigationHost'
      ) ||
      zone.querySelectorAll(
        '[data-automation-id="CanvasControl"]'
      ).length !== 1
    ) {
      return;
    }


    const marked:
      Array<{
        element:
          HTMLElement;
        attribute:
          string;
        previous:
          string | null;
      }> = [];


    const mark = (
      element:
        HTMLElement,
      attribute:
        string
    ): void => {

      marked.push({
        element,
        attribute,
        previous:
          element.getAttribute(
            attribute
          )
      });


      element.setAttribute(
        attribute,
        'true'
      );
    };


    mark(
      zone,
      'data-kq-moments-zone'
    );


    const canvas =
      zone.closest<HTMLElement>(
        '[data-automation-id="CanvasLayout"]'
      );


    let outer =
      zone.parentElement;


    while (
      outer &&
      outer !== canvas &&
      canvas &&
      outer.querySelectorAll(
        '[data-automation-id="CanvasZone"]'
      ).length === 1 &&
      !outer.querySelector(
        '.kqWorldNavigationHost'
      )
    ) {

      mark(
        outer,
        'data-kq-moments-wrapper'
      );

      outer =
        outer.parentElement;
    }


    let wrapper =
      root.parentElement;


    while (
      wrapper &&
      wrapper !== zone
    ) {

      mark(
        wrapper,
        'data-kq-moments-wrapper'
      );

      wrapper =
        wrapper.parentElement;
    }


    this.layoutCleanup =
      () => {

        marked.forEach(
          ({
            element,
            attribute,
            previous
          }) => {

            if (
              previous === null
            ) {

              element.removeAttribute(
                attribute
              );

            } else {

              element.setAttribute(
                attribute,
                previous
              );
            }

          }
        );
      };
  }


  /* ============================================================
     LIFECYCLE
     ============================================================ */

  public async componentDidMount():
    Promise<void> {

    window.addEventListener(
      'kqworld-theme-change',
      this._handleThemeChange as EventListener
    );


    window.addEventListener(
      'popstate',
      this._handleBrowserNavigation
    );


    window.addEventListener(
      'resize',
      this._updatePortalTop
    );


    const currentTheme =
      document.documentElement
        .getAttribute(
          'data-kq-theme'
        );


    this.setState({
      isDarkMode:
        currentTheme ===
          'dark'
    });


    this.setupLayout();


    await this._loadMoments();


    this._syncViewFromUrl();
  }


  public componentWillUnmount():
    void {

    this.disposed =
      true;


    this.layoutCleanup?.();


    window.removeEventListener(
      'kqworld-theme-change',
      this._handleThemeChange as EventListener
    );


    window.removeEventListener(
      'popstate',
      this._handleBrowserNavigation
    );


    window.removeEventListener(
      'resize',
      this._updatePortalTop
    );


    this._unlockPageScroll();
  }


  /* ============================================================
     THEME
     ============================================================ */

  private _handleThemeChange = (
    event:
      CustomEvent
  ): void => {

    const theme =
      event.detail?.theme;


    this.setState({
      isDarkMode:
        theme ===
          'dark'
    });
  };


  /* ============================================================
     LOAD MOMENTS
     ============================================================ */

  private async _loadMoments():
    Promise<void> {

    try {

      this.setState({
        isLoading:
          true,

        errorMessage:
          ''
      });


      const items =
        await this._momentsService
          .getMoments();


      if (
        this.disposed
      ) {
        return;
      }


      this.setState(
        {
          items,
          isLoading:
            false
        },
        () => {

          /*
           * Important:
           * If the page was refreshed while inside a gallery,
           * we can now resolve the gallery ID from the URL
           * after the Moments data has loaded.
           */

          this._syncViewFromUrl();
        }
      );


    } catch (
      error
    ) {

      if (
        this.disposed
      ) {
        return;
      }


      console.error(
        'KQ Moments error:',
        error
      );


      this.setState({

        isLoading:
          false,

        errorMessage:
          error instanceof Error
            ? error.message
            : 'Unable to load KQ Moments.'

      });
    }
  }


  /* ============================================================
     ROUTING
     ============================================================ */

  private _getViewFromUrl():
    KqMomentsView {

    if (
      typeof window ===
        'undefined'
    ) {

      return 'home';
    }


    const params =
      new URLSearchParams(
        window.location.search
      );


    const view =
      params.get(
        'kqView'
      );


    if (
      view ===
        'gallery'
    ) {

      return 'gallery';
    }


    if (
      view ===
        'moments'
    ) {

      return 'moments';
    }


    return 'home';
  }


  private _getGalleryIdFromUrl():
    number |
    undefined {

    if (
      typeof window ===
        'undefined'
    ) {

      return undefined;
    }


    const params =
      new URLSearchParams(
        window.location.search
      );


    const rawGalleryId =
      params.get(
        'gallery'
      );


    if (
      !rawGalleryId
    ) {

      return undefined;
    }


    const galleryId =
      Number(
        rawGalleryId
      );


    return Number.isFinite(
      galleryId
    )
      ? galleryId
      : undefined;
  }


  private _findGalleryById(
    galleryId:
      number |
      undefined
  ): IKqMoment |
    undefined {

    if (
      galleryId ===
        undefined
    ) {

      return undefined;
    }


    return this.state.items.find(
      (
        item:
          IKqMoment
      ) =>
        item.id ===
          galleryId
    );
  }


  private _syncViewFromUrl():
    void {

    const view =
      this._getViewFromUrl();


    if (
      view ===
        'home'
    ) {

      this._unlockPageScroll();


      this.setState({
        currentView:
          'home',

        selectedGallery:
          undefined
      });


      return;
    }


    this._updatePortalTop();

    this._lockPageScroll();


    if (
      view ===
        'gallery'
    ) {

      const galleryId =
        this._getGalleryIdFromUrl();


      const selectedGallery =
        this._findGalleryById(
          galleryId
        );


      /*
       * If data has not loaded yet,
       * keep the gallery route.
       * _loadMoments() calls this again
       * once items are available.
       */

      this.setState({
        currentView:
          'gallery',

        selectedGallery
      });


      return;
    }


    this.setState({
      currentView:
        'moments',

      selectedGallery:
        undefined
    });
  }


  private _handleBrowserNavigation =
    (): void => {

      this._syncViewFromUrl();
    };


  /* ============================================================
     OPEN MOMENTS LANDING
     ============================================================ */

  private _openMomentsLanding =
    (): void => {

      this._updatePortalTop();

      this._lockPageScroll();


      const url =
        new URL(
          window.location.href
        );


      url.searchParams.set(
        'kqView',
        'moments'
      );


      url.searchParams.delete(
        'gallery'
      );


      window.history.pushState(
        {
          kqView:
            'moments'
        },
        '',
        url.toString()
      );


      this.setState({
        currentView:
          'moments',

        selectedGallery:
          undefined
      });
    };


  /* ============================================================
     OPEN INTERNAL GALLERY
     ============================================================ */

  private _openGalleryFromLanding = (
    item:
      IKqMoment
  ): void => {

    /*
     * NO window.open().
     *
     * We remain completely inside KQ World.
     */

    this._updatePortalTop();

    this._lockPageScroll();


    const url =
      new URL(
        window.location.href
      );


    url.searchParams.set(
      'kqView',
      'gallery'
    );


    url.searchParams.set(
      'gallery',
      item.id.toString()
    );


    window.history.pushState(
      {
        kqView:
          'gallery',

        gallery:
          item.id
      },
      '',
      url.toString()
    );


    this.setState({
      currentView:
        'gallery',

      selectedGallery:
        item
    });
  };


  /* ============================================================
     BACK FROM GALLERY
     ============================================================ */

  private _backToMoments =
    (): void => {

      const url =
        new URL(
          window.location.href
        );


      url.searchParams.set(
        'kqView',
        'moments'
      );


      url.searchParams.delete(
        'gallery'
      );


      window.history.pushState(
        {
          kqView:
            'moments'
        },
        '',
        url.toString()
      );


      this.setState({
        currentView:
          'moments',

        selectedGallery:
          undefined
      });
    };


  /* ============================================================
     BACK TO KQ WORLD
     ============================================================ */

  private _backToKqWorld =
    (): void => {

      const url =
        new URL(
          window.location.href
        );


      url.searchParams.delete(
        'kqView'
      );


      url.searchParams.delete(
        'gallery'
      );


      window.history.pushState(
        {
          kqView:
            'home'
        },
        '',
        url.toString()
      );


      this._unlockPageScroll();


      this.setState({
        currentView:
          'home',

        selectedGallery:
          undefined
      });
    };


  /* ============================================================
     PORTAL POSITION
     ============================================================ */

  private _updatePortalTop =
    (): void => {

      const navigation =
        document.querySelector(
          '.kqWorldNavigationStickyHost'
        ) as HTMLElement | null;


      if (
        !navigation
      ) {

        this.setState({
          portalTop:
            0
        });


        return;
      }


      const rect =
        navigation
          .getBoundingClientRect();


      const portalTop =
        Math.max(
          0,
          Math.round(
            rect.bottom
          )
        );


      this.setState({
        portalTop
      });
    };


  /* ============================================================
     PAGE SCROLL
     ============================================================ */

  private _lockPageScroll():
    void {

    document.documentElement
      .setAttribute(
        'data-kq-moments-open',
        'true'
      );


    document.body
      .setAttribute(
        'data-kq-moments-open',
        'true'
      );
  }


  private _unlockPageScroll():
    void {

    document.documentElement
      .removeAttribute(
        'data-kq-moments-open'
      );


    document.body
      .removeAttribute(
        'data-kq-moments-open'
      );
  }


  /* ============================================================
     HOMEPAGE MOMENT CARD
     ============================================================ */

  private _openMoment(
    item:
      IKqMoment
  ): void {

    if (
      !item
    ) {
      return;
    }


    /*
     * Homepage card opens the selected gallery
     * directly inside KQ World.
     */

    this._openGalleryFromLanding(
      item
    );
  }


  private _renderMomentCard(
    item:
      IKqMoment,

    layout:
      'tall' |
      'wide'

  ): React.ReactElement {

    const isHovered =
      this.state.hoveredId ===
        item.id;


    return (

      <button

        key={
          item.id
        }

        type="button"

        aria-label={
          `${item.title}. Open KQ Moments gallery.`
        }

        onClick={
          () =>
            this._openMoment(
              item
            )
        }

        onMouseEnter={
          () =>
            this.setState({
              hoveredId:
                item.id
            })
        }

        onMouseLeave={
          () =>
            this.setState({
              hoveredId:
                undefined
            })
        }

        className={[
          styles.momentCard,

          layout ===
            'tall'
            ? styles.tallCard
            : styles.wideCard,

          isHovered
            ? styles.momentCardHovered
            : ''

        ]
          .filter(Boolean)
          .join(' ')}

      >

        <img

          src={
            item.imageUrl
          }

          alt={
            item.title
          }

          className={[
            styles.momentImage,

            isHovered
              ? styles.momentImageHovered
              : ''

          ]
            .filter(Boolean)
            .join(' ')}

        />


        <div
          className={[
            styles.momentOverlay,

            isHovered
              ? styles.momentOverlayHovered
              : ''

          ]
            .filter(Boolean)
            .join(' ')}
        />


        <div
          className={
            styles.momentInfo
          }
        >

          <span
            className={
              styles.momentText
            }
          >

            <span
              className={
                styles.momentTitle
              }
            >
              {item.title}
            </span>


            <span
              className={
                styles.momentSubtext
              }
            >
              Visit, View, or Download Resource
            </span>

          </span>


          <span
            className={
              styles.momentArrow
            }
            aria-hidden="true"
          >
            →
          </span>

        </div>

      </button>
    );
  }


  /* ============================================================
     FULL PAGE PORTAL
     ============================================================ */

  private _renderMomentsPortal():
    React.ReactPortal |
    null {

    const {
      currentView,
      selectedGallery,
      isDarkMode,
      items
    } = this.state;


    if (
      currentView ===
        'home'
    ) {

      return null;
    }


    let content:
      React.ReactNode;


    /*
     * GALLERY VIEWER
     */

    if (
      currentView ===
        'gallery'
    ) {

      if (
        selectedGallery
      ) {

        content = (

          <KqGalleryViewer

            context={
              this.props.context
            }

            gallery={
              selectedGallery
            }

            isDarkMode={
              isDarkMode
            }

            onBack={
              this._backToMoments
            }

          />

        );

      } else if (
        this.state.isLoading
      ) {

        content = (

          <div
            style={{
              padding:
                '60px 110px',
              fontFamily:
                '"Montserrat", Arial, Helvetica, sans-serif'
            }}
          >
            Loading gallery...
          </div>

        );

      } else {

        content = (

          <div
            style={{
              padding:
                '60px 110px',
              fontFamily:
                '"Montserrat", Arial, Helvetica, sans-serif'
            }}
          >

            <button
              type="button"
              onClick={
                this._backToMoments
              }
              style={{
                marginBottom:
                  '24px',
                cursor:
                  'pointer'
              }}
            >
              ← Back to KQ Moments
            </button>


            <div>
              This gallery could not be found.
            </div>

          </div>

        );
      }


    } else {

      /*
       * MOMENTS LANDING PAGE
       */

      content = (

        <KqMomentsLanding

          items={
            items
          }

          isDarkMode={
            isDarkMode
          }

          onBack={
            this._backToKqWorld
          }

          onOpenGallery={
            this._openGalleryFromLanding
          }

        />

      );
    }


    const portalContent =
      (

        <div

          className={[
            styles.momentsPagePortal,

            isDarkMode
              ? styles.momentsPagePortalDark
              : ''

          ]
            .filter(Boolean)
            .join(' ')}

          style={{
            top:
              `${this.state.portalTop}px`
          }}

        >

          {content}

        </div>
      );


    return ReactDOM.createPortal(
      portalContent,
      document.body
    );
  }


  /* ============================================================
     RENDER
     ============================================================ */

  public render():
    React.ReactElement<
      IKqMomentsProps
    > {

    const {

      items,

      isLoading,

      errorMessage,

      isDarkMode

    } = this.state;


    /*
     * Homepage remains the existing
     * 1 tall + 4 wide/tall arrangement.
     */

    const first =
      items[0];

    const second =
      items[1];

    const third =
      items[2];

    const fourth =
      items[3];

    const fifth =
      items[4];


    return (

      <>

        <section
          id="kq-moments"

          ref={
            this.rootRef
          }

          className={[
            styles.kqMoments,

            isDarkMode
              ? styles.darkMode
              : ''

          ]
            .filter(Boolean)
            .join(' ')}

        >

          <div
            className={
              styles.header
            }
          >

            <div>

              <div
                className={
                  styles.eyebrow
                }
              >
                #KQMOMENTS
              </div>


              <h2
                className={
                  styles.sectionTitle
                }
              >
                Life at Kenya Airways
              </h2>

            </div>


            <button

              type="button"

              className={
                styles.galleryLink
              }

              onClick={
                this._openMomentsLanding
              }

            >
              Open Gallery

              <span
                aria-hidden="true"
              >
                →
              </span>

            </button>

          </div>


          {
            isLoading && (

              <div
                className={
                  styles.message
                }
              >
                Loading KQ Moments...
              </div>

            )
          }


          {
            !isLoading &&
            errorMessage && (

              <div
                className={
                  styles.error
                }
              >
                {errorMessage}
              </div>

            )
          }


          {
            !isLoading &&
            !errorMessage &&
            items.length ===
              0 && (

              <div
                className={
                  styles.message
                }
              >
                No KQ Moments found.
              </div>

            )
          }


          {
            !isLoading &&
            !errorMessage &&
            items.length >
              0 && (

              <div
                className={
                  styles.momentsGrid
                }
              >

                {
                  first && (

                    <div
                      className={
                        styles.slotOne
                      }
                    >

                      {
                        this._renderMomentCard(
                          first,
                          'tall'
                        )
                      }

                    </div>

                  )
                }


                {
                  second && (

                    <div
                      className={
                        styles.slotTwo
                      }
                    >

                      {
                        this._renderMomentCard(
                          second,
                          'wide'
                        )
                      }

                    </div>

                  )
                }


                {
                  third && (

                    <div
                      className={
                        styles.slotThree
                      }
                    >

                      {
                        this._renderMomentCard(
                          third,
                          'wide'
                        )
                      }

                    </div>

                  )
                }


                {
                  fourth && (

                    <div
                      className={
                        styles.slotFour
                      }
                    >

                      {
                        this._renderMomentCard(
                          fourth,
                          'tall'
                        )
                      }

                    </div>

                  )
                }


                {
                  fifth && (

                    <div
                      className={
                        styles.slotFive
                      }
                    >

                      {
                        this._renderMomentCard(
                          fifth,
                          'wide'
                        )
                      }

                    </div>

                  )
                }

              </div>

            )
          }

        </section>


        {
          this._renderMomentsPortal()
        }

      </>
    );
  }
}