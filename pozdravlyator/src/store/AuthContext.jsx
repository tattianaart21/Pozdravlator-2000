import { createContext, useContext, useMemo, useCallback } from 'react';

const AuthContext = createContext(null);

/** Авторизация отключена: приложение всегда в «локальном» режиме (данные в браузере). */
export function AuthProvider({ children }) {
  const signUp = useCallback(async () => {
    throw new Error('Регистрация отключена');
  }, []);

  const signIn = useCallback(async () => {
    throw new Error('Вход отключён');
  }, []);

  const signOut = useCallback(async () => {}, []);

  const signInDemo = useCallback(() => {}, []);

  const value = useMemo(
    () => ({
      user: null,
      loading: false,
      isConfigured: false,
      signUp,
      signIn,
      signOut,
      signInDemo,
    }),
    [signUp, signIn, signOut, signInDemo]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
