import './KineticHeadline.css';

/**
 * Кинетическая типографика — заголовок с анимацией появления букв/слов.
 * Уникальная ДНК бренда: запоминающийся, артовый вид.
 */
export function KineticHeadline({ children, className = '', tag: Tag = 'h1', delay = 0 }) {
  const text = typeof children === 'string' ? children : '';
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <Tag className={`kinetic-headline ${className}`.trim()} style={{ animationDelay: `${delay}ms` }}>
      {words.map((word, i) => (
        <span key={i} className="kinetic-headline__word" style={{ animationDelay: `${delay + i * 60}ms` }}>
          {word}
        </span>
      ))}
    </Tag>
  );
}
