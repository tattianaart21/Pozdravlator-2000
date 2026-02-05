import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Bookmark, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { useTheme } from '../store/ThemeContext';
import { usePalette } from '../store/PaletteContext';
import { useSettings } from '../store/SettingsContext';
import { useApp } from '../store/AppContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import './Profile.css';

const DOSSIER_FIELDS = ['name', 'birthDate', 'role', 'hobbies', 'dreams', 'jokes', 'memories', 'tastes'];

function dossierCompletionPercent(contact) {
  if (!contact) return 0;
  const filled = DOSSIER_FIELDS.filter((key) => {
    const v = contact[key];
    return v != null && String(v).trim() !== '';
  }).length;
  return Math.round((filled / DOSSIER_FIELDS.length) * 100);
}

export function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { themeId, setThemeId, themes } = useTheme();
  const { paletteId, setPaletteId, palettes } = usePalette();
  const { backgroundOn, setBackgroundOn } = useSettings();
  const { contacts, congratulations } = useApp();

  const liveDossier = useMemo(() => {
    const total = contacts.length;
    const avgCompletion = total
      ? Math.round(
          contacts.reduce((sum, c) => sum + dossierCompletionPercent(c), 0) / total
        )
      : 0;
    const fullDossier = contacts.filter((c) => dossierCompletionPercent(c) === 100).length;
    const savedCount = congratulations.length;
    const badges = [];
    if (total >= 1) badges.push({ id: 'first', label: 'Первый контакт', icon: Users });
    if (total >= 5) badges.push({ id: 'five', label: '5 контактов', icon: Users });
    if (fullDossier >= 1) badges.push({ id: 'full', label: 'Полное досье', icon: Award });
    if (savedCount >= 3) badges.push({ id: 'saved', label: '3+ сохранённых', icon: Bookmark });
    return { total, avgCompletion, fullDossier, savedCount, badges };
  }, [contacts, congratulations]);

  const handleSignOut = () => {
    signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="page profile">
      <header className="page__header">
        <h1 className="page__title">Профиль</h1>
        <p className="page__subtitle">Живое досье, тема и оформление</p>
      </header>

      <Card className="profile__card profile__card--glass profile__live-dossier">
        <h2 className="profile__live-title">Живое досье</h2>
        <div className="profile__live-stats">
          <div className="profile__stat">
            <Users size={20} strokeWidth={2} aria-hidden />
            <span><strong>{liveDossier.total}</strong> контактов</span>
          </div>
          <div className="profile__stat">
            <TrendingUp size={20} strokeWidth={2} aria-hidden />
            <span>Досье заполнено в среднем на <strong>{liveDossier.avgCompletion}%</strong></span>
          </div>
          <div className="profile__stat">
            <Bookmark size={20} strokeWidth={2} aria-hidden />
            <span><strong>{liveDossier.savedCount}</strong> сохранённых поздравлений</span>
          </div>
        </div>
        {liveDossier.badges.length > 0 && (
          <div className="profile__badges">
            <span className="profile__badges-label">Достижения:</span>
            <ul className="profile__badges-list">
              {liveDossier.badges.map((b) => (
                <li key={b.id} className="profile__badge" title={b.label}>
                  <b.icon size={18} strokeWidth={2} />
                  <span>{b.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Card className="profile__card profile__card--glass">
        <p className="profile__email" title={user?.email}>
          {user?.email ?? '—'}
        </p>

        <div className="profile__group">
          <label className="profile__label">Тема</label>
          <select
            className="profile__select"
            value={themeId}
            onChange={(e) => setThemeId(e.target.value)}
            aria-label="Тема оформления"
          >
            {themes.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="profile__group">
          <label className="profile__label">Палитра</label>
          <select
            className="profile__select"
            value={paletteId}
            onChange={(e) => setPaletteId(e.target.value)}
            aria-label="Цветовая палитра"
          >
            {palettes.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="profile__group profile__group--row">
          <span className="profile__label">Стильный фон</span>
          <button
            type="button"
            role="switch"
            aria-checked={backgroundOn}
            aria-label="Включить или выключить фон"
            className={`profile__toggle ${backgroundOn ? 'profile__toggle--on' : ''}`}
            onClick={() => setBackgroundOn(!backgroundOn)}
          >
            <span className="profile__toggle-thumb" />
          </button>
        </div>

        <Button variant="secondary" className="profile__logout" onClick={handleSignOut}>
          Выйти
        </Button>
      </Card>
    </div>
  );
}
