/**
 * Картинки к поздравлению: мемные поздравления и котики из интернета.
 * Несколько источников + запасной picsum.photos, чтобы картинка всегда подгружалась.
 */

const MEME_API_BASE = 'https://meme-api.com/gimme';
const REQUEST_TIMEOUT_MS = 5000;

/** Сабреддиты: котики и мемные/поздравительные. */
const MEME_STICKER_SUBREDDITS = [
  'cats',
  'aww',
  'catpictures',
  'wholesomememes',
  'memes',
  'MadeMeSmile',
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

/** URL случайного котика (cataas.com отдаёт картинку по этому адресу). */
function getRandomCatUrl() {
  return `https://cataas.com/cat?t=${Date.now()}`;
}

/**
 * Возвращает одну случайную картинку: { url, title, postLink }.
 * Порядок: Reddit мемы/котики → cataas котики → picsum.
 */
export async function fetchRandomMeme(_options = {}) {
  const subreddits = [...MEME_STICKER_SUBREDDITS].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(3, subreddits.length); i++) {
    try {
      const result = await fetchOneFromSubreddit(subreddits[i]);
      if (result) return result;
    } catch {
      /* пробуем следующий источник */
    }
  }

  return {
    url: getRandomCatUrl(),
    title: 'Котик',
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
 * Запасной URL случайной картинки (picsum), если API мемов недоступен.
 */
export function getRandomImageUrl(keyword = 'birthday') {
  const seed = encodeURIComponent(keyword) + Date.now();
  return `https://picsum.photos/seed/${seed}/400/300`;
}
