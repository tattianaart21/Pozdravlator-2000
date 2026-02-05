/**
 * Картинки к поздравлению: котики, мемы, русскоязычные мемы.
 * Короткий таймаут и быстрый fallback (picsum), чтобы картинки не висели.
 */

const MEME_API_BASE = 'https://meme-api.com/gimme';
const REQUEST_TIMEOUT_MS = 2500;

/** Котики, мемы, поздравления + русский сектор (Пикабу и др.). */
const MEME_STICKER_SUBREDDITS = [
  'cats',
  'aww',
  'catpictures',
  'wholesomememes',
  'memes',
  'MadeMeSmile',
  'Pikabu',
  'Epicentr',
  'russia',
  'dankmemes',
];

/**
 * Запрос с таймаутом.
 */
function fetchWithTimeout(url) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
}

/**
 * Один мем с Reddit (meme-api.com).
 */
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

/**
 * Возвращает одну случайную картинку: { url, title, postLink }.
 * Быстрая попытка Reddit (2 сабреддита, 2.5 с), иначе picsum.photos.
 */
export async function fetchRandomMeme(_options = {}) {
  const subreddits = [...MEME_STICKER_SUBREDDITS].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(2, subreddits.length); i++) {
    try {
      const result = await fetchOneFromSubreddit(subreddits[i]);
      if (result) return result;
    } catch {
      /* сразу следующий источник */
    }
  }

  return {
    url: getRandomImageUrl('meme'),
    title: 'Случайная картинка',
    postLink: '',
  };
}

/**
 * Запасной URL (picsum), если основная картинка не загрузилась в браузере.
 */
export function getFallbackImageUrl() {
  return getRandomImageUrl('fallback');
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
