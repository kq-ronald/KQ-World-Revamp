import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {
  IKqMoment,
  IKqGalleryImage
} from '../models/IKqMoment';

import KqMomentsService
  from '../services/KqMomentsService';

import {
  WebPartContext
} from '@microsoft/sp-webpart-base';

import styles
  from './KqGalleryViewer.module.scss';


export interface IKqGalleryViewerProps {

  context:
    WebPartContext;

  gallery:
    IKqMoment;

  isDarkMode:
    boolean;

  onBack:
    () => void;
}


interface IKqGalleryViewerState {

  images:
    IKqGalleryImage[];

  isLoading:
    boolean;

  errorMessage:
    string;

  selectedIndex?:
    number;
}


export default class KqGalleryViewer
  extends React.Component<
    IKqGalleryViewerProps,
    IKqGalleryViewerState
  > {

  private readonly _service:
    KqMomentsService;


  public constructor(
    props:
      IKqGalleryViewerProps
  ) {

    super(props);


    this._service =
      new KqMomentsService(
        props.context
      );


    this.state = {

      images:
        [],

      isLoading:
        true,

      errorMessage:
        '',

      selectedIndex:
        undefined

    };
  }


  /* ============================================================
     LIFECYCLE
     ============================================================ */

  public async componentDidMount():
    Promise<void> {

    document.addEventListener(
      'keydown',
      this._handleKeyDown
    );


    await this._loadImages();
  }


  public componentWillUnmount():
    void {

    document.removeEventListener(
      'keydown',
      this._handleKeyDown
    );


    /*
     * Safety cleanup.
     *
     * If the user leaves the gallery while the lightbox
     * is open, restore the KQ/SharePoint shell.
     */

    this._disableLightboxMode();
  }


  /* ============================================================
     LOAD IMAGES
     ============================================================ */

  private async _loadImages():
    Promise<void> {

    try {

      this.setState({

        isLoading:
          true,

        errorMessage:
          ''

      });


      const images =
        await this._service
          .getGalleryImages(
            this.props
              .gallery
              .galleryUrl
          );


      this.setState({

        images,

        isLoading:
          false

      });


    } catch (
      error
    ) {

      console.error(
        'Unable to load KQ Moments gallery:',
        error
      );


      this.setState({

        isLoading:
          false,

        errorMessage:
          error instanceof Error
            ? error.message
            : 'Unable to load this gallery.'

      });
    }
  }


  /* ============================================================
     LIGHTBOX MODE
     ============================================================ */

  private _enableLightboxMode():
    void {

    document.documentElement
      .setAttribute(
        'data-kq-lightbox-open',
        'true'
      );


    document.body
      .setAttribute(
        'data-kq-lightbox-open',
        'true'
      );
  }


  private _disableLightboxMode():
    void {

    document.documentElement
      .removeAttribute(
        'data-kq-lightbox-open'
      );


    document.body
      .removeAttribute(
        'data-kq-lightbox-open'
      );
  }


  /* ============================================================
     OPEN IMAGE
     ============================================================ */

  private _openImage = (
    index:
      number
  ): void => {

    this._enableLightboxMode();


    this.setState({

      selectedIndex:
        index

    });
  };


  /* ============================================================
     CLOSE IMAGE
     ============================================================ */

  private _closeImage =
    (): void => {

      this._disableLightboxMode();


      this.setState({

        selectedIndex:
          undefined

      });
    };


  /* ============================================================
     PREVIOUS IMAGE
     ============================================================ */

  private _showPrevious =
    (): void => {

      const {

        selectedIndex,

        images

      } = this.state;


      if (
        selectedIndex ===
          undefined ||
        images.length ===
          0
      ) {

        return;
      }


      const nextIndex =
        selectedIndex ===
          0
          ? images.length - 1
          : selectedIndex - 1;


      this.setState({

        selectedIndex:
          nextIndex

      });
    };


  /* ============================================================
     NEXT IMAGE
     ============================================================ */

  private _showNext =
    (): void => {

      const {

        selectedIndex,

        images

      } = this.state;


      if (
        selectedIndex ===
          undefined ||
        images.length ===
          0
      ) {

        return;
      }


      const nextIndex =
        selectedIndex ===
          images.length - 1
          ? 0
          : selectedIndex + 1;


      this.setState({

        selectedIndex:
          nextIndex

      });
    };


  /* ============================================================
     KEYBOARD
     ============================================================ */

  private _handleKeyDown = (
    event:
      KeyboardEvent
  ): void => {

    if (
      this.state.selectedIndex ===
        undefined
    ) {

      return;
    }


    if (
      event.key ===
        'Escape'
    ) {

      event.preventDefault();

      this._closeImage();


    } else if (
      event.key ===
        'ArrowLeft'
    ) {

      event.preventDefault();

      this._showPrevious();


    } else if (
      event.key ===
        'ArrowRight'
    ) {

      event.preventDefault();

      this._showNext();
    }
  };


  /* ============================================================
     LIGHTBOX
     ============================================================ */

  private _renderLightbox():
    React.ReactPortal |
    null {

    const {

      images,

      selectedIndex

    } = this.state;


    if (
      selectedIndex ===
        undefined
    ) {

      return null;
    }


    const image =
      images[
        selectedIndex
      ];


    if (
      !image
    ) {

      return null;
    }


    const lightbox =
      (

        <div

          className={
            styles.lightbox
          }

          role="dialog"

          aria-modal="true"

          aria-label="KQ Moments photo viewer"

          onClick={
            this._closeImage
          }

        >

          {/* CLOSE */}

          <button

            type="button"

            className={
              styles.closeButton
            }

            onClick={
              (
                event
              ) => {

                event.stopPropagation();

                this._closeImage();
              }
            }

            aria-label="Close photo"

          >
            ×
          </button>


          {/* PREVIOUS */}

          {
            images.length >
              1 && (

              <button

                type="button"

                className={[
                  styles.navigationButton,
                  styles.previousButton
                ].join(' ')}

                onClick={
                  (
                    event
                  ) => {

                    event.stopPropagation();

                    this._showPrevious();
                  }
                }

                aria-label="Previous photo"

              >
                ←
              </button>

            )
          }


          {/* IMAGE */}

          <div

            className={
              styles.lightboxContent
            }

            onClick={
              (
                event
              ) =>
                event.stopPropagation()
            }

          >

            <img

              src={
                image.url
              }

              alt={
                image.name
              }

              className={
                styles.lightboxImage
              }

              draggable={
                false
              }

            />


            <div
              className={
                styles.imageCounter
              }
            >

              {
                selectedIndex + 1
              } / {
                images.length
              }

            </div>

          </div>


          {/* NEXT */}

          {
            images.length >
              1 && (

              <button

                type="button"

                className={[
                  styles.navigationButton,
                  styles.nextButton
                ].join(' ')}

                onClick={
                  (
                    event
                  ) => {

                    event.stopPropagation();

                    this._showNext();
                  }
                }

                aria-label="Next photo"

              >
                →
              </button>

            )
          }

        </div>
      );


    /*
     * IMPORTANT:
     *
     * The lightbox is intentionally mounted directly
     * on document.body.
     *
     * It is therefore outside the Moments portal and
     * outside the KQ navigation stacking context.
     */

    return ReactDOM.createPortal(
      lightbox,
      document.body
    );
  }


  /* ============================================================
     RENDER
     ============================================================ */

  public render():
    React.ReactElement {

    const {

      gallery,

      isDarkMode,

      onBack

    } = this.props;


    const {

      images,

      isLoading,

      errorMessage

    } = this.state;


    return (

      <main

        className={[

          styles.galleryViewer,

          isDarkMode
            ? styles.darkMode
            : ''

        ]
          .filter(Boolean)
          .join(' ')}

      >

        <div
          className={
            styles.pageContent
          }
        >

          {/* BACK */}

          <button

            type="button"

            className={
              styles.backButton
            }

            onClick={
              onBack
            }

          >
            ← Back to KQ Moments
          </button>


          {/* HEADER */}

          <header
            className={
              styles.header
            }
          >

            <div
              className={
                styles.eyebrow
              }
            >
              #KQMOMENTS
            </div>


            <h1
              className={
                styles.title
              }
            >
              {gallery.title}
            </h1>


            {
              !isLoading &&
              !errorMessage && (

                <p
                  className={
                    styles.photoCount
                  }
                >

                  {
                    images.length
                  } {
                    images.length ===
                      1
                      ? 'photo'
                      : 'photos'
                  }

                </p>

              )
            }

          </header>


          {/* COVER */}

          {
            gallery.imageUrl && (

              <div
                className={
                  styles.cover
                }
              >

                <img

                  src={
                    gallery.imageUrl
                  }

                  alt=""

                />


                <div
                  className={
                    styles.coverShade
                  }
                />


                <div
                  className={
                    styles.coverTitle
                  }
                >
                  {gallery.title}
                </div>

              </div>

            )
          }


          {/* LOADING */}

          {
            isLoading && (

              <div
                className={
                  styles.message
                }
              >
                Loading gallery...
              </div>

            )
          }


          {/* ERROR */}

          {
            !isLoading &&
            !!errorMessage && (

              <div
                className={
                  styles.error
                }
              >
                {errorMessage}
              </div>

            )
          }


          {/* EMPTY */}

          {
            !isLoading &&
            !errorMessage &&
            images.length ===
              0 && (

              <div
                className={
                  styles.message
                }
              >
                No photos were found in this gallery.
              </div>

            )
          }


          {/* PHOTOS */}

          {
            !isLoading &&
            !errorMessage &&
            images.length >
              0 && (

              <section
                className={
                  styles.photosSection
                }
              >

                <div
                  className={
                    styles.sectionHeader
                  }
                >

                  <h2>
                    Photos
                  </h2>


                  <span>

                    {
                      images.length
                    } {
                      images.length ===
                        1
                        ? 'photo'
                        : 'photos'
                    }

                  </span>

                </div>


                <div
                  className={
                    styles.photoGrid
                  }
                >

                  {
                    images.map(
                      (
                        image,
                        index
                      ) => (

                        <button

                          key={
                            image.serverRelativeUrl
                          }

                          type="button"

                          className={
                            styles.photoCard
                          }

                          onClick={
                            () =>
                              this._openImage(
                                index
                              )
                          }

                          aria-label={
                            `View ${image.name}`
                          }

                        >

                          <img

                            src={
                              image.url
                            }

                            alt={
                              image.name
                            }

                            loading="lazy"

                          />


                          <span
                            className={
                              styles.photoHover
                            }
                          >

                            <span>
                              View
                            </span>

                          </span>

                        </button>

                      )
                    )
                  }

                </div>

              </section>

            )
          }

        </div>


        {
          this._renderLightbox()
        }

      </main>
    );
  }
}