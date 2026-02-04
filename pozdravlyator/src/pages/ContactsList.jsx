import { Link } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { formatDate } from '../utils/dateUtils';
import { getRoleById } from '../constants/roles';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import './ContactsList.css';

export function ContactsList() {
  const { contacts } = useApp();

  const sorted = [...contacts].sort((a, b) => {
    const nameA = (a.name ?? '').toLowerCase();
    const nameB = (b.name ?? '').toLowerCase();
    return nameA.localeCompare(nameB);
  });

  return (
    <div className="page contacts-list">
      <header className="page__header contacts-list__header">
        <h1 className="page__title">Контакты</h1>
        <p className="page__subtitle">Список добавленных контактов и досье</p>
        <Button as={Link} to="/contacts/add" variant="primary" className="contacts-list__add">
          Добавить контакт
        </Button>
      </header>

      {sorted.length === 0 ? (
        <Card className="contacts-list__empty">
          <p>Пока нет контактов.</p>
          <p className="contacts-list__empty-hint">Добавьте первого — укажите имя, дату рождения и досье для персонализированных поздравлений.</p>
          <Button as={Link} to="/contacts/add" variant="primary">
            Добавить контакт
          </Button>
        </Card>
      ) : (
        <ul className="contacts-list__list">
          {sorted.map((contact) => (
            <li key={contact.id}>
              <Link to={`/contacts/${contact.id}/edit`} className="contacts-list__link">
                <Card as="article" className="contacts-list__card card--clickable">
                  <div className="contacts-list__card-main">
                    <span className="contacts-list__name">{contact.name}</span>
                    <span className="contacts-list__role">{getRoleById(contact.role)?.name}</span>
                  </div>
                  {contact.birthDate && (
                    <div className="contacts-list__birth">
                      ДР: {formatDate(contact.birthDate)}
                    </div>
                  )}
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
