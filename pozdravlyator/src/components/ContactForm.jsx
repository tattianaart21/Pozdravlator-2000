import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ROLES } from '../constants/roles';
import { TONES } from '../constants/tones';
import { Button } from './Button';
import { Input, Textarea } from './Input';
import { Card } from './Card';
import '../pages/AddContact.css';

/** Лимит символов в полях досье, чтобы не перегружать контекст ИИ */
export const DOSSIER_FIELD_MAX_LENGTH = 400;

const emptyForm = {
  name: '',
  birthDate: '',
  birthYearUnknown: false,
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
      let rawBirth = initialContact.birthDate ?? '';
      const birthYearUnknown = rawBirth.startsWith('1000-') || rawBirth.startsWith('0004-') || rawBirth.startsWith('0000-');
      if (rawBirth.length >= 10 && (rawBirth.startsWith('0004-') || rawBirth.startsWith('0000-')))
        rawBirth = '1000-' + rawBirth.slice(5);
      /* eslint-disable react-hooks/set-state-in-effect -- синхронизация формы с контактом */
      setForm({
        name: initialContact.name ?? '',
        birthDate: rawBirth,
        birthYearUnknown,
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
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = e.target.checked;
      setForm((prev) => {
        const next = { ...prev, [name]: checked };
        if (name === 'birthYearUnknown' && prev.birthDate && prev.birthDate.length >= 10) {
          const monthDay = prev.birthDate.slice(5); // "MM-DD"
          if (checked) next.birthDate = '1000-' + monthDay;
          else next.birthDate = new Date().getFullYear() + '-' + monthDay;
        }
        return next;
      });
    } else {
      setForm((prev) => {
        const next = { ...prev, [name]: value };
        if (name === 'birthDate' && prev.birthYearUnknown && value && value.length >= 10)
          next.birthDate = '1000-' + value.slice(5);
        return next;
      });
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const todayISO = new Date().toISOString().slice(0, 10);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Введите имя';
    if (!form.birthDate) next.birthDate = 'Укажите дату рождения (хотя бы день и месяц)';
    else if (!form.birthYearUnknown && form.birthDate > todayISO) next.birthDate = 'Дата рождения не может быть в будущем';
    (form.events ?? []).forEach((ev, i) => {
      if (ev.date && ev.date > todayISO) next[`eventDate_${i}`] = 'Дата не может быть в будущем';
    });
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

    const birthDate = form.birthYearUnknown && form.birthDate && form.birthDate.length >= 10
      ? '1000-' + form.birthDate.slice(5)
      : form.birthDate;

    const dossier = {
      ...(contactId && { id: contactId }),
      name: form.name.trim(),
      birthDate,
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
          <div className="add-contact__birth-row">
            <Input
              label="Дата рождения *"
              name="birthDate"
              type="date"
              value={form.birthDate}
              onChange={handleChange}
              error={errors.birthDate}
              max={form.birthYearUnknown ? undefined : todayISO}
              required
            />
            <label className="add-contact__check-label">
              <input
                type="checkbox"
                name="birthYearUnknown"
                checked={form.birthYearUnknown || false}
                onChange={handleChange}
                className="add-contact__check"
              />
              <span>Не знаю год — напоминать каждый год в этот день и месяц (в календарь подставится текущий год)</span>
            </label>
          </div>
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
                  max={todayISO}
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
          <p className="add-contact__hint">До {DOSSIER_FIELD_MAX_LENGTH} символов в каждом поле — чтобы не перегружать контекст ИИ.</p>
          <Textarea label="Хобби" name="hobbies" value={form.hobbies} onChange={handleChange} placeholder="Спорт, музыка, путешествия..." maxLength={DOSSIER_FIELD_MAX_LENGTH} />
          <span className="add-contact__char-count">{form.hobbies.length}/{DOSSIER_FIELD_MAX_LENGTH}</span>
          <Textarea label="Мечты" name="dreams" value={form.dreams} onChange={handleChange} placeholder="О чём мечтает?" maxLength={DOSSIER_FIELD_MAX_LENGTH} />
          <span className="add-contact__char-count">{form.dreams.length}/{DOSSIER_FIELD_MAX_LENGTH}</span>
          <Textarea label="Внутренние шутки" name="jokes" value={form.jokes} onChange={handleChange} placeholder="Общие мемы, фразы..." maxLength={DOSSIER_FIELD_MAX_LENGTH} />
          <span className="add-contact__char-count">{form.jokes.length}/{DOSSIER_FIELD_MAX_LENGTH}</span>
          <Textarea label="Совместные воспоминания" name="memories" value={form.memories} onChange={handleChange} placeholder="Смешные или тёплые моменты" maxLength={DOSSIER_FIELD_MAX_LENGTH} />
          <span className="add-contact__char-count">{form.memories.length}/{DOSSIER_FIELD_MAX_LENGTH}</span>
          <Textarea label="Вкусы (музыка, кино, книги)" name="tastes" value={form.tastes} onChange={handleChange} placeholder="Любимые фильмы, группы, книги" maxLength={DOSSIER_FIELD_MAX_LENGTH} />
          <span className="add-contact__char-count">{form.tastes.length}/{DOSSIER_FIELD_MAX_LENGTH}</span>
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
