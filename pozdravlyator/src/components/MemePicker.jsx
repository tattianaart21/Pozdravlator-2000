import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { fetchRandomMeme, getFallbackImageUrl, getPlaceholderImageUrl } from '../services/memeApi';
import { Button } from './Button';
import './MemePicker.css';

/**
 * Стикеры к поздравлению: мемы, картинки или своя загрузка.
 */
export function MemePicker({ onSelect, selectedUrl, toneId, contact }) {
  const [loadedList, setLoadedList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const loadTimeoutRef = useRef(null);
  const IMAGE_LOAD_TIMEOUT_MS = 12000;

  const handleLoadRandom = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRandomMeme({ toneId, contact });
      if (data) {
        setImgLoading(true);
        setLoadedList((prev) => {
          const next = [...prev, { url: data.url }];
          setCurrentIndex(next.length - 1);
          return next;
        });
      } else setError('Не удалось загрузить. Попробуйте ещё раз.');
    } catch {
      setError('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleNext = () => {
    if (currentIndex < loadedList.length - 1) setCurrentIndex((i) => i + 1);
  };

  const handleOwnImage = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setLoadedList((prev) => {
        const next = [...prev, { url: dataUrl }];
        setCurrentIndex(next.length - 1);
        return next;
      });
      onSelect?.(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const replaceUrlWithFallback = (failedUrl) => {
    const fallback = getFallbackImageUrl();
    setLoadedList((prev) =>
      prev.map((item) => (item.url === failedUrl ? { ...item, url: fallback } : item))
    );
  };

  const replaceUrlWithPlaceholder = (failedUrl) => {
    const placeholder = getPlaceholderImageUrl();
    setLoadedList((prev) =>
      prev.map((item) => (item.url === failedUrl ? { ...item, url: placeholder } : item))
    );
  };

  const currentMeme = currentIndex >= 0 && loadedList[currentIndex] ? loadedList[currentIndex].url : null;
  const displayUrl = selectedUrl || currentMeme;
  const canGoPrevious = currentIndex > 0;

  useEffect(() => {
    if (!displayUrl) return;
    setImgLoading(true);
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    if (displayUrl.startsWith('http')) {
      loadTimeoutRef.current = setTimeout(() => {
        loadTimeoutRef.current = null;
        replaceUrlWithFallback(displayUrl);
      }, IMAGE_LOAD_TIMEOUT_MS);
    }
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
    };
  }, [displayUrl]);
  const canGoNext = currentIndex >= 0 && currentIndex < loadedList.length - 1;

  return (
    <div className="meme-picker">
      <h3 className="meme-picker__title">Стикер к поздравлению</h3>

      <div className="meme-picker__actions">
        <Button
          type="button"
          variant="secondary"
          onClick={handleLoadRandom}
          disabled={loading}
        >
          {loading ? 'Загружаю...' : 'Случайная картинка'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="meme-picker__file-input"
          aria-label="Добавить свою картинку"
          onChange={handleOwnImage}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={18} strokeWidth={2} />
          Своя картинка
        </Button>
        {displayUrl && (
          <Button
            type="button"
            variant="primary"
            onClick={() => onSelect?.(displayUrl)}
          >
            Выбрать эту картинку
          </Button>
        )}
      </div>

      {displayUrl && loadedList.length > 0 && (
        <div className="meme-picker__nav">
          <button
            type="button"
            className="meme-picker__nav-btn"
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            title="Предыдущая картинка"
            aria-label="Предыдущая картинка"
          >
            <ChevronLeft size={24} strokeWidth={2} />
          </button>
          <span className="meme-picker__nav-counter">
            {currentIndex + 1} / {loadedList.length}
          </span>
          <button
            type="button"
            className="meme-picker__nav-btn"
            onClick={handleNext}
            disabled={!canGoNext}
            title="Следующая картинка"
            aria-label="Следующая картинка"
          >
            <ChevronRight size={24} strokeWidth={2} />
          </button>
        </div>
      )}

      {error && <p className="meme-picker__error" role="alert">{error}</p>}
      {displayUrl && (
        <div className="meme-picker__preview">
          {imgLoading && (
            <div className="meme-picker__preview-loading" aria-hidden>
              Загрузка…
            </div>
          )}
          <img
            src={displayUrl}
            alt="Стикер к поздравлению"
            className="meme-picker__img"
            decoding="async"
            onLoad={() => {
              if (loadTimeoutRef.current) {
                clearTimeout(loadTimeoutRef.current);
                loadTimeoutRef.current = null;
              }
              setImgLoading(false);
            }}
            onError={(e) => {
              const failed = e.target.src;
              const fallback = getFallbackImageUrl();
              const placeholder = getPlaceholderImageUrl();
              if (failed !== fallback && failed !== placeholder) {
                e.target.src = fallback;
                replaceUrlWithFallback(displayUrl);
              } else {
                e.target.src = placeholder;
                replaceUrlWithPlaceholder(displayUrl);
              }
              setImgLoading(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
