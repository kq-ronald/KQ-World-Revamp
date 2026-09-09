import * as React from 'react';

import {
  IKqVivaExchangeProps
} from './IKqVivaExchangeProps';

import {
  IKqVivaPost
} from '../models/IKqVivaPost';

import KqVivaExchangeService
  from '../services/KqVivaExchangeService';

import styles
  from './KqVivaExchange.module.scss';


interface IKqVivaExchangeState {
  posts: IKqVivaPost[];

  draftText: string;

  isLoading: boolean;

  isPosting: boolean;

  errorMessage: string;

  isDarkMode: boolean;
}


export default class KqVivaExchange
  extends React.Component<
    IKqVivaExchangeProps,
    IKqVivaExchangeState
  > {

  private readonly _service:
    KqVivaExchangeService;


  public constructor(
    props:
      IKqVivaExchangeProps
  ) {

    super(props);

    this._service =
      new KqVivaExchangeService(
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
      posts: [],

      draftText: '',

      isLoading: true,

      isPosting: false,

      errorMessage: '',

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

    await this._loadPosts();
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


  private async _loadPosts():
    Promise<void> {

    try {

      this.setState({
        isLoading: true,
        errorMessage: ''
      });

      const posts =
        await this._service
          .getLatestPosts();

      this.setState({
        posts,
        isLoading: false
      });

    } catch (error) {

      console.error(
        'Viva Engage feed error:',
        error
      );

      this.setState({
        isLoading: false,

        errorMessage:
          error instanceof Error
            ? error.message
            : 'Unable to load KQ conversations.'
      });
    }
  }


  private async _submitPost():
    Promise<void> {

    const text =
      this.state
        .draftText
        .trim();

    if (
      !text ||
      this.state.isPosting
    ) {
      return;
    }

    try {

      this.setState({
        isPosting: true,
        errorMessage: ''
      });

      await this._service
        .createPost(
          text
        );

      this.setState({
        draftText: ''
      });

      await this._loadPosts();

      this.setState({
        isPosting: false
      });

    } catch (error) {

      console.error(
        'Viva post error:',
        error
      );

      this.setState({
        isPosting: false,

        errorMessage:
          error instanceof Error
            ? error.message
            : 'Unable to publish post.'
      });
    }
  }


  private _formatRelativeDate(
    date: Date
  ): string {

    const now =
      new Date()
        .getTime();

    const then =
      date.getTime();

    const minutes =
      Math.floor(
        (now - then) /
        60000
      );

    if (minutes < 1) {
      return 'Just now';
    }

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours =
      Math.floor(
        minutes / 60
      );

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days =
      Math.floor(
        hours / 24
      );

    return `${days}d ago`;
  }


  private _getCommunityUrl():
    string {

    return (
      'https://engage.cloud.microsoft/main/groups/' +
      'eyJfdHlwZSI6Ikdyb3VwIiwiaWQiOiIxODIyNDM1MjQ2MDgifQ/new'
    );
  }


  private _getUserInitials():
    string {

    return (
      this.props.context
        .pageContext
        .user
        .displayName
        .split(' ')
        .map(
          (
            item:
              string
          ) =>
            item.charAt(0)
        )
        .slice(0, 2)
        .join('')
        .toUpperCase()
    );
  }


  private _renderPost(
    post:
      IKqVivaPost
  ): React.ReactElement {

    return (

      <article
        key={post.id}
        className={
          styles.postCard
        }
      >

        <div
          className={
            styles.postHeader
          }
        >

          <div
            className={
              styles.avatar
            }
          >
            {post.authorInitials}
          </div>


          <div
            className={
              styles.authorArea
            }
          >

            <div
              className={
                styles.authorLine
              }
            >

              <span
                className={
                  styles.authorName
                }
              >
                {post.authorName}
              </span>

              {post.authorRole && (

                <span
                  className={
                    styles.authorRole
                  }
                >
                  · {post.authorRole}
                </span>

              )}

            </div>


            <div
              className={
                styles.postDate
              }
            >
              {this._formatRelativeDate(
                post.createdAt
              )}
            </div>

          </div>

        </div>


        <p
          className={
            styles.postBody
          }
        >
          {post.body}
        </p>


        <div
          className={
            styles.postActions
          }
        >

          <span>
            ♡ {post.likes}
          </span>

          <span>
            ▢ {post.comments}
          </span>

          {post.webUrl && (

            <a
              href={
                post.webUrl
              }
              target="_blank"
              rel="noreferrer"
              className={
                styles.shareLink
              }
            >
              ↗ Share
            </a>

          )}

        </div>

      </article>
    );
  }


  public render():
    React.ReactElement<
      IKqVivaExchangeProps
    > {

    const {
      posts,
      draftText,
      isLoading,
      isPosting,
      errorMessage,
      isDarkMode
    } = this.state;

    return (

      <section
        className={[
          styles.kqVivaExchange,
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

          <div
            className={
              styles.headerIdentity
            }
          >

            <div
              className={
                styles.vivaIcon
              }
            >
              ◯
            </div>


            <div>

              <div
                className={
                  styles.eyebrow
                }
              >
                VIVA ENGAGE
              </div>

              <div
                className={
                  styles.title
                }
              >
                KQ World Conversations
              </div>

            </div>

          </div>


          <a
            href={
              this._getCommunityUrl()
            }
            target="_blank"
            rel="noreferrer"
            className={
              styles.communityLink
            }
          >
            Open Community

            <span>
              →
            </span>
          </a>

        </div>


        <div
          className={
            styles.content
          }
        >

          {isLoading && (

            <div
              className={
                styles.message
              }
            >
              Loading conversations...
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
            posts.length === 0 && (

            <div
              className={
                styles.message
              }
            >
              Connect the KQ Viva Engage
              community to display the live feed.
            </div>

          )}


          {!isLoading &&
            posts.map(
              (
                post:
                  IKqVivaPost
              ) =>
                this._renderPost(
                  post
                )
            )}


          <div
            className={
              styles.composer
            }
          >

            <div
              className={
                styles.currentUserAvatar
              }
            >
              {this._getUserInitials()}
            </div>


            <input
              type="text"
              value={
                draftText
              }
              disabled={
                isPosting
              }
              placeholder=
                "Share something with the KQ family..."
              onChange={(
                event:
                  React.ChangeEvent<
                    HTMLInputElement
                  >
              ) =>
                this.setState({
                  draftText:
                    event.target.value
                })
              }
              onKeyDown={(
                event:
                  React.KeyboardEvent<
                    HTMLInputElement
                  >
              ) => {

                if (
                  event.key ===
                  'Enter'
                ) {

                  event.preventDefault();

                  this._submitPost()
                    .catch(
                      error =>
                        console.error(
                          error
                        )
                    );
                }
              }}
              className={
                styles.composerInput
              }
            />


            <button
              type="button"
              disabled={
                isPosting ||
                !draftText.trim()
              }
              onClick={() =>
                this._submitPost()
                  .catch(
                    error =>
                      console.error(
                        error
                      )
                  )
              }
              className={[
                styles.sendButton,
                !draftText.trim()
                  ? styles.sendButtonDisabled
                  : ''
              ].join(' ')}
            >
              ➤
            </button>

          </div>

        </div>

      </section>
    );
  }
}