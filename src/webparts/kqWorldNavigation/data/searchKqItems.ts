import { IKqSearchItem, KqSearchCategory, kqSearchItems } from './searchData';

export interface IKqSearchOptions {
  limit?: number;
  category?: KqSearchCategory;
  includeUnavailable?: boolean;
}

export interface IKqSearchResult extends IKqSearchItem {
  score: number;
  matchType: 'exact' | 'direct' | 'related';
  available: boolean;
}

interface IIndexedItem {
  item: IKqSearchItem;
  terms: Map<string, number>;
  names: string[];
  phrases: string[];
  available: boolean;
  order: number;
}

interface ITermMatch {
  strength: number;
  direct: boolean;
}

const STOP_WORDS = new Set(
  'a an the i me my we our you your to for of on in at from with and or is are am be been was were do does did can could would should will want need please how where what which find search show open view read get access use go download locate looking tell give fetch'.split(' ')
);

const SINGULARS: Record<string, string> = {
  news: 'news', access: 'access', status: 'status', business: 'business',
  policies: 'policy', stories: 'story', resources: 'resource',
  documents: 'document', documentation: 'document', docs: 'document', doc: 'document',
  instructions: 'instruction', guidelines: 'guideline',
  children: 'child', people: 'people'
};

function normalize(value: string): string {
  return value.slice(0, 2000).normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\btake\s*three\b/g, 'take 3')
    .replace(/\btake3\b/g, 'take 3')
    .replace(/\bi\s+pride\b/g, 'ipride')
    .replace(/\bwi\s+fi\b/g, 'wifi')
    .replace(/\bsign\s+in\b/g, 'login')
    .replace(/\btime\s+off\b/g, 'leave')
    .replace(/\s+/g, ' ')
    .trim();
}

function singular(term: string): string {
  if (Object.prototype.hasOwnProperty.call(SINGULARS, term)) return SINGULARS[term];
  if (term.length > 4 && /s$/.test(term) && !/(ss|us|is)$/.test(term)) return term.slice(0, -1);
  return term;
}

function tokenize(value: string): string[] {
  return Array.from(new Set(normalize(value).split(' ')
    .filter(term => term.length > 0 && !STOP_WORDS.has(term))
    .map(singular)));
}

const RELATED_GROUPS = [
  ['manual', 'handbook', 'guide', 'instruction'],
  ['policy', 'rule', 'guideline', 'regulation'],
  ['document', 'file', 'paperwork'],
  ['leave', 'vacation', 'holiday'],
  ['hr', 'human', 'personnel'],
  ['employee', 'staff', 'worker'],
  ['support', 'helpdesk', 'assistance', 'troubleshooting'],
  ['password', 'credential'],
  ['login', 'logon', 'signin'],
  ['wifi', 'internet', 'network', 'connectivity'],
  ['finance', 'financial', 'accounting'],
  ['expense', 'reimbursement', 'claim'],
  ['pension', 'retirement', 'provident', 'saving'],
  ['training', 'learning', 'course', 'lesson'],
  ['template', 'ppt', 'powerpoint', 'presentation'],
  ['logo', 'branding', 'brand'],
  ['news', 'update', 'announcement'],
  ['blog', 'article', 'story'],
  ['newsletter', 'magazine', 'publication']
];

const relatedTerms = new Map<string, Set<string>>();
RELATED_GROUPS.forEach(group => {
  const terms = group.map(singular);
  terms.forEach(term => {
    const related = relatedTerms.get(term) || new Set<string>();
    terms.forEach(other => { if (other !== term) related.add(other); });
    relatedTerms.set(term, related);
  });
});

function availableUrl(value: string): boolean {
  const url = value.trim();
  if (!url || /todo|placeholder/i.test(url) || url.charAt(0) === '#') return false;
  if (/^\/(?!\/)/.test(url)) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch { return false; }
}

function editDistance(a: string, b: string, maximum: number): number {
  if (Math.abs(a.length - b.length) > maximum) return maximum + 1;
  let beforePrevious: number[] = [];
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let row = 1; row <= a.length; row++) {
    const current = [row];
    for (let column = 1; column <= b.length; column++) {
      current[column] = Math.min(
        previous[column] + 1,
        current[column - 1] + 1,
        previous[column - 1] + (a[row - 1] === b[column - 1] ? 0 : 1)
      );
      if (row > 1 && column > 1 && a[row - 1] === b[column - 2] && a[row - 2] === b[column - 1]) {
        current[column] = Math.min(current[column], beforePrevious[column - 2] + 1);
      }
    }
    beforePrevious = previous;
    previous = current;
  }
  return previous[b.length];
}

function termMatch(query: string, candidate: string, allowPrefix: boolean): ITermMatch | undefined {
  if (query === candidate) return { strength: 1, direct: true };
  if (allowPrefix && query.length >= 3 && candidate.indexOf(query) === 0) {
    return { strength: 0.85, direct: true };
  }
  if (relatedTerms.get(query)?.has(candidate)) return { strength: 0.62, direct: false };
  if (query.length < 4 || candidate.length < 4) return undefined;
  const maximum = query.length >= 8 && candidate.length >= 8 ? 2 : 1;
  const distance = editDistance(query, candidate, maximum);
  return distance <= maximum ? { strength: distance === 1 ? 0.70 : 0.53, direct: false } : undefined;
}

export function createKqSearch(items: ReadonlyArray<IKqSearchItem>):
  (input: string, options?: IKqSearchOptions) => IKqSearchResult[] {
  const ids = new Set<string>();
  const index: IIndexedItem[] = [];
  const documentFrequency = new Map<string, number>();

  items.forEach((item, order) => {
    if (ids.has(item.id)) return;
    ids.add(item.id);
    const terms = new Map<string, number>();
    const fields: Array<{ values: string[]; weight: number }> = [
      { values: [item.title], weight: 10 },
      { values: item.aliases || [], weight: 9 },
      { values: item.keywords || [], weight: 6 },
      { values: item.intents || [], weight: 5 },
      { values: [item.description || ''], weight: 2 },
      { values: [item.category], weight: 2 }
    ];
    fields.forEach(field => field.values.forEach(value => tokenize(value).forEach(term => {
      terms.set(term, Math.max(terms.get(term) || 0, field.weight));
    })));
    Array.from(terms.keys()).forEach(term => {
      documentFrequency.set(term, (documentFrequency.get(term) || 0) + 1);
    });
    index.push({
      item, terms, order, available: availableUrl(item.url),
      names: [item.title].concat(item.aliases || []).map(normalize),
      phrases: (item.keywords || []).concat(item.intents || []).map(normalize)
    });
  });

  const inverseFrequency = (term: string): number =>
    1 + Math.log(1 + index.length / (1 + (documentFrequency.get(term) || 0)));

  return (input: string, options: IKqSearchOptions = {}): IKqSearchResult[] => {
    const query = normalize(input.slice(0, 240));
    const tokens = tokenize(query).slice(0, 16);
    const limit = options.limit === undefined ? 8 : Math.max(0, Math.min(50, Math.floor(options.limit)));
    if (!query || !tokens.length || !limit || !isFinite(limit)) return [];
    const matches = new Map<string, Map<string, ITermMatch>>();
    tokens.forEach(token => {
      const candidates = new Map<string, ITermMatch>();
      Array.from(documentFrequency.keys()).forEach(term => {
        const match = termMatch(token, term, !documentFrequency.has(token));
        if (match) candidates.set(term, match);
      });
      matches.set(token, candidates);
    });
    const totalWeight = tokens.reduce((sum, token) => sum + inverseFrequency(token), 0);
    const results: Array<{ result: IKqSearchResult; tier: number; order: number }> = [];

    index.forEach(entry => {
      if ((!entry.available && !options.includeUnavailable) ||
          (options.category && entry.item.category !== options.category)) return;
      let relevance = 0;
      let matchedWeight = 0;
      let matchedCount = 0;
      let directCount = 0;
      tokens.forEach(token => {
        let best = 0;
        let direct = false;
        const candidates = matches.get(token);
        entry.terms.forEach((fieldWeight, term) => {
          const match = candidates?.get(term);
          if (!match) return;
          const value = fieldWeight * match.strength;
          if (value > best) best = value;
          if (match.direct) direct = true;
        });
        if (best > 0) {
          matchedCount++;
          if (direct) directCount++;
          const weight = inverseFrequency(token);
          matchedWeight += weight;
          relevance += best * weight;
        }
      });
      const exactName = entry.names.indexOf(query) !== -1;
      const coverage = matchedWeight / totalWeight;
      if (!exactName && (coverage < 0.55 || matchedCount === 0)) return;
      const allMatched = matchedCount === tokens.length;
      const tier = exactName ? 4 : allMatched && directCount === tokens.length ? 3 : allMatched ? 2 : 1;
      const phraseBonus = entry.phrases.indexOf(query) !== -1 ? 12 : 0;
      const priority = Math.max(0, Math.min(100, entry.item.priority || 0)) / 100;
      const score = tier * 1000 + relevance / totalWeight * 10 + coverage * 20 + phraseBonus + priority;
      results.push({
        result: { ...entry.item, score: Math.round(score * 100) / 100,
          matchType: exactName ? 'exact' : tier === 3 ? 'direct' : 'related', available: entry.available },
        tier, order: entry.order
      });
    });

    return results.sort((a, b) => b.tier - a.tier || b.result.score - a.result.score || a.order - b.order)
      .slice(0, limit).map(entry => entry.result);
  };
}

export const searchKqItems = createKqSearch(kqSearchItems);
