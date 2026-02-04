/** Тона поздравлений для выбора в досье и в генераторе */
export const TONES = [
  { id: 'touching', name: 'Трогательный' },
  { id: 'ironic', name: 'Ироничный' },
  { id: 'formal', name: 'Официальный' },
  { id: 'epic', name: 'Эпичный' },
  { id: 'verse', name: 'В стихах' },
];

export const getToneById = (id) => TONES.find((t) => t.id === id) ?? TONES[0];
