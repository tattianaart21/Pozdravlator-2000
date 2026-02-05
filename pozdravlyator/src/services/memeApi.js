/**
 * Картинки к поздравлению: мемы с Reddit и запасные источники (picsum, placekitten, loremflickr).
 */

const MEME_API_BASE = 'https://meme-api.com/gimme';
const REQUEST_TIMEOUT_MS = 3500;

/** Сабреддиты с мемами и прикольными картинками. */
const MEME_SUBREDDITS = [
  'memes',
  'dankmemes',
  'wholesomememes',
  'me_irl',
  'funny',
  'cats',
  'aww',
  'MadeMeSmile',
  'catpictures',
  'rarepuppers',
  'Eyebleach',
  'Unexpected',
  'perfecttiming',
  'happy',
  'pics',
];

function fetchWithTimeout(url, ms = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
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
  return { url, title: data?.title ?? 'Мем', postLink: data?.postLink ?? '' };
}

function getPlacekittenUrl() {
  const w = 400 + (Math.floor(Math.random() * 20) % 10);
  const h = 300 + (Math.floor(Math.random() * 20) % 10);
  return `https://placekitten.com/${w}/${h}`;
}

/** Случайное фото с loremflickr (темы: funny, meme, cat, smile). */
function getLoremFlickrUrl() {
  const tags = ['funny', 'meme', 'cat', 'smile', 'birthday', 'party', 'celebration'];
  const tag = tags[Math.floor(Math.random() * tags.length)];
  return `https://loremflickr.com/400/300/${tag}?random=${Date.now()}`;
}

/** Один из запасных URL (без API). */
function getDirectImageUrl() {
  const sources = [
    () => getRandomImageUrl('meme'),
    getPlacekittenUrl,
    getLoremFlickrUrl,
  ];
  const fn = sources[Math.floor(Math.random() * sources.length)];
  return typeof fn === 'function' ? fn() : fn();
}

/**
 * Возвращает одну случайную картинку: мем с Reddit или картинка из запасных источников.
 */
export async function fetchRandomMeme(_options = {}) {
  const subreddits = [...MEME_SUBREDDITS].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(6, subreddits.length); i++) {
    try {
      const result = await fetchOneFromSubreddit(subreddits[i]);
      if (result) return result;
    } catch {
      /* следующий сабреддит */
    }
  }

  return {
    url: getDirectImageUrl(),
    title: 'Случайная картинка',
    postLink: '',
  };
}

/** Запасной URL при ошибке загрузки в браузере. */
export function getFallbackImageUrl() {
  return getDirectImageUrl();
}

export function getContextualSubreddits() {
  return [...MEME_SUBREDDITS];
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
