/**
 * Подбор картинок в стиле «всратые картинки для поздравления»:
 * котики, собачки, уточки, милые животные, смешные праздничные картинки.
 * Фразы и контент — ориентированы на русскоязычный интернет (визуальный ряд универсален).
 */

const MEME_API = 'https://meme-api.com/gimme';

/** Приоритет: субреддиты, которые чаще отвечают без таймаута */
const MEME_STICKER_SUBREDDITS = [
  'cats',
  'aww',
  'Eyebleach',
  'wholesomememes',
  'catpictures',
  'rarepuppers',
  'duck',
  'funny',
  'memes',
  'MadeMeSmile',
  'CatsWithDogs',
  'dankmemes',
];

/** Fallback: милые животные и праздничный контент */
const STICKER_STYLE_SUBREDDITS = [
  'cats',
  'aww',
  'rarepuppers',
  'duck',
  'Eyebleach',
  'MadeMeSmile',
  'wholesomememes',
  'catpictures',
];

/** Субреддиты под тон «гик» / шуточный: мемы по вселенным */
const GEEK_SUBREDDITS = [
  'PrequelMemes',
  'lotrmemes',
  'MarvelMemes',
  'dndmemes',
  'gaming',
  'ProgrammerHumor',
  'wholesomememes',
];

/** По интересам из досье: книги, музыка, кофе, путешествия, природа и т.д. */
const INTEREST_SUBREDDITS = {
  книги: ['bookporn', 'books', 'CozyPlaces', 'reading'],
  музыка: ['vinyl', 'Music', 'listentothis', 'audiophile'],
  кофе: ['coffee', 'cafe', 'espresso', 'CozyPlaces'],
  путешествия: ['travel', 'EarthPorn', 'backpacking', 'roadtrip'],
  природа: ['NatureIsFuckingLit', 'EarthPorn', 'Outdoors', 'camping'],
  животные: ['cats', 'aww', 'rarepuppers', 'duck', 'CatsWithDogs'],
  еда: ['FoodPorn', 'cooking', 'Baking', 'vegetarian'],
  сад: ['gardening', 'plants', 'succulents', 'houseplants'],
  спорт: ['sports', 'running', 'yoga', 'fitness'],
  рыбалка: ['Fishing', 'flyfishing', 'Kayaking'],
};

/**
 * По тону и досье контакта возвращает список субреддитов для подбора картинки.
 * Учитываются хобби, вкусы, тон: гик → мемы по вселенным; книги/музыка/кофе и т.д. → тематические сабреддиты.
 */
export function getContextualSubreddits(toneId, contact = null) {
  const raw = [
    contact?.hobbies,
    contact?.tastes,
    contact?.dreams,
    contact?.memories,
    contact?.role,
  ]
    .filter(Boolean)
    .join(' ');
  const lower = (raw || '').toLowerCase();

  const isGeek = /\b(гик|звёздн|мстител|марвел|игр|dnd|фэнтези|star wars|марвел)\b/.test(lower);
  const isIronicOrEpic = toneId === 'ironic' || toneId === 'epic';

  if (isGeek && isIronicOrEpic) {
    return GEEK_SUBREDDITS;
  }

  // Подбор по интересам из досье
  const matched = [];
  if (/\b(книг|чита|автор|литератур)\b/.test(lower)) matched.push(...INTEREST_SUBREDDITS.книги);
  if (/\b(музык|гитар|пластинк|винил|рок|джаз)\b/.test(lower)) matched.push(...INTEREST_SUBREDDITS.музыка);
  if (/\b(кофе|чай|завар|эспрессо)\b/.test(lower)) matched.push(...INTEREST_SUBREDDITS.кофе);
  if (/\b(путешеств|отпуск|стран|горы|море)\b/.test(lower)) matched.push(...INTEREST_SUBREDDITS.путешествия);
  if (/\b(природ|лес|гор|море|поход)\b/.test(lower)) matched.push(...INTEREST_SUBREDDITS.природа);
  if (/\b(котик|кошк|собак|пёс|утк|животн|питомец)\b/.test(lower)) matched.push(...INTEREST_SUBREDDITS.животные);
  if (/\b(ед|готов|кулин|выпечк|рецепт)\b/.test(lower)) matched.push(...INTEREST_SUBREDDITS.еда);
  if (/\b(сад|огород|растени|цветы|бонсай)\b/.test(lower)) matched.push(...INTEREST_SUBREDDITS.сад);
  if (/\b(спорт|зал|бег|йог|тренировк)\b/.test(lower)) matched.push(...INTEREST_SUBREDDITS.спорт);
  if (/\b(рыбалк|удочк|катушк|воблер)\b/.test(lower)) matched.push(...INTEREST_SUBREDDITS.рыбалка);

  if (matched.length > 0) {
    return [...new Set(matched)];
  }

  return MEME_STICKER_SUBREDDITS;
}

/** Таймаут одного запроса к meme-api (при таймауте/блокировке сразу даём picsum) */
const MEME_FETCH_TIMEOUT_MS = 4000;

/** Пробуем один запрос к meme-api; при ошибке или таймауте возвращаем null. */
async function tryFetchOneSubreddit(sub, signal) {
  const res = await fetch(`${MEME_API}/${sub}`, { signal });
  if (!res.ok) return null;
  const data = await res.json();
  return { url: data.url, title: data.title ?? '', postLink: data.postLink ?? '' };
}

/**
 * Возвращает одну случайную картинку: { url, title, postLink }. При недоступности meme-api — картинка с picsum.photos.
 */
export async function fetchRandomMeme(options = {}) {
  const { toneId, contact } = options;
  const subreddits = toneId || contact
    ? getContextualSubreddits(toneId, contact)
    : MEME_STICKER_SUBREDDITS;
  const shuffled = [...subreddits].sort(() => Math.random() - 0.5);

  for (let i = 0; i < Math.min(2, shuffled.length); i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MEME_FETCH_TIMEOUT_MS);
    try {
      const result = await tryFetchOneSubreddit(shuffled[i], controller.signal);
      clearTimeout(timeoutId);
      if (result?.url) return result;
    } catch {
      clearTimeout(timeoutId);
    }
  }

  return {
    url: getRandomImageUrl('congrats'),
    title: '',
    postLink: '',
  };
}

/**
 * Возвращает URL случайной картинки (picsum) по ключевому слову.
 */
export function getRandomImageUrl(keyword = 'birthday') {
  const seed = encodeURIComponent(keyword) + Date.now();
  return `https://picsum.photos/seed/${seed}/400/300`;
}
