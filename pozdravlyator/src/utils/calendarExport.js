/**
 * Экспорт события в Google Calendar или скачивание .ics (iCalendar).
 * Событие с пометкой «ДР Маши» и опциональной ссылкой на приложение.
 */

/**
 * Формирует URL для добавления события в Google Calendar.
 * @param {{ title: string, date: string (YYYY-MM-DD), details?: string, location?: string }} opts
 */
export function getGoogleCalendarUrl(opts) {
  const { title, date, details = '', location = '' } = opts;
  const [y, m, d] = date.split('-').map(Number);
  const start = new Date(y, m - 1, d, 9, 0, 0);
  const end = new Date(y, m - 1, d, 10, 0, 0);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${formatICSDate(start)}/${formatICSDate(end)}`,
    details: details,
    location: location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function formatICSDate(d) {
  return d.toISOString().replace(/[-:]/g, '').slice(0, 15);
}

/**
 * Генерирует содержимое .ics файла для одного события.
 * @param {{ title: string, date: string (YYYY-MM-DD), description?: string }} opts
 */
export function buildICalContent(opts) {
  const { title, date, description = '' } = opts;
  const [y, m, d] = date.split('-').map(Number);
  const start = new Date(y, m - 1, d, 9, 0, 0);
  const end = new Date(y, m - 1, d, 10, 0, 0);
  const now = new Date();
  const uid = `pozdrav-${date}-${now.getTime()}@pozdravlyator`;
  const formatICS = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Pozdravlyator//RU',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICS(now)}Z`,
    `DTSTART:${formatICS(start)}`,
    `DTEND:${formatICS(end)}`,
    `SUMMARY:${escapeICS(title)}`,
    description ? `DESCRIPTION:${escapeICS(description)}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');
}

function escapeICS(str) {
  return str.replace(/\r/g, '').replace(/\n/g, '\\n').replace(/[,;\\]/g, (c) => '\\' + c);
}

/**
 * Скачивает .ics файл в браузере.
 */
export function downloadICS(content, filename = 'event.ics') {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
