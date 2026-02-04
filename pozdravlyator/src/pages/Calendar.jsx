import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { getUpcomingEvents, formatDate } from '../utils/dateUtils';
import { getGoogleCalendarUrl } from '../utils/calendarExport';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import './Calendar.css';

export function Calendar() {
  const navigate = useNavigate();
  const { contacts } = useApp();
  const fromDate = new Date();
  const events = getUpcomingEvents(contacts, fromDate, 60);

  const handleEventClick = (event) => {
    navigate('/generate', {
      state: {
        eventId: event.id,
        contactId: event.contactId,
        contact: event.contact,
        occasionName: event.occasionName ?? 'День рождения',
      },
    });
  };

  return (
    <div className="page calendar">
      <header className="page__header">
        <h1 className="page__title">Календарь</h1>
        <p className="page__subtitle">Дни рождения и добавленные памятные даты (годовщины, свои праздники)</p>
      </header>

      {events.length === 0 ? (
        <Card className="calendar__empty">
          <p>Пока нет предстоящих событий.</p>
          <p className="calendar__empty-hint">Добавьте контакты с датой рождения и памятные даты (годовщина, свой праздник) — они появятся здесь с указанием типа события.</p>
          <Button variant="primary" onClick={() => navigate('/contacts/add')}>
            Добавить контакт
          </Button>
        </Card>
      ) : (
        <ul className="calendar__list">
          {events.map((event) => (
            <li key={event.id}>
              <Card
                as="article"
                className="calendar__event calendar__event--with-actions"
              >
                <div
                  className="calendar__event-clickable"
                  onClick={() => handleEventClick(event)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleEventClick(event)}
                >
                  <div className="calendar__event-date">
                    {formatDate(event.date)} {event.daysUntil === 0 ? '— сегодня!' : event.daysUntil === 1 ? '— завтра' : `через ${event.daysUntil} дн.`}
                  </div>
                  <div className="calendar__event-main">
                    <span className="calendar__event-name">{event.contact?.name ?? 'Без имени'}</span>
                    <span className="calendar__event-type" title="Тип события">
                      {event.occasionName ?? 'День рождения'}
                    </span>
                  </div>
                </div>
                <div className="calendar__event-actions">
                  <a
                    href={getGoogleCalendarUrl({
                      title: `${event.occasionName ?? 'ДР'} ${event.contact?.name ?? ''}`.trim(),
                      date: event.date,
                      details: `Напоминание из Поздравлятора. Сгенерировать поздравление: ${window.location.origin}/generate`,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="calendar__event-link"
                    title="Добавить в Google"
                  >
                    <CalendarIcon size={16} strokeWidth={2} />
                    Google
                  </a>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
