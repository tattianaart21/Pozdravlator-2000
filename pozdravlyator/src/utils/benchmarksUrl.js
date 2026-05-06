/**
 * Относительный URL макета бенчмарков (HashRouter).
 * На любом хосте (localhost, Vercel) ведёт на тот же origin, что и основное приложение.
 */
export function getBenchmarksRunsHref() {
  const raw = import.meta.env.BASE_URL || '/';
  const base = raw.endsWith('/') ? raw : `${raw}/`;
  return `${base}benchmarks.html#/runs`;
}
