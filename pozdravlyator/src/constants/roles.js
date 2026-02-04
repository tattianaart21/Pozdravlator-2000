/** Роли/статусы контактов */
export const ROLES = [
  { id: 'mom', name: 'Мама' },
  { id: 'dad', name: 'Папа' },
  { id: 'friend', name: 'Друг / подруга' },
  { id: 'partner', name: 'Партнёр' },
  { id: 'colleague', name: 'Коллега' },
  { id: 'other', name: 'Свой вариант' },
];

export const getRoleById = (id) => ROLES.find((r) => r.id === id) ?? ROLES[ROLES.length - 1];
