import * as React from 'react';

import {
  IKqMomentsProps
} from './IKqMomentsProps';

import {
  IKqMoment
} from '../models/IKqMoment';

import KqMomentsService
  from '../services/KqMomentsService';

import styles
  from './KqMoments.module.scss';


interface IKqMomentsState {
  items: IKqMoment[];

  isLoading: boolean;

  errorMessage: string;

  hoveredId?: number;

  isDarkMode: boolean;
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

    const currentTheme =
      typeof document !== 'undefined'
        ? document.documentElement
            .getAttribute(
              'data-kq-theme'
            )
        : 'light';

    this.state = {
      items: [],

      isLoading:
        true,

      errorMessage:
        '',

      hoveredId:
        undefined,

      isDarkMode:
        currentTheme === 'dark'
    };
  }


  public async componentDidMount():
    Promise<void> {

    window.addEventListener(
      'kqworld-theme-change',
      this._handleThemeChange as EventListener
    );

    const currentTheme =
      document.documentElement
        .getAttribute(
          'data-kq-theme'
        );

    this.setState({
      isDarkMode:
        currentTheme === 'dark'
    });

    await this._loadMoments();
  }


  public componentWillUnmount():
    void {

    window.removeEventListener(
      'kqworld-theme-change',
      this._handleThemeChange as EventListener
    );
  }


  private _handleThemeChange = (
    event: CustomEvent
  ): void => {

    const theme =
      event.detail?.theme;

    this.setState({
      isDarkMode:
        theme === 'dark'
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
        className={[
          styles.momentCard,
          layout === 'tall'
            ? styles.tallCard
            : styles.wideCard,
          isHovered
            ? styles.momentCardHovered
            : ''
        ].join(' ')}
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
          ].join(' ')}
        />


        <div
          className={[
            styles.momentOverlay,
            isHovered
              ? styles.momentOverlayHovered
              : ''
          ].join(' ')}
        />


        <div
          className={[
            styles.momentInfo,
            isHovered
              ? styles.momentInfoVisible
              : ''
          ].join(' ')}
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
              styles.momentArrow
            }
          >
            →
          </span>

        </div>

      </button>
    );
  }


  private _getGalleryUrl():
    string {

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
      isDarkMode
    } = this.state;

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
        className={[
          styles.kqMoments,
          isDarkMode
            ? styles.darkMode
            : ''
        ].join(' ')}
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


          <a
            href={
              this._getGalleryUrl()
            }
            target="_blank"
            rel="noreferrer"
            className={
              styles.galleryLink
            }
          >
            Open Gallery

            <span>
              →
            </span>
          </a>

        </div>


        {isLoading && (

          <div
            className={
              styles.message
            }
          >
            Loading KQ Moments...
          </div>

        )}


        {!isLoading &&
          errorMessage && (

          <div
            className={
              styles.error
            }
          >
            {errorMessage}
          </div>

        )}


        {!isLoading &&
          !errorMessage &&
          items.length === 0 && (

          <div
            className={
              styles.message
            }
          >
            No KQ Moments found.
          </div>

        )}


        {!isLoading &&
          !errorMessage &&
          items.length > 0 && (

          <div
            className={
              styles.momentsGrid
            }
          >

            {first && (

              <div
                className={
                  styles.slotOne
                }
              >
                {this._renderMomentCard(
                  first,
                  'tall'
                )}
              </div>

            )}


            {second && (

              <div
                className={
                  styles.slotTwo
                }
              >
                {this._renderMomentCard(
                  second,
                  'wide'
                )}
              </div>

            )}


            {third && (

              <div
                className={
                  styles.slotThree
                }
              >
                {this._renderMomentCard(
                  third,
                  'wide'
                )}
              </div>

            )}


            {fourth && (

              <div
                className={
                  styles.slotFour
                }
              >
                {this._renderMomentCard(
                  fourth,
                  'tall'
                )}
              </div>

            )}


            {third && (

              <div
                className={
                  styles.slotFive
                }
              >
                {this._renderMomentCard(
                  third,
                  'wide'
                )}
              </div>

            )}

          </div>

        )}

      </section>
    );
  }
}