/**
 * Картинки к поздравлению: встроенный SVG-фон (без внешних запросов — нет таймаутов и ошибок).
 */

/** Встроенный фон-плейсхолдер: градиент + шарики, без загрузки из сети. */
function getEmbeddedPlaceholderUrl() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ff9a9e"/>
          <stop offset="100%" style="stop-color:#fecfef"/>
        </linearGradient>
        <radialGradient id="ball">
          <stop offset="0%" style="stop-color:#fff"/>
          <stop offset="100%" style="stop-color:#ffb3ba"/>
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill="url(#g)"/>
      <circle cx="80" cy="60" r="24" fill="url(#ball)" opacity="0.9"/>
      <circle cx="320" cy="80" r="20" fill="url(#ball)" opacity="0.8"/>
      <circle cx="200" cy="220" r="28" fill="url(#ball)" opacity="0.85"/>
    </svg>
  `.replace(/\s+/g, ' ').trim();
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

/**
 * Возвращает одну «картинку»: { url, title, postLink }.
 * Только встроенный SVG — без запросов в интернет, ошибок не будет.
 */
export async function fetchRandomMeme(_options = {}) {
  return {
    url: getEmbeddedPlaceholderUrl(),
    title: '',
    postLink: '',
  };
}

/** Оставлено для совместимости (getContextualSubreddits может вызываться из других мест). */
export function getContextualSubreddits() {
  return [];
}

/**
 * Возвращает URL встроенного фона (без внешних запросов).
 */
export function getRandomImageUrl(keyword = 'birthday') {
  return getEmbeddedPlaceholderUrl();
}
