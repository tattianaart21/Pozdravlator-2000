import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { ContactForm } from '../components/ContactForm';

export function EditContact() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getContact, updateContact, deleteContact } = useApp();
  const contact = id ? getContact(id) : null;

  const handleSubmit = (dossier) => {
    if (id) {
      updateContact(id, dossier);
      navigate('/contacts', { replace: true });
    }
  };

  const handleDelete = () => {
    if (id && window.confirm('Удалить этот контакт? Данные нельзя будет восстановить.')) {
      deleteContact(id);
      navigate('/contacts', { replace: true });
    }
  };

  if (id && contact === undefined) {
    return (
      <div className="page">
        <header className="page__header">
          <h1 className="page__title">Контакт не найден</h1>
          <p className="page__subtitle">Возможно, он был удалён.</p>
          <button type="button" className="btn btn--primary" onClick={() => navigate('/contacts')}>
            К списку контактов
          </button>
        </header>
      </div>
    );
  }

  return (
    <ContactForm
      contactId={id}
      initialContact={contact}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      title="Редактировать контакт"
      subtitle="Измените описание и досье — поздравления станут точнее"
      submitLabel="Сохранить изменения"
    />
  );
}
