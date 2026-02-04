import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Trophy } from 'lucide-react';
import './Challenges.css';

/** Контакт, с которым дольше всего не было взаимодействия. */
function getForgottenContact(contacts, congratulations) {
  if (!contacts.length) return null;
  const lastByContact = new Map();
  for (const c of congratulations) {
    const date = c.sentAt ? new Date(c.sentAt) : new Date(c.createdAt);
    const prev = lastByContact.get(c.contactId);
    if (!prev || date > prev) lastByContact.set(c.contactId, date);
  }
  const noInteraction = contacts.filter((c) => !lastByContact.has(c.id));
  if (noInteraction.length) return noInteraction[0];
  let forgotten = contacts[0];
  let oldest = lastByContact.get(contacts[0].id);
  for (const contact of contacts) {
    const last = lastByContact.get(contact.id);
    if (last && last < oldest) {
      oldest = last;
      forgotten = contact;
    }
  }
  return forgotten;
}

export function Challenges() {
  const navigate = useNavigate();
  const { contacts, congratulations } = useApp();
  const forgottenContact = getForgottenContact(contacts, congratulations);

  return (
    <div className="page challenges">
      <header className="page__header">
        <h1 className="page__title challenges__title">
          <Trophy size={28} strokeWidth={2} aria-hidden />
          Челленджи
        </h1>
        <p className="page__subtitle">Недели внимания — повод написать без повода</p>
      </header>

      <div className="challenges__list">
        <Card as="article" className="challenges__card challenges__card--glass">
          <h2 className="challenges__card-title">Неделя благодарности</h2>
          <p className="challenges__card-text">Напиши трём людям, за которых ты благодарен, без повода.</p>
          <Button variant="secondary" onClick={() => navigate('/generate')}>
            Написать поздравление
          </Button>
        </Card>

        {forgottenContact ? (
          <Card as="article" className="challenges__card challenges__card--glass">
            <h2 className="challenges__card-title">День забытых друзей</h2>
            <p className="challenges__card-text">
              Ты давно не писал <strong>{forgottenContact.name}</strong>. Напиши пару тёплых слов?
            </p>
            <Button
              variant="primary"
              onClick={() =>
                navigate('/generate', { state: { contactId: forgottenContact.id, contact: forgottenContact } })
              }
            >
              Составить сообщение
            </Button>
          </Card>
        ) : (
          <Card as="article" className="challenges__card challenges__card--glass">
            <h2 className="challenges__card-title">День забытых друзей</h2>
            <p className="challenges__card-text">Добавь контакты и поздравляй — здесь появится тот, с кем давно не общался.</p>
            <Button variant="secondary" onClick={() => navigate('/contacts')}>
              К контактам
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
