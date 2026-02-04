import './BrandLogo.css';

/**
 * Логотип (две руки — человек и робот, «Сотворение Адама») и надпись «Поздравлятор 2000».
 * @param {{ showText?: boolean, size?: 'hero' | 'compact' | 'inline', className?: string }} props
 */
export function BrandLogo({ showText = true, size = 'hero', className = '' }) {
  return (
    <div className={`brand-logo brand-logo--${size} ${className}`.trim()} aria-hidden>
      <span className="brand-logo__mark" aria-hidden>
        <img
          src="/logo-hands.svg"
          alt=""
          className="brand-logo__img"
        />
      </span>
      {showText && (
        <span className="brand-logo__title">
          Поздравлятор 2000
        </span>
      )}
    </div>
  );
}
