import { Link } from 'react-router-dom';
import { useTheme } from '../store/ThemeContext';
import { Button } from '../components/Button';
import './Landing.css';

/**
 * Главная страница для незалогиненных пользователей.
 * Минималистичный вариант: сетка, заголовок, кнопки.
 */
export function Landing() {
  const { themeId, setThemeId, themes } = useTheme();

  return (
    <div className="landing">
      <label className="landing__theme">
        <span className="landing__theme-label">Тема</span>
        <select
          className="landing__theme-select"
          value={themeId}
          onChange={(e) => setThemeId(e.target.value)}
          aria-label="Тема оформления"
        >
          {themes.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </label>

      <div className="landing__grid" aria-hidden="true">
        <span className="landing__grid-annot landing__grid-annot--1">ДАТЫ</span>
        <span className="landing__grid-annot landing__grid-annot--2">ДОСЬЕ</span>
        <span className="landing__grid-annot landing__grid-annot--3">ИИ</span>
        <span className="landing__grid-annot landing__grid-annot--4">КАЛЕНДАРЬ</span>
        <span className="landing__grid-annot landing__grid-annot--5">ПОВОД</span>
        <span className="landing__grid-annot landing__grid-annot--6">ТЕКСТ</span>
        <span className="landing__grid-annot landing__grid-annot--7">НАПОМИНАНИЯ</span>
        <span className="landing__grid-annot landing__grid-annot--8">КОНТАКТЫ</span>
        <span className="landing__grid-annot landing__grid-annot--9">ТОН</span>
        <span className="landing__grid-annot landing__grid-annot--10">ПОЗДРАВЛЕНИЯ</span>
        <span className="landing__grid-annot landing__grid-annot--11">ДР</span>
        <span className="landing__grid-annot landing__grid-annot--12">ПЕРСОНАЛЬНО</span>
      </div>

      <header className="landing__hero">
        <h1 className="landing__title">ПОЗДРАВЛЯТОР</h1>
        <p className="landing__tagline">
          ИИ для искренних поздравлений. Не забывай даты — генерируй тёплые слова за минуту.
        </p>
      </header>

      <section className="landing__content">
        <div className="landing__actions">
          <Link to="/login">
            <Button variant="primary" className="landing__btn">Войти</Button>
          </Link>
          <Link to="/signup">
            <Button variant="secondary" className="landing__btn">Регистрация</Button>
          </Link>
        </div>
      </section>

      <footer className="landing__footer">
        <Link to="/login" className="landing__footer-link">Вход</Link>
        <span className="landing__footer-sep">·</span>
        <Link to="/signup" className="landing__footer-link">Регистрация</Link>
      </footer>
    </div>
  );
}
