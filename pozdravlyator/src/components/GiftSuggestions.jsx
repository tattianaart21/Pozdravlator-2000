import { useState, useCallback } from 'react';
import { Gift, ChevronDown, ChevronUp, Loader2, RefreshCw } from 'lucide-react';
import { getGiftSuggestions } from '../services/giftSuggestions';
import { getGiftSuggestionsFromAI } from '../services/api';
import './GiftSuggestions.css';

/**
 * Подбор 5 идей подарков по досье и поводу через ИИ; кнопка «Обновить список» запрашивает новые идеи.
 */
export function GiftSuggestions({ dossier, occasion = '', className = '' }) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = useCallback(() => {
    if (!dossier) return;
    setLoading(true);
    getGiftSuggestionsFromAI(dossier, occasion)
      .then((ideas) => {
        if (ideas && ideas.length > 0) {
          setSuggestions(ideas);
        } else {
          setSuggestions(getGiftSuggestions(dossier, 5));
        }
      })
      .catch(() => {
        setSuggestions(getGiftSuggestions(dossier, 5));
      })
      .finally(() => setLoading(false));
  }, [dossier, occasion]);

  if (!dossier) return null;

  return (
    <div className={`gift-suggestions ${className}`.trim()}>
      <button
        type="button"
        className="gift-suggestions__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="gift-suggestions-list"
      >
        <Gift size={18} strokeWidth={2} aria-hidden />
        <span>Идеи подарков по досье</span>
        {loading && <Loader2 size={18} className="gift-suggestions__spinner" aria-hidden />}
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && (
        <>
          <ul id="gift-suggestions-list" className="gift-suggestions__list">
            {suggestions.length === 0 && !loading ? (
              <li className="gift-suggestions__empty">Нажмите «Обновить список», чтобы подгрузить идеи подарков.</li>
            ) : (
              suggestions.map((text, i) => (
                <li key={i} className="gift-suggestions__item">{text}</li>
              ))
            )}
          </ul>
          <button
            type="button"
            className="gift-suggestions__refresh"
            onClick={fetchSuggestions}
            disabled={loading}
            title="Обновить список идей"
            aria-label="Обновить список идей подарков"
          >
            <RefreshCw size={16} aria-hidden />
            Обновить список
          </button>
        </>
      )}
    </div>
  );
}
