import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { getUpcomingEventsForContact } from '../utils/dateUtils';
import { TONES } from '../constants/tones';
import { OCCASIONS, getOccasionById } from '../constants/occasions';
import { generateCongratulation } from '../services/api';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input, Textarea } from '../components/Input';
import { MemePicker } from '../components/MemePicker';
import { GiftOrder } from '../components/GiftOrder';
import { GiftSuggestions } from '../components/GiftSuggestions';
import { ShareButtons } from '../components/ShareButtons';
import './Generator.css';

export function Generator() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { contacts, getContact, addCongratulation } = useApp();
  const state = location.state || {};
  const contactIdFromUrl = searchParams.get('contactId');

  const [contactId, setContactId] = useState(state.contactId ?? contactIdFromUrl ?? '');
  const [toneId, setToneId] = useState('');
  const [occasionId, setOccasionId] = useState(state.occasionId ?? 'birthday');
  const [occasionCustomName, setOccasionCustomName] = useState(state.occasionCustomName ?? '');
  const [variants, setVariants] = useState([]);
  const [selectedText, setSelectedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const contact = contactId ? getContact(contactId) : null;
  const fromDate = new Date();
  const contactEvents = contact ? getUpcomingEventsForContact(contact, fromDate, 365) : [];
  const eventWithinWeek = contactEvents.find((e) => e.daysUntil != null && e.daysUntil <= 7);

  const handleCopyText = useCallback(async () => {
    const text = selectedText.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  }, [selectedText]);

  // Повод для промпта: из списка (День рождения, 23 февраля и т.д.) или свой вариант
  const occasionName = occasionId === 'custom'
    ? occasionCustomName.trim() || 'Праздник'
    : getOccasionById(occasionId)?.name ?? 'День рождения';

  // При смене контакта: если есть событие не позднее 1 недели — подставить его в «Повод»
  useEffect(() => {
    if (state.occasionName) {
      const found = OCCASIONS.find((o) => o.name === state.occasionName);
      if (found) setOccasionId(found.id);
      else {
        setOccasionId('custom');
        setOccasionCustomName(state.occasionName);
      }
      return;
    }
    if (!contact || !eventWithinWeek) return;
    const name = eventWithinWeek.occasionName;
    const found = OCCASIONS.find((o) => o.name === name);
    if (found) {
      setOccasionId(found.id);
      setOccasionCustomName('');
    } else {
      setOccasionId('custom');
      setOccasionCustomName(name || '');
    }
  }, [contact?.id, eventWithinWeek?.id, state.occasionName]);

  useEffect(() => {
    if (contact?.defaultTone) setToneId(contact.defaultTone);
    else if (TONES.length) setToneId(TONES[0].id);
  }, [contact?.id, contact?.defaultTone]);

  const dossier = contact
    ? {
        name: contact.name,
        role: contact.role,
        hobbies: contact.hobbies,
        dreams: contact.dreams,
        jokes: contact.jokes,
        memories: contact.memories,
        tastes: contact.tastes,
      }
    : null;

  const handleGenerate = async () => {
    if (!dossier) return;
    setLoading(true);
    setVariants([]);
    setSelectedText('');
    const eventInfo =
      eventWithinWeek != null
        ? {
            daysUntil: eventWithinWeek.daysUntil,
            eventDate: eventWithinWeek.date ? new Date(eventWithinWeek.date).toLocaleDateString('ru-RU') : undefined,
          }
        : null;
    try {
      const texts = await generateCongratulation(dossier, toneId, occasionName, eventInfo);
      setVariants(texts);
      if (texts.length) setSelectedText(texts[0]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!selectedText.trim() || !contactId) return;
    addCongratulation({
      contactId,
      eventId: state.eventId ?? `gen-${contactId}-${Date.now()}`,
      text: selectedText.trim(),
      toneId,
      occasion: occasionName,
      imageUrl: imageUrl || undefined,
    });
    setSaved(true);
    setTimeout(() => navigate('/saved'), 1000);
  };

  return (
    <div className="page generator">
      <header className="page__header">
        <h1 className="page__title">Генератор поздравлений</h1>
        <p className="page__subtitle">Выберите контакт и тон — получите несколько вариантов текста</p>
      </header>

      <Card className="generator__card">
        <div className="input-group">
          <label className="input-group__label">Контакт</label>
          <select
            className="input-group__input"
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
          >
            <option value="">Выберите контакт</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {contact && (
          <>
            <div className="input-group">
              <label className="input-group__label">Повод</label>
              <select
                className="input-group__input"
                value={occasionId}
                onChange={(e) => setOccasionId(e.target.value)}
              >
                {OCCASIONS.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
            {occasionId === 'custom' && (
              <Input
                label="Название повода"
                placeholder="Например: День знакомства, Юбилей"
                value={occasionCustomName}
                onChange={(e) => setOccasionCustomName(e.target.value)}
              />
            )}
            {eventWithinWeek && (
              <p className="generator__event-hint">
                Ближайшее событие у контакта: {eventWithinWeek.occasionName} (через {eventWithinWeek.daysUntil} дн.) — повод подставлен выше.
              </p>
            )}

            <GiftSuggestions dossier={dossier} occasion={occasionName} className="generator__gift-suggestions" />
            <div className="input-group">
              <label className="input-group__label">Тон</label>
              <select
                className="input-group__input"
                value={toneId}
                onChange={(e) => setToneId(e.target.value)}
              >
                {TONES.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <Button
              type="button"
              variant="primary"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? 'Генерирую...' : 'Сгенерировать 5 вариантов'}
            </Button>
          </>
        )}
      </Card>

      {variants.length > 0 && (
        <Card className="generator__card">
          <h2 className="generator__variants-title">Варианты</h2>
          <div className="generator__variants">
            {variants.map((text, i) => (
              <button
                key={i}
                type="button"
                className={`generator__variant ${selectedText === text ? 'generator__variant--active' : ''}`}
                onClick={() => setSelectedText(text)}
              >
                {text}
              </button>
            ))}
          </div>
          <div className="generator__edited-row">
            <Textarea
              label="Или отредактируйте текст"
              value={selectedText}
              onChange={(e) => setSelectedText(e.target.value)}
              rows={4}
            />
            <div className="generator__copy-row">
              <button
                type="button"
                className={`generator__copy ${copyFeedback ? 'generator__copy--done' : ''}`}
                onClick={handleCopyText}
                disabled={!selectedText.trim()}
                title="Копировать в буфер"
                aria-label="Копировать текст поздравления"
              >
                {copyFeedback ? 'Скопировано' : 'Копировать'}
              </button>
            </div>
          </div>
          <MemePicker onSelect={setImageUrl} selectedUrl={imageUrl} toneId={toneId} contact={contact} />
          {imageUrl && (
            <p className="generator__image-chosen">
              К поздравлению прикреплена картинка.{' '}
              <button type="button" className="generator__remove-image" onClick={() => setImageUrl(null)}>
                Убрать
              </button>
            </p>
          )}
          {(selectedText.trim() || imageUrl) && (
            <div className="generator__share-row generator__share-row--under-image">
              <ShareButtons text={selectedText.trim()} imageUrl={imageUrl} className="generator__share" />
            </div>
          )}
          <GiftOrder className="generator__gift" />
          <Button variant="primary" onClick={handleSave} disabled={saved}>
            {saved ? 'Сохранено!' : 'Сохранить в историю'}
          </Button>
        </Card>
      )}
    </div>
  );
}
