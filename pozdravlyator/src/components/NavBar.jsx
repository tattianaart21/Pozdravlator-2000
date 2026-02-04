import { NavLink } from 'react-router-dom';
import { Home, Calendar, Users, Sparkles, Bookmark, Clock, User } from 'lucide-react';
import './NavBar.css';

const links = [
  { to: '/', label: 'Главная', Icon: Home },
  { to: '/calendar', label: 'Календарь', Icon: Calendar },
  { to: '/contacts', label: 'Контакты', Icon: Users },
  { to: '/generate', label: 'Генератор', Icon: Sparkles },
  { to: '/saved', label: 'Сохранённое', Icon: Bookmark },
  { to: '/history', label: 'История', Icon: Clock },
];

export function NavBar() {
  return (
    <div className="navbar-wrapper">
      <nav className="navbar navbar--glass" aria-label="Основная навигация">
        {links.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}
            end={to !== '/contacts'}
          >
            <span className="navbar__icon" aria-hidden>
              <Icon size={20} strokeWidth={2} />
            </span>
            <span className="navbar__label">{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="navbar-user navbar-user--glass">
        <NavLink
          to="/profile"
          className={({ isActive }) => `navbar__link navbar__link--profile ${isActive ? 'navbar__link--active' : ''}`}
          title="Профиль: тема, палитра, выход"
        >
          <User size={20} strokeWidth={2} aria-hidden />
          <span className="navbar__label">Профиль</span>
        </NavLink>
      </div>
    </div>
  );
}
