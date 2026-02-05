import { Share2 } from 'lucide-react';
import './ShareButtons.css';

/**
 * Кнопки «В Telegram» и «В VK». Если передан imageUrl (ссылка из интернета), он добавляется отдельной строкой —
 * в Telegram отображается как кликабельная ссылка.
 * @param {{ text: string, imageUrl?: string | null, className?: string }} props
 */
export function ShareButtons({ text, imageUrl = null, className = '' }) {
  let shareText = (text || '').trim();
  if (imageUrl) shareText = shareText ? `${shareText}\n\n${imageUrl}` : imageUrl;
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';

  if (!shareText) return null;

  return (
    <span className={`share-buttons ${className}`.trim()}>
      <a
        href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="share-buttons__link share-buttons__link--tg"
        title="Поделиться в Telegram"
      >
        <Share2 size={18} strokeWidth={2} />
        В Telegram
      </a>
      <a
        href={`https://vk.com/share.php?comment=${encodeURIComponent(shareText)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="share-buttons__link share-buttons__link--vk"
        title="Поделиться в VK"
      >
        <Share2 size={18} strokeWidth={2} />
        В VK
      </a>
    </span>
  );
}
