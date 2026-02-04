import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Sparkles, Bookmark, Clock, ArrowRight, Image, Trophy } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { getUpcomingEvents, formatDate } from '../utils/dateUtils';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import './Dashboard.css';

export function Dashboard() {
  const navigate = useNavigate();
  const { contacts, congratulations } = useApp();
  const fromDate = new Date();
  const events = getUpcomingEvents(contacts, fromDate, 30);
  const nextEvent = events[0];
  const thisMonth = events.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === fromDate.getMonth();
  }).length;

  const quickActions = [
    { label: 'Календарь', hint: 'Все события', Icon: Calendar, path: '/calendar' },
    { label: 'Контакты', hint: `${contacts.length} в досье`, Icon: Users, path: '/contacts' },
    { label: 'Генератор', hint: 'Новое поздравление', Icon: Sparkles, path: '/generate' },
    { label: 'Открытка за 60 сек', hint: 'Текст + картинка', Icon: Image, path: '/quick-card', chip: 'Тест' },
    { label: 'Сохранённое', hint: `${congratulations.length} сохранено`, Icon: Bookmark, path: '/saved' },
    { label: 'История', hint: 'Прошедшие события', Icon: Clock, path: '/history' },
    { label: 'Челленджи', hint: 'Неделя внимания', Icon: Trophy, path: '/challenges' },
  ];

  return (
    <div className="page dashboard">
      <header className="dashboard__hero">
        <h1 className="dashboard__brand dashboard__brand-title" aria-label="Поздравлятор 2000">
          Поздравлятор 2000
        </h1>
        <p className="dashboard__tagline">
          Персональный ассистент по тёплым отношениям.
          <span className="dashboard__tagline-line">Не забывай даты — генерируй искренние поздравления.</span>
        </p>
      </header>

      {thisMonth > 0 && (
        <p className="dashboard__stats dashboard__stats--above-card">
          В этом месяце — <strong>{thisMonth}</strong> {thisMonth === 1 ? 'событие' : 'событий'}
        </p>
      )}

      {nextEvent && (
        <Card
          as="article"
          className="dashboard__next card--clickable card--highlight"
          onClick={() =>
            navigate('/generate', {
              state: {
                eventId: nextEvent.id,
                contactId: nextEvent.contactId,
                contact: nextEvent.contact,
                occasionName: nextEvent.occasionName ?? 'День рождения',
              },
            })
          }
        >
          <div className="dashboard__next-badge">Ближайшее событие</div>
          <div className="dashboard__next-days">
            {nextEvent.daysUntil === 0
              ? 'Сегодня'
              : nextEvent.daysUntil === 1
                ? 'Завтра'
                : `Через ${nextEvent.daysUntil} дн.`}
          </div>
          <div className="dashboard__next-name">{nextEvent.contact?.name ?? 'Контакт'}</div>
          <div className="dashboard__next-occasion">{nextEvent.occasionName ?? 'День рождения'}</div>
          <div className="dashboard__next-date">{formatDate(nextEvent.date)}</div>
          <Button variant="primary" className="dashboard__next-cta" as="span">
            Сгенерировать поздравление
            <ArrowRight size={16} strokeWidth={2} />
          </Button>
        </Card>
      )}

      <section className="dashboard__quick">
        <h2 className="dashboard__section-title">Быстрые действия</h2>
        <div className="dashboard__quick-grid dashboard__quick-grid--chaotic">
          {quickActions.map(({ label, hint, Icon, path, chip }, i) => (
            <button
              key={path}
              type="button"
              className="dashboard__quick-card dashboard__quick-card--glass"
              onClick={() => navigate(path)}
              style={{ animationDelay: `${0.05 + i * 0.08}s` }}
            >
              <span className="dashboard__quick-icon">
                <Icon size={22} strokeWidth={2} />
              </span>
              <span className="dashboard__quick-head">
                <span className="dashboard__quick-label">{label}</span>
                {chip && <span className="dashboard__quick-chip" title="Функция в тестировании">{chip}</span>}
              </span>
              <span className="dashboard__quick-hint">{hint}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="dashboard__roadmap" aria-label="Планы развития">
        <h2 className="dashboard__section-title">В планах</h2>
        <ul className="dashboard__roadmap-list">
          <li className="dashboard__roadmap-item">Умные напоминания за день и час до события</li>
          <li className="dashboard__roadmap-item">Озвучка поздравления голосом</li>
        </ul>
      </section>

      {!nextEvent && contacts.length === 0 && (
        <Card className="dashboard__empty dashboard__empty--glass">
          <p className="dashboard__empty-text">Добавьте первого контакта с датой — и здесь появится ближайшее событие.</p>
          <Button variant="primary" onClick={() => navigate('/contacts/add')}>
            Добавить контакт
          </Button>
        </Card>
      )}
    </div>
  );
}
