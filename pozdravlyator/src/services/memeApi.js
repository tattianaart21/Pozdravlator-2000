/**
 * Картинки к поздравлению: котики, собаки, мемы, приколы.
 * Несколько источников, чтобы картинка точно подгрузилась.
 */

const MEME_API_BASE = 'https://meme-api.com/gimme';
const REQUEST_TIMEOUT_MS = 2500;
const DOG_API = 'https://dog.ceo/api/breeds/image/random';
const CAT_API = 'https://api.thecatapi.com/v1/images/search?limit=1';

/** Котики, мемы, поздравления + русский сектор. */
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
function fetchWithTimeout(url, ms = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
}

/**
 * Один мем с Reddit (meme-api.com).
 * При 300/3xx делаем один запрос по Location, если есть.
 */
async function fetchOneFromSubreddit(subreddit) {
  const baseUrl = `${MEME_API_BASE}/${subreddit}`;
  let res = await fetchWithTimeout(baseUrl);
  if (res.status >= 300 && res.status < 400) {
    const location = res.headers?.get('Location');
    if (location) {
      const redirectUrl = location.startsWith('http') ? location : new URL(location, baseUrl).href;
      res = await fetchWithTimeout(redirectUrl);
    }
  }
  if (!res.ok) return null;
  const data = await res.json();
  const url = data?.url;
  if (!url || typeof url !== 'string') return null;
  const isImage = /\.(jpe?g|png|gif|webp)$/i.test(url) || /\.(jpe?g|png|gif|webp)\?/i.test(url);
  if (!isImage) return null;
  return { url, title: data?.title ?? '', postLink: data?.postLink ?? '' };
}

/** Котики с placekitten — прямая ссылка на картинку, без API. */
function getPlacekittenUrl() {
  const w = 400 + Math.floor(Math.random() * 20);
  const h = 300 + Math.floor(Math.random() * 20);
  return `https://placekitten.com/${w}/${h}`;
}

/**
 * Возвращает одну случайную картинку: { url, title, postLink }.
 * Пробуем: Reddit → собака/котик по API → placekitten / picsum.
 */
export async function fetchRandomMeme(_options = {}) {
  const subreddits = [...MEME_STICKER_SUBREDDITS].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(3, subreddits.length); i++) {
    try {
      const result = await fetchOneFromSubreddit(subreddits[i]);
      if (result) return result;
    } catch {
      /* следующий источник */
    }
  }

  try {
    const dog = await fetchWithTimeout(DOG_API, 3000).then((r) => (r.ok ? r.json() : null));
    if (dog?.message) return { url: dog.message, title: 'Собачка', postLink: '' };
  } catch {
    /* дальше котик */
  }

  try {
    const cat = await fetchWithTimeout(CAT_API, 3000).then((r) => (r.ok ? r.json() : null));
    const url = Array.isArray(cat)?.[0]?.url;
    if (url) return { url, title: 'Котик', postLink: '' };
  } catch {
    /* дальше placekitten/picsum */
  }

  const sources = [
    () => ({ url: getPlacekittenUrl(), title: 'Котик', postLink: '' }),
    () => ({ url: getRandomImageUrl('meme'), title: 'Случайная картинка', postLink: '' }),
  ];
  const pick = sources[Math.floor(Math.random() * sources.length)]();
  return pick;
}

/**
 * Синхронный запасной URL (placekitten или picsum), когда картинка не загрузилась.
 */
export function getFallbackImageUrl() {
  return Math.random() > 0.5 ? getPlacekittenUrl() : getRandomImageUrl('fallback');
}

/**
 * Асинхронно подбирает другую реальную картинку (собака, котик, placekitten, picsum).
 * Вызывать при onError, чтобы подставить новую картинку вместо сломанной.
 */
export async function fetchAnotherImage() {
  const order = [
    async () => {
      const r = await fetchWithTimeout(DOG_API, 3000);
      if (!r.ok) return null;
      const d = await r.json();
      return d?.message || null;
    },
    async () => {
      const r = await fetchWithTimeout(CAT_API, 3000);
      if (!r.ok) return null;
      const d = await r.json();
      return Array.isArray(d)?.[0]?.url || null;
    },
    () => Promise.resolve(getPlacekittenUrl()),
    () => Promise.resolve(getRandomImageUrl('retry')),
  ];
  for (const fn of order) {
    try {
      const url = await fn();
      if (url) return { url };
    } catch {
      /* следующий источник */
    }
  }
  return { url: getPlacekittenUrl() };
}

export function getContextualSubreddits() {
  return [...MEME_STICKER_SUBREDDITS];
}

/**
 * Запасной URL случайной картинки (picsum), если основная картинка не загрузилась.
 * В Network может отображаться как "300" — это последний сегмент URL (.../400/300), не HTTP-код.
 */
export function getRandomImageUrl(keyword = 'birthday') {
  const seed = encodeURIComponent(keyword) + Date.now();
  return `https://picsum.photos/seed/${seed}/400/300`;
}

/** Локальная заглушка (data URL), когда сеть недоступна (net::ERR_...). Не требует интернета. */
export function getPlaceholderImageUrl() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="#f0f0f0" width="400" height="300"/><text x="50%" y="50%" fill="#999" font-family="sans-serif" font-size="14" text-anchor="middle" dy=".3em">Картинка недоступна</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
