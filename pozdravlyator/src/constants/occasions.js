/** Предустановленные поводы для поздравлений */
export const OCCASIONS = [
  { id: 'birthday', name: 'День рождения' },
  { id: 'anniversary', name: 'Годовщина' },
  { id: 'feb14', name: '14 февраля' },
  { id: 'march8', name: '8 марта' },
  { id: 'feb23', name: '23 февраля' },
  { id: 'may9', name: '9 мая' },
  { id: 'newyear', name: 'Новый год' },
  { id: 'knowledge_day', name: 'День знаний (1 сентября)' },
  { id: 'custom', name: 'Свой вариант' },
];

export const getOccasionById = (id) => OCCASIONS.find((o) => o.id === id) ?? { id: 'custom', name: id || 'Свой вариант' };

/** Название повода для отображения (для custom — переданное имя) */
export function getOccasionName(occasionId, customName) {
  if (occasionId === 'custom' && customName) return customName.trim();
  return getOccasionById(occasionId)?.name ?? occasionId;
}
