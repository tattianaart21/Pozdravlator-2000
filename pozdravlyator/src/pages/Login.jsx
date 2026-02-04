import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useTheme } from '../store/ThemeContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import './Auth.css';

export function Login() {
  const navigate = useNavigate();
  const { signIn, signInDemo, isConfigured } = useAuth();
  const { themeId, setThemeId, themes } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      navigate('/calendar', { replace: true });
    } catch (err) {
      const msg = err.message ?? 'Ошибка входа';
      if (msg.toLowerCase().includes('email not confirmed') || msg.toLowerCase().includes('email_not_confirmed')) {
        setError('Email ещё не подтверждён. Проверьте почту и перейдите по ссылке из письма от Supabase. Если письма нет — проверьте папку «Спам» или отключите подтверждение в Supabase: Authentication → Providers → Email → «Confirm email».');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isConfigured) {
    return (
      <div className="auth-page">
        <label className="auth-theme">
          <select className="auth-theme__select" value={themeId} onChange={(e) => setThemeId(e.target.value)} aria-label="Тема">
            {themes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
        <Card className="auth-card">
          <h1 className="auth-title">Вход</h1>
          <p className="auth-message auth-message--warning">
            Настройте Supabase: добавьте <code>VITE_SUPABASE_URL</code> и <code>VITE_SUPABASE_ANON_KEY</code> в <code>.env</code>.
          </p>
          <p className="auth-hint">Создайте проект на supabase.com → Settings → API.</p>
          <Button variant="secondary" onClick={signInDemo} className="auth-submit">
            Продолжить в демо-режиме (без сервера)
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <label className="auth-theme">
        <select
          className="auth-theme__select"
          value={themeId}
          onChange={(e) => setThemeId(e.target.value)}
          aria-label="Тема оформления"
        >
          {themes.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </label>
      <Card className="auth-card">
        <h1 className="auth-title">Вход</h1>
        <p className="auth-subtitle">Войдите в свой аккаунт Поздравлятор 2000</p>

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
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
          <Button type="submit" variant="primary" disabled={loading} className="auth-submit">
            {loading ? 'Вход...' : 'Войти'}
          </Button>
        </form>

        <p className="auth-footer">
          Нет аккаунта? <Link to="/signup">Зарегистрироваться</Link>
        </p>
      </Card>
    </div>
  );
}
