import * as React from 'react';

import * as ReactDOM from 'react-dom';
import JSZip from 'jszip';

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
  images: IKqGalleryImage[];
  isLoading: boolean;
  errorMessage: string;
  selectedIndex?: number;

  // Download and share functionality
  actionMessage: string;
  isDownloadingAlbum: boolean;
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
  images: [],
  isLoading: true,
  errorMessage: '',
  selectedIndex: undefined,
  actionMessage: '',
  isDownloadingAlbum: false
};

  }

  /* ============================================================

     LIFECYCLE

     \============================================================ */

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

     \============================================================ */

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

     \============================================================ */

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

     \============================================================ */

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

     \============================================================ */

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

     \============================================================ */

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

     \============================================================ */

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

     \============================================================ */

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

     \============================================================ */

  private _downloadBlob(blob: Blob, name: string): void {
   const objectUrl = URL.createObjectURL(blob);
   const anchor = document.createElement('a');
   anchor.href = objectUrl;
   anchor.download = name;
   document.body.appendChild(anchor);
   anchor.click();
   anchor.remove();
   window.setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
 }

 private async _fetchImage(image: IKqGalleryImage): Promise<Blob> {
   const response = await fetch(image.url, { credentials: 'same-origin' });
   if (!response.ok) {
     throw new Error(`Could not download ${image.name} (${response.status}).`);
   }
   return response.blob();
 }

 private _downloadImage = async (image: IKqGalleryImage): Promise<void> => {
   try {
     const blob = await this._fetchImage(image);
     this._downloadBlob(blob, image.name || 'KQ-Moment.jpg');
     this.setState({ actionMessage: 'Image download started.' });
   } catch (error) {
     this.setState({ actionMessage: error instanceof Error ? error.message : 'Image download failed.' });
   }
 };

 private _downloadAlbum = async (): Promise<void> => {
   if (this.state.isDownloadingAlbum || !this.state.images.length) return;
   this.setState({ isDownloadingAlbum: true, actionMessage: 'Preparing album ZIP...' });
   try {
     const zip = new JSZip();
     const failures: string[] = [];
    for (
  let index = 0;
  index < this.state.images.length;
  index++
) {
  const image = this.state.images[index];
       try {
         const blob = await this._fetchImage(image);
         zip.file(image.name || `image-${index + 1}.jpg`, blob);
       } catch (_) {
         failures.push(image.name);
       }
     }
     if (failures.length) {
       throw new Error(`Album download stopped: ${failures.length} image(s) could not be retrieved. Nothing was saved.`);
     }
     const archive = await zip.generateAsync({ type: 'blob' });
     const safeName = (this.props.gallery.title || 'KQ-Moments').replace(/[\\/:*?"<>|]/g, '_');
     this._downloadBlob(archive, `${safeName}.zip`);
     this.setState({ actionMessage: 'Album ZIP download started.' });
   } catch (error) {
     this.setState({ actionMessage: error instanceof Error ? error.message : 'Album download failed.' });
   } finally {
     this.setState({ isDownloadingAlbum: false });
   }
 };

 private _shareUrl = async (url: string, title: string): Promise<void> => {
   try {
     const absoluteUrl = new URL(url, window.location.href).href;
     if (navigator.share) {
       await navigator.share({ title, url: absoluteUrl });
       this.setState({ actionMessage: 'Share options opened.' });
     } else if (navigator.clipboard && navigator.clipboard.writeText) {
       await navigator.clipboard.writeText(absoluteUrl);
       this.setState({ actionMessage: 'Link copied to clipboard.' });
     } else {
       window.prompt('Copy this link:', absoluteUrl);
     }
   } catch (error) {
     if (error instanceof Error && error.name === 'AbortError') return;
     this.setState({ actionMessage: 'Unable to share this link.' });
   }
 };

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

          <div className="kqMomentsLightboxActions" onClick={(event) => event.stopPropagation()}>
          <button type="button" onClick={() => { void this._downloadImage(image); }} aria-label="Download image">↓ Download</button>
          <button type="button" onClick={() => { void this._shareUrl(image.url, image.name); }} aria-label="Share image">↗ Share</button>
        </div>

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

     \============================================================ */

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

          <div className="kqMomentsAlbumActions">
          <button type="button" disabled={isLoading || !!errorMessage || images.length === 0 || this.state.isDownloadingAlbum} onClick={() => { void this._downloadAlbum(); }}>
            {this.state.isDownloadingAlbum ? 'Preparing ZIP...' : '↓ Download Album'}
          </button>
          <button type="button" onClick={() => { void this._shareUrl(gallery.galleryUrl, gallery.title); }}>↗ Share Album</button>
        </div>
        {this.state.actionMessage && <p role="status" className="kqMomentsActionStatus">{this.state.actionMessage}</p>}

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