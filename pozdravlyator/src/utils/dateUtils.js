import { addYears, isAfter, isBefore, parseISO, format, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getOccasionName } from '../constants/occasions';

export const EVENT_TYPES = { birthday: 'birthday', anniversary: 'anniversary', custom: 'custom' };

/**
 * Парсит дату YYYY-MM-DD как календарную (без сдвига по часовым поясам).
 * parseISO трактует строку как UTC, из-за чего в части часовых поясов день сдвигается на 1.
 */
function parseLocalDate(dateStr) {
  if (!dateStr || dateStr.length < 10) return null;
  const parts = dateStr.split('-').map(Number);
  if (parts.length < 3 || parts.some(Number.isNaN)) return null;
  return { year: parts[0], month: parts[1] - 1, day: parts[2] };
}

/** YYYY-MM-DD в локальной дате (без сдвига UTC) */
function formatLocalDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Форматирует дату для отображения
 */
export function formatDate(date, options = {}) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, options.format ?? 'd MMMM', { locale: ru });
}

/** Год-маркер «год неизвестен»: дата хранится как 1000-MM-DD, при расчёте используется текущий год */
export const UNKNOWN_YEAR = 1000;

/**
 * Возвращает предстоящие события (ДР, годовщины, свои даты) на основе контактов.
 * События повторяются каждый год: дата с любым годом (в т.ч. 0004 для «год неизвестен») даёт напоминание в этот день и месяц.
 * @param {Array} contacts — контакты с birthDate и опционально events: [{ id, type, name?, date }]
 * @param {Date} fromDate — от какой даты
 * @param {number} limitDays — сколько дней вперёд
 */
export function getUpcomingEvents(contacts, fromDate = new Date(), limitDays = 60) {
  const events = [];
  const endDate = addYears(fromDate, 1);

  for (const contact of contacts) {
    // День рождения — парсим как локальную дату, чтобы не было сдвига на день из-за UTC
    if (contact.birthDate) {
      const birth = parseLocalDate(contact.birthDate);
      if (!birth) continue;
      let eventDate = new Date(fromDate.getFullYear(), birth.month, birth.day);

      if (isBefore(eventDate, startOfDay(fromDate))) {
        eventDate = addYears(eventDate, 1);
      }

      if (!isAfter(eventDate, endDate)) {
        const daysUntil = Math.ceil((eventDate - fromDate) / (24 * 60 * 60 * 1000));
        if (daysUntil <= limitDays) {
          events.push({
            id: `ev-${contact.id}-birthday-${eventDate.getTime()}`,
            contactId: contact.id,
            contact,
            date: formatLocalDate(eventDate),
            type: EVENT_TYPES.birthday,
            occasionId: 'birthday',
            occasionName: 'День рождения',
            daysUntil,
          });
        }
      }
    }

    // Другие памятные даты — парсим как локальную дату
    const contactEvents = contact.events ?? [];
    for (const ev of contactEvents) {
      if (!ev.date) continue;
      const evDate = parseLocalDate(ev.date);
      if (!evDate) continue;
      let eventDate = new Date(fromDate.getFullYear(), evDate.month, evDate.day);

      if (isBefore(eventDate, startOfDay(fromDate))) {
        eventDate = addYears(eventDate, 1);
      }

      if (!isAfter(eventDate, endDate)) {
        const daysUntil = Math.ceil((eventDate - fromDate) / (24 * 60 * 60 * 1000));
        if (daysUntil <= limitDays) {
          const occasionName = getOccasionName(ev.type, ev.name);
          events.push({
            id: ev.id ? `ev-${contact.id}-${ev.id}` : `ev-${contact.id}-${ev.date}-${eventDate.getTime()}`,
            contactId: contact.id,
            contact,
            date: formatLocalDate(eventDate),
            type: ev.type === 'anniversary' ? EVENT_TYPES.anniversary : EVENT_TYPES.custom,
            occasionId: ev.type,
            occasionName,
            daysUntil,
          });
        }
      }
    }
  }

  events.sort((a, b) => new Date(a.date) - new Date(b.date));
  return events;
}

/**
 * Следующая дата наступления события по строке YYYY-MM-DD (год игнорируется для расчёта).
 * @param {string} dateStr — YYYY-MM-DD
 * @returns {string} YYYY-MM-DD следующего наступления в локальной дате
 */
export function getNextOccurrenceDate(dateStr) {
  const parsed = parseLocalDate(dateStr);
  if (!parsed) return '';
  const today = startOfDay(new Date());
  let next = new Date(today.getFullYear(), parsed.month, parsed.day);
  if (isBefore(next, today)) next = new Date(today.getFullYear() + 1, parsed.month, parsed.day);
  return formatLocalDate(next);
}

/**
 * Предстоящие события для одного контакта (ДР + добавленные пользователем даты).
 * @param {Object} contact — контакт с birthDate и events
 * @param {Date} fromDate
 * @param {number} limitDays — сколько дней вперёд (по умолчанию 365)
 */
export function getUpcomingEventsForContact(contact, fromDate = new Date(), limitDays = 365) {
  if (!contact) return [];
  return getUpcomingEvents([contact], fromDate, limitDays);
}

/**
 * Возвращает прошедшие события (даты уже были в текущем году или в прошлом).
 * @param {Array} contacts — контакты с birthDate и events
 * @param {Date} beforeDate — до какой даты считать прошедшими (по умолчанию — сегодня)
 * @param {number} limit — максимум событий (по умолчанию 60)
 */
export function getPastEvents(contacts, beforeDate = new Date(), limit = 60) {
  const events = [];
  const startOfBefore = startOfDay(beforeDate);
  const startOfYear = new Date(startOfBefore.getFullYear(), 0, 1);

  for (const contact of contacts) {
    if (contact.birthDate) {
      const birth = parseLocalDate(contact.birthDate);
      if (!birth) continue;
      const eventDate = new Date(startOfBefore.getFullYear(), birth.month, birth.day);
      if (isBefore(eventDate, startOfBefore) && !isBefore(eventDate, startOfYear)) {
        const daysAgo = Math.ceil((startOfBefore - eventDate) / (24 * 60 * 60 * 1000));
        events.push({
          id: `past-${contact.id}-birthday-${eventDate.getTime()}`,
          contactId: contact.id,
          contact,
          date: formatLocalDate(eventDate),
          type: EVENT_TYPES.birthday,
          occasionName: 'День рождения',
          daysAgo,
        });
      }
    }
    const contactEvents = contact.events ?? [];
    for (const ev of contactEvents) {
      if (!ev.date) continue;
      const evDate = parseLocalDate(ev.date);
      if (!evDate) continue;
      const eventDate = new Date(startOfBefore.getFullYear(), evDate.month, evDate.day);
      if (isBefore(eventDate, startOfBefore) && !isBefore(eventDate, startOfYear)) {
        const daysAgo = Math.ceil((startOfBefore - eventDate) / (24 * 60 * 60 * 1000));
        const occasionName = getOccasionName(ev.type, ev.name);
        events.push({
            id: `past-${contact.id}-${ev.id}-${eventDate.getTime()}`,
            contactId: contact.id,
            contact,
            date: formatLocalDate(eventDate),
          type: ev.type === 'anniversary' ? EVENT_TYPES.anniversary : EVENT_TYPES.custom,
          occasionName,
          daysAgo,
        });
      }
    }
  }

  events.sort((a, b) => new Date(b.date) - new Date(a.date));
  return events.slice(0, limit);
}
