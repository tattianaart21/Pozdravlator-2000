import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { loadContactsWithFallback, saveContacts, loadCongratulationsWithFallback, saveCongratulations } from '../services/storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [contacts, setContacts] = useState([]);
  const [congratulations, setCongratulations] = useState([]);

  /* При выходе загружаем из _local, при входе — из userId с подстановкой _local, если по userId пусто. Данные не стираются при выходе. */
  /* eslint-disable react-hooks/set-state-in-effect -- загрузка при смене пользователя */
  useEffect(() => {
    setContacts(loadContactsWithFallback(userId));
    setCongratulations(loadCongratulationsWithFallback(userId));
  }, [userId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    saveContacts(contacts, userId);
  }, [contacts, userId]);

  useEffect(() => {
    saveCongratulations(congratulations, userId);
  }, [congratulations, userId]);

  const addContact = useCallback((contact) => {
    const id = contact.id ?? uuidv4();
    const newContact = { ...contact, id };
    setContacts((prev) => [...prev, newContact]);
    return id;
  }, []);

  const updateContact = useCallback((id, data) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  }, []);

  const deleteContact = useCallback((id) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const getContact = useCallback(
    (id) => contacts.find((c) => c.id === id),
    [contacts]
  );

  const addCongratulation = useCallback((item) => {
    const id = item.id ?? uuidv4();
    const newItem = { ...item, id, createdAt: item.createdAt ?? new Date().toISOString() };
    setCongratulations((prev) => [...prev, newItem]);
    return id;
  }, []);

  const updateCongratulation = useCallback((id, data) => {
    setCongratulations((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  }, []);

  const deleteCongratulation = useCallback((id) => {
    setCongratulations((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const getCongratulationsByEvent = useCallback(
    (eventId) => congratulations.filter((c) => c.eventId === eventId),
    [congratulations]
  );

  const value = {
    contacts,
    setContacts,
    congratulations,
    setCongratulations,
    addContact,
    updateContact,
    deleteContact,
    getContact,
    addCongratulation,
    updateCongratulation,
    deleteCongratulation,
    getCongratulationsByEvent,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
