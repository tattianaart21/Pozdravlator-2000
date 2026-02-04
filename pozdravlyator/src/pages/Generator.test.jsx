import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '../store/AppContext';
import { Generator } from './Generator';

vi.mock('../store/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user' },
    loading: false,
    isConfigured: true,
    signOut: () => {},
    signIn: () => {},
    signUp: () => {},
    signInDemo: () => {},
  }),
}));

const mockVariants = [
  'Поздравляю с днём рождения!',
  'С праздником! Удачи и счастья!',
  'Желаю радости в этот день!',
  'Пусть сбудутся все мечты!',
  'С днём рождения, от души!',
];

vi.mock('../services/api', () => ({
  generateCongratulation: vi.fn(() => Promise.resolve(mockVariants)),
  getGiftSuggestionsFromAI: vi.fn(() => Promise.resolve(null)),
}));

function renderGenerator() {
  return render(
    <MemoryRouter initialEntries={['/generate']} initialIndex={0}>
      <AppProvider>
        <Routes>
          <Route path="/generate" element={<Generator />} />
        </Routes>
      </AppProvider>
    </MemoryRouter>
  );
}

describe('Страница /generate (Генератор)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('рендерится без падения и показывает заголовок', () => {
    renderGenerator();
    expect(screen.getByRole('heading', { name: /Генератор поздравлений/i })).toBeInTheDocument();
  });

  it('показывает подзаголовок про выбор контакта', () => {
    renderGenerator();
    expect(screen.getByText(/Выберите контакт и тон/i)).toBeInTheDocument();
  });

  it('при отсутствии контактов есть выбор контакта (пустой список)', () => {
    renderGenerator();
    const select = document.querySelector('select');
    expect(select).toBeInTheDocument();
  });

  it('при выборе контакта появляются повод, тон и кнопка «Сгенерировать 5 вариантов»', async () => {
    const contact = {
      id: 'c1',
      name: 'Мария',
      birthDate: '1990-05-15',
      role: 'friend',
      hobbies: 'книги',
    };
    localStorage.setItem('pozdrav_contacts_test-user', JSON.stringify([contact]));
    localStorage.setItem('pozdrav_contacts_local', JSON.stringify([contact]));

    renderGenerator();

    const contactSelect = document.querySelector('select');
    await userEvent.selectOptions(contactSelect, 'c1');

    expect(screen.getByRole('button', { name: /Сгенерировать 5 вариантов/i })).toBeInTheDocument();
    expect(screen.getByText('Повод')).toBeInTheDocument();
    expect(document.querySelector('.generator__card').textContent).toMatch(/Тон/);
  });

  it('по нажатию «Сгенерировать» вызывается API и показываются варианты', async () => {
    const { generateCongratulation } = await import('../services/api');
    const contact = {
      id: 'c1',
      name: 'Мария',
      birthDate: '1990-05-15',
      role: 'friend',
      hobbies: 'книги',
    };
    localStorage.setItem('pozdrav_contacts_test-user', JSON.stringify([contact]));
    localStorage.setItem('pozdrav_contacts_local', JSON.stringify([contact]));

    renderGenerator();

    const contactSelect = document.querySelector('select');
    await userEvent.selectOptions(contactSelect, 'c1');

    const generateBtn = screen.getByRole('button', { name: /Сгенерировать 5 вариантов/i });
    await userEvent.click(generateBtn);

    expect(generateCongratulation).toHaveBeenCalled();
    await screen.findByRole('heading', { name: 'Варианты' });
    expect(screen.getByRole('button', { name: mockVariants[0] })).toBeInTheDocument();
  });
});
