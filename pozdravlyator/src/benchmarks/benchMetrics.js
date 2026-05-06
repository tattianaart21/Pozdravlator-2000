/** Агрегаты по запуску бенчмарка (уровень всего run), без сравнения по кейсам. */

/**
 * Ключ конфигурации для сопоставления «тот же запуск по параметрам»:
 * планировщик + навигатор + версия бенчмарка (FK определения).
 */
export function runConfigFingerprint(run) {
  if (!run) return '';
  return [
    run.planner_model ?? '',
    run.planner_version ?? '',
    run.navigator_model ?? '',
    run.navigator_version ?? '',
    run.bench_definition_version_id ?? '',
  ].join('\u0001');
}

function taskOutcomeBucket(task) {
  const s = String(task?.success ?? '').trim();
  const sLow = s.toLowerCase();
  const blob = `${sLow} ${String(task?.final_answer ?? task?.error ?? '').toLowerCase()}`;
  if (/connection|connect|timeout|network|econn|refused|unavailable|socket|connection_error|connerr|прерв|сеть/i.test(blob)) {
    return 'connection';
  }
  if (/^(yes|success|passed|partial)$/i.test(sLow)) return 'success';
  if (/^(no|fail|false|failed|error)$/i.test(sLow)) return 'failed';
  return 'unknown';
}

function parseBenchDate(iso) {
  if (!iso) return NaN;
  const t = Date.parse(String(iso).replace(' ', 'T'));
  return Number.isFinite(t) ? t : NaN;
}

/** Длительность бенчмарка по полям run или по задачам (секунды). */
export function benchRunDurationSeconds(run, tasks) {
  const a = parseBenchDate(run?.start_time);
  const b = parseBenchDate(run?.finish_time);
  if (Number.isFinite(a) && Number.isFinite(b) && b >= a) return Math.round((b - a) / 1000);
  const tasksArr = tasks ?? [];
  if (!tasksArr.length) return null;
  const starts = tasksArr.map((t) => parseBenchDate(t.start_time)).filter(Number.isFinite);
  const ends = tasksArr.map((t) => parseBenchDate(t.finish_time)).filter(Number.isFinite);
  if (starts.length && ends.length) {
    const mn = Math.min(...starts);
    const mx = Math.max(...ends);
    if (mx >= mn) return Math.round((mx - mn) / 1000);
  }
  const sum = tasksArr.reduce((acc, t) => acc + (Number(t?.duration_seconds) || 0), 0);
  return sum > 0 ? Math.round(sum) : null;
}

export function formatDurationSeconds(sec) {
  if (sec == null || !Number.isFinite(sec)) return '—';
  if (sec < 60) return `${sec} с`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m} мин ${s} с`;
}

/**
 * Статус отображения: приоритет явного поля API, иначе эвристика по датам/задачам.
 */
export function deriveBenchRunDisplayStatus(run, tasks) {
  const explicit = String(run?.bench_run_status ?? run?.status ?? '').trim().toLowerCase();
  if (explicit) {
    if (/pause|paused|hold/.test(explicit)) return 'paused';
    if (/cancel|abort|stop|killed/.test(explicit)) return 'cancelled';
    if (/run|progress|pending|work|active/.test(explicit)) return 'running';
    if (/complete|done|finish|success|ok/.test(explicit)) return 'completed';
  }
  const ft = run?.finish_time;
  if (ft == null || String(ft).trim() === '') {
    const tlist = tasks ?? [];
    const anyOpen = tlist.some((t) => !t.finish_time || /running|pending/i.test(String(t.success ?? '')));
    if (anyOpen || tlist.length === 0) return 'running';
  }
  return 'completed';
}

const STATUS_LABELS = {
  running: 'В работе',
  paused: 'Пауза',
  cancelled: 'Прерван',
  completed: 'Завершён',
};

export function benchRunStatusLabel(status) {
  return STATUS_LABELS[status] ?? status ?? '—';
}

/**
 * @returns {{
 *   total: number,
 *   success: number,
 *   failed: number,
 *   unknown: number,
 *   connectionErrors: number,
 *   durationSeconds: number | null,
 *   pctSuccess: number | null,
 *   pctFailed: number | null,
 * }}
 */
export function aggregateBenchRunMetrics(tasks, run) {
  const list = tasks ?? [];
  const n = list.length;
  let success = 0;
  let failed = 0;
  let unknown = 0;
  let connectionErrors = 0;
  for (const t of list) {
    const b = taskOutcomeBucket(t);
    if (b === 'connection') connectionErrors += 1;
    else if (b === 'success') success += 1;
    else if (b === 'failed') failed += 1;
    else unknown += 1;
  }
  const denom = n > 0 ? n : null;
  return {
    total: n,
    success,
    failed,
    unknown,
    connectionErrors,
    durationSeconds: benchRunDurationSeconds(run, list),
    pctSuccess: denom ? Math.round((success / denom) * 1000) / 10 : null,
    pctFailed: denom ? Math.round((failed / denom) * 1000) / 10 : null,
  };
}

/** Найти предыдущий запуск с тем же fingerprint (строго раньше по created_at). */
export function findPreviousRunSameConfig(sortedNewestFirst, runId) {
  const list = sortedNewestFirst ?? [];
  const idx = list.findIndex((r) => r.id === runId);
  if (idx < 0) return null;
  const base = list[idx];
  const fp = runConfigFingerprint(base);
  const baseTime = String(base.created_at ?? '');
  for (let j = idx + 1; j < list.length; j++) {
    const r = list[j];
    if (runConfigFingerprint(r) !== fp) continue;
    if (String(r.created_at ?? '') < baseTime) return r;
  }
  return null;
}
