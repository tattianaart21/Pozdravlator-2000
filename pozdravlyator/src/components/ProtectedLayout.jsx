/** Раньше оборачивал защищённые страницы; авторизация отключена — просто рендер детей. */
export function ProtectedLayout({ children }) {
  return children;
}
