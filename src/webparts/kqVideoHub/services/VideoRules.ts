import { IVideoEntry } from '../models/IVideo';

export function httpsUrl(value: string): string {
  const url = new URL(value.trim());
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error('Enter a valid HTTPS link without embedded credentials.');
  }
  return url.href;
}

export function insertAtPosition(entries: IVideoEntry[], item: IVideoEntry): IVideoEntry[] {
  if (!Number.isInteger(item.displayOrder) || item.displayOrder < 1) {
    throw new Error('Display position must be a positive whole number.');
  }
  const ordered = entries.filter((entry) => entry.id !== item.id)
    .sort((a, b) => a.displayOrder - b.displayOrder || a.id.localeCompare(b.id));
  ordered.splice(Math.min(item.displayOrder - 1, ordered.length), 0, item);
  return ordered.map((entry, index) => ({ ...entry, displayOrder: index + 1 }));
}

export function applyOrder(entries: IVideoEntry[], ids: string[]): IVideoEntry[] {
  if (ids.length !== entries.length || new Set(ids).size !== ids.length) {
    throw new Error('The playlist changed. Refresh before saving its order.');
  }
  const byId = new Map(entries.map((entry) => [entry.id, entry] as [string, IVideoEntry]));
  return ids.map((id, index) => {
    const entry = byId.get(id);
    if (!entry) throw new Error('The playlist changed. Refresh before saving its order.');
    return { ...entry, displayOrder: index + 1 };
  });
}

export function linkPlayer(value: string): { kind: 'embed' | 'media' | 'external'; url: string } {
  const url = new URL(httpsUrl(value));
  const host = url.hostname.toLowerCase();
  let id = '';
  if (host === 'youtu.be') id = url.pathname.split('/')[1] || '';
  if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'www.youtube-nocookie.com'].indexOf(host) !== -1) {
    id = url.searchParams.get('v') || '';
    if (!id && /^\/(embed|shorts|live)\//.test(url.pathname)) id = url.pathname.split('/')[2] || '';
  }
  if (/^[A-Za-z0-9_-]{11}$/.test(id)) return { kind: 'embed', url: `https://www.youtube.com/embed/${id}?rel=0` };
  if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].indexOf(host) !== -1) {
    const match = url.pathname.match(/\/(?:video\/)?(\d+)\/?$/);
    if (match) return { kind: 'embed', url: `https://player.vimeo.com/video/${match[1]}` };
  }
  if (/\.(mp4|webm|ogg|ogv)$/i.test(url.pathname)) return { kind: 'media', url: url.href };
  return { kind: 'external', url: url.href };
}
