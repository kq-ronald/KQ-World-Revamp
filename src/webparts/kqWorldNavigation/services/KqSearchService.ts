import { SPHttpClient } from '@microsoft/sp-http';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { kqSearchItems } from '../data/searchData';
import type { IKqSearchItem, KqSearchCategory } from '../data/searchData';
import { createKqSearch } from '../data/searchKqItems';
import { navigationItems } from '../data/navigationData';

/* =========================================================
   TYPES
========================================================= */
export interface IKqSearchResult {
  id: string;
  title: string;
  description?: string;
  url: string;
  category: string;          // content type / category chip
  typeLabel?: string;        // PDF, DOCX, Page ...
  openInNewTab: boolean;
  score: number;
  source: 'quick-link' | 'content';
}

export interface IKqLocalSearch {
  results: IKqSearchResult[];
  related: string[];         // rendered as tags
  suggestions: string[];     // predictive phrases
}

/* =========================================================
   CONFIG - edit to match your agreed content sources
========================================================= */
const SEARCH_SCOPES: string[] = [
  '/homepage', '/Notices', '/Quicklinks', '/mrkt', '/hr',
  '/sites/kqdocshares', '/sites/trnProgs', '/erp',
  '/StrategyInnovation', '/fahariaviation'
];

const CATEGORY_BY_PATH: Array<[string, string]> = [
  ['/notices', 'Staff Notices'],
  ['/quicklinks', 'Brand Portal'],
  ['/mrkt', 'Brand Portal'],
  ['/sites/kqdocshares', 'Knowledge Hub'],
  ['/sites/trnprogs', 'Training'],
  ['/erp', 'iPride'],
  ['/hr', 'Human Resource'],
  ['/strategyinnovation', 'Departments'],
  ['/fahariaviation', 'Departments'],
  ['/lists/', 'Departments'],
  ['/sitepages', 'Corporate News']
];

// Fill these in when known. Empty = skipped (no dead links).
const IPRIDE_URL = 'https://i-pride.kenya-airways.com/OA_HTML/AppsLocalLogin.jsp';   // leave / expenses / payslip
const ISAFARI_URL = '';  // staff travel
const ISR_URL = 'https://kenyaairwaysplc.sharepoint.com/sites/isr/workflows/Pages/request.aspx';
const URL_OVERRIDES: Record<string, string> = {
  'it-support': ISR_URL,
  'annual-leave': IPRIDE_URL,
  'brand-portal': 'https://kenyaairwaysplc.sharepoint.com/Quicklinks/KQ%20Brand%20Documents/Forms/AllItems.aspx',
  'kq-brand-documents': 'https://kenyaairwaysplc.sharepoint.com/Quicklinks/KQ%20Brand%20Documents/Forms/AllItems.aspx',
  'policy-statements': 'https://kenyaairwaysplc.sharepoint.com/sites/kqdocshares/omnidocs/Pages/homev2.aspx',
  'the-pride': 'https://kenyaairwaysplc.sharepoint.com/sites/KQWorldhome?kqView=news&type=take3'
};

// The engine types category as a fixed union; display labels like "Staff Notices" need a cast.
const cat = (label: string): KqSearchCategory => label as KqSearchCategory;

const ACTION_ITEMS: IKqSearchItem[] = [
  {
    id: 'action-ticket', title: 'Log a Ticket', description: 'Raise a request in the ISR system.', url: ISR_URL,
    keywords: ['ticket', 'request', 'isr', 'support', 'incident'], aliases: ['ISR', 'raise ticket'],
    intents: ['log a ticket', 'raise a ticket', 'report a problem'], category: cat('Quick Action'), priority: 90, openInNewTab: true
  },
  {
    id: 'action-safety', title: 'Report Safety Concern', description: 'Report a safety concern in Galiot.',
    url: 'https://kq.galiot.net/galiot/login.action?input=true&redirectCms=1788765882604',
    keywords: ['safety', 'incident', 'hazard', 'report', 'galiot'], aliases: ['galiot', 'safety report'],
    intents: ['report a safety concern', 'report a hazard'], category: cat('Quick Action'), priority: 85, openInNewTab: true
  },
  {
    id: 'action-travel', title: 'Book Staff Travel', description: 'Book staff travel in iSafari.', url: ISAFARI_URL,
    keywords: ['travel', 'staff travel', 'flight', 'isafari', 'book'], aliases: ['isafari', 'staff ticket'],
    intents: ['book staff travel', 'book a flight'], category: cat('Quick Action'), priority: 90, openInNewTab: true
  },
  {
    id: 'action-expense', title: 'Submit Expense', description: 'Submit an expense claim in iPride.', url: IPRIDE_URL,
    keywords: ['expense', 'expenses', 'claim', 'reimbursement', 'ipride'], aliases: ['expense claim'],
    intents: ['submit expense', 'claim expenses'], category: cat('Quick Action'), priority: 80, openInNewTab: true
  },
  {
    id: 'action-payslip', title: 'View my Payslip', description: 'View your payslip in iPride.', url: IPRIDE_URL,
    keywords: ['payslip', 'salary', 'pay', 'payroll', 'ipride'], aliases: ['pay slip', 'salary slip'],
    intents: ['view my payslip', 'see my salary'], category: cat('Quick Action'), priority: 85, openInNewTab: true
  }
];

/* =========================================================
   HELPERS
========================================================= */
const STOP_WORDS = new Set([
  'i', 'me', 'my', 'we', 'a', 'an', 'the', 'to', 'of', 'in', 'on', 'for', 'and', 'or', 'is', 'are',
  'how', 'do', 'can', 'where', 'what', 'want', 'need', 'go', 'find', 'open', 'get', 'view', 'read', 'show', 'please'
]);

export const normalize = (text: string): string =>
  (text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

/** Meaningful words, unstemmed (used for highlighting and the SharePoint query). */
export const tokenize = (text: string, _opts?: { stem?: boolean }): string[] => {
  const words = normalize(text).split(' ').filter(Boolean);
  const meaningful = words.filter(w => !STOP_WORDS.has(w));
  return meaningful.length > 0 ? meaningful : words;
};

const canonicalUrl = (url: string): string =>
  url.toLowerCase().split('#')[0].split('?')[0].replace(/\/+$/, '');

const categoryFromPath = (path: string): string => {
  const lower = path.toLowerCase();
  for (const [fragment, label] of CATEGORY_BY_PATH) {
    if (lower.indexOf(fragment) >= 0) return label;
  }
  return 'KQ World';
};

/* =========================================================
   SERVICE
========================================================= */
export class KqSearchService {
  private entries: IKqSearchItem[] | null = null;
  private engine: ReturnType<typeof createKqSearch> | null = null;
  private processes: IKqSearchItem[] = [];
  private processesPromise: Promise<void> | null = null;
  private readonly remoteCache = new Map<string, { at: number; results: IKqSearchResult[] }>();
  private readonly inFlight = new Map<string, Promise<IKqSearchResult[]>>();
  private static readonly CACHE_MS = 120000;

  constructor(private context: WebPartContext) { }

  private get origin(): string {
    return this.context.pageContext.web.absoluteUrl.split('/').slice(0, 3).join('/');
  }

  /* ---------- index ---------- */
  private buildEntries(): IKqSearchItem[] {
    const navByTitle = new Map<string, { title: string; url: string; parent: string }>();
    navigationItems.forEach(parent => {
      (parent.children || []).forEach(child => {
        if (child.url && child.url !== '#') {
          navByTitle.set(normalize(child.title), { title: child.title, url: child.url, parent: parent.title });
        }
      });
    });

    const entries: IKqSearchItem[] = [];
    const used = new Set<string>();

    // 1) Curated items add aliases/intents; the menu is the source of truth for URLs.
    kqSearchItems.forEach(item => {
      const key = normalize(item.title);
      const nav = navByTitle.get(key);
      const url = URL_OVERRIDES[item.id] || (nav && nav.url) || item.url;
      if (!url || url.charAt(0) === '#') {
        console.warn(`[KqSearch] "${item.title}" skipped: no URL yet.`);
        return;
      }
      used.add(key);
      entries.push({ ...item, url, category: nav ? cat(nav.parent) : item.category });
    });

    // 2) Every other menu link becomes searchable automatically.
    navByTitle.forEach((nav, key) => {
      if (used.has(key)) return;
      entries.push({
        id: `nav-${key.replace(/ /g, '-')}`, title: nav.title, description: `${nav.parent} · KQ World`,
        url: nav.url, keywords: [nav.parent], category: cat(nav.parent), priority: 60, openInNewTab: true
      });
    });

    // 3) Quick actions with a known URL.
    ACTION_ITEMS.forEach(a => { if (a.url) entries.push(a); });

    // 4) Online Processes.
    return entries.concat(this.processes);
  }

  private getEntries(): IKqSearchItem[] {
    if (!this.entries) this.entries = this.buildEntries();
    return this.entries;
  }

  private getEngine(): ReturnType<typeof createKqSearch> {
    if (!this.engine) this.engine = createKqSearch(this.getEntries());
    return this.engine;
  }

  /** Call on first focus. Loads the Online Processes list once. */
  public preload(): Promise<void> {
    if (!this.processesPromise) {
      const url =
        `${this.origin}/homepage/_api/web/lists/getbytitle('Online Processes')/items` +
        `?$select=Id,Title,Content_x0020_Link,ProcessType&$orderby=Title%20asc&$top=500`;
      this.processesPromise = this.context.spHttpClient
        .get(url, SPHttpClient.configurations.v1, { headers: { Accept: 'application/json;odata=nometadata' } })
        .then(res => { if (!res.ok) throw new Error(`Online Processes HTTP ${res.status}`); return res.json(); })
        .then((json: { value?: Array<{ Id: number; Title: string; Content_x0020_Link?: string | { Url: string }; ProcessType?: string }> }) => {
          this.processes = (json.value || [])
            .map(row => {
              const link = row.Content_x0020_Link;
              const href = typeof link === 'string' ? link : link ? link.Url : '';
              return {
                id: `process-${row.Id}`, title: row.Title,
                description: row.ProcessType ? `${row.ProcessType} · Online Process` : 'Online Process',
                url: href, keywords: row.ProcessType ? [row.ProcessType] : [],
                category: cat('Online Process'), priority: 70, openInNewTab: true
              } as IKqSearchItem;
            })
            .filter(e => !!e.title && !!e.url);
          this.entries = null; // rebuild with processes included
          this.engine = null;
        })
        .catch(err => { this.processesPromise = null; console.warn('[KqSearch] Online Processes unavailable:', err); });
    }
    return this.processesPromise;
  }

  /* ---------- local (instant) search: uses your createKqSearch engine ---------- */
  public searchLocal(query: string, limit: number): IKqLocalSearch {
    const q = normalize(query);
    if (!q) return { results: [], related: [], suggestions: [] };

    const found = this.getEngine()(query, { limit });
    const results: IKqSearchResult[] = found.map(r => ({
      id: r.id, title: r.title, description: r.description, url: r.url, category: r.category,
      openInNewTab: r.openInNewTab !== false, score: r.score, source: 'quick-link'
    }));

    // Related tags: aliases of the best matches + siblings in the same category.
    const related: string[] = [];
    const seen = new Set<string>([q]);
    const queryWords = tokenize(query);
    const push = (label: string): void => {
      const key = normalize(label);
      if (!key || seen.has(key) || label.length > 30 || queryWords.indexOf(key) >= 0) return;
      seen.add(key);
      related.push(label);
    };
    const top = found.slice(0, 3);
    const shown = new Set(found.map(r => r.id));
    const categories = new Set(top.map(r => r.category));
    top.forEach(r => (r.aliases || []).forEach(push));
    this.getEntries()
      .filter(e => categories.has(e.category) && !shown.has(e.id))
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .forEach(e => push(e.title));
    top.forEach(r => (r.keywords || []).filter(k => k.length > 3).forEach(push));

    return { results, related: related.slice(0, 6), suggestions: this.getSuggestions(q) };
  }

  /** Predictive phrases - what the user is probably about to type. */
  private getSuggestions(q: string): string[] {
    const last = q.split(' ').pop() || q;
    const scored: Array<{ text: string; w: number }> = [];
    const seen = new Set<string>();
    this.getEntries().forEach(e => {
      [e.title].concat(e.aliases || [], e.intents || []).forEach(text => {
        const n = normalize(text);
        if (!n || n === q || seen.has(n)) return;
        let w = 0;
        if (n.indexOf(q) === 0) w = 3;
        else if (last.length >= 2 && n.split(' ').some(word => word.indexOf(last) === 0)) w = 1;
        if (w) { seen.add(n); scored.push({ text, w: w * 100 + (e.priority || 0) }); }
      });
    });
    return scored.sort((a, b) => b.w - a.w).slice(0, 3).map(x => x.text);
  }

  /** Exact employee actions. Never guess on ambiguous queries such as "leave policy". */
  public resolveShortcut(input: string): IKqSearchResult | undefined {
    const q = normalize(input);
    const shortcuts: Array<{ phrases: string[]; title: string; url: string; category: string }> = [
      { phrases: ['request annual leave', 'apply for leave', 'book leave', 'leave application', 'i want to go on leave', 'take time off', 'request leave'], title: 'Request Annual Leave', url: IPRIDE_URL, category: 'HR' },
      { phrases: ['reset my password', 'change my password', 'forgot password', 'password reset', 'password change', 'unlock my account'], title: 'Change or Reset Password', url: ISR_URL, category: 'IT Support' },
      { phrases: ['kq logo and brand guidelines', 'kq logo', 'brand guidelines', 'download kq logo', 'brand assets', 'brand documents'], title: 'KQ Logo and Brand Guidelines', url: URL_OVERRIDES['brand-portal'], category: 'Brand Portal' },
      { phrases: ['find a policy', 'company policies', 'policy statements', 'search policies', 'find policy'], title: 'Find a Policy', url: URL_OVERRIDES['policy-statements'], category: 'Knowledge Hub' },
      { phrases: ['latest pride newsletter', 'latest pride', 'the pride newsletter', 'pride newsletter'], title: 'Latest Pride Newsletter', url: URL_OVERRIDES['the-pride'], category: 'Corporate News' }
    ];
    const match = shortcuts.find(item => item.phrases.some(phrase => normalize(phrase) === q));
    return match ? { id: `intent-${normalize(match.title)}`, title: match.title, url: match.url, category: match.category, openInNewTab: true, score: 9999, source: 'quick-link' } : undefined;
  }

  /* ---------- SharePoint content search ---------- */
  public searchSharePoint(query: string, limit: number): Promise<IKqSearchResult[]> {
    const terms = tokenize(query).filter(t => t.length >= 2).slice(0, 6);
    if (!terms.length || normalize(query).length < 3) return Promise.resolve([]);
    const key = `${normalize(query)}|${limit}`;
    const cached = this.remoteCache.get(key);
    if (cached && Date.now() - cached.at < KqSearchService.CACHE_MS) return Promise.resolve(cached.results);
    const pending = this.inFlight.get(key);
    if (pending) return pending;

    const escapeKql = (value: string): string => value.replace(/["\\]/g, ' ').trim();
    const termClause = terms.map(escapeKql).filter(Boolean).join(' ');
    const scopes = SEARCH_SCOPES.map(path => `Path:"${this.origin}${path}*"`).join(' OR ');
    const body = {
      request: {
        Querytext: `(${termClause}) AND (${scopes})`,
        RowLimit: Math.min(50, limit + 10),
        TrimDuplicates: true,
        SelectProperties: [
          'Title',
          'Path',
          'HitHighlightedSummary',
          'FileExtension',
          'LastModifiedTime'
        ]
      }
    };
    const task = (async (): Promise<IKqSearchResult[]> => {
      const res = await this.context.spHttpClient.post(
        `${this.origin}/homepage/_api/search/postquery`,
        SPHttpClient.configurations.v1,
        { headers: { Accept: 'application/json;odata=nometadata', 'Content-Type': 'application/json;odata=nometadata' }, body: JSON.stringify(body) }
      );
      if (!res.ok) {
        const detail = (await res.text()).slice(0, 600);
        throw new Error(`SharePoint search HTTP ${res.status}: ${detail}`);
      }
      const json = await res.json();
      const relevant = json?.PrimaryQueryResult?.RelevantResults || json?.d?.postquery?.PrimaryQueryResult?.RelevantResults;
      const rows: any[] = relevant?.Table?.Rows?.results || relevant?.Table?.Rows || [];
      const out: IKqSearchResult[] = [];
      rows.forEach((row, index) => {
        const cells: Array<{ Key: string; Value: string }> = row?.Cells?.results || row?.Cells || [];
        const cellMap = new Map(cells.map(c => [c.Key, c.Value]));
        const get = (name: string): string => cellMap.get(name) || '';
        const path = get('Path');
        if (!/^https?:\/\//i.test(path) || /\/_(catalogs|layouts)\//i.test(path)) return;
        const ext = get('FileExtension').toUpperCase();
        const summary = get('HitHighlightedSummary').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
        out.push({
          id: `sp-${index}-${canonicalUrl(path)}`, title: get('Title') || path.split('/').pop() || path,
          description: summary || undefined, url: path, category: categoryFromPath(path), typeLabel: ext || 'Page',
          openInNewTab: true, score: 0, source: 'content'
        });
      });
      this.remoteCache.set(key, { at: Date.now(), results: out });
      if (this.remoteCache.size > 80) this.remoteCache.delete(this.remoteCache.keys().next().value as string);
      return out;
    })();
    this.inFlight.set(key, task);
    return task.finally(() => { this.inFlight.delete(key); });
  }

  /** Blend high-confidence quick links with content results, deduplicated by URL. */
  public merge(local: IKqSearchResult[], remote: IKqSearchResult[], limit: number, query = ''): IKqSearchResult[] {
    const shortcut = this.resolveShortcut(query);
    const items = shortcut ? [shortcut, ...local, ...remote] : [...local, ...remote];
    const seen = new Set<string>();
    return items.filter(item => {
      const key = canonicalUrl(item.url);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, limit);
  }
}
