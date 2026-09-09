import * as React from 'react';

import {
  IKqSocialsProps
} from './IKqSocialsProps';

import {
  ISocialCommunityLink,
  SocialCommunityType,
  SocialCommunityIcon
} from '../models/ISocialCommunityLink';

import {
  socialCommunityLinks
} from '../data/socialCommunityLinks';

import styles
  from './KqSocials.module.scss';


interface IKqSocialsState {
  activeTab:
    SocialCommunityType;

  isDarkMode:
    boolean;
}


export default class KqSocials
  extends React.Component<
    IKqSocialsProps,
    IKqSocialsState
  > {

  public constructor(
    props: IKqSocialsProps
  ) {

    super(props);

    const currentTheme =
      typeof document !== 'undefined'
        ? document.documentElement
            .getAttribute(
              'data-kq-theme'
            )
        : 'light';

    this.state = {
      activeTab:
        'internal',

      isDarkMode:
        currentTheme === 'dark'
    };
  }


  public componentDidMount():
    void {

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


  private _openLink(
    item:
      ISocialCommunityLink
  ): void {

    if (!item.url) {
      return;
    }

    window.open(
      item.url,
      '_blank',
      'noopener,noreferrer'
    );
  }


  private _getIconConfig(
    iconType:
      SocialCommunityIcon
  ): {
    background:
      string;

    label:
      string;

    fontSize:
      number;
  } {

    switch (
      iconType
    ) {

      case 'viva':
        return {
          background:
            '#08162f',
          label:
            '◯',
          fontSize:
            15
        };

      case 'whatsapp':
        return {
          background:
            '#00a884',
          label:
            '◌',
          fontSize:
            17
        };

      case 'broadcast':
        return {
          background:
            '#1769ff',
          label:
            '▣',
          fontSize:
            13
        };

      case 'facebook':
        return {
          background:
            '#2f80ed',
          label:
            'f',
          fontSize:
            17
        };

      case 'twitter':
        return {
          background:
            '#000000',
          label:
            '↗',
          fontSize:
            13
        };

      case 'youtube':
        return {
          background:
            '#ff001f',
          label:
            '▶',
          fontSize:
            11
        };

      case 'website':
        return {
          background:
            '#ef001b',
          label:
            '◎',
          fontSize:
            15
        };

      case 'linkedin':
        return {
          background:
            '#1477c9',
          label:
            'in',
          fontSize:
            11
        };

      default:
        return {
          background:
            '#17213a',
          label:
            '•',
          fontSize:
            13
        };
    }
  }


  private _renderIcon(
    iconType:
      SocialCommunityIcon
  ): React.ReactElement {

    const config =
      this._getIconConfig(
        iconType
      );

    return (

      <div
        className={
          styles.socialIcon
        }
        style={{
          '--icon-bg':
            config.background,

          '--icon-size':
            `${config.fontSize}px`
        } as React.CSSProperties}
      >
        {config.label}
      </div>

    );
  }


  private _renderInternalItem(
    item:
      ISocialCommunityLink
  ): React.ReactElement {

    return (

      <button
        key={item.id}
        type="button"
        onClick={() =>
          this._openLink(
            item
          )
        }
        className={
          styles.internalItem
        }
      >

        {this._renderIcon(
          item.iconType
        )}


        <div
          className={
            styles.itemContent
          }
        >

          <div
            className={
              styles.itemTitle
            }
          >
            {item.title}
          </div>

          <div
            className={
              styles.itemSubtitle
            }
          >
            {item.subtitle}
          </div>

        </div>


        <div
          className={
            styles.itemArrow
          }
        >
          ↗
        </div>

      </button>
    );
  }


  private _renderExternalItem(
    item:
      ISocialCommunityLink
  ): React.ReactElement {

    return (

      <button
        key={item.id}
        type="button"
        onClick={() =>
          this._openLink(
            item
          )
        }
        className={
          styles.externalItem
        }
      >

        {this._renderIcon(
          item.iconType
        )}


        <div
          className={
            styles.itemContent
          }
        >

          <div
            className={
              styles.itemTitle
            }
          >
            {item.title}
          </div>

          <div
            className={
              styles.itemSubtitle
            }
          >
            {item.subtitle}
          </div>

        </div>


        <div
          className={
            styles.itemArrow
          }
        >
          ↗
        </div>

      </button>
    );
  }


  public render():
    React.ReactElement<
      IKqSocialsProps
    > {

    const {
      activeTab,
      isDarkMode
    } = this.state;

    const filteredLinks =
      socialCommunityLinks
        .filter(
          (
            item:
              ISocialCommunityLink
          ) =>
            item.type ===
            activeTab
        );

    return (

      <section
        className={[
          styles.kqSocials,
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
              ♧ SOCIAL &amp; COMMUNITY
            </div>

            <div
              className={
                styles.title
              }
            >
              Stay connected
            </div>

          </div>


          <div
            className={
              styles.tabBar
            }
          >

            <button
              type="button"
              onClick={() =>
                this.setState({
                  activeTab:
                    'internal'
                })
              }
              className={[
                styles.tab,
                activeTab ===
                  'internal'
                  ? styles.tabActive
                  : ''
              ].join(' ')}
            >
              Internal
            </button>


            <button
              type="button"
              onClick={() =>
                this.setState({
                  activeTab:
                    'external'
                })
              }
              className={[
                styles.tab,
                activeTab ===
                  'external'
                  ? styles.tabActive
                  : ''
              ].join(' ')}
            >
              External
            </button>

          </div>

        </div>


        <div
          className={[
            styles.linksList,
            activeTab === 'external'
              ? styles.externalList
              : ''
          ].join(' ')}
        >

          {filteredLinks.map(
            (
              item:
                ISocialCommunityLink
            ) => {

              if (
                activeTab ===
                'internal'
              ) {

                return (
                  this._renderInternalItem(
                    item
                  )
                );
              }

              return (
                this._renderExternalItem(
                  item
                )
              );
            }
          )}

        </div>

      </section>
    );
  }
}