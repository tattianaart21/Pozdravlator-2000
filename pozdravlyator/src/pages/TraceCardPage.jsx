import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  Film,
  FileJson2,
  MessageSquare,
  Sparkles,
  Timer,
} from 'lucide-react';
import { TRACE_ADMIN_BASE, getTaskBySessionId } from '../benchmarks/fullMockData';
import { findBenchRunById, getBenchTasks, isBenchApiEnabled, runWithUiFields } from '../benchmarks/benchApi';
import './TraceCardPage.css';

const TIMELINE_ICONS = [Sparkles, Activity, MessageSquare, CheckCircle2];

const TASK_FIELDS = [
  'id',
  'run_id',
  'session_id',
  'chat_id',
  'task_id',
  'task_web_name',
  'task_ques',
  'task_web',
  'start_time',
  'finish_time',
  'duration_seconds',
  'numb_steps',
  'success',
  'final_answer',
  'judge_llm_result',
  'history_json_url',
  'gif_url',
  'created_at',
];

export function TraceCardPage() {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const benchRunIdFromQuery = searchParams.get('run')?.trim() ?? '';

  const useApi = isBenchApiEnabled();

  const [remote, setRemote] = useState(null);
  const [remoteLoading, setRemoteLoading] = useState(false);

  useEffect(() => {
    if (!useApi || !benchRunIdFromQuery || !sessionId) {
      setRemote(null);
      setRemoteLoading(false);
      return;
    }
    let cancel = false;
    (async () => {
      setRemoteLoading(true);
      try {
        const tr = await getBenchTasks(benchRunIdFromQuery, { limit: 500 });
        const dec = decodeURIComponent(sessionId);
        const task = tr?.data?.find((x) => x.session_id === dec) ?? null;
        const row = await findBenchRunById(benchRunIdFromQuery);
        const run = row ? runWithUiFields(row) : null;
        if (!cancel) setRemote(task && run ? { task, run } : { missing: true, run });
      } catch (e) {
        if (!cancel) setRemote({ fetchError: e?.message ?? String(e) });
      } finally {
        if (!cancel) setRemoteLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [useApi, benchRunIdFromQuery, sessionId]);

  const mockData = useMemo(() => getTaskBySessionId(sessionId ?? ''), [sessionId]);

  const resolved = useMemo(() => {
    if (!sessionId) return null;
    if (useApi && benchRunIdFromQuery) {
      if (remote?.task && remote?.run) return { task: remote.task, run: remote.run };
      return null;
    }
    return mockData;
  }, [sessionId, useApi, benchRunIdFromQuery, remote, mockData]);

  const [toast, setToast] = useState(null);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2400);
  }, []);

  const copyText = useCallback(
    (text, label) => {
      void navigator.clipboard.writeText(text).then(
        () => showToast(`${label} скопирован`),
        () => showToast('Не удалось скопировать')
      );
    },
    [showToast]
  );

  if (remoteLoading) {
    return (
      <div className="trace-card trace-card--page trace-card--empty">
        <div className="trace-card__inner">
          <p className="trace-card__empty-text">Загрузка задачи из API…</p>
          <Link to="/runs" className="trace-card__btn trace-card__btn--primary">
            <ArrowLeft size={18} aria-hidden /> К запускам
          </Link>
        </div>
      </div>
    );
  }

  if (remote?.fetchError) {
    return (
      <div className="trace-card trace-card--page trace-card--empty">
        <div className="trace-card__inner">
          <p className="trace-card__empty-title">Ошибка API</p>
          <p className="trace-card__empty-text">{remote.fetchError}</p>
          <Link to="/runs" className="trace-card__btn trace-card__btn--primary">
            <ArrowLeft size={18} aria-hidden /> К запускам
          </Link>
        </div>
      </div>
    );
  }

  if (!resolved) {
    return (
      <div className="trace-card trace-card--page trace-card--empty">
        <div className="trace-card__inner">
          <div className="trace-card__empty-inner">
            <p className="trace-card__empty-title">Трейс не найден</p>
            <p className="trace-card__empty-text">
              {useApi && !benchRunIdFromQuery
                ? 'В режиме API добавьте в ссылку параметр ?run=<uuid bench_run>, чтобы загрузить bench_task_run по session_id.'
                : useApi && benchRunIdFromQuery && remote?.missing
                  ? 'В этом запуске нет задачи с данным session_id.'
                  : 'Проверьте ссылку или вернитесь к списку запусков.'}
            </p>
            <Link to="/runs" className="trace-card__btn trace-card__btn--primary">
              <ArrowLeft size={18} aria-hidden /> К запускам
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { task, run } = resolved;
  const adminTraceUrl = `${TRACE_ADMIN_BASE}?session=${task.session_id}`;

  const successLabel =
    task.success === 'yes' ? 'Успех' : task.success === 'partial' ? 'Частично' : task.success === 'no' ? 'Неуспех' : String(task.success ?? '—');

  const judgeLabel =
    task.judge_llm_result === 'pass'
      ? 'Судья: ок'
      : task.judge_llm_result === 'fail'
        ? 'Судья: отказ'
        : `Судья: ${task.judge_llm_result ?? '—'}`;

  const durationNum = Number(task.duration_seconds ?? NaN);
  const durationDisplay = Number.isFinite(durationNum) ? `${durationNum.toFixed(1)}` : '—';

  const timeline = [
    { title: 'Старт таски', meta: task.start_time ?? '—' },
    { title: 'Навигатор', meta: `${task.numb_steps ?? '—'} шагов` },
    { title: 'Финиш', meta: task.finish_time ?? '—' },
    { title: 'Длительность', meta: Number.isFinite(durationNum) ? `${durationNum.toFixed(1)} с` : '—' },
  ];

  return (
    <div className="trace-card trace-card--page">
      <div className="trace-card__inner">
        <header className="trace-card__hero">
          <div className="trace-card__hero-bg" aria-hidden />
          <div className="trace-card__hero-content">
            <Link to="/runs" className="trace-card__back">
              <ArrowLeft size={18} aria-hidden />
              <span>Запуски</span>
            </Link>
            <div className="trace-card__hero-badge">
              <Activity size={14} aria-hidden />
              bench_task_run · карточка
            </div>
            <h1 className="trace-card__title">{task.task_web_name}</h1>
            <p className="trace-card__subtitle">{task.task_ques ?? '—'}</p>
            <div className="trace-card__hero-chips">
              <span
                className={`trace-chip trace-chip--${
                  task.success === 'yes' ? 'ok' : task.success === 'partial' ? 'mid' : 'bad'
                }`}
              >
                {successLabel}
              </span>
              <span
                className={`trace-chip trace-chip--${
                  task.judge_llm_result === 'pass' ? 'ok' : task.judge_llm_result === 'fail' ? 'bad' : 'mid'
                }`}
              >
                {judgeLabel}
              </span>
              <span className="trace-chip trace-chip--muted">
                run #{run.run_number ?? '?'} · {run.suite_label ?? run.pipeline ?? 'run'}
              </span>
            </div>
          </div>
        </header>

        <section className="trace-panel trace-panel--run">
          <h2 className="trace-panel__title">Связанный bench_run</h2>
          <dl className="trace-dl trace-dl--compact">
            <div className="trace-dl__row">
              <dt>run_id</dt>
              <dd>
                <span className="trace-mono">{run.id}</span>
                <Link to={`/runs/${run.id}`} className="trace-card__mini-link">
                  открыть run
                </Link>
              </dd>
            </div>
            <div className="trace-dl__row">
              <dt>agent_version_string</dt>
              <dd className="trace-mono">{run.agent_version_string ?? '—'}</dd>
            </div>
            <div className="trace-dl__row">
              <dt>judge_name (run)</dt>
              <dd>{run.judge_name ?? '—'}</dd>
            </div>
          </dl>
        </section>

        <section className="trace-panel">
          <h2 className="trace-panel__title">final_answer</h2>
          <p className="trace-final-answer">{task.final_answer ?? '—'}</p>
        </section>

        <div className="trace-card__metrics">
          <article className="trace-metric">
            <Timer className="trace-metric__icon" size={22} aria-hidden />
            <span className="trace-metric__value">{durationDisplay}</span>
            <span className="trace-metric__label">секунд</span>
          </article>
          <article className="trace-metric">
            <Activity className="trace-metric__icon" size={22} aria-hidden />
            <span className="trace-metric__value">{task.numb_steps ?? '—'}</span>
            <span className="trace-metric__label">шагов</span>
          </article>
          <article className="trace-metric trace-metric--wide">
            <Sparkles className="trace-metric__icon" size={22} aria-hidden />
            <span className="trace-metric__value trace-metric__value--small">{run.agent_version_string ?? composeRunVersion(run)}</span>
            <span className="trace-metric__label">версия агента (run)</span>
          </article>
        </div>

        <div className="trace-card__grid">
          <section className="trace-panel">
            <h2 className="trace-panel__title">Все поля bench_task_run</h2>
            <dl className="trace-dl">
              {TASK_FIELDS.map((key) => (
                <div key={key} className="trace-dl__row">
                  <dt>{key}</dt>
                  <dd>
                    <span className="trace-mono">{task[key] != null ? String(task[key]) : '—'}</span>
                    {(key === 'session_id' || key === 'chat_id' || key === 'id') && task[key] ? (
                      <button type="button" className="trace-mini-copy" onClick={() => copyText(String(task[key]), key)} title="Копировать">
                        <Copy size={14} aria-hidden />
                      </button>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="trace-panel trace-panel--timeline">
            <h2 className="trace-panel__title">Таймлайн</h2>
            <ol className="trace-timeline">
              {timeline.map((step, i) => {
                const Icon = TIMELINE_ICONS[i % TIMELINE_ICONS.length];
                return (
                  <li key={step.title} className="trace-timeline__item">
                    <span className="trace-timeline__dot" aria-hidden>
                      <Icon size={16} strokeWidth={2} />
                    </span>
                    <div className="trace-timeline__body">
                      <span className="trace-timeline__title">{step.title}</span>
                      <span className="trace-timeline__meta">{step.meta}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>

        {(task.status_events ?? []).length > 0 ? (
          <section className="trace-panel">
            <h2 className="trace-panel__title">Промежуточные статусы (шаги)</h2>
            <ol className="trace-status-list">
              {task.status_events.map((ev, i) => (
                <li key={i}>
                  <strong>шаг {ev.step}</strong> {ev.label}: success={ev.success}
                  {ev.judge_llm_result != null ? `, judge=${ev.judge_llm_result}` : ''} · {ev.at}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <section className="trace-card__actions">
          <a href={adminTraceUrl} target="_blank" rel="noreferrer" className="trace-card__btn trace-card__btn--primary trace-card__btn--lg">
            <ExternalLink size={20} aria-hidden />
            Админка трейсов (session)
          </a>
          <div className="trace-card__secondary-actions">
            {task.history_json_url ? (
              <a href={task.history_json_url} className="trace-card__btn trace-card__btn--ghost" target="_blank" rel="noreferrer">
                <FileJson2 size={18} aria-hidden />
                history_json_url
              </a>
            ) : null}
            {task.gif_url ? (
              <a href={task.gif_url} className="trace-card__btn trace-card__btn--ghost" target="_blank" rel="noreferrer">
                <Film size={18} aria-hidden />
                gif_url
              </a>
            ) : null}
          </div>
        </section>

        {toast ? <div className="trace-card__toast" role="status">{toast}</div> : null}
      </div>
    </div>
  );
}

function composeRunVersion(run) {
  return [run.planner_model, run.navigator_model, run.planner_version, run.navigator_version].filter(Boolean).join(' · ') || '—';
}
