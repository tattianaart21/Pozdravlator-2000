/**
 * Картинки к поздравлению: мемные поздравления и котики из интернета (Reddit API).
 * При таймауте или ошибке — запасной вариант: picsum.photos.
 */

const MEME_API_BASE = 'https://meme-api.com/gimme';
const REQUEST_TIMEOUT_MS = 8000;

/** Сабреддиты: котики и мемные/поздравительные. */
const MEME_STICKER_SUBREDDITS = [
  'cats',
  'aww',
  'catpictures',
  'CatsWithDogs',
  'wholesomememes',
  'memes',
  'dankmemes',
  'MadeMeSmile',
  'CongratsLikeIm5',
];

/**
 * Запрос к API с таймаутом.
 * @param {string} url
 * @returns {Promise<Response>}
 */
function fetchWithTimeout(url) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
}

/**
 * Пытается получить один мем по сабреддиту.
 * @param {string} subreddit
 * @returns {Promise<{ url: string, title: string, postLink: string } | null>}
 */
async function fetchOneFromSubreddit(subreddit) {
  const res = await fetchWithTimeout(`${MEME_API_BASE}/${subreddit}`);
  if (!res.ok) return null;
  const data = await res.json();
  const url = data?.url;
  if (!url || typeof url !== 'string') return null;
  const isImage = /\.(jpe?g|png|gif|webp)$/i.test(url) || /\.(jpe?g|png|gif|webp)\?/i.test(url);
  if (!isImage) return null;
  return {
    url,
    title: data?.title ?? '',
    postLink: data?.postLink ?? '',
  };
}

/**
 * Возвращает одну случайную картинку: { url, title, postLink }.
 * Сначала пробует мемы/котики из Reddit, при неудаче — picsum.photos.
 */
export async function fetchRandomMeme(_options = {}) {
  const subreddits = [...MEME_STICKER_SUBREDDITS].sort(() => Math.random() - 0.5);

  for (let i = 0; i < Math.min(3, subreddits.length); i++) {
    try {
      const result = await fetchOneFromSubreddit(subreddits[i]);
      if (result) return result;
    } catch {
      // таймаут или ошибка — пробуем следующий сабреддит
    }
  }

  return {
    url: getRandomImageUrl('congrats'),
    title: '',
    postLink: '',
  };
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
