/**
 * Наборы для макета «Запуск бенча» (UI + задел под CI с тем же списком id).
 * Соответствует приоритету Sbervoyager и корзине бизнес-кейсов из ТЗ.
 */
export const BENCH_LAUNCH_OPTIONS = [
  {
    id: 'sbervoyager-full',
    name: 'Sbervoyager — весь набор',
    description: 'Приоритетный прогон всех тасок Sbervoyager.',
    group: 'priority',
  },
  {
    id: 'sbervoyager-subset',
    name: 'Sbervoyager — выборочно',
    description: 'Подмножество тасок (в продукте — по чекбоксам тасок / тегам).',
    group: 'priority',
  },
  {
    id: 'biz-cart-samokat',
    name: 'Бизнес: корзина · Самокат',
    description: 'Поиск товара и добавление в корзину.',
    group: 'business',
  },
  {
    id: 'biz-cart-ozon',
    name: 'Бизнес: корзина · Озон',
    description: 'Поиск товара и добавление в корзину.',
    group: 'business',
  },
  {
    id: 'biz-cart-litres',
    name: 'Бизнес: корзина · Литрес',
    description: 'Поиск товара и добавление в корзину.',
    group: 'business',
  },
  {
    id: 'biz-multi-borscht',
    name: 'Бизнес: набор корзины (борщ / том ям и т.п.)',
    description: 'Несколько товаров в одной сессии.',
    group: 'business',
  },
  {
    id: 'biz-price-compare',
    name: 'Бизнес: сравнение цен + суммаризация',
    description: 'Разные сайты, итоговая сводка.',
    group: 'business',
  },
];

export const BENCH_LAUNCH_IDS = BENCH_LAUNCH_OPTIONS.map((o) => o.id);
