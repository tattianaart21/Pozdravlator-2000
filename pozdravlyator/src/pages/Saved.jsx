import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Card } from '../components/Card';
import { GiftOrder } from '../components/GiftOrder';
import { ShareButtons } from '../components/ShareButtons';
import './History.css';

/** Страница «Сохраненное» — список сохранённых поздравлений (черновики/готовые тексты). */
export function Saved() {
  const navigate = useNavigate();
  const { congratulations, getContact, deleteCongratulation } = useApp();
  const [copiedId, setCopiedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const handleCopy = useCallback(async (item) => {
    try {
      await navigator.clipboard.writeText(item.text);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = item.text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  const handleDelete = (item) => {
    if (window.confirm('Удалить это поздравление из сохранённых?')) {
      deleteCongratulation(item.id);
      setSelectedIds((prev) => prev.filter((id) => id !== item.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    setSelectedIds(sorted.map((item) => item.id));
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Удалить выбранные поздравления (${selectedIds.length})?`)) return;
    selectedIds.forEach((id) => deleteCongratulation(id));
    setSelectedIds([]);
  };

  const handleDeleteAll = () => {
    if (sorted.length === 0) return;
    if (!window.confirm(`Удалить все сохранённые поздравления (${sorted.length})?`)) return;
    sorted.forEach((item) => deleteCongratulation(item.id));
    setSelectedIds([]);
  };

  const sorted = useMemo(() => {
    return [...congratulations].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [congratulations]);

  return (
    <div className="page history">
      <header className="page__header">
        <h1 className="page__title">Сохранённое</h1>
        <p className="page__subtitle">Сохранённые поздравления</p>
      </header>

      {sorted.length === 0 ? (
        <Card className="history__empty">
          <p>Пока нет сохранённых поздравлений.</p>
          <p className="history__empty-hint">Сгенерируйте текст в разделе «Генератор» и нажмите «Сохранить в историю».</p>
          <button type="button" className="history__link" onClick={() => navigate('/generate')}>
            Перейти в генератор →
          </button>
        </Card>
      ) : (
        <>
          <div className="history__bulk-actions">
            <button type="button" className="history__bulk-btn" onClick={handleSelectAll}>
              Выбрать все
            </button>
            <button type="button" className="history__bulk-btn" onClick={handleClearSelection} disabled={selectedIds.length === 0}>
              Снять выбор
            </button>
            <button type="button" className="history__bulk-btn history__bulk-btn--danger" onClick={handleDeleteSelected} disabled={selectedIds.length === 0}>
              Удалить выбранные ({selectedIds.length})
            </button>
            <button type="button" className="history__bulk-btn history__bulk-btn--danger" onClick={handleDeleteAll}>
              Удалить все
            </button>
          </div>
          <ul className="history__list">
          {sorted.map((item) => {
            const contact = getContact(item.contactId);
            const dateStr = item.createdAt
              ? format(new Date(item.createdAt), 'd MMMM yyyy, HH:mm', { locale: ru })
              : '—';
            const selected = selectedIds.includes(item.id);
            return (
              <li key={item.id} className="history__list-item">
                <Card as="article" className="history__item">
                  <div className="history__item-meta">
                    <label className="history__select">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleSelect(item.id)}
                        aria-label="Выбрать поздравление"
                      />
                    </label>
                    <span className="history__item-name">{contact?.name ?? 'Неизвестный контакт'}</span>
                    <span className="history__item-date">{dateStr}</span>
                    <div className="history__item-actions">
                      <button
                        type="button"
                        className={`history__item-copy ${copiedId === item.id ? 'history__item-copy--done' : ''}`}
                        onClick={() => handleCopy(item)}
                        title="Копировать текст"
                        aria-label="Копировать поздравление"
                      >
                        {copiedId === item.id ? 'Скопировано' : 'Копировать'}
                      </button>
                      <ShareButtons text={item.text} imageUrl={item.imageUrl} className="history__share" />
                      <button
                        type="button"
                        className="history__item-delete history__item-delete--icon"
                        onClick={() => handleDelete(item)}
                        title="Удалить из сохранённых"
                        aria-label="Удалить поздравление"
                      >
                        <X size={18} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                  <p className="history__item-text">{item.text}</p>
                  {item.imageUrl && (
                    <div className="history__item-image">
                      <img src={item.imageUrl} alt="К поздравлению" className="history__item-img" />
                    </div>
                  )}
                  <GiftOrder className="history__gift" />
                </Card>
              </li>
            );
          })}
          </ul>
        </>
      )}
    </div>
  );
}
