import { useEffect, useMemo, useState } from 'react';
import { useBenchmarksUi } from './BenchmarksUiContext';
import { BENCH_LAUNCH_IDS } from '../benchLaunchOptions';
import { buildLaunchPayload, defaultLaunchParams } from './benchExportUtils';
import './BenchRunLaunchModal.css';

export function BenchRunLaunchModal({ open, onClose, onAfterLaunch }) {
  const { launchTaskSelection } = useBenchmarksUi();
  const [params, setParams] = useState(defaultLaunchParams);

  useEffect(() => {
    if (!open) return;
    setParams(defaultLaunchParams());
  }, [open]);

  const taskOnly = open && Boolean(launchTaskSelection?.tasks?.length);

  const payloadExtras = useMemo(() => {
    if (!open || !launchTaskSelection?.tasks?.length) return {};
    return {
      selected_tasks_from_ui: launchTaskSelection.tasks.map((t) => ({
        bench_id: t._benchId ?? launchTaskSelection.benchId,
        task_id: t.task_id,
        task_web_name: t.web_name,
        task_ques: t.ques,
        task_web: t.web,
      })),
    };
  }, [open, launchTaskSelection]);

  const payload = useMemo(
    () => buildLaunchPayload(taskOnly ? [] : [...BENCH_LAUNCH_IDS], params, payloadExtras),
    [taskOnly, params, payloadExtras]
  );

  if (!open) return null;

  const p = (key, label, type = 'text', extra = {}) => {
    const raw = params[key];
    const value = type === 'number' ? (raw === '' || raw == null ? '' : String(raw)) : raw ?? '';
    return (
      <label className="bench-launch__field" key={key}>
        <span className="bench-launch__label">{label}</span>
        <input
          type={type}
          className="bench-launch__input"
          value={value}
          onChange={(e) =>
            setParams((prev) => ({
              ...prev,
              [key]: type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value,
            }))
          }
          {...extra}
        />
      </label>
    );
  };

  const launchLabel = taskOnly
    ? `Запустить (${launchTaskSelection.tasks.length} ${launchTaskSelection.tasks.length === 1 ? 'задача' : 'задач'})`
    : 'Запустить';

  const launchDisabled = taskOnly && launchTaskSelection.tasks.length === 0;

  return (
    <div className="bench-launch-overlay" role="presentation" onClick={onClose}>
      <div className="bench-launch-modal" role="dialog" aria-labelledby="bench-launch-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="bench-launch-title">Запуск бенчмарка</h2>

        {taskOnly ? (
          <div className="bench-launch__banner" role="status">
            В запуске только выбранные таски ({launchTaskSelection.tasks.length}). Параметры ниже.
          </div>
        ) : null}

        <h3 className="bench-launch__h3">Параметры запуска (bench_run)</h3>
        <div className="bench-launch__grid">
          {p('max_steps', 'max_steps', 'number', { min: 1 })}
          {p('max_concurrent', 'max_concurrent', 'number', { min: 1 })}
          {p('planner_model', 'planner_model')}
          {p('planner_version', 'planner_version')}
          {p('navigator_model', 'navigator_model')}
          {p('navigator_version', 'navigator_version')}
          {p('judge_name', 'judge_name')}
          {p('gigado_backend_url', 'gigado_backend_url')}
          {p('bench_test_path', 'bench_test_path')}
          {p('result_dir', 'result_dir')}
          {p('web_browser_path', 'web_browser_path')}
          {p('web_browser_extension_dir', 'web_browser_extension_dir')}
          {p('web_browser_user_dir', 'web_browser_user_dir')}
          <label className="bench-launch__field">
            <span className="bench-launch__label">save_screenshots</span>
            <input
              type="checkbox"
              checked={Boolean(params.save_screenshots)}
              onChange={(e) => setParams((prev) => ({ ...prev, save_screenshots: e.target.checked }))}
            />
          </label>
          <label className="bench-launch__field">
            <span className="bench-launch__label">screen_without_markup</span>
            <input
              type="checkbox"
              checked={Boolean(params.screen_without_markup)}
              onChange={(e) => setParams((prev) => ({ ...prev, screen_without_markup: e.target.checked }))}
            />
          </label>
        </div>

        <div className="bench-launch__actions">
          <button type="button" className="bench-launch__btn" onClick={onClose}>
            Отмена
          </button>
          <button
            type="button"
            className="bench-launch__btn bench-launch__btn--primary"
            disabled={launchDisabled}
            onClick={() => {
              onAfterLaunch?.({
                payload,
                selectedIds: taskOnly ? launchTaskSelection.tasks.map((t) => t.task_id) : BENCH_LAUNCH_IDS,
              });
              onClose();
            }}
          >
            {launchLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
