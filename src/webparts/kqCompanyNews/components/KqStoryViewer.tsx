import * as React from 'react';

import {
  IKqCompanyNewsItem
} from '../models/IKqCompanyNewsItem';

import KqCompanyNewsService
  from '../services/KqCompanyNewsService';

import styles
  from './KqStoryViewer.module.scss';


export interface IKqStoryViewerProps {
  item: IKqCompanyNewsItem;
  service: KqCompanyNewsService;
  isDarkMode: boolean;
  onBack: () => void;
}


interface IKqStoryViewerState {
  story?: IKqCompanyNewsItem;
  isLoading: boolean;
  errorMessage: string;
}


export default class KqStoryViewer
  extends React.Component<
    IKqStoryViewerProps,
    IKqStoryViewerState
  > {

  public constructor(
    props: IKqStoryViewerProps
  ) {
    super(props);

    this.state = {
      story: undefined,
      isLoading: true,
      errorMessage: ''
    };
  }


  public componentDidMount(): void {
    this._loadStory().catch(
      (error: unknown) => {
        console.error(
          'Unable to load KQ Company News story:',
          error
        );
      }
    );
  }


  public componentDidUpdate(
    previousProps: IKqStoryViewerProps
  ): void {

    if (
      previousProps.item.id !==
        this.props.item.id ||
      previousProps.item.type !==
        this.props.item.type
    ) {
      this.setState(
        {
          story: undefined,
          isLoading: true,
          errorMessage: ''
        },
        () => {
          this._loadStory().catch(
            (error: unknown) => {
              console.error(
                'Unable to reload KQ Company News story:',
                error
              );
            }
          );
        }
      );
    }
  }


  private async _loadStory():
    Promise<void> {

    const {
      item,
      service
    } = this.props;

    try {

      const story =
        await service.getStoryById(
          item.id,
          item.type
        );

      if (!story) {
        throw new Error(
          'The requested story could not be found.'
        );
      }

      this.setState({
        story,
        isLoading: false,
        errorMessage: ''
      });

    } catch (error) {

      console.error(
        'Unable to load KQ story:',
        error
      );

      this.setState({
        story: undefined,
        isLoading: false,
        errorMessage:
          'We could not load this story.'
      });
    }
  }


  private _formatDate(
    value: Date
  ): string {

    if (!value) {
      return '';
    }

    return value.toLocaleDateString(
      'en-GB',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }
    );
  }


  private _getTypeName(): string {

    switch (
      this.props.item.type
    ) {
      case 'blog':
        return 'Blogs';

      case 'pride':
        return 'The Pride';

      case 'take3':
        return 'Take 3';

      default:
        return 'Take 3';
    }
  }


  /*
   * SharePoint CanvasContent1 contains the content of a
   * modern Site Page together with SharePoint canvas metadata.
   *
   * We do NOT inject the raw value directly.
   *
   * Instead:
   * 1. Parse it in an isolated document.
   * 2. Remove scripts / styles / SharePoint control metadata.
   * 3. Keep normal article text, headings, lists, links,
   *    images, tables and quotes.
   * 4. Return clean HTML for the KQ reader.
   */
  private _prepareSharePointContent(
    content: string
  ): string {

    if (!content) {
      return '';
    }

    try {

      const parser =
        new DOMParser();

      const documentValue =
        parser.parseFromString(
          `<div id="kq-reader-root">${content}</div>`,
          'text/html'
        );

      const root =
        documentValue.getElementById(
          'kq-reader-root'
        );

      if (!root) {
        return '';
      }


      /*
       * Remove content that should never appear
       * inside the KQ reader.
       */
      const unwantedSelectors = [
        'script',
        'style',
        'noscript',
        'iframe',
        'object',
        'embed',
        'form',
        'input',
        'button',
        'textarea',
        'select'
      ];

      unwantedSelectors.forEach(
        (selector) => {

          const elements =
            root.querySelectorAll(
              selector
            );

          Array.prototype.forEach.call(
            elements,
            (element: Element) => {
              if (
                element.parentNode
              ) {
                element.parentNode
                  .removeChild(
                    element
                  );
              }
            }
          );
        }
      );


      /*
       * Remove SharePoint control metadata attributes.
       * They are useful to SharePoint's page renderer,
       * but not to our KQ reader.
       */
      const allElements =
        root.querySelectorAll('*');

      Array.prototype.forEach.call(
        allElements,
        (element: Element) => {

          const attributes =
            Array.prototype.slice.call(
              element.attributes
            ) as Attr[];

          attributes.forEach(
            (attribute: Attr) => {

              const name =
                attribute.name
                  .toLowerCase();

              if (
                name.indexOf(
                  'data-sp-'
                ) === 0 ||
                name === 'contenteditable' ||
                name === 'role' ||
                name === 'tabindex'
              ) {
                element.removeAttribute(
                  attribute.name
                );
              }

              if (
                name.indexOf('on') === 0
              ) {
                element.removeAttribute(
                  attribute.name
                );
              }
            }
          );
        }
      );


      /*
       * Make relative SharePoint URLs absolute.
       */
      const links =
        root.querySelectorAll('a');

      Array.prototype.forEach.call(
        links,
        (link: HTMLAnchorElement) => {

          const href =
            link.getAttribute(
              'href'
            );

          if (
            href &&
            href.indexOf('/') === 0
          ) {
            link.setAttribute(
              'href',
              `${window.location.origin}${href}`
            );
          }

          link.setAttribute(
            'target',
            '_blank'
          );

          link.setAttribute(
            'rel',
            'noopener noreferrer'
          );
        }
      );


      const images =
        root.querySelectorAll('img');

      Array.prototype.forEach.call(
        images,
        (image: HTMLImageElement) => {

          const src =
            image.getAttribute(
              'src'
            );

          if (
            src &&
            src.indexOf('/') === 0
          ) {
            image.setAttribute(
              'src',
              `${window.location.origin}${src}`
            );
          }

          image.removeAttribute(
            'width'
          );

          image.removeAttribute(
            'height'
          );

          image.setAttribute(
            'loading',
            'lazy'
          );
        }
      );


      /*
       * SharePoint often leaves empty canvas wrappers.
       * Remove wrappers that contain no visible content.
       */
      const divs =
        Array.prototype.slice.call(
          root.querySelectorAll(
            'div'
          )
        ) as HTMLElement[];

      divs
        .reverse()
        .forEach(
          (
            div:
              HTMLElement
          ) => {

            const text =
              (
                div.textContent ||
                ''
              ).trim();

            const hasImage =
              !!div.querySelector(
                'img'
              );

            const hasUsefulElement =
              !!div.querySelector(
                'p,h1,h2,h3,h4,h5,h6,ul,ol,table,blockquote,a'
              );

            if (
              !text &&
              !hasImage &&
              !hasUsefulElement
            ) {
              if (
                div.parentNode
              ) {
                div.parentNode
                  .removeChild(
                    div
                  );
              }
            }
          }
        );


      return root.innerHTML;

    } catch (error) {

      console.error(
        'Unable to parse SharePoint story content:',
        error
      );

      return '';
    }
  }


  private _renderSharePointBody(
    story: IKqCompanyNewsItem
  ): React.ReactNode {

    if (!story.contentHtml) {

      return (
        <div
          className={
            styles.emptyContent
          }
        >
          <h2>
            Story content unavailable
          </h2>

          <p>
            No article body was found
            for this story.
          </p>
        </div>
      );
    }


    const preparedContent =
      this._prepareSharePointContent(
        story.contentHtml
      );


    if (!preparedContent) {

      return (
        <div
          className={
            styles.emptyContent
          }
        >
          <h2>
            Story content unavailable
          </h2>

          <p>
            The page was found, but it
            does not contain content that
            can currently be displayed
            in the KQ World reader.
          </p>
        </div>
      );
    }


    return (
      <div
        className={
          styles.sharePointContent
        }
        dangerouslySetInnerHTML={{
          __html:
            preparedContent
        }}
      />
    );
  }


  private _renderBlogBody(
    story: IKqCompanyNewsItem
  ): React.ReactNode {

    return (
      <div
        className={
          styles.blogNotice
        }
      >
        <h2>
          Continue reading
        </h2>

        <p>
          This blog is currently
          published on the Kenya Airways
          corporate website. Its full
          article body has not yet been
          moved into the KQ World CMS.
        </p>

        {
          story.itemUrl && (
            <a
              href={
                story.itemUrl
              }
              target="_blank"
              rel="noopener noreferrer"
              className={
                styles.sourceButton
              }
            >
              Read current article

              <span
                aria-hidden="true"
              >
                ↗
              </span>
            </a>
          )
        }
      </div>
    );
  }


  public render():
    React.ReactElement<
      IKqStoryViewerProps
    > {

    const {
      isDarkMode,
      onBack
    } = this.props;

    const {
      story,
      isLoading,
      errorMessage
    } = this.state;


    const rootClassName =
      [
        styles.storyViewer,
        isDarkMode
          ? styles.darkMode
          : ''
      ]
        .filter(Boolean)
        .join(' ');


    if (isLoading) {

      return (
        <main
          className={
            rootClassName
          }
        >
          <div
            className={
              styles.storyContainer
            }
          >
            <div
              className={
                styles.loadingState
              }
            >
              <div
                className={
                  styles.loadingSpinner
                }
              />

              <span>
                Loading story...
              </span>
            </div>
          </div>
        </main>
      );
    }


    if (
      errorMessage ||
      !story
    ) {

      return (
        <main
          className={
            rootClassName
          }
        >
          <div
            className={
              styles.storyContainer
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

              Back
            </button>

            <div
              className={
                styles.errorState
              }
            >
              {
                errorMessage ||
                'Story not found.'
              }
            </div>
          </div>
        </main>
      );
    }


    return (
      <main
        className={
          rootClassName
        }
      >
        <article
          className={
            styles.storyContainer
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

            Back to {
              this._getTypeName()
            }
          </button>


          <header
            className={
              styles.storyHeader
            }
          >

            <div
              className={
                styles.storyCategory
              }
            >
              {
                story.category ||
                this._getTypeName()
              }
            </div>


            <h1
              className={
                styles.storyTitle
              }
            >
              {story.title}
            </h1>


            {
              story.moreInfo && (
                <p
                  className={
                    styles.storyIntro
                  }
                >
                  {story.moreInfo}
                </p>
              )
            }


            <div
              className={
                styles.storyMeta
              }
            >

              {
                story.authorName && (
                  <span>
                    {
                      story.authorName
                    }
                  </span>
                )
              }

              <span>
                {
                  this._formatDate(
                    story.publishedDate
                  )
                }
              </span>

              {
                story.readTimeMinutes && (
                  <span>
                    {
                      story
                        .readTimeMinutes
                    } min read
                  </span>
                )
              }

            </div>

          </header>


          {
            story.imageUrl && (
              <div
                className={
                  styles.hero
                }
              >
                <img
                  src={
                    story.imageUrl
                  }
                  alt=""
                />
              </div>
            )
          }


          <div
            className={
              styles.storyBody
            }
          >
            {
              story.type ===
                'blog'
                ? this
                    ._renderBlogBody(
                      story
                    )
                : this
                    ._renderSharePointBody(
                      story
                    )
            }
          </div>

        </article>
      </main>
    );
  }
}