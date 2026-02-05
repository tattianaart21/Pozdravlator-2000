import React, { useState, useEffect } from 'react';
import './AppStandalone.css';

export default function AppStandalone() {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({ name: '', role: '', birthday: '', hobbies: '', tone: 'тёплый' });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('contacts');
      if (raw) {
        /* eslint-disable react-hooks/set-state-in-effect */
        setContacts(JSON.parse(raw));
        /* eslint-enable react-hooks/set-state-in-effect */
      }
    } catch {
      // ignore
    }
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = [...contacts, form];
    setContacts(next);
    localStorage.setItem('contacts', JSON.stringify(next));
    setForm({ name: '', role: '', birthday: '', hobbies: '', tone: 'тёплый' });
  };

  return (
    <div className="standalone">
      <header className="standalone__header">
        <h1 className="standalone__title">Поздравлятор 2000</h1>
        <p className="standalone__subtitle">ИИ для искренних поздравлений</p>
      </header>

      <div className="standalone__grid">
        <section className="standalone__card standalone__form-card" aria-label="Новое досье">
          <h2 className="standalone__card-title">Новое досье</h2>
          <form onSubmit={handleSubmit} className="standalone__form">
            <label className="standalone__label">
              <span className="standalone__label-text">Имя</span>
              <input
                name="name"
                type="text"
                placeholder="Как обращаться?"
                value={form.name}
                onChange={handleChange}
                className="standalone__input"
                autoComplete="name"
              />
            </label>
            <label className="standalone__label">
              <span className="standalone__label-text">Роль</span>
              <input
                name="role"
                type="text"
                placeholder="Мама, друг, коллега..."
                value={form.role}
                onChange={handleChange}
                className="standalone__input"
              />
            </label>
            <label className="standalone__label">
              <span className="standalone__label-text">День рождения</span>
              <input
                name="birthday"
                type="date"
                value={form.birthday}
                onChange={handleChange}
                className="standalone__input"
                max={new Date().toISOString().slice(0, 10)}
                title="Дата не может быть в будущем"
              />
            </label>
            <label className="standalone__label">
              <span className="standalone__label-text">Хобби и воспоминания</span>
              <textarea
                name="hobbies"
                placeholder="Хобби, шутки, общие воспоминания..."
                value={form.hobbies}
                onChange={handleChange}
                className="standalone__input standalone__textarea"
                rows={3}
              />
            </label>
            <label className="standalone__label">
              <span className="standalone__label-text">Тон поздравления</span>
              <select
                name="tone"
                value={form.tone}
                onChange={handleChange}
                className="standalone__input standalone__select"
              >
                <option value="тёплый">Тёплый</option>
                <option value="ироничный">Ироничный</option>
                <option value="официальный">Официальный</option>
                <option value="эпичный">Эпичный</option>
              </select>
            </label>
            <button type="submit" className="standalone__btn standalone__btn--primary">
              Создать профиль
            </button>
          </form>
        </section>

        {contacts.length > 0 && (
          <section className="standalone__card standalone__contacts-card" aria-label="Контакты">
            <h2 className="standalone__card-title">Контакты ({contacts.length})</h2>
            <ul className="standalone__list">
              {contacts.map((c, i) => (
                <li key={i} className="standalone__contact">
                  <div className="standalone__contact-head">
                    <span className="standalone__contact-name">{c.name}</span>
                    <span className={`standalone__badge standalone__badge--${c.tone.replace(/\s/g, '-')}`}>
                      {c.tone}
                    </span>
                  </div>
                  <dl className="standalone__contact-dl">
                    <div><dt>Роль</dt><dd>{c.role || '—'}</dd></div>
                    <div><dt>ДР</dt><dd>{c.birthday || '—'}</dd></div>
                  </dl>
                  {c.hobbies && (
                    <p className="standalone__contact-hobbies">{c.hobbies}</p>
                  )}
                  <button
                    type="button"
                    className="standalone__btn standalone__btn--secondary"
                    onClick={() => alert(`Поздравление для ${c.name} будет здесь`)}
                  >
                    Сгенерировать поздравление
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
