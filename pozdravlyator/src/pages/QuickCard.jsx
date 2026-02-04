import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input, Textarea } from '../components/Input';
import { MemePicker } from '../components/MemePicker';
import { Share2, Download, Music } from 'lucide-react';
import './QuickCard.css';

const MUSIC_OPTIONS = [
  { id: 'none', label: 'Без музыки' },
  { id: 'soft', label: 'Мягкий фон' },
  { id: 'joy', label: 'Праздничный' },
];

/** Открытка за 60 секунд: текст + картинка + музыка → превью и шаринг. */
export function QuickCard() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [musicId, setMusicId] = useState('none');
  const cardRef = useRef(null);

  const handleDownload = useCallback(async () => {
    const el = cardRef.current;
    if (!el) return;
    const canvas = document.createElement('canvas');
    const rect = el.getBoundingClientRect();
    const scale = 2;
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bgEl = el.querySelector('.quick-card__preview-bg');
    if (bgEl && imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = 'var(--color-bg-subtle)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines = (text || 'С праздником!').split('\n');
    const lineHeight = 32;
    const startY = canvas.height / 2 - (lines.length * lineHeight) / 2;
    lines.forEach((line, i) => {
      ctx.fillText(line, canvas.width / 2, startY + i * lineHeight);
    });

    const link = document.createElement('a');
    link.download = 'pozdravlyator-open-card.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [text, imageUrl]);

  const shareText = text.trim() || 'С праздником!';
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="page quick-card">
      <header className="page__header">
        <h1 className="page__title">Открытка за 60 секунд</h1>
        <p className="page__subtitle">Текст, картинка и музыка — готовая открытка или сторис</p>
      </header>

      <Card className="quick-card__card">
        <Textarea
          label="1. Текст"
          placeholder="Введите поздравление или вставьте из генератора"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="quick-card__textarea"
        />

        <div className="quick-card__section">
          <span className="input-group__label">2. Картинка</span>
          <MemePicker onSelect={setImageUrl} selectedUrl={imageUrl} />
        </div>

        <div className="input-group">
          <label className="input-group__label">
            <Music size={18} strokeWidth={2} aria-hidden />
            3. Музыка (фон)
          </label>
          <select
            className="input-group__input"
            value={musicId}
            onChange={(e) => setMusicId(e.target.value)}
            aria-label="Выбор фоновой музыки"
          >
            {MUSIC_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
          <p className="quick-card__hint">Музыка будет в видео-сторис (в разработке). Пока — только открытка.</p>
        </div>

        <div className="quick-card__preview-wrap">
          <p className="quick-card__preview-label">Превью открытки</p>
          <div
            ref={cardRef}
            className="quick-card__preview"
            role="img"
            aria-label="Превью открытки"
          >
            {imageUrl && (
              <div
                className="quick-card__preview-bg"
                style={{ backgroundImage: `url(${imageUrl})` }}
              />
            )}
            <div className="quick-card__preview-overlay" />
            <p className="quick-card__preview-text">{text.trim() || 'С праздником!'}</p>
          </div>
        </div>

        <div className="quick-card__actions">
          <Button variant="secondary" onClick={handleDownload} className="quick-card__btn">
            <Download size={18} strokeWidth={2} />
            Скачать как картинку
          </Button>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="quick-card__share quick-card__share--tg"
          >
            <Share2 size={18} strokeWidth={2} />
            В Telegram
          </a>
          <a
            href={`https://vk.com/share.php?comment=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="quick-card__share quick-card__share--vk"
          >
            <Share2 size={18} strokeWidth={2} />
            В VK
          </a>
        </div>
      </Card>
    </div>
  );
}
