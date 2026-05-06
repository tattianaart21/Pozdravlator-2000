import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, Diff, Layers, List, Upload } from 'lucide-react';
import { BenchmarksUiProvider, useBenchmarksUi } from './BenchmarksUiContext';
import { BenchRunLaunchModal } from './BenchRunLaunchModal';
import { BenchBenchImportModal } from './BenchBenchImportModal';
import './BenchmarksLayout.css';

const nav = [
  { to: '/', label: 'Дашборд', end: true, Icon: BarChart3 },
  { to: '/benches', label: 'Бенчи', Icon: Layers },
  { to: '/runs', label: 'Запуски', Icon: List },
  { to: '/diff', label: 'Diff', Icon: Diff },
];

function LayoutInner() {
  const { launchOpen, closeLaunch, benchImportOpen, openBenchImport, closeBenchImport } = useBenchmarksUi();
  const [toast, setToast] = useState(null);

  return (
    <div className="bench-layout">
      <header className="bench-layout__header">
        <div className="bench-layout__brand">
          <span className="bench-layout__brand-title">Бенчмарки</span>
        </div>
        <nav className="bench-layout__nav" aria-label="Разделы">
          {nav.map(({ to, label, end, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `bench-layout__link ${isActive ? 'bench-layout__link--active' : ''}`}
            >
              <Icon size={16} aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="bench-layout__import" onClick={openBenchImport}>
          <Upload size={18} aria-hidden />
          Импорт бенча
        </button>
      </header>

      <Outlet />

      <BenchRunLaunchModal
        open={launchOpen}
        onClose={closeLaunch}
        onAfterLaunch={() => {
          setToast('Параметры запуска сохранены в макете.');
          setTimeout(() => setToast(null), 3500);
        }}
      />

      <BenchBenchImportModal
        open={benchImportOpen}
        onClose={closeBenchImport}
        onImported={() => {
          setToast('Задачи импортированы в выбранный бенч.');
          setTimeout(() => setToast(null), 3500);
        }}
      />

      {toast ? <div className="bench-layout__toast" role="status">{toast}</div> : null}
    </div>
  );
}

export function BenchmarksLayout() {
  return (
    <BenchmarksUiProvider>
      <LayoutInner />
    </BenchmarksUiProvider>
  );
}
