import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { ContactForm } from '../components/ContactForm';
import { Button } from '../components/Button';
import { getGoogleCalendarUrl } from '../utils/calendarExport';
import { getNextOccurrenceDate } from '../utils/dateUtils';
import './AddContact.css';

export function AddContact() {
  const navigate = useNavigate();
  const { addContact } = useApp();
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [savedContactId, setSavedContactId] = useState(null);
  const [savedDossier, setSavedDossier] = useState(null);

  const handleSubmit = (dossier) => {
    const id = addContact(dossier);
    setSavedContactId(id);
    setSavedDossier(dossier);
    setShowGoogleModal(true);
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const generateUrl = savedContactId ? `${origin}/generate?contactId=${savedContactId}` : `${origin}/generate`;
  const nextBirthdayDate = savedDossier?.birthDate ? getNextOccurrenceDate(savedDossier.birthDate) : '';
  const googleCalendarUrl = nextBirthdayDate && savedDossier?.name
    ? getGoogleCalendarUrl({
        title: `ДР ${savedDossier.name}`,
        date: nextBirthdayDate,
        details: `Напоминание из Поздравлятора. Сгенерировать поздравление: ${generateUrl}`,
      })
    : '';

  const closeModal = () => {
    setShowGoogleModal(false);
    navigate('/contacts', { replace: true });
  };

  return (
    <>
      <ContactForm
        onSubmit={handleSubmit}
        title="Новый контакт"
        subtitle="Заполните досье — ИИ подберёт персональные поздравления"
        submitLabel="Сохранить контакт"
      />

      {showGoogleModal && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-google-title">
          <div className="modal__backdrop" onClick={closeModal} />
          <div className="modal__content">
            <h3 className="modal__title" id="modal-google-title">Контакт добавлен</h3>
            <p className="modal__text">
              Добавьте напоминание в Google Календарь — в день события придёт уведомление, по ссылке из описания можно быстро открыть Поздравлятор и сгенерировать поздравление.
            </p>
            {googleCalendarUrl ? (
              <a
                href={googleCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="modal__link"
              >
                Добавить в Google Календарь
              </a>
            ) : null}
            <Button variant="primary" onClick={closeModal} className="modal__btn">
              Перейти к контактам
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
