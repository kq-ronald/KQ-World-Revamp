import * as React from 'react';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import styles from './KqWorldNavigation.module.scss';
import { KqSearchService, IKqSearchResult, tokenize } from '../services/KqSearchService';

// Phrases that actually resolve to results in the index.
const INSPIRATION = [
  'Request annual leave',
  'Reset my password',
  'KQ logo and brand guidelines',
  'Find a policy',
  'Latest Pride newsletter'
];

const PREVIEW_LIMIT = 6;
const SUBMITTED_LIMIT = 20;

type Status = 'idle' | 'loading' | 'ready' | 'error';

export interface IKqSearchProps {
  context: WebPartContext;
  variant: 'desktop' | 'mobile';
  /** e.g. close the mobile menu when search gets focus */
  onFocus?: () => void;
}

const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const Highlight: React.FC<{ text: string; tokens: string[] }> = ({ text, tokens }) => {
  if (!tokens.length) return <>{text}</>;
  const re = new RegExp(`(${tokens.map(escapeRegExp).join('|')})`, 'ig');
  return (
    <>
      {text.split(re).map((part, i) =>
        i % 2 === 1 ? <mark key={i} className={styles.searchMark}>{part}</mark> : <React.Fragment key={i}>{part}</React.Fragment>
      )}
    </>
  );
};

const KqSearch: React.FC<IKqSearchProps> = ({ context, variant, onFocus }) => {
  const service = React.useMemo(() => new KqSearchService(context), [context]);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const requestId = React.useRef(0);

  const [query, setQuery] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [status, setStatus] = React.useState<Status>('idle');
  const [results, setResults] = React.useState<IKqSearchResult[]>([]);
  const [related, setRelated] = React.useState<string[]>([]);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [warning, setWarning] = React.useState('');
  const [active, setActive] = React.useState(-1);

  const listId = `kq-search-${variant}`;
  const tokens = React.useMemo(() => tokenize(query, { stem: false }), [query]);

  /* ---------- outside click ---------- */
  React.useEffect(() => {
    const onDown = (e: MouseEvent): void => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActive(-1);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  /* ---------- run a search: instant local results, then SharePoint content ---------- */
  const runSearch = React.useCallback(async (text: string, limit: number): Promise<void> => {
    const id = ++requestId.current;
    const q = text.trim();
    if (!q) {
      setStatus('idle'); setResults([]); setRelated([]); setSuggestions([]); setWarning('');
      return;
    }

    const local = service.searchLocal(q, limit);
    setResults(local.results);
    setRelated(local.related);
    setSuggestions(local.suggestions);
    setWarning('');
    setStatus('loading');
    setActive(-1);

    try {
      const remote = await service.searchSharePoint(q, limit);
      if (id !== requestId.current) return; // a newer search replaced this one
      setResults(service.merge(local.results, remote, limit));
      setStatus('ready');
    } catch (error) {
      if (id !== requestId.current) return;
      console.error('KQ World content search failed:', error);
      if (local.results.length === 0) {
        setStatus('error');
      } else {
        setWarning('Showing quick links only. Content search is unavailable right now.');
        setStatus('ready');
      }
    }
  }, [service]);

  // Debounced as-you-type search.
  React.useEffect(() => {
    if (!query.trim()) {
      requestId.current++;
      setStatus('idle'); setResults([]); setRelated([]); setSuggestions([]); setWarning('');
      return;
    }
    const timer = window.setTimeout(() => {
      runSearch(query, submitted ? SUBMITTED_LIMIT : PREVIEW_LIMIT).catch(() => undefined);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query, submitted, runSearch]);

  /* ---------- actions ---------- */
  const openResult = (item: IKqSearchResult): void => {
    setOpen(false);
    setActive(-1);
    if (item.openInNewTab) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.assign(item.url);
    }
  };

  const pickPhrase = (phrase: string): void => {
    setQuery(phrase);
    setSubmitted(false);
    setOpen(true);
    if (inputRef.current) inputRef.current.focus();
  };

  const submit = (): void => {
    if (!query.trim()) return;
    setSubmitted(true);
    setOpen(true);
    runSearch(query, SUBMITTED_LIMIT).catch(() => undefined);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      if (results.length) setActive(a => (a + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length) setActive(a => (a <= 0 ? results.length - 1 : a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (active >= 0 && results[active]) openResult(results[active]);
      else submit();
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActive(-1);
    }
  };

  /* ---------- pieces ---------- */
  const spinner = (label: string): JSX.Element => (
    <div className={styles.searchState} role="status">
      <span className={styles.searchSpinner} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );

  const renderTags = (title: string, tags: string[]): JSX.Element | null =>
    tags.length ? (
      <div className={styles.searchTagsBlock}>
        <div className={styles.searchDropdownTitle}>{title}</div>
        <div className={styles.searchTags}>
          {tags.map(tag => (
            <button key={tag} type="button" className={styles.searchTag} onClick={() => pickPhrase(tag)}>
              {tag}
            </button>
          ))}
        </div>
      </div>
    ) : null;

  const renderBody = (): JSX.Element => {
    // 1) Nothing typed: inspiration.
    if (!query.trim()) {
      return (
        <>
          <div className={styles.searchDropdownTitle}>Need inspiration? Try searching for...</div>
          <div className={styles.searchSuggestionList}>
            {INSPIRATION.map(text => (
              <button key={text} type="button" className={styles.searchSuggestion} onClick={() => pickPhrase(text)}>
                <span className={styles.searchSuggestionIcon}>⌕</span>
                <span className={styles.searchSuggestionText}>{text}</span>
                <span className={styles.searchSuggestionArrow}>→</span>
              </button>
            ))}
          </div>
        </>
      );
    }

    // 2) Loading with nothing to show yet.
    if (status === 'loading' && results.length === 0) return spinner('Searching KQ World...');

    // 3) Error with nothing to show.
    if (status === 'error' && results.length === 0) {
      return (
        <div className={styles.searchState} role="alert">
          <span>We couldn't complete your search. Please try again.</span>
          <button type="button" className={styles.searchRetry} onClick={submit}>Try again</button>
        </div>
      );
    }

    // 4) Loaded, nothing found.
    if (status === 'ready' && results.length === 0) {
      return (
        <>
          <div className={styles.searchState}>
            <span>No results for “{query.trim()}”</span>
            <span className={styles.searchStateHint}>Check the spelling or try a broader keyword.</span>
          </div>
          {renderTags(suggestions.length ? 'Did you mean' : 'Popular searches', suggestions.length ? suggestions : INSPIRATION.slice(0, 4))}
        </>
      );
    }

    // 5) Results.
    return (
      <>
        {suggestions.length > 0 && results.length < 3 && renderTags('Suggested searches', suggestions)}
        <div className={styles.searchDropdownTitle}>
          {submitted ? `Results for “${query.trim()}”` : 'Suggested results'}
        </div>
        <div className={styles.searchSuggestionList} role="listbox" id={listId} aria-label="Search results">
          {results.map((item, index) => (
            <button
              key={item.id}
              id={`${listId}-${index}`}
              type="button"
              role="option"
              aria-selected={active === index}
              className={`${styles.searchSuggestion} ${styles.searchResultRow} ${active === index ? styles.searchSuggestionActive : ''}`}
              onMouseEnter={() => setActive(index)}
              onClick={() => openResult(item)}
            >
              <span className={styles.searchSuggestionIcon}>⌕</span>
              <span className={styles.searchResultBody}>
                <span className={styles.searchResultTitle}><Highlight text={item.title} tokens={tokens} /></span>
                {item.description ? <span className={styles.searchResultDesc}>{item.description}</span> : null}
              </span>
              <span className={styles.searchCategory}>
                {item.typeLabel ? `${item.typeLabel} · ` : ''}{item.category}
              </span>
              <span className={styles.searchSuggestionArrow}>→</span>
            </button>
          ))}
        </div>
        {status === 'loading' && spinner('Searching content...')}
        {warning ? <div className={styles.searchWarning} role="status">{warning}</div> : null}
        {renderTags('Related searches', related)}
      </>
    );
  };

  return (
    <div
      ref={rootRef}
      className={variant === 'desktop' ? styles.searchBox : styles.mobileSearch}
      style={variant === 'desktop' ? { width: '240px', minWidth: '200px', maxWidth: '240px', flexShrink: 0 } : undefined}
    >
      <span className={styles.searchIcon} aria-hidden="true">⌕</span>
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-label="Search KQ World"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        placeholder="Search KQ World"
        value={query}
        onFocus={() => {
          setOpen(true);
          service.preload().catch(() => undefined);
          if (onFocus) onFocus();
        }}
        onChange={e => {
          setQuery(e.target.value);
          setSubmitted(false);
          setActive(-1);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />
      {open && <div className={styles.searchDropdown}>{renderBody()}</div>}
    </div>
  );
};

export default KqSearch;
