import { Link } from 'react-router-dom';
import { useTheme } from '../store/ThemeContext';
import { Button } from '../components/Button';
import './Landing.css';

/**
 * Главная страница для незалогиненных пользователей.
 * Стиль в духе Letta: сильный hero, секции, современный tech-вид.
 */
export function Landing() {
  const { themeId, setThemeId, themes } = useTheme();

  return (
    <div className="landing">
      <nav className="landing__nav">
        <div className="landing__nav-inner">
          <span className="landing__logo">Поздравлятор</span>
          <div className="landing__nav-links">
            <span className="landing__nav-link landing__nav-link--active">Главная</span>
            <a href="#features" className="landing__nav-link">Возможности</a>
          </div>
          <div className="landing__nav-actions">
            <label className="landing__theme">
              <span className="landing__theme-label">Тема</span>
              <select
                className="landing__theme-select"
                value={themeId}
                onChange={(e) => setThemeId(e.target.value)}
                aria-label="Тема"
              >
                {themes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </label>
            <Link to="/login" className="landing__nav-btn landing__nav-btn--ghost">Войти</Link>
            <Link to="/signup" className="landing__nav-btn landing__nav-btn--primary">Регистрация</Link>
          </div>
        </div>
      </nav>

      <div className="landing__grid" aria-hidden="true" />

      <section className="landing__hero">
        <p className="landing__hero-label">ИИ-ассистент</p>
        <h1 className="landing__hero-title">
          Не забывай даты —<br />генерируй поздравления
        </h1>
        <p className="landing__hero-desc">
          Персональный помощник по тёплым отношениям: досье контактов, календарь событий,
          генерация текстов под человека и повод. Один сервис — чтобы ни одна важная дата не прошла мимо.
        </p>
        <div className="landing__hero-actions">
          <Link to="/signup">
            <Button variant="primary" className="landing__cta">Начать бесплатно</Button>
          </Link>
          <Link to="/login" className="landing__hero-link">Уже есть аккаунт — войти</Link>
        </div>
      </section>

      <section className="landing__value" id="features">
        <div className="landing__value-inner">
          <h2 className="landing__value-title">Почему это работает</h2>
          <p className="landing__value-lead">
            ИИ, который помнит о людях: досье, даты, тон. Генерируй искренние поздравления за минуту.
          </p>
          <div className="landing__value-cards">
            <div className="landing__card">
              <span className="landing__card-icon">📅</span>
              <h3 className="landing__card-title">Календарь и напоминания</h3>
              <p className="landing__card-text">Дни рождения, годовщины, свои праздники — все даты в одном месте. Уведомления не дадут забыть.</p>
            </div>
            <div className="landing__card">
              <span className="landing__card-icon">📝</span>
              <h3 className="landing__card-title">Досье на каждого</h3>
              <p className="landing__card-text">Хобби, мечты, шутки, воспоминания. Чем больше деталей — тем персонализированнее текст.</p>
            </div>
            <div className="landing__card">
              <span className="landing__card-icon">✨</span>
              <h3 className="landing__card-title">ИИ пишет за тебя</h3>
              <p className="landing__card-text">Не шаблонные фразы, а тёплые слова под человека и повод. Несколько вариантов тона на выбор.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing__cta-block">
        <h2 className="landing__cta-title">Готов поздравить по-настоящему?</h2>
        <p className="landing__cta-desc">Регистрация за минуту. Без подписок.</p>
        <div className="landing__cta-actions">
          <Link to="/signup">
            <Button variant="primary" className="landing__btn">Регистрация</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" className="landing__btn">Войти</Button>
          </Link>
        </div>
      </section>

      <footer className="landing__footer">
        <div className="landing__footer-inner">
          <Link to="/login" className="landing__footer-link">Вход</Link>
          <span className="landing__footer-sep">·</span>
          <Link to="/signup" className="landing__footer-link">Регистрация</Link>
          <span className="landing__footer-sep">·</span>
          <span className="landing__footer-copy">Поздравлятор 2000</span>
        </div>
      </footer>
    </div>
  );
}
