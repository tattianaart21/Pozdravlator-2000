/** Данные хранятся по userId; копия в _local не стирается при выходе — контакты остаются после выхода из приложения. */
const PREFIX_CONTACTS = 'pozdrav_contacts';
const PREFIX_CONGRATULATIONS = 'pozdrav_congratulations';
const LOCAL_SUFFIX = '_local';

function contactsKey(userId) {
  return userId ? `${PREFIX_CONTACTS}_${userId}` : `${PREFIX_CONTACTS}${LOCAL_SUFFIX}`;
}

function congratulationsKey(userId) {
  return userId ? `${PREFIX_CONGRATULATIONS}_${userId}` : `${PREFIX_CONGRATULATIONS}${LOCAL_SUFFIX}`;
}

export function loadContacts(userId = null) {
  try {
    const key = contactsKey(userId);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Загружает контакты: при наличии userId — из ключа пользователя, при пустом — из _local (данные после выхода). */
export function loadContactsWithFallback(userId) {
  if (userId) {
    const fromUser = loadContacts(userId);
    if (fromUser.length > 0) return fromUser;
    const fromLocal = loadContacts(null);
    if (fromLocal.length > 0) return fromLocal;
    return [];
  }
  return loadContacts(null);
}

export function saveContacts(contacts, userId = null) {
  const key = contactsKey(userId);
  localStorage.setItem(key, JSON.stringify(contacts));
  if (userId) {
    localStorage.setItem(contactsKey(null), JSON.stringify(contacts));
  }
}

export function loadCongratulations(userId = null) {
  try {
    const raw = localStorage.getItem(congratulationsKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Аналогично контактам: при входе подставляем _local, если по userId пусто. */
export function loadCongratulationsWithFallback(userId) {
  if (userId) {
    const fromUser = loadCongratulations(userId);
    if (fromUser.length > 0) return fromUser;
    const fromLocal = loadCongratulations(null);
    if (fromLocal.length > 0) return fromLocal;
    return [];
  }
  return loadCongratulations(null);
}

export function saveCongratulations(items, userId = null) {
  const key = congratulationsKey(userId);
  localStorage.setItem(key, JSON.stringify(items));
  if (userId) {
    localStorage.setItem(congratulationsKey(null), JSON.stringify(items));
  }
}
