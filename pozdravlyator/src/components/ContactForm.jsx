import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ROLES } from '../constants/roles';
import { TONES } from '../constants/tones';
import { Button } from './Button';
import { Input, Textarea } from './Input';
import { Card } from './Card';
import '../pages/AddContact.css';

const emptyForm = {
  name: '',
  birthDate: '',
  role: ROLES[0].id,
  defaultTone: TONES[0].id,
  hobbies: '',
  dreams: '',
  jokes: '',
  memories: '',
  tastes: '',
  events: [],
};

export function ContactForm({ contactId, initialContact, onSubmit, onDelete, submitLabel = 'Сохранить контакт', title, subtitle }) {
  const [showImportModal, setShowImportModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(emptyForm);

  const isEdit = Boolean(contactId);

  useEffect(() => {
    if (initialContact) {
      /* eslint-disable react-hooks/set-state-in-effect -- синхронизация формы с контактом */
      setForm({
        name: initialContact.name ?? '',
        birthDate: initialContact.birthDate ?? '',
        role: initialContact.role ?? ROLES[0].id,
        defaultTone: initialContact.defaultTone ?? TONES[0].id,
        hobbies: initialContact.hobbies ?? '',
        dreams: initialContact.dreams ?? '',
        jokes: initialContact.jokes ?? '',
        memories: initialContact.memories ?? '',
        tastes: initialContact.tastes ?? '',
        events: Array.isArray(initialContact.events) ? initialContact.events.map((e) => ({ ...e, id: e.id ?? uuidv4() })) : [],
      });
    } else if (!isEdit) {
      setForm(emptyForm);
    }
  }, [initialContact, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Введите имя';
    if (!form.birthDate) next.birthDate = 'Укажите дату рождения';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const events = (form.events ?? [])
      .filter((e) => e.date)
      .map((e) => ({
        id: e.id ?? uuidv4(),
        type: e.type === 'custom' ? 'custom' : 'anniversary',
        name: e.type === 'custom' ? (e.name || '').trim() || undefined : undefined,
        date: e.date,
      }));

    const dossier = {
      ...(contactId && { id: contactId }),
      name: form.name.trim(),
      birthDate: form.birthDate,
      role: form.role,
      defaultTone: form.defaultTone,
      hobbies: form.hobbies.trim() || undefined,
      dreams: form.dreams.trim() || undefined,
      jokes: form.jokes.trim() || undefined,
      memories: form.memories.trim() || undefined,
      tastes: form.tastes.trim() || undefined,
      events: events.length ? events : undefined,
    };

    onSubmit(dossier);
  };

  const addEvent = () => {
    setForm((prev) => ({
      ...prev,
      events: [...(prev.events ?? []), { id: uuidv4(), type: 'anniversary', name: '', date: '' }],
    }));
  };

  const updateEvent = (index, field, value) => {
    setForm((prev) => {
      const next = [...(prev.events ?? [])];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, events: next };
    });
  };

  const removeEvent = (index) => {
    setForm((prev) => ({
      ...prev,
      events: (prev.events ?? []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="page add-contact">
      <header className="page__header">
        <h1 className="page__title">{title}</h1>
        <p className="page__subtitle">{subtitle}</p>
      </header>

      <form onSubmit={handleSubmit} className="add-contact__form">
        <Card className="add-contact__card">
          <Input
            label="Имя *"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Как к нему/ней обращаться?"
            error={errors.name}
            required
          />
          <Input
            label="Дата рождения *"
            name="birthDate"
            type="date"
            value={form.birthDate}
            onChange={handleChange}
            error={errors.birthDate}
            required
          />
          <div className="input-group">
            <label className="input-group__label">Роль / статус</label>
            <select name="role" value={form.role} onChange={handleChange} className="input-group__input">
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label className="input-group__label">Тон поздравления по умолчанию</label>
            <select name="defaultTone" value={form.defaultTone} onChange={handleChange} className="input-group__input">
              {TONES.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="add-contact__events">
            <h3 className="add-contact__section-title">Другие памятные даты</h3>
            <p className="add-contact__hint">Годовщина, 14 февраля, свой праздник — укажите дату и при необходимости название.</p>
            {(form.events ?? []).map((ev, index) => (
              <div key={ev.id ?? index} className="add-contact__event-row">
                <select
                  className="input-group__input add-contact__event-type"
                  value={ev.type}
                  onChange={(e) => updateEvent(index, 'type', e.target.value)}
                >
                  <option value="anniversary">Годовщина</option>
                  <option value="custom">Свой вариант</option>
                </select>
                {ev.type === 'custom' && (
                  <input
                    type="text"
                    className="input-group__input add-contact__event-name"
                    placeholder="Название (напр. День знакомства)"
                    value={ev.name ?? ''}
                    onChange={(e) => updateEvent(index, 'name', e.target.value)}
                  />
                )}
                <input
                  type="date"
                  className="input-group__input add-contact__event-date"
                  value={ev.date ?? ''}
                  onChange={(e) => updateEvent(index, 'date', e.target.value)}
                />
                <Button type="button" variant="ghost" className="add-contact__event-remove" onClick={() => removeEvent(index)} title="Удалить">
                  ✕
                </Button>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={addEvent}>
              Добавить дату
            </Button>
          </div>
        </Card>

        <Card className="add-contact__card">
          <h2 className="add-contact__section-title">Досье (чем больше — тем персонализированнее поздравления)</h2>
          <Textarea label="Хобби" name="hobbies" value={form.hobbies} onChange={handleChange} placeholder="Спорт, музыка, путешествия..." />
          <Textarea label="Мечты" name="dreams" value={form.dreams} onChange={handleChange} placeholder="О чём мечтает?" />
          <Textarea label="Внутренние шутки" name="jokes" value={form.jokes} onChange={handleChange} placeholder="Общие мемы, фразы..." />
          <Textarea label="Совместные воспоминания" name="memories" value={form.memories} onChange={handleChange} placeholder="Смешные или тёплые моменты" />
          <Textarea label="Вкусы (музыка, кино, книги)" name="tastes" value={form.tastes} onChange={handleChange} placeholder="Любимые фильмы, группы, книги" />
        </Card>

        <div className="add-contact__actions">
          {!isEdit && (
            <Button type="button" variant="secondary" onClick={() => setShowImportModal(true)}>
              Импорт из VK / Telegram
            </Button>
          )}
          {isEdit && onDelete && (
            <Button type="button" variant="danger" onClick={onDelete}>
              Удалить контакт
            </Button>
          )}
          <Button type="submit" variant="primary">{submitLabel}</Button>
        </div>
      </form>

      {showImportModal && (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Импорт контактов">
          <div className="modal__backdrop" onClick={() => setShowImportModal(false)} />
          <div className="modal__content">
            <h3 className="modal__title">Скоро</h3>
            <p className="modal__text">Импорт контактов и дат рождения из VK и Telegram будет доступен в следующей версии.</p>
            <Button variant="primary" onClick={() => setShowImportModal(false)}>Понятно</Button>
          </div>
        </div>
      )}
    </div>
  );
}
