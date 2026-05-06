import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const Ctx = createContext(null);

/** @typedef {{ benchId: string, benchName?: string, tasks: Array<{ id: string, task_id: string, web_name: string, ques: string, web: string }> } | null} LaunchTaskSelection */

export function BenchmarksUiProvider({ children }) {
  const [launchOpen, setLaunchOpen] = useState(false);
  /** Выбор конкретных тасок со страницы «Бенчи» — передаётся в модалку запуска. */
  const [launchTaskSelection, setLaunchTaskSelection] = useState(null);
  const [benchImportOpen, setBenchImportOpen] = useState(false);

  const openLaunch = useCallback(() => {
    setLaunchTaskSelection(null);
    setLaunchOpen(true);
  }, []);

  const openLaunchWithSelectedTasks = useCallback((selection) => {
    setLaunchTaskSelection(selection);
    setLaunchOpen(true);
  }, []);

  const closeLaunch = useCallback(() => {
    setLaunchOpen(false);
    setLaunchTaskSelection(null);
  }, []);

  const openBenchImport = useCallback(() => setBenchImportOpen(true), []);
  const closeBenchImport = useCallback(() => setBenchImportOpen(false), []);

  const value = useMemo(
    () => ({
      launchOpen,
      launchTaskSelection,
      openLaunch,
      openLaunchWithSelectedTasks,
      closeLaunch,
      benchImportOpen,
      openBenchImport,
      closeBenchImport,
    }),
    [
      launchOpen,
      launchTaskSelection,
      openLaunch,
      openLaunchWithSelectedTasks,
      closeLaunch,
      benchImportOpen,
      openBenchImport,
      closeBenchImport,
    ]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBenchmarksUi() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useBenchmarksUi outside provider');
  return v;
}
