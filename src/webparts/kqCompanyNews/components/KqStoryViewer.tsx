import * as React from 'react';
import KqCompanyNewsService from '../services/KqCompanyNewsService';
import { IKqCompanyNewsItem } from '../models/IKqCompanyNewsItem';

export interface IKqStoryViewerProps {
  item: IKqCompanyNewsItem;
  service: KqCompanyNewsService;
  isDarkMode: boolean;
  onBack: () => void;
}

interface IKqStoryViewerState {
  story?: IKqCompanyNewsItem;
  loading: boolean;
  error: string;
  isFullscreen: boolean;
}

/** Extract a SharePoint-hosted PDF URL from page canvas or embedded web-part metadata. */
function findMagazinePdf(source: string, pageUrl: string): string {
  if (!source) return '';
  const decoded = document.createElement('textarea');
  decoded.innerHTML = source;
  const candidates = [
    source,
    decoded.value,
    source.replace(/\\u002[fF]/g, '/').replace(/\\\//g, '/')
      .replace(/&amp;/g, '&').replace(/%2[fF]/g, '/')
  ];
  // SharePoint's file viewer may store the file URL in a JSON-escaped string.
  const pattern = /(?:https?:\/\/[^\s"'<>\\]+|\/(?:sites|teams|homepage|SiteAssets|Shared%20Documents|Shared Documents)[^\s"'<>\\]*|[^"'<>\\\s]{1,300})\.pdf(?:\?[^"'<>\\\s]*)?/gi;
  for (const value of candidates) {
    const matches = value.match(pattern) || [];
    for (const candidate of matches) {
      try {
        const cleaned = candidate.replace(/&quot;.*$/, '').replace(/&amp;/g, '&');
        const url = new URL(cleaned, pageUrl);
        if (url.protocol === 'https:' &&
            url.hostname.toLowerCase() === 'kenyaairwaysplc.sharepoint.com' &&
            /\.pdf$/i.test(url.pathname)) {
          return url.href;
        }
      } catch { /* Skip invalid URLs */ }
    }
  }
  return '';
}

/** Render supported story markup without executing SharePoint web parts or scripts. */
function safeStoryHtml(source: string, pageUrl: string): string {
  if (!source || typeof DOMParser === 'undefined') return '';
  const doc = new DOMParser().parseFromString(source, 'text/html');
  const output = doc.createElement('div');
  const allowed = new Set([
    'p', 'div', 'span', 'strong', 'b', 'em', 'i', 'u', 's', 'blockquote',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'hr', 'ul', 'ol', 'li',
    'a', 'img', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tfoot',
    'tr', 'th', 'td', 'pre', 'code', 'sup', 'sub'
  ]);
  const blocked = new Set([
    'script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button',
    'textarea', 'select', 'svg', 'math', 'template', 'noscript', 'video', 'audio'
  ]);
  const safeUrl = (raw: string): string => {
    try {
      const parsed = new URL(raw, pageUrl || window.location.origin);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:'
        ? parsed.href : '';
    } catch { return ''; }
  };
  const copy = (node: Node, target: Node): void => {
    if (node.nodeType === 3) {
      target.appendChild(doc.createTextNode(node.textContent || ''));
      return;
    }
    if (node.nodeType !== 1) return;
    const element = node as Element;
    const tag = element.tagName.toLowerCase();
    if (blocked.has(tag)) return;
    const container: Node = allowed.has(tag) ? doc.createElement(tag) : target;
    if (container !== target && container instanceof Element) {
      if (tag === 'a') {
        const href = safeUrl(element.getAttribute('href') || '');
        if (href) {
          container.setAttribute('href', href);
          container.setAttribute('target', '_blank');
          container.setAttribute('rel', 'noopener noreferrer');
        }
      }
      if (tag === 'img') {
        const src = safeUrl(element.getAttribute('src') || '');
        if (!src) return;
        container.setAttribute('src', src);
        container.setAttribute('alt', element.getAttribute('alt') || 'Story image');
        container.setAttribute('loading', 'lazy');
        container.setAttribute('style', 'max-width:100%;height:auto;border-radius:8px;');
      }
      if (tag === 'th' || tag === 'td') {
        for (const attr of ['colspan', 'rowspan']) {
          const val = element.getAttribute(attr);
          if (val && /^\d{1,2}$/.test(val)) container.setAttribute(attr, val);
        }
      }
      target.appendChild(container);
    }
    if (tag !== 'img') {
      Array.from(element.childNodes).forEach(child => copy(child, container));
    }
  };
  Array.from(doc.body.childNodes).forEach(node => copy(node, output));
  return output.innerHTML;
}

export default class KqStoryViewer extends React.Component<IKqStoryViewerProps, IKqStoryViewerState> {
  private readonly _pdfContainerRef = React.createRef<HTMLDivElement>();

  private _syncFullscreen = (): void => {
    this.setState({ isFullscreen: document.fullscreenElement === this._pdfContainerRef.current });
  };

  private _toggleFullscreen = async (): Promise<void> => {
    try {
      if (document.fullscreenElement === this._pdfContainerRef.current) {
        await document.exitFullscreen();
      } else if (this._pdfContainerRef.current) {
        await this._pdfContainerRef.current.requestFullscreen();
      }
    } catch {
      // Browser or tenant policy may block fullscreen.
      this.setState({ error: 'Fullscreen is blocked by your browser or SharePoint page settings.' });
    }
  };

  public constructor(props: IKqStoryViewerProps) {
    super(props);
    this.state = { loading: false, error: '', isFullscreen: false };
  }

  public componentDidMount(): void {
    document.addEventListener('fullscreenchange', this._syncFullscreen);
    void this._loadStory();
  }

  public componentWillUnmount(): void {
    document.removeEventListener('fullscreenchange', this._syncFullscreen);
  }

  public componentDidUpdate(previousProps: IKqStoryViewerProps): void {
    if (previousProps.item.id !== this.props.item.id ||
        previousProps.item.type !== this.props.item.type) {
      this.setState({ story: undefined, error: '' }, () => { void this._loadStory(); });
    }
  }

  private async _loadStory(): Promise<void> {
    const { item, service } = this.props;
    if (item.type === 'blog') return;
    this.setState({ loading: true, error: '' });
    try {
      const story = await service.getStoryById(item.id, item.type);
      if (this.props.item.id === item.id && this.props.item.type === item.type) {
        this.setState({ story, loading: false });
      }
    } catch (error) {
      if (this.props.item.id === item.id && this.props.item.type === item.type) {
        this.setState({
          loading: false,
          error: error instanceof Error ? error.message : 'Unable to load the story.'
        });
      }
    }
  }

  public render(): React.ReactElement {
    const item = this.state.story || this.props.item;
    const dark = this.props.isDarkMode;
    const foreground = dark ? '#fff' : '#171717';
    const muted = dark ? '#c7ccd4' : '#666';
    const html = item.contentHtml ? safeStoryHtml(item.contentHtml, item.itemUrl) : '';
    const isPride = item.type === 'pride';
    const pdfUrl = isPride ? findMagazinePdf(item.contentHtml || '', item.itemUrl) : '';

    return (
      <main style={{
        minHeight: '100%', padding: '28px clamp(16px, 5vw, 72px)',
        background: dark ? '#171b22' : '#fff', color: foreground,
        fontFamily: 'Montserrat, Arial, sans-serif', boxSizing: 'border-box'
      }}>
        <button type="button" onClick={this.props.onBack} style={{
          cursor: 'pointer', background: 'transparent', color: foreground,
          border: '1px solid currentColor', borderRadius: 20,
          padding: '9px 18px', marginBottom: 24
        }}>← Back to news</button>
        <article style={{ maxWidth: isPride ? 1150 : 1000, margin: '0 auto' }}>
          <p style={{ color: muted, fontSize: 13, textTransform: 'uppercase' }}>
            {item.category || item.type}
          </p>
          <h1 style={{ fontSize: 'clamp(24px, 3vw, 40px)', lineHeight: 1.25 }}>
            {item.title}
          </h1>
          {this.state.loading && <p style={{ color: muted }}>Loading full story...</p>}
          {this.state.error && <p role="alert" style={{ color: '#e57373' }}>{this.state.error}</p>}
          {!this.state.loading && !this.state.error && pdfUrl && (
            <div ref={this._pdfContainerRef} style={{
              background: dark ? '#171b22' : '#fff',
              padding: this.state.isFullscreen ? 12 : 0,
              display: 'flex', flexDirection: 'column',
              height: this.state.isFullscreen ? '100vh' : 'auto',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                <button type="button" onClick={() => { void this._toggleFullscreen(); }}
                  style={{ cursor: 'pointer', padding: '10px 16px', borderRadius: 6,
                    border: '1px solid currentColor', background: 'transparent', color: foreground }}>
                  {this.state.isFullscreen ? 'Exit fullscreen' : 'Fullscreen magazine'}
                </button>
              </div>
              <iframe
                title={`${item.title} magazine`}
                src={pdfUrl}
                style={{ width: '100%', height: this.state.isFullscreen ? '100%' : 'min(80vh, 1100px)',
                  minHeight: this.state.isFullscreen ? 0 : 550, flex: this.state.isFullscreen ? 1 : undefined,
                  border: '1px solid #777', borderRadius: 8, background: '#fff' }}
              />
              <p style={{ color: muted, fontSize: 13 }}>
                If the PDF does not appear,{' '}
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
                  style={{ color: dark ? '#fff' : '#e30613' }}>
                  open the magazine PDF directly
                </a>.
              </p>
            </div>
          )}
          {!this.state.loading && !this.state.error && !pdfUrl && html && (
            <div className="kqStoryBody" style={{ lineHeight: 1.75, overflowWrap: 'anywhere' }}
              dangerouslySetInnerHTML={{ __html: html }} />
          )}
          {!this.state.loading && !this.state.error && !pdfUrl && !html && (
            <p style={{ color: muted }}>
              {item.type === 'blog'
                ? 'Blog articles are hosted on the Kenya Airways corporate website.'
                : 'No supported article body was found in this SharePoint page.'}
            </p>
          )}
          {!this.state.loading && !this.state.error && isPride && !pdfUrl && item.itemUrl && (
            <p><a href={item.itemUrl} target="_blank" rel="noopener noreferrer"
              style={{ color: dark ? '#fff' : '#e30613' }}>
              Open the original magazine page
            </a></p>
          )}
          {!this.state.loading && !this.state.error && !isPride && !html && item.itemUrl && (
            <a href={item.itemUrl} target="_blank" rel="noopener noreferrer"
              style={{ color: dark ? '#fff' : '#e30613' }}>
              Open original article
            </a>
          )}
        </article>
      </main>
    );
  }
}
