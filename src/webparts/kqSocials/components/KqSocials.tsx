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

interface IKqSocialsState {
  activeTab: SocialCommunityType;
  hoveredId: string;
  windowWidth: number;
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

    this.state = {
      activeTab: 'internal',
      hoveredId: '',
      windowWidth:
        window.innerWidth
    };
  }

  public componentDidMount():
    void {

    window.addEventListener(
      'resize',
      this._handleResize
    );
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
        style={{
          width: 34,
          height: 34,
          minWidth: 34,
          borderRadius: '50%',
          background:
            config.background,
          color:
            '#ffffff',
          display: 'flex',
          alignItems:
            'center',
          justifyContent:
            'center',
          fontSize:
            config.fontSize,
          fontWeight: 700,
          lineHeight: 1
        }}
      >
        {config.label}
      </div>
    );
  }

  private _getIconConfig(
    iconType:
      SocialCommunityIcon
  ): {
    background: string;
    label: string;
    fontSize: number;
  } {

    switch (
      iconType
    ) {

      case 'viva':
        return {
          background:
            '#08162f',
          label: '◯',
          fontSize: 16
        };

      case 'whatsapp':
        return {
          background:
            '#00a884',
          label: '◌',
          fontSize: 18
        };

      case 'broadcast':
        return {
          background:
            '#1769ff',
          label: '▣',
          fontSize: 14
        };

      case 'facebook':
        return {
          background:
            '#2f80ed',
          label: 'f',
          fontSize: 18
        };

      case 'twitter':
        return {
          background:
            '#000000',
          label: '↗',
          fontSize: 14
        };

      case 'youtube':
        return {
          background:
            '#ff001f',
          label: '▶',
          fontSize: 12
        };

      case 'website':
        return {
          background:
            '#ef001b',
          label: '◎',
          fontSize: 16
        };

      case 'linkedin':
        return {
          background:
            '#1477c9',
          label: 'in',
          fontSize: 12
        };

      default:
        return {
          background:
            '#17213a',
          label: '•',
          fontSize: 14
        };
    }
  }

  private _renderInternalItem(
    item:
      ISocialCommunityLink
  ): React.ReactElement {

    const hovered =
      this.state.hoveredId ===
      item.id;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() =>
          this._openLink(
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
            hoveredId: ''
          })
        }
        style={{
          width: '100%',
          border:
            '1px solid #e0e5eb',
          background:
            hovered
              ? '#fafafa'
              : '#ffffff',
          borderRadius: 16,
          padding:
            '10px 12px',
          display: 'flex',
          alignItems:
            'center',
          gap: 10,
          cursor:
            item.url
              ? 'pointer'
              : 'default',
          textAlign:
            'left',
          transition:
            'background .2s ease, transform .2s ease',
          transform:
            hovered
              ? 'translateY(-1px)'
              : 'translateY(0)',
          boxSizing:
            'border-box'
        }}
      >
        {this._renderIcon(
          item.iconType
        )}

        <div
          style={{
            flex: 1,
            minWidth: 0
          }}
        >
          <div
            style={{
              fontSize: 13,
              color:
                '#17213a',
              fontWeight: 700,
              lineHeight: 1.2
            }}
          >
            {item.title}
          </div>

          <div
            style={{
              fontSize: 10,
              color:
                '#8a93a3',
              marginTop: 3
            }}
          >
            {item.subtitle}
          </div>
        </div>

        <div
          style={{
            color:
              '#7b8494',
            fontSize: 13
          }}
        >
          ↗
        </div>
      </button>
    );
  }

  private _renderExternalItem(
    item:
      ISocialCommunityLink,
    isLast:
      boolean
  ): React.ReactElement {

    const hovered =
      this.state.hoveredId ===
      item.id;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() =>
          this._openLink(
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
            hoveredId: ''
          })
        }
        style={{
          width: '100%',
          border: 'none',
          borderBottom:
            isLast
              ? 'none'
              : '1px solid #e4e7eb',
          background:
            hovered
              ? '#fafafa'
              : '#ffffff',
          padding:
            '11px 0',
          display: 'flex',
          alignItems:
            'center',
          gap: 10,
          cursor:
            item.url
              ? 'pointer'
              : 'default',
          textAlign:
            'left',
          transition:
            'background .2s ease',
          boxSizing:
            'border-box'
        }}
      >
        {this._renderIcon(
          item.iconType
        )}

        <div
          style={{
            flex: 1,
            minWidth: 0
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color:
                '#17213a',
              lineHeight: 1.2
            }}
          >
            {item.title}
          </div>

          <div
            style={{
              marginTop: 3,
              fontSize: 10,
              color:
                '#8a93a3'
            }}
          >
            {item.subtitle}
          </div>
        </div>

        <div
          style={{
            color:
              '#8a93a3',
            fontSize: 13,
            paddingRight: 4
          }}
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
      windowWidth
    } = this.state;

    const mobile =
      windowWidth <= 640;

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
        style={{
          width: '100%',
          minHeight:
            mobile
              ? 'auto'
              : 480,
          border:
            '1px solid #d8dde5',
          borderRadius: 16,
          background:
            '#ffffff',
          boxShadow:
            '0 5px 18px rgba(0,0,0,.06)',
          boxSizing:
            'border-box',
          overflow: 'hidden',
          padding:
            mobile
              ? 16
              : 22
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
                : 'flex-start',
            justifyContent:
              'space-between',
            gap: 14,
            marginBottom: 18
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing:
                  '2px',
                color:
                  '#ed1c24',
                marginBottom: 5
              }}
            >
              ♧ SOCIAL &amp; COMMUNITY
            </div>

            <div
              style={{
                fontSize:
                  mobile
                    ? 17
                    : 18,
                color:
                  '#17213a',
                fontWeight: 500
              }}
            >
              Stay connected
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                '1fr 1fr',
              width:
                mobile
                  ? '100%'
                  : 260,
              padding: 3,
              border:
                '1px solid #d9dde4',
              borderRadius: 999,
              background:
                '#ffffff',
              boxShadow:
                '0 2px 7px rgba(0,0,0,.07)',
              boxSizing:
                'border-box'
            }}
          >
            <button
              type="button"
              onClick={() =>
                this.setState({
                  activeTab:
                    'internal'
                })
              }
              style={{
                border: 'none',
                borderRadius:
                  999,
                padding:
                  '9px 16px',
                background:
                  activeTab ===
                  'internal'
                    ? '#ff001b'
                    : 'transparent',
                color:
                  activeTab ===
                  'internal'
                    ? '#ffffff'
                    : '#17213a',
                fontSize: 12,
                fontWeight: 700,
                cursor:
                  'pointer'
              }}
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
              style={{
                border: 'none',
                borderRadius:
                  999,
                padding:
                  '9px 16px',
                background:
                  activeTab ===
                  'external'
                    ? '#ff001b'
                    : 'transparent',
                color:
                  activeTab ===
                  'external'
                    ? '#ffffff'
                    : '#17213a',
                fontSize: 12,
                fontWeight: 700,
                cursor:
                  'pointer'
              }}
            >
              External
            </button>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection:
              'column',
            gap:
              activeTab ===
              'internal'
                ? 10
                : 0
          }}
        >
          {filteredLinks.map(
            (
              item:
                ISocialCommunityLink,
              index:
                number
            ) => {

              if (
                activeTab ===
                'internal'
              ) {

                return this
                  ._renderInternalItem(
                    item
                  );
              }

              return this
                ._renderExternalItem(
                  item,
                  index ===
                    filteredLinks.length -
                    1
                );
            }
          )}
        </div>
      </section>
    );
  }
}