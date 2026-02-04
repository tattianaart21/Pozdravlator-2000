import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { ContactForm } from '../components/ContactForm';

export function AddContact() {
  const navigate = useNavigate();
  const { addContact } = useApp();

  const handleSubmit = (dossier) => {
    addContact(dossier);
    navigate('/contacts', { replace: true });
  };

  return (
    <ContactForm
      onSubmit={handleSubmit}
      title="Новый контакт"
      subtitle="Заполните досье — ИИ подберёт персональные поздравления"
      submitLabel="Сохранить контакт"
    />
  );
}
