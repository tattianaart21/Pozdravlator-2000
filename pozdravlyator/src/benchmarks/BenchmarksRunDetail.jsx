import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Pause, Play, Square } from 'lucide-react';
import { getRun, getTasksForRun } from './fullMockData';
import { downloadTextFile } from './benchExportUtils';
import {
  findBenchRunById,
  getBenchTasks,
  isBenchApiEnabled,
  postBenchRunControl,
  runWithUiFields,
} from './benchApi';
import {
  aggregateBenchRunMetrics,
  benchRunStatusLabel,
  deriveBenchRunDisplayStatus,
  formatDurationSeconds,
} from './benchMetrics';
import './BenchmarksRunDetail.css';

const RUN_FIELD_LABELS_API = [
  ['id', 'id (UUID)'],
  ['start_time', 'start_time'],
  ['finish_time', 'finish_time'],
  ['web_browser_path', 'web_browser_path'],
  ['web_browser_extension_dir', 'web_browser_extension_dir'],
  ['web_browser_user_dir', 'web_browser_user_dir'],
  ['pipeline', 'pipeline'],
  ['save_screenshots', 'save_screenshots'],
  ['planner_model', 'planner_model'],
  ['planner_version', 'planner_version'],
  ['navigator_version', 'navigator_version'],
  ['navigator_model', 'navigator_model'],
  ['max_steps', 'max_steps'],
  ['judge_name', 'judge_name'],
  ['result_dir', 'result_dir'],
  ['bench_test_path', 'bench_test_path'],
  ['gigado_backend_url', 'gigado_backend_url'],
  ['max_concurrent', 'max_concurrent'],
  ['screen_without_markup', 'screen_without_markup'],
  ['user_id', 'user_id'],
  ['run_number', 'run_number'],
  ['kubernetes_pod_id', 'kubernetes_pod_id'],
  ['created_at', 'created_at'],
];

export function BenchmarksRunDetail() {
  const navigate = useNavigate();
  const { runId } = useParams();
  const useApi = isBenchApiEnabled();

  const [run, setRun] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(useApi);
  const [error, setError] = useState(null);
  const [controlBusy, setControlBusy] = useState(false);
  const [controlMsg, setControlMsg] = useState(null);
  /** Локальное переопределение статуса (мок без API). */
  const [mockRunPatch, setMockRunPatch] = useState(null);

  useEffect(() => {
    setMockRunPatch(null);
  }, [runId]);

  useEffect(() => {
    if (!runId) return;
    if (!useApi) {
      setRun(getRun(runId));
      setTasks(getTasksForRun(runId));
      setLoading(false);
      return;
    }
    let cancel = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const row = await findBenchRunById(runId);
        const tr = await getBenchTasks(runId, { limit: 500 });
        if (!cancel) {
          setRun(row ? runWithUiFields(row) : null);
          setTasks(tr?.data ?? []);
        }
      } catch (e) {
        if (!cancel) setError(e?.message ?? String(e));
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [runId, useApi]);

  const displayRun = useMemo(() => {
    if (!run) return null;
    if (!useApi) return { ...run, ...mockRunPatch };
    return run;
  }, [run, mockRunPatch, useApi]);

  const sendControl = useCallback(
    async (action) => {
      if (!runId) return;
      if (!useApi) {
        if (action === 'pause') setMockRunPatch((p) => ({ ...p, bench_run_status: 'paused' }));
        if (action === 'resume') setMockRunPatch((p) => ({ ...p, bench_run_status: 'running' }));
        if (action === 'cancel')
          setMockRunPatch((p) => ({
            ...p,
            bench_run_status: 'cancelled',
            finish_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
          }));
        setControlMsg('Статус изменён локально (мок).');
        setTimeout(() => setControlMsg(null), 2400);
        return;
      }
      setControlBusy(true);
      setControlMsg(null);
      try {
        await postBenchRunControl(runId, action);
        const row = await findBenchRunById(runId);
        const tr = await getBenchTasks(runId, { limit: 500 });
        setRun(row ? runWithUiFields(row) : null);
        setTasks(tr?.data ?? []);
        setControlMsg('Команда принята сервером.');
        setTimeout(() => setControlMsg(null), 2400);
      } catch (e) {
        setControlMsg(e?.message ?? String(e));
      } finally {
        setControlBusy(false);
      }
    },
    [runId, useApi]
  );

  if (useApi && loading) {
    return (
      <div className="bench-detail bench-detail--empty">
        <p>Загрузка запуска…</p>
        <Link to="/runs">← К списку</Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bench-detail bench-detail--empty">
        <p>{error}</p>
        <Link to="/runs">← К списку</Link>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="bench-detail bench-detail--empty">
        <p>Запуск не найден.</p>
        <Link to="/runs">← К списку</Link>
      </div>
    );
  }

  const fieldRows = [
    ...RUN_FIELD_LABELS_API,
    ...(displayRun.bench_definition_version_id != null ? [['bench_definition_version_id', 'bench_definition_version_id (FK версии бенча)']] : []),
    ...(displayRun.agent_version_string != null && !RUN_FIELD_LABELS_API.some(([k]) => k === 'agent_version_string')
      ? [['agent_version_string', 'agent_version_string (композит)']]
      : []),
    ...(displayRun.suite_label != null ? [['suite_label', 'suite_label (UI)']] : []),
    ...(displayRun.bench_run_status != null ? [['bench_run_status', 'bench_run_status']] : []),
  ];

  const uniqueFields = [];
  const seen = new Set();
  for (const pair of fieldRows) {
    const key = pair[0];
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueFields.push(pair);
  }

  const handleDownloadRunJson = () => {
    const body = {
      version: 1,
      exported_at: new Date().toISOString(),
      bench_run: displayRun,
      bench_task_run: tasks,
    };
    downloadTextFile(`bench-run-${displayRun.id}.json`, JSON.stringify(body, null, 2), 'application/json;charset=utf-8');
  };

  const dispStatus = deriveBenchRunDisplayStatus(displayRun, tasks);
  const statusLabel = benchRunStatusLabel(dispStatus);
  const metrics = aggregateBenchRunMetrics(tasks, displayRun);
  const showControls = dispStatus === 'running' || dispStatus === 'paused';

  return (
    <div className="bench-detail">
      <div className="bench-detail__head">
        <div className="bench-detail__head-row">
          <Link to="/runs" className="bench-detail__back">
            ← Запуски
          </Link>
          <button type="button" className="bench-detail__json-btn" onClick={handleDownloadRunJson}>
            <Download size={16} aria-hidden /> JSON запуска
          </button>
        </div>
        <h1 className="bench-detail__title">
          Run #{displayRun.run_number ?? '?'} · {displayRun.suite_label ?? displayRun.pipeline ?? 'run'}
        </h1>
        <p className="bench-detail__sub">Клик по строке задачи — карточка и трейс</p>
      </div>

      <section className="bench-detail__section bench-detail__section--status">
        <h2 className="bench-detail__h2">Статус и агрегаты</h2>
        <div className="bench-detail__status-row">
          <span className={`bench-detail__status-badge bench-detail__status-badge--${dispStatus}`}>{statusLabel}</span>
          {showControls ? (
            <div className="bench-detail__controls">
              {dispStatus === 'running' ? (
                <button type="button" className="bench-detail__ctrl-btn" disabled={controlBusy} onClick={() => void sendControl('pause')}>
                  <Pause size={16} aria-hidden /> Пауза
                </button>
              ) : (
                <button type="button" className="bench-detail__ctrl-btn" disabled={controlBusy} onClick={() => void sendControl('resume')}>
                  <Play size={16} aria-hidden /> Продолжить
                </button>
              )}
              <button type="button" className="bench-detail__ctrl-btn bench-detail__ctrl-btn--danger" disabled={controlBusy} onClick={() => void sendControl('cancel')}>
                <Square size={16} aria-hidden /> Прервать
              </button>
            </div>
          ) : null}
        </div>
        {controlMsg ? <p className="bench-detail__control-msg">{controlMsg}</p> : null}
        {!useApi ? <p className="bench-detail__muted">Без API: пауза / прерывание только локально для макета.</p> : null}
        <dl className="bench-detail__metrics">
          <div className="bench-detail__metrics-item">
            <dt>Таски</dt>
            <dd>{metrics.total}</dd>
          </div>
          <div className="bench-detail__metrics-item">
            <dt>OK / fail / ? / conn</dt>
            <dd>
              {metrics.success} / {metrics.failed} / {metrics.unknown} / {metrics.connectionErrors}
            </dd>
          </div>
          <div className="bench-detail__metrics-item">
            <dt>Время бенчмарка</dt>
            <dd>{formatDurationSeconds(metrics.durationSeconds)}</dd>
          </div>
          <div className="bench-detail__metrics-item">
            <dt>% успешности</dt>
            <dd>{metrics.pctSuccess != null ? `${metrics.pctSuccess}%` : '—'}</dd>
          </div>
          <div className="bench-detail__metrics-item">
            <dt>% failed</dt>
            <dd>{metrics.pctFailed != null ? `${metrics.pctFailed}%` : '—'}</dd>
          </div>
        </dl>
      </section>

      <section className="bench-detail__section">
        <h2 className="bench-detail__h2">bench_run</h2>
        <dl className="bench-detail__dl">
          {uniqueFields.map(([key, label]) => (
            <div key={key} className="bench-detail__row">
              <dt>{label}</dt>
              <dd>{displayRun[key] != null ? String(displayRun[key]) : '—'}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="bench-detail__section">
        <h2 className="bench-detail__h2">bench_task_run (таски этого запуска)</h2>
        <div className="bench-detail__table-wrap">
          <table className="bench-detail__table">
            <thead>
              <tr>
                <th>id</th>
                <th>run_id</th>
                <th>session_id</th>
                <th>chat_id</th>
                <th>task_id</th>
                <th>task_web_name</th>
                <th>task_ques</th>
                <th>task_web</th>
                <th>start_time</th>
                <th>finish_time</th>
                <th>duration_seconds</th>
                <th>numb_steps</th>
                <th>success</th>
                <th>final_answer</th>
                <th>judge_llm_result</th>
                <th>history_json_url</th>
                <th>gif_url</th>
                <th>created_at</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr
                  key={t.id}
                  className={t.session_id ? 'bench-detail__row-task' : ''}
                  onClick={() => {
                    if (t.session_id && displayRun?.id) {
                      navigate(`/trace/${encodeURIComponent(t.session_id)}?run=${encodeURIComponent(displayRun.id)}`);
                    }
                  }}
                  title={t.session_id ? 'Открыть карточку задачи' : undefined}
                >
                  <td className="bench-detail__mono" title={t.id}>
                    {(t.id || '').slice(0, 8)}
                    {(t.id || '').length > 8 ? '…' : ''}
                  </td>
                  <td className="bench-detail__mono">{(String(t.run_id || '').slice(0, 8) || '—') + (t.run_id && t.run_id.length > 8 ? '…' : '')}</td>
                  <td className="bench-detail__mono" title={t.session_id}>
                    {(t.session_id || '').slice(0, 8)}
                    {(t.session_id || '').length > 8 ? '…' : ''}
                  </td>
                  <td className="bench-detail__mono" title={t.chat_id}>
                    {(t.chat_id || '').slice(0, 8) || '—'}
                  </td>
                  <td>{t.task_id}</td>
                  <td>{t.task_web_name}</td>
                  <td className="bench-detail__ques">{t.task_ques}</td>
                  <td className="bench-detail__mono">{t.task_web || '—'}</td>
                  <td>{t.start_time ?? '—'}</td>
                  <td>{t.finish_time ?? '—'}</td>
                  <td>{t.duration_seconds ?? '—'}</td>
                  <td>{t.numb_steps ?? '—'}</td>
                  <td>{t.success ?? '—'}</td>
                  <td className="bench-detail__ques">{t.final_answer ?? '—'}</td>
                  <td>{t.judge_llm_result ?? '—'}</td>
                  <td className="bench-detail__mono">{t.history_json_url ?? '—'}</td>
                  <td className="bench-detail__mono">{t.gif_url ?? '—'}</td>
                  <td>{t.created_at ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="bench-detail__h3">Промежуточные статусы (пример хранения по шагам)</h3>
        {!tasks.some((t) => (t.status_events ?? []).length > 0) ? (
          <p className="bench-detail__muted">Нет поля status_events (в данных API обычно отсутствует).</p>
        ) : (
          tasks.map((t) => (
            <div key={`ev-${t.id}`} className="bench-detail__events">
              <strong>{t.task_id}</strong>
              {(t.status_events ?? []).length === 0 ? (
                <span className="bench-detail__muted"> нет событий</span>
              ) : (
                <ol>
                  {t.status_events.map((ev, i) => (
                    <li key={i}>
                      шаг {ev.step}: {ev.label} · success={ev.success}
                      {ev.judge_llm_result != null ? ` · judge=${ev.judge_llm_result}` : ''} · {ev.at}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
