/**
 * Генерация поздравлений через ИИ.
 * Если VITE_AI_API_URL не задан — собираем персонализированные варианты из досье (локальная заглушка).
 */
import { getToneById } from '../constants/tones';
import { getRoleById } from '../constants/roles';
import { declineName } from '../utils/nameDeclension';

const MIN_VARIANTS = 5;

/**
 * Собирает не менее 5 вариантов поздравления с правильным склонением имён, без лишнего текста, с разным тоном.
 */
function buildStubFromDossier(dossier, toneId, occasion = 'День рождения') {
  const name = dossier.name?.trim() || 'друг';
  const nameDat = declineName(name, 'dative');
  const nameAcc = declineName(name, 'accusative');
  const toneKey = toneId || 'touching';
  const role = dossier.role ? getRoleById(dossier.role)?.name : null;
  const occasionLower = occasion.toLowerCase();
  const variants = [];
  const generic = [
    `${name}, с ${occasionLower}! Желаю ${nameDat} всего доброго.`,
    `Поздравляю ${nameAcc}! С ${occasionLower}!`,
    `${nameDat} — только хорошее в этот день. С праздником!`,
  ];

  const hobbies = dossier.hobbies?.trim();
  const dreams = dossier.dreams?.trim();
  const jokes = dossier.jokes?.trim();
  const memories = dossier.memories?.trim();
  const tastes = dossier.tastes?.trim();

  switch (toneKey) {
    case 'touching': {
      // Трогательный: тёплые, душевные, личные слова
      if (memories) variants.push(`${name}, помнишь, как мы ${memories}? В этот день желаю тебе, чтобы таких моментов было больше. С праздником!`);
      if (dreams) variants.push(`Дорогая/ый ${name}, с ${occasionLower}! Пусть мечта о ${dreams} станет ближе — ты этого заслуживаешь.`);
      variants.push(`${name}, с ${occasionLower}! От всего сердца желаю ${nameDat} тепла, радости и людей рядом.`);
      if (hobbies) variants.push(`${name}, поздравляю с ${occasionLower}! Пусть твоё увлечение — ${hobbies} — приносит тебе счастье каждый день.`);
      variants.push(`${nameDat} в этот день — только хорошее. С ${occasionLower}!`);
      break;
    }
    case 'ironic': {
      // Ироничный: лёгкий юмор, подколы, без пафоса
      if (jokes) variants.push(`${name}, с ${occasionLower}! Как у нас говорят: ${jokes}. Так что держи марку и в этом году.`);
      if (role) variants.push(`${name}, с праздником! Наконец-то у ${nameDat} законный повод ничего не делать. Как подобает ${role.toLowerCase()}.`);
      variants.push(`Поздравляю ${nameAcc} с ${occasionLower}! Желаю, чтобы жизнь подкидывала поводы для смеха, а не для слёз.`);
      if (hobbies) variants.push(`${name}, с ${occasionLower}! Пусть ${hobbies} не только отнимают время, но и приносят радость. Шучу — ты и так молодец.`);
      variants.push(`${name}, с днём рождения тебя! Пусть год будет хоть чуть менее хаотичным. Хотя бы на один день.`);
      break;
    }
    case 'formal': {
      // Официальный: сдержанно, уважительно, структурированно
      const roleWord = role ? ` (${role})` : '';
      variants.push(`Уважаем${name.endsWith('а') || name.endsWith('я') ? 'ая' : 'ый'} ${name}${roleWord}! Позвольте поздравить Вас с ${occasionLower}. Желаю благополучия и успехов.`);
      if (dreams) variants.push(`${name}, примите поздравления с ${occasionLower}. Пусть намеченные цели, в том числе ${dreams}, будут достигнуты.`);
      variants.push(`С ${occasionLower}, ${name}! Искренне желаю ${nameDat} здоровья, благополучия и всего наилучшего.`);
      if (tastes) variants.push(`${name}, поздравляю с ${occasionLower}. Желаю приятных моментов за любимыми книгами и фильмами.`);
      variants.push(`${name}, с праздником. Всего доброго в этот день и в наступающем году.`);
      break;
    }
    case 'epic': {
      // Эпичный: пафосно, с восклицаниями, ярко
      if (role) variants.push(`${name}! В этот великий день — день ${occasionLower} — пусть судьба благоволит тебе! Ты — наша ${role}, и мы тобой гордимся!`);
      variants.push(`${name}, с ${occasionLower}! Пусть грядёт год побед, смеха и незабываемых моментов! Ты заслуживаешь самого лучшего!`);
      if (dreams) variants.push(`${name}! С ${occasionLower}! Пусть мечты сбываются, а ${dreams} станет реальностью! Вперёд к новым вершинам!`);
      if (hobbies) variants.push(`${name}, поздравляю! Пусть ${hobbies} ведут тебя к новым свершениям! С праздником!`);
      variants.push(`${nameDat} — огонь! С ${occasionLower}! Пусть этот год будет легендарным!`);
      break;
    }
    case 'verse': {
      // В стихах: короткое поздравление в стихотворной форме по данным досье
      if (hobbies && memories) {
        variants.push(`${name}, с ${occasionLower}!\nПусть ${hobbies} радуют тебя,\nИ вспоминаются опять\nТот день, когда мы ${memories}.`);
      }
      if (dreams) {
        variants.push(`С ${occasionLower}, ${name}!\nМечта — ${dreams}\nПусть станет явью в этот год.\nУдачи, счастья и побед!`);
      }
      variants.push(`${name}, с праздником, с ${occasionLower}!\nЖелаю радости, тепла,\nЧтоб жизнь тебе везла-везла\nИ счастье в дом твой привела.`);
      if (role) {
        variants.push(`Тебя, ${name}, поздравляем —\nНаш ${role}, мы тебя знаем!\nС ${occasionLower} от души!\nБудь счастлив и хорош.`);
      }
      variants.push(`${nameDat} — ура в этот день!\nС ${occasionLower} тебя!\nПусть будет светлой жизнь твоя\nИ полной добрых дел, друзья.`);
      break;
    }
    default: {
      variants.push(`${name}, с ${occasionLower}! Желаю ${nameDat} всего доброго.`);
      if (hobbies) variants.push(`${name}, пусть ${hobbies} приносят радость. С праздником!`);
      variants.push(`Поздравляю ${nameAcc}! С ${occasionLower}!`);
    }
  }

  const filtered = variants.filter(Boolean);
  while (filtered.length < MIN_VARIANTS) {
    filtered.push(generic[filtered.length % generic.length]);
  }
  return filtered;
}

/**
 * Возвращает не менее 5 вариантов поздравления.
 * @param {Object} dossier — досье контакта (name, role, hobbies, dreams, jokes, memories, tastes)
 * @param {string} toneId — id тона из constants/tones
 * @param {string} occasion — повод (День рождения и т.д.)
 * @param {{ daysUntil?: number, eventDate?: string } | null} eventInfo — данные о событии (опционально)
 */
export async function generateCongratulation(dossier, toneId, occasion = 'День рождения', eventInfo = null) {
  const supabase = (await import('./supabase')).supabase;
  if (supabase?.functions) {
    try {
      if (import.meta.env.DEV) {
        console.log('[Генерация] Запрос в ИИ (Perplexity), контакт:', dossier?.name);
      }
      const { data, error } = await supabase.functions.invoke('generate-congratulation', {
        body: { dossier, toneId, occasion, eventInfo },
      });
      if (error) {
        if (import.meta.env.DEV) {
          console.warn('[Генерация] ИИ вернул ошибку:', error.message || error);
        }
        throw error;
      }
      const texts = Array.isArray(data?.texts) ? data.texts : [data?.text ?? 'Поздравляю!'];
      if (import.meta.env.DEV && texts.length) {
        console.log('[Генерация] Получено от ИИ вариантов:', texts.length, '— первый:', texts[0]?.slice(0, 50) + '…');
      }
      return texts;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn('[Генерация] Ошибка ИИ, используем локальную генерацию:', err?.message || err);
      }
    }
  } else if (import.meta.env.DEV) {
    console.warn('[Генерация] Supabase не настроен — локальная генерация');
  }

  return Promise.resolve(buildStubFromDossier(dossier, toneId, occasion));
}

/**
 * Идеи подарков по досье и поводу через ИИ (Edge Function suggest-gifts). 5 идей.
 * При ошибке или отсутствии VITE_AI_GIFTS_URL возвращает null — вызывающий код использует локальный подбор.
 * @param {Object} dossier — досье контакта
 * @param {string} [occasion] — повод (День рождения и т.д.)
 * @returns {Promise<string[] | null>} массив из 5 идей или null
 */
export async function getGiftSuggestionsFromAI(dossier, occasion = '') {
  if (!dossier) return null;
  const supabase = (await import('./supabase')).supabase;
  if (!supabase?.functions) return null;
  try {
    const { data, error } = await supabase.functions.invoke('suggest-gifts', {
      body: { dossier, occasion },
    });
    if (error) return null;
    const ideas = Array.isArray(data?.ideas) ? data.ideas.slice(0, 5) : [];
    return ideas.length > 0 ? ideas : null;
  } catch {
    return null;
  }
}
