import * as React from 'react';

import {
  IKqVivaExchangeProps
} from './IKqVivaExchangeProps';

import {
  IKqVivaPost
} from '../models/IKqVivaPost';

import KqVivaExchangeService
  from '../services/KqVivaExchangeService';

interface IKqVivaExchangeState {

  posts: IKqVivaPost[];

  draftText: string;

  isLoading: boolean;

  isPosting: boolean;

  errorMessage: string;

  windowWidth: number;
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

    this.state = {

      posts: [],

      draftText: '',

      isLoading: true,

      isPosting: false,

      errorMessage: '',

      windowWidth:
        window.innerWidth
    };
  }

  public async componentDidMount():
    Promise<void> {

    window.addEventListener(
      'resize',
      this._handleResize
    );

    await this._loadPosts();
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

    if (
      minutes < 1
    ) {
      return 'Just now';
    }

    if (
      minutes < 60
    ) {
      return `${minutes}m ago`;
    }

    const hours =
      Math.floor(
        minutes / 60
      );

    if (
      hours < 24
    ) {
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

    /*
     * Replace with the real KQ
     * Viva Engage community URL.
     */
    return (
      'https://engage.cloud.microsoft/main/groups/eyJfdHlwZSI6Ikdyb3VwIiwiaWQiOiIxODIyNDM1MjQ2MDgifQ/new'
    );
  }

  private _renderPost(
    post:
      IKqVivaPost
  ): React.ReactElement {

    return (
      <article
        key={post.id}
        style={{

          padding:
            '16px 18px',

          border:
            '1px solid #e2e6ec',

          borderRadius: 18,

          background:
            '#ffffff'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems:
              'flex-start',
            gap: 12
          }}
        >
          <div
            style={{

              width: 36,
              height: 36,

              minWidth: 36,

              borderRadius:
                '50%',

              display: 'flex',

              alignItems:
                'center',

              justifyContent:
                'center',

              background:
                '#df0011',

              color:
                '#ffffff',

              fontWeight: 700,

              fontSize: 13
            }}
          >
            {post.authorInitials}
          </div>

          <div
            style={{
              minWidth: 0,
              flex: 1
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems:
                  'baseline',
                gap: 4
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color:
                    '#17213a'
                }}
              >
                {post.authorName}
              </span>

              {post.authorRole && (
                <span
                  style={{
                    fontSize: 13,
                    color:
                      '#687182'
                  }}
                >
                  · {post.authorRole}
                </span>
              )}
            </div>

            <div
              style={{
                fontSize: 11,
                color:
                  '#989da6',
                marginTop: 3
              }}
            >
              {this._formatRelativeDate(
                post.createdAt
              )}
            </div>
          </div>
        </div>

        <p
          style={{
            margin:
              '12px 0 10px',

            color:
              '#4a5262',

            fontSize: 14,

            lineHeight: 1.5
          }}
        >
          {post.body}
        </p>

        <div
          style={{
            display: 'flex',
            alignItems:
              'center',
            gap: 16,
            color:
              '#687182',
            fontSize: 12
          }}
        >
          <span>
            ♡ {post.likes}
          </span>

          <span>
            ▢ {post.comments}
          </span>

          {post.webUrl && (
            <a
              href={post.webUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                color:
                  '#687182',
                textDecoration:
                  'none'
              }}
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
      windowWidth
    } = this.state;

    const mobile =
      windowWidth <= 640;

    return (
      <section
        style={{
          width: '100%',

          border:
            '1px solid #d9dde4',

          borderRadius: 16,

          background:
            '#ffffff',

          boxShadow:
            '0 5px 18px rgba(0,0,0,.07)',

          overflow:
            'hidden',

          boxSizing:
            'border-box'
        }}
      >
        <div
          style={{
            display: 'flex',

            flexDirection:
              mobile
                ? 'column'
                : 'row',

            alignItems:
              mobile
                ? 'stretch'
                : 'center',

            justifyContent:
              'space-between',

            gap: 14,

            padding:
              mobile
                ? 16
                : '16px 20px',

            borderBottom:
              '1px solid #e5e7eb'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems:
                'center',
              gap: 12
            }}
          >
            <div
              style={{

                width: 36,
                height: 36,

                borderRadius:
                  '50%',

                background:
                  '#09162f',

                color:
                  '#ffffff',

                display: 'flex',

                alignItems:
                  'center',

                justifyContent:
                  'center',

                fontSize: 17
              }}
            >
              ◯
            </div>

            <div>
              <div
                style={{
                  color:
                    '#ed1c24',

                  fontSize: 11,

                  letterSpacing:
                    2,

                  fontWeight: 700
                }}
              >
                VIVA ENGAGE
              </div>

              <div
                style={{
                  fontSize: 17,
                  color:
                    '#17213a'
                }}
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
            style={{

              padding:
                '10px 20px',

              border:
                '1px solid #ed1c24',

              borderRadius:
                999,

              textDecoration:
                'none',

              color:
                '#ed1c24',

              textAlign:
                'center',

              fontSize: 13,

              fontWeight: 700
            }}
          >
            Open Community&nbsp;&nbsp; →
          </a>
        </div>

        <div
          style={{
            padding:
              mobile
                ? 14
                : 18,

            display: 'flex',

            flexDirection:
              'column',

            gap: 12
          }}
        >
          {isLoading && (
            <div
              style={{
                padding: 35,
                textAlign:
                  'center',
                color:
                  '#687182'
              }}
            >
              Loading conversations...
            </div>
          )}

          {!isLoading &&
            errorMessage && (
              <div
                style={{
                  padding: 14,
                  color:
                    '#b42318',
                  background:
                    '#fef3f2',
                  borderRadius: 10
                }}
              >
                {errorMessage}
              </div>
            )}

          {!isLoading &&
            !errorMessage &&
            posts.length === 0 && (
              <div
                style={{
                  padding: 30,
                  textAlign:
                    'center',
                  color:
                    '#687182'
                }}
              >
                Connect the KQ Viva Engage
                community to display the
                live feed.
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
            style={{

              display: 'flex',

              alignItems:
                'center',

              gap: 12,

              padding:
                '10px 12px',

              background:
                '#f6f7f9',

              borderRadius: 18
            }}
          >
            <div
              style={{

                width: 34,
                height: 34,

                minWidth: 34,

                borderRadius:
                  '50%',

                display: 'flex',

                alignItems:
                  'center',

                justifyContent:
                  'center',

                background:
                  '#e1ab43',

                color:
                  '#17213a',

                fontWeight: 700,

                fontSize: 12
              }}
            >
              {this.props.context
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
                .toUpperCase()}
            </div>

            <input
              type="text"
              value={draftText}
              disabled={isPosting}
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

                  void this._submitPost();
                }
              }}
              style={{
                flex: 1,
                minWidth: 0,
                border: 'none',
                outline: 'none',
                background:
                  'transparent',
                fontSize: 13,
                color:
                  '#17213a'
              }}
            />

            <button
              type="button"
              disabled={
                isPosting ||
                !draftText.trim()
              }
              onClick={() =>
                void this._submitPost()
              }
              style={{

                width: 36,
                height: 36,

                minWidth: 36,

                border:
                  'none',

                borderRadius:
                  '50%',

                background:
                  !draftText.trim()
                    ? '#d5d7dc'
                    : '#ed1c24',

                color:
                  '#ffffff',

                cursor:
                  !draftText.trim()
                    ? 'default'
                    : 'pointer',

                fontSize: 16
              }}
            >
              ➤
            </button>
          </div>
        </div>
      </section>
    );
  }
}