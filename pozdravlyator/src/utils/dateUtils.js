import { addYears, isAfter, isBefore, parseISO, format, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getOccasionName } from '../constants/occasions';

export const EVENT_TYPES = { birthday: 'birthday', anniversary: 'anniversary', custom: 'custom' };

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
    // День рождения (дата может быть 0004-MM-DD если год неизвестен — используем только месяц и день, год fromDate)
    if (contact.birthDate) {
      const birth = parseISO(contact.birthDate);
      let eventDate = new Date(fromDate.getFullYear(), birth.getMonth(), birth.getDate());

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
            date: eventDate.toISOString().slice(0, 10),
            type: EVENT_TYPES.birthday,
            occasionId: 'birthday',
            occasionName: 'День рождения',
            daysUntil,
          });
        }
      }
    }

    // Другие памятные даты (годовщина, своя) — повторяются каждый год (месяц и день из ev.date, год — fromDate)
    const contactEvents = contact.events ?? [];
    for (const ev of contactEvents) {
      if (!ev.date) continue;
      let evDate;
      try {
        evDate = parseISO(ev.date);
        if (Number.isNaN(evDate.getTime())) continue;
      } catch {
        continue;
      }
      let eventDate = new Date(fromDate.getFullYear(), evDate.getMonth(), evDate.getDate());

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
            date: eventDate.toISOString().slice(0, 10),
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
      const birth = parseISO(contact.birthDate);
      const eventDate = new Date(startOfBefore.getFullYear(), birth.getMonth(), birth.getDate());
      if (isBefore(eventDate, startOfBefore) && !isBefore(eventDate, startOfYear)) {
        const daysAgo = Math.ceil((startOfBefore - eventDate) / (24 * 60 * 60 * 1000));
        events.push({
          id: `past-${contact.id}-birthday-${eventDate.getTime()}`,
          contactId: contact.id,
          contact,
          date: eventDate.toISOString().slice(0, 10),
          type: EVENT_TYPES.birthday,
          occasionName: 'День рождения',
          daysAgo,
        });
      }
    }
    const contactEvents = contact.events ?? [];
    for (const ev of contactEvents) {
      if (!ev.date) continue;
      try {
        const evDate = parseISO(ev.date);
        if (Number.isNaN(evDate.getTime())) continue;
        const eventDate = new Date(startOfBefore.getFullYear(), evDate.getMonth(), evDate.getDate());
        if (isBefore(eventDate, startOfBefore) && !isBefore(eventDate, startOfYear)) {
          const daysAgo = Math.ceil((startOfBefore - eventDate) / (24 * 60 * 60 * 1000));
          const occasionName = getOccasionName(ev.type, ev.name);
          events.push({
            id: `past-${contact.id}-${ev.id}-${eventDate.getTime()}`,
            contactId: contact.id,
            contact,
            date: eventDate.toISOString().slice(0, 10),
            type: ev.type === 'anniversary' ? EVENT_TYPES.anniversary : EVENT_TYPES.custom,
            occasionName,
            daysAgo,
          });
        }
      } catch {
        // skip
      }
    }
  }

  events.sort((a, b) => new Date(b.date) - new Date(a.date));
  return events.slice(0, limit);
}
