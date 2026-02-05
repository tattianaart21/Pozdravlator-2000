/**
 * Картинки к поздравлению: котики, мемы. Всегда возвращаем рабочий URL (picsum или placekitten).
 */

const MEME_API_BASE = 'https://meme-api.com/gimme';
const REQUEST_TIMEOUT_MS = 2000;

const MEME_STICKER_SUBREDDITS = [
  'cats',
  'aww',
  'wholesomememes',
  'memes',
  'MadeMeSmile',
];

function fetchWithTimeout(url) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
}

async function fetchOneFromSubreddit(subreddit) {
  const res = await fetchWithTimeout(`${MEME_API_BASE}/${subreddit}`);
  if (!res.ok) return null;
  const data = await res.json();
  const url = data?.url;
  if (!url || typeof url !== 'string') return null;
  const isImage = /\.(jpe?g|png|gif|webp)$/i.test(url) || /\.(jpe?g|png|gif|webp)\?/i.test(url);
  if (!isImage) return null;
  return { url, title: data?.title ?? '', postLink: data?.postLink ?? '' };
}

/** Прямая ссылка на картинку (placekitten), без API. */
function getPlacekittenUrl() {
  const w = 400 + (Math.floor(Math.random() * 10) % 5);
  const h = 300 + (Math.floor(Math.random() * 10) % 5);
  return `https://placekitten.com/${w}/${h}`;
}

/**
 * Возвращает одну случайную картинку. Сначала быстрая попытка Reddit (1 раз), затем picsum или placekitten.
 */
export async function fetchRandomMeme(_options = {}) {
  const subreddits = [...MEME_STICKER_SUBREDDITS].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(1, subreddits.length); i++) {
    try {
      const result = await fetchOneFromSubreddit(subreddits[i]);
      if (result) return result;
    } catch {
      /* сразу на запасной источник */
    }
  }

  const direct = Math.random() > 0.5
    ? { url: getRandomImageUrl('meme'), title: 'Случайная картинка', postLink: '' }
    : { url: getPlacekittenUrl(), title: 'Котик', postLink: '' };
  return direct;
}

/** Запасной URL при ошибке загрузки (другой источник). */
export function getFallbackImageUrl() {
  return Math.random() > 0.5 ? getRandomImageUrl('fallback') : getPlacekittenUrl();
}

export function getContextualSubreddits() {
  return [...MEME_STICKER_SUBREDDITS];
}

/**
 * Запасной URL случайной картинки (picsum).
 */
export function getRandomImageUrl(keyword = 'birthday') {
  const seed = encodeURIComponent(keyword) + Date.now();
  return `https://picsum.photos/seed/${seed}/400/300`;
}

/** Локальная заглушка (data URL), когда сеть недоступна. */
export function getPlaceholderImageUrl() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="#f0f0f0" width="400" height="300"/><text x="50%" y="50%" fill="#999" font-family="sans-serif" font-size="14" text-anchor="middle" dy=".3em">Картинка недоступна</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const TELEGRAM_PACKS_STORAGE_KEY = 'pozdrav_telegram_sticker_packs';

/** Список имён стикерпаков Telegram из localStorage (через запятую). */
export function getStickerPackNamesFromStorage() {
  try {
    const raw = localStorage.getItem(TELEGRAM_PACKS_STORAGE_KEY) || '';
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

/** Сохранить имена стикерпаков в localStorage. */
export function saveStickerPackNamesToStorage(packNames) {
  try {
    const list = Array.isArray(packNames) ? packNames : [packNames].filter(Boolean);
    localStorage.setItem(TELEGRAM_PACKS_STORAGE_KEY, list.join(', '));
  } catch {
    /* ignore */
  }
}
