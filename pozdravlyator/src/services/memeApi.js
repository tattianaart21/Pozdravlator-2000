/**
 * Подбор картинок в стиле «всратые картинки для поздравления»:
 * котики, собачки, уточки, милые животные, смешные праздничные картинки.
 * Фразы и контент — ориентированы на русскоязычный интернет (визуальный ряд универсален).
 */

const MEME_API = 'https://meme-api.com/gimme';

/** Приоритет: котики, собачки, уточки и смешные/милые картинки для поздравления */
const MEME_STICKER_SUBREDDITS = [
  'cats',
  'aww',
  'rarepuppers',
  'catpictures',
  'FromKittenToCat',
  'duck',
  'CatsWithDogs',
  'wholesomememes',
  'MadeMeSmile',
  'funny',
  'memes',
  'dankmemes',
  'Eyebleach',
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
  'FromKittenToCat',
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
  животные: ['cats', 'aww', 'rarepuppers', 'duck', 'CatsWithDogs', 'FromKittenToCat'],
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

/**
 * Возвращает одну случайную картинку: { url, title, postLink } или null.
 * @param {{ toneId?: string, contact?: { hobbies?, tastes?, role? } }} options — тон и контакт для контекстного подбора (гик → мемы по вселенным).
 */
export async function fetchRandomMeme(options = {}) {
  const { toneId, contact } = options;
  const subreddits = toneId || contact
    ? getContextualSubreddits(toneId, contact)
    : MEME_STICKER_SUBREDDITS;
  try {
    const sub = subreddits[Math.floor(Math.random() * subreddits.length)];
    const res = await fetch(`${MEME_API}/${sub}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      url: data.url,
      title: data.title ?? '',
      postLink: data.postLink,
    };
  } catch {
    return null;
  }
}

/**
 * Возвращает URL случайной картинки (picsum) по ключевому слову.
 */
export function getRandomImageUrl(keyword = 'birthday') {
  const seed = encodeURIComponent(keyword) + Date.now();
  return `https://picsum.photos/seed/${seed}/400/300`;
}
