import * as React from 'react';

import {
  IKqMoment
} from '../models/IKqMoment';

import styles
  from './KqMomentsLanding.module.scss';


export interface IKqMomentsLandingProps {
  items: IKqMoment[];
  isDarkMode: boolean;
  onBack: () => void;
  onOpenGallery: (
    item: IKqMoment
  ) => void;
}


interface IKqMomentsLandingState {
  searchTerm: string;
  sortOrder:
    'newest' |
    'az';
}


export default class KqMomentsLanding
  extends React.Component<
    IKqMomentsLandingProps,
    IKqMomentsLandingState
  > {

  public constructor(
    props: IKqMomentsLandingProps
  ) {
    super(props);

    this.state = {
      searchTerm: '',
      sortOrder: 'newest'
    };
  }


  private _getVisibleItems():
    IKqMoment[] {

    const {
      items
    } = this.props;

    const {
      searchTerm,
      sortOrder
    } = this.state;

    const search =
      searchTerm
        .trim()
        .toLowerCase();

    const filtered =
      items.filter(
        (item) => {

          if (!search) {
            return true;
          }

          return (
            item.title || ''
          )
            .toLowerCase()
            .includes(search);
        }
      );


    if (
      sortOrder === 'az'
    ) {

      return filtered
        .slice()
        .sort(
          (
            first,
            second
          ) =>
            (
              first.title || ''
            ).localeCompare(
              second.title || ''
            )
        );
    }


    /*
     * getMoments() already supplies the Moments
     * collection in its normal order.
     *
     * Until we inspect the actual model/service,
     * we preserve that order rather than inventing
     * a date field.
     */
    return filtered;
  }


  private _renderGalleryCard(
    item: IKqMoment,
    featured:
      boolean = false
  ): React.ReactElement {

    const {
      onOpenGallery
    } = this.props;

    return (
      <button
        key={item.id}
        type="button"
        className={[
          styles.galleryCard,
          featured
            ? styles.featuredCard
            : ''
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() =>
          onOpenGallery(
            item
          )
        }
        aria-label={
          `Open ${item.title} gallery`
        }
      >

        <img
          src={
            item.imageUrl
          }
          alt=""
          className={
            styles.galleryImage
          }
        />

        <span
          className={
            styles.galleryShade
          }
        />

        <span
          className={
            styles.galleryCardContent
          }
        >
          <span
            className={
              styles.galleryCardTitle
            }
          >
            {item.title}
          </span>

          <span
            className={
              styles.galleryCardAction
            }
          >
            View gallery

            <span
              className={
                styles.galleryArrow
              }
              aria-hidden="true"
            >
              →
            </span>
          </span>
        </span>

      </button>
    );
  }


  public render():
    React.ReactElement<
      IKqMomentsLandingProps
    > {

    const {
      isDarkMode,
      onBack
    } = this.props;

    const {
      searchTerm,
      sortOrder
    } = this.state;

    const visibleItems =
      this._getVisibleItems();

    const featured =
      visibleItems[0];

    const secondary =
      visibleItems.slice(
        1,
        3
      );

    const remaining =
      visibleItems.slice(3);


    return (
      <main
        className={[
          styles.momentsLanding,
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

          <button
            type="button"
            className={
              styles.backButton
            }
            onClick={
              onBack
            }
          >
            <span
              aria-hidden="true"
            >
              ←
            </span>

            Back to KQ World
          </button>


          <header
            className={
              styles.heroHeader
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

              <h1
                className={
                  styles.title
                }
              >
                Life at Kenya Airways
              </h1>

              <p
                className={
                  styles.description
                }
              >
                Discover moments from
                across Kenya Airways,
                celebrating our people,
                culture and experiences.
              </p>
            </div>

          </header>


          <div
            className={
              styles.toolbar
            }
          >

            <label
              className={
                styles.searchBox
              }
            >
              <span
                className={
                  styles.searchIcon
                }
                aria-hidden="true"
              >
                ⌕
              </span>

              <input
                type="search"
                value={
                  searchTerm
                }
                placeholder="Search galleries"
                aria-label="Search KQ Moments galleries"
                onChange={(
                  event:
                    React.ChangeEvent<HTMLInputElement>
                ) =>
                  this.setState({
                    searchTerm:
                      event.target.value
                  })
                }
              />
            </label>


            <label
              className={
                styles.sortBox
              }
            >
              <span>
                Sort
              </span>

              <select
                value={
                  sortOrder
                }
                aria-label="Sort galleries"
                onChange={(
                  event:
                    React.ChangeEvent<HTMLSelectElement>
                ) =>
                  this.setState({
                    sortOrder:
                      event.target.value as
                        'newest' |
                        'az'
                  })
                }
              >
                <option
                  value="newest"
                >
                  Newest
                </option>

                <option
                  value="az"
                >
                  A to Z
                </option>
              </select>
            </label>

          </div>


          {
            visibleItems.length ===
              0 ? (

              <div
                className={
                  styles.emptyState
                }
              >
                <div
                  className={
                    styles.emptyIcon
                  }
                >
                  ◫
                </div>

                <h2>
                  No galleries found
                </h2>

                <p>
                  Try another search.
                </p>
              </div>

            ) : (

              <>

                {
                  featured && (
                    <section
                      className={
                        styles.featuredSection
                      }
                    >
                      <div
                        className={
                          styles.sectionHeading
                        }
                      >
                        <div>
                          <div
                            className={
                              styles.sectionEyebrow
                            }
                          >
                            FEATURED
                          </div>

                          <h2>
                            Latest Moments
                          </h2>
                        </div>
                      </div>


                      <div
                        className={
                          styles.featuredGrid
                        }
                      >

                        {
                          this._renderGalleryCard(
                            featured,
                            true
                          )
                        }


                        {
                          secondary.length >
                            0 && (

                            <div
                              className={
                                styles.featuredSide
                              }
                            >
                              {
                                secondary.map(
                                  (
                                    item
                                  ) =>
                                    this._renderGalleryCard(
                                      item
                                    )
                                )
                              }
                            </div>
                          )
                        }

                      </div>
                    </section>
                  )
                }


                {
                  remaining.length >
                    0 && (

                    <section
                      className={
                        styles.allSection
                      }
                    >

                      <div
                        className={
                          styles.sectionHeading
                        }
                      >
                        <div>
                          <div
                            className={
                              styles.sectionEyebrow
                            }
                          >
                            EXPLORE
                          </div>

                          <h2>
                            All Moments
                          </h2>
                        </div>

                        <span
                          className={
                            styles.galleryCount
                          }
                        >
                          {
                            visibleItems.length
                          } {
                            visibleItems.length ===
                              1
                              ? 'gallery'
                              : 'galleries'
                          }
                        </span>
                      </div>


                      <div
                        className={
                          styles.galleryGrid
                        }
                      >
                        {
                          remaining.map(
                            (
                              item
                            ) =>
                              this._renderGalleryCard(
                                item
                              )
                          )
                        }
                      </div>

                    </section>
                  )
                }

              </>
            )
          }

        </div>

      </main>
    );
  }
}