import { Gift } from 'lucide-react';
import './GiftOrder.css';

const GIFT_LINKS = [
  { name: 'Flowwow', url: 'https://flowwow.com', title: 'Цветы и подарки с доставкой' },
  { name: 'Ozon', url: 'https://www.ozon.ru/category/podarki-9348/', title: 'Подарки на Ozon' },
  { name: 'WB', url: 'https://www.wildberries.ru/catalog/podarki', title: 'Подарки на Wildberries' },
];

export function GiftOrder({ className = '' }) {
  return (
    <div className={`gift-order ${className}`.trim()}>
      <span className="gift-order__label">
        <Gift size={18} strokeWidth={2} aria-hidden />
        Заказать подарок
      </span>
      <div className="gift-order__links">
        {GIFT_LINKS.map(({ name, url, title }) => (
          <a
            key={name}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="gift-order__link"
            title={title}
          >
            {name}
          </a>
        ))}
      </div>
    </div>
  );
}
