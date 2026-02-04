import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { getPastEvents, formatDate } from '../utils/dateUtils';
import { Card } from '../components/Card';
import './History.css';
import './HistoryTimeline.css';

/** Страница «История» — только прошедшие события. */
export function History() {
  const navigate = useNavigate();
  const { contacts } = useApp();

  const pastEvents = useMemo(() => getPastEvents(contacts, new Date(), 50), [contacts]);

  return (
    <div className="page history-past-only">
      <header className="page__header">
        <h1 className="page__title">История</h1>
        <p className="page__subtitle">Прошедшие события в этом году</p>
      </header>

      {pastEvents.length === 0 ? (
        <Card className="history__empty">
          <p>Пока нет прошедших событий в этом году.</p>
          <p className="history__empty-hint">Добавьте контакты с датой рождения и памятные даты — после того как дата пройдёт, она появится здесь.</p>
          <button type="button" className="history__link" onClick={() => navigate('/contacts')}>
            К контактам →
          </button>
        </Card>
      ) : (
        <section className="history-past" aria-label="Прошедшие события">
          <ul className="history-past__list">
            {pastEvents.map((event) => (
              <li key={event.id}>
                <Card
                  as="article"
                  className="history-past__card card--clickable"
                  onClick={() =>
                    navigate('/generate', {
                      state: {
                        contactId: event.contactId,
                        contact: event.contact,
                        occasionName: event.occasionName,
                      },
                    })
                  }
                >
                  <span className="history-past__name">{event.contact?.name ?? '—'}</span>
                  <span className="history-past__occasion">{event.occasionName}</span>
                  <span className="history-past__date">{formatDate(event.date)}</span>
                  {event.daysAgo != null && (
                    <span className="history-past__ago">{event.daysAgo} дн. назад</span>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
