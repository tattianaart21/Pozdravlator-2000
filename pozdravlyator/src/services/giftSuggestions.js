/**
 * Контекстный подбор идей подарков по досье контакта.
 * Не просто по ключевым словам: интерпретируем описание и предлагаем неочевидные идеи.
 * При подключённом ИИ можно вызывать API для генерации; здесь — локальная заглушка.
 */

const HOBBY_IDEAS = {
  рыбалка: [
    'Редкая книга о рыбалке (советское издание 1970–80‑х)',
    'Ретро-катушка или винтажная удочка',
    'Набор воблеров ручной работы',
    'Термос для рыбалки с гравировкой',
  ],
  гик: ['Фигурка из любимой вселенной', 'Ретро-консоль или игра на ретро-платформе', 'Комикс или артбук ограниченного тиража'],
  книги: ['Подарочное издание любимого автора', 'Подписка на книжный клуб', 'Редкий букинистический экземпляр'],
  музыка: ['Винтажная пластинка', 'Качественные наушники или колонка', 'Билет на концерт любимого исполнителя'],
  кофе: ['Ручная кофемолка или турка от мастера', 'Набор редких сортов зерна', 'Подписка на кофе с доставкой'],
  путешествия: ['Дорожный органайзер или чемодан', 'Книга о месте мечты', 'Карта мира для отметок посещённого'],
  спорт: ['Качественный инвентарь (бренд мечты)', 'Абонемент в зал или на занятие', 'Умные часы для тренировок'],
  сад: ['Редкие семена или саженец', 'Книга по ландшафту или бонсай', 'Качественный инструмент для сада'],
};

const USSR_NOSTALGIA = [
  'Ретро-открытки или календарь СССР',
  'Книга или альбом про эпоху',
  'Винтажная вещь с барахолки (значок, кружка)',
];

function normalize(text) {
  if (!text || typeof text !== 'string') return '';
  return text.toLowerCase().trim();
}

function extractKeywords(dossier) {
  const raw = [
    dossier.hobbies,
    dossier.dreams,
    dossier.memories,
    dossier.tastes,
    dossier.jokes,
    dossier.role,
  ]
    .filter(Boolean)
    .join(' ');
  const lower = normalize(raw);
  const keywords = [];
  if (/\b(ссср|советск|ностальг|ретро|винтаж)\b/.test(lower)) keywords.push('ussr');
  if (/\b(рыбалк|удочк|катушк|воблер)\b/.test(lower)) keywords.push('рыбалка');
  if (/\b(гик|звёздн|мстител|марвел|дисней|игр|консоль)\b/.test(lower)) keywords.push('гик');
  if (/\b(книг|чита|автор)\b/.test(lower)) keywords.push('книги');
  if (/\b(музык|гитар|пластинк)\b/.test(lower)) keywords.push('музыка');
  if (/\b(кофе|чай|завар)\b/.test(lower)) keywords.push('кофе');
  if (/\b(путешеств|отпуск|стран)\b/.test(lower)) keywords.push('путешествия');
  if (/\b(спорт|зал|бег|йог)\b/.test(lower)) keywords.push('спорт');
  if (/\b(сад|огород|растени)\b/.test(lower)) keywords.push('сад');
  return keywords;
}

/**
 * Возвращает массив идей подарков по досье (неочевидные + по хобби).
 * @param {Object} dossier — досье контакта (hobbies, dreams, memories, tastes и т.д.)
 * @param {number} limit — максимум идей
 */
export function getGiftSuggestions(dossier, limit = 6) {
  const suggestions = new Set();
  const keywords = extractKeywords(dossier);

  if (keywords.includes('ussr')) {
    USSR_NOSTALGIA.forEach((s) => suggestions.add(s));
  }

  keywords.forEach((key) => {
    const list = HOBBY_IDEAS[key];
    if (list) list.forEach((s) => suggestions.add(s));
  });

  // Универсальные, если мало идей
  if (suggestions.size < 2) {
    suggestions.add('Сертификат в магазин по интересам');
    suggestions.add('Впечатление в подарок (мастер-класс, концерт)');
    suggestions.add('Книга или артбук по увлечению');
  }

  return Array.from(suggestions).slice(0, limit);
}
