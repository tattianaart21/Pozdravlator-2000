import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useTheme } from '../store/ThemeContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import './Auth.css';

export function SignUp() {
  const { signUp, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signUp(email.trim(), password);
      setSignUpSuccess(true);
    } catch (err) {
      setError(err.message ?? 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const { themeId, setThemeId, themes } = useTheme();

  if (!isConfigured) {
    return (
      <div className="auth-page">
        <label className="auth-theme">
          <select className="auth-theme__select" value={themeId} onChange={(e) => setThemeId(e.target.value)} aria-label="Тема">
            {themes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
        <Card className="auth-card">
          <h1 className="auth-title">Регистрация</h1>
          <p className="auth-message auth-message--warning">
            Настройте Supabase в <code>.env</code> (см. страницу входа).
          </p>
        </Card>
      </div>
    );
  }

  if (signUpSuccess) {
    return (
      <div className="auth-page">
        <label className="auth-theme">
          <select className="auth-theme__select" value={themeId} onChange={(e) => setThemeId(e.target.value)} aria-label="Тема">
            {themes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
        <Card className="auth-card">
          <h1 className="auth-title">Проверьте почту</h1>
          <p className="auth-message">
            На <strong>{email}</strong> отправлено письмо с ссылкой для подтверждения. Перейдите по ссылке, затем войдите в приложение.
          </p>
          <p className="auth-hint">Если письма нет — проверьте папку «Спам».</p>
          <Button as={Link} to="/login" variant="primary" className="auth-submit">
            Перейти к входу
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <label className="auth-theme">
        <select className="auth-theme__select" value={themeId} onChange={(e) => setThemeId(e.target.value)} aria-label="Тема">
          {themes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </label>
      <Card className="auth-card">
        <h1 className="auth-title">Регистрация</h1>
        <p className="auth-subtitle">Создайте аккаунт для хранения досье и поздравлений</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <p className="auth-error" role="alert">{error}</p>}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
            autoComplete="email"
          />
          <Input
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Не менее 6 символов"
            required
            autoComplete="new-password"
            minLength={6}
          />
          <Input
            label="Повторите пароль"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />
          <Button type="submit" variant="primary" disabled={loading} className="auth-submit">
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>
        </form>

        <p className="auth-footer">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </Card>
    </div>
  );
}
