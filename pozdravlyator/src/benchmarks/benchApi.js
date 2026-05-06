/** Клиент к Trace Service API: только бенчи (/bench, /bench_task). Эндпоинты trace не используются. */

const base = () => {
  const u = import.meta.env.VITE_BENCH_API_URL;
  return typeof u === 'string' && u.trim() !== '' ? u.replace(/\/$/, '') : null;
};

export function isBenchApiEnabled() {
  return Boolean(base());
}

function buildParams(obj) {
  const sp = new URLSearchParams();
  if (!obj) return sp;
  const entries = Object.entries(obj);
  for (const [k, v] of entries) {
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v)) {
      for (const item of v) {
        if (item !== undefined && item !== null && item !== '') sp.append(k, String(item));
      }
    } else if (typeof v === 'boolean') {
      sp.set(k, String(v));
    } else {
      sp.set(k, String(v));
    }
  }
  return sp;
}

export async function getBenchRuns(query = {}) {
  const b = base();
  if (!b) throw new Error('VITE_BENCH_API_URL не задан');
  const q = buildParams(query);
  const res = await fetch(`${b}/bench/?${q.toString()}`);
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const j = await res.json();
      if (j?.detail) msg = JSON.stringify(j.detail);
    } catch {
      msg = await res.text();
    }
    throw new Error(msg);
  }
  return res.json();
}

export async function getAvailableNavigatorModels() {
  const b = base();
  if (!b) throw new Error('VITE_BENCH_API_URL не задан');
  const res = await fetch(`${b}/bench/available_navigator_model`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function getBenchTasks(benchRunId, query = {}) {
  const b = base();
  if (!b) throw new Error('VITE_BENCH_API_URL не задан');
  const q = buildParams(query);
  const url = `${b}/bench_task/${encodeURIComponent(benchRunId)}${q.size ? `?${q}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const j = await res.json();
      if (j?.detail) msg = JSON.stringify(j.detail);
    } catch {
      msg = await res.text();
    }
    throw new Error(msg);
  }
  return res.json();
}

/** Одна строка запуска: ищем через список (отдельного GET по id нет в OpenAPI). */
export async function findBenchRunById(runId, { pageSize = 100, maxScan = 2000 } = {}) {
  let offset = 0;
  while (offset < maxScan) {
    const res = await getBenchRuns({
      limit: pageSize,
      offset,
      sort_by: 'created_at',
      order: 'desc',
    });
    const row = (res?.data ?? []).find((r) => r.id === runId);
    if (row) return row;
    const total = res?.pagination?.total ?? 0;
    if (offset + pageSize >= total) break;
    offset += pageSize;
  }
  return null;
}

export function composeAgentVersion(run) {
  if (!run) return '';
  return [
    `planner_model=${run.planner_model ?? ''}`,
    `planner_version=${run.planner_version ?? ''}`,
    `navigator_model=${run.navigator_model ?? ''}`,
    `navigator_version=${run.navigator_version ?? ''}`,
  ].join('|');
}

export function runWithUiFields(run) {
  if (!run) return run;
  return {
    ...run,
    agent_version_string: run.agent_version_string ?? composeAgentVersion(run),
    suite_label: run.suite_label ?? (run.pipeline || '—'),
  };
}

/** Pass rate по задачам (как раньше в моках). success / judge строки произвольны с API. */
export function aggregateRunStatsFromTasks(tasks) {
  const n = tasks.length;
  const passSuccess = tasks.filter((t) => /^yes|success|passed|partial$/i.test(String(t.success))).length;
  const passJudge = tasks.filter((t) => /^pass|yes|success$/i.test(String(t.judge_llm_result))).length;
  return {
    total: n,
    passRate: n ? `${Math.round((passSuccess / n) * 100)}%` : '—',
    passWithJudge: n ? `${Math.round((passJudge / n) * 100)}%` : '—',
  };
}

export { aggregateBenchRunMetrics, benchRunDurationSeconds, deriveBenchRunDisplayStatus, runConfigFingerprint } from './benchMetrics';

export function pipelinesForTab(tab) {
  const sber = (import.meta.env.VITE_BENCH_PIPELINE_SBER || 'e2e,sbervoyager,Sbervoyager')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const biz = (import.meta.env.VITE_BENCH_PIPELINE_BIZ || 'business')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (tab === 'sbervoyager') return sber;
  if (tab === 'business') return biz;
  return undefined;
}

/** Найти task по session_id внутри задач запуска (без отдельного REST по task). */
export async function findTaskInBenchRun(runId, sessionId) {
  const dec = decodeURIComponent(String(sessionId || '')).trim();
  if (!runId || !dec) return null;
  const res = await getBenchTasks(runId, { limit: 500 });
  const tasks = res?.data ?? [];
  return tasks.find((t) => t.session_id === dec) ?? null;
}

export function classifyRunSuite(run) {
  const p = (run?.pipeline ?? '').toLowerCase();
  const bizMarks = ['business', 'biz', 'samokat', 'ozon', 'корзин'];
  if (bizMarks.some((x) => p.includes(x))) return 'biz';
  return 'sber';
}

/**
 * Управление выполнением бенчмарка (пауза / возобновление / прерывание).
 * Ожидается POST `{ action }` на бэкенде; при отсутствии эндпоинта вернётся ошибка.
 * @param {'pause' | 'resume' | 'cancel'} action
 */
export async function postBenchRunControl(runId, action) {
  const b = base();
  if (!b) throw new Error('VITE_BENCH_API_URL не задан');
  const res = await fetch(`${b}/bench/${encodeURIComponent(runId)}/control`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const j = await res.json();
      if (j?.detail != null) msg = typeof j.detail === 'string' ? j.detail : JSON.stringify(j.detail);
    } catch {
      try {
        msg = await res.text();
      } catch {
        /* keep msg */
      }
    }
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  const ct = res.headers.get('Content-Type') ?? '';
  if (ct.includes('application/json')) return res.json();
  return null;
}
