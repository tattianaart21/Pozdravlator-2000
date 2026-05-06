import { useEffect, useMemo, useState } from 'react';
import { BENCH_RUNS, BENCH_TASKS_BY_RUN } from './fullMockData';
import { getBenchRuns, getBenchTasks, isBenchApiEnabled, runWithUiFields } from './benchApi';
import {
  aggregateBenchRunMetrics,
  findPreviousRunSameConfig,
  formatDurationSeconds,
  runConfigFingerprint,
} from './benchMetrics';
import './BenchmarksDiff.css';

function sortRunsNewestFirst(list) {
  return [...(list ?? [])].sort((a, b) => String(b.created_at ?? '').localeCompare(String(a.created_at ?? '')));
}

function suiteLabel(run) {
  if (!run) return '—';
  return `#${run.run_number ?? '?'} · ${run.pipeline ?? '—'}`;
}

function fmtPct(v) {
  if (v == null || !Number.isFinite(v)) return '—';
  return `${v}%`;
}

function deltaNum(a, b) {
  if (a == null || b == null || !Number.isFinite(a) || !Number.isFinite(b)) return '—';
  const d = b - a;
  if (d === 0) return '0';
  return d > 0 ? `+${d}` : String(d);
}

function deltaPctPoints(a, b) {
  if (a == null || b == null || !Number.isFinite(a) || !Number.isFinite(b)) return '—';
  const d = Math.round((b - a) * 10) / 10;
  if (d === 0) return '0 п.п.';
  const sign = d > 0 ? '+' : '';
  return `${sign}${d} п.п.`;
}

export function BenchmarksDiff() {
  const useApi = isBenchApiEnabled();
  const [mode, setMode] = useState('auto');
  const [runsList, setRunsList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [autoBaseId, setAutoBaseId] = useState('');
  const [manualA, setManualA] = useState('');
  const [manualB, setManualB] = useState('');

  const [tasksA, setTasksA] = useState([]);
  const [tasksB, setTasksB] = useState([]);

  useEffect(() => {
    if (!useApi) {
      const sorted = sortRunsNewestFirst(BENCH_RUNS);
      setRunsList(sorted);
      setAutoBaseId(sorted[0]?.id ?? '');
      setManualA(sorted[1]?.id ?? sorted[0]?.id ?? '');
      setManualB(sorted[0]?.id ?? '');
      return;
    }
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const res = await getBenchRuns({ limit: 200, offset: 0, sort_by: 'created_at', order: 'desc' });
        if (cancel) return;
        const data = (res?.data ?? []).map(runWithUiFields);
        const sorted = sortRunsNewestFirst(data);
        setRunsList(sorted);
        const first = sorted[0]?.id ?? '';
        setAutoBaseId(first);
        const second = sorted.find((r) => r.id !== first)?.id ?? first;
        setManualA(second);
        setManualB(first);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [useApi]);

  const sortedRuns = useMemo(() => sortRunsNewestFirst(runsList), [runsList]);

  const { runAId, runBId, autoNote } = useMemo(() => {
    if (mode === 'manual') {
      return { runAId: manualA, runBId: manualB, autoNote: null };
    }
    const base = sortedRuns.find((r) => r.id === autoBaseId) ?? sortedRuns[0];
    if (!base) return { runAId: '', runBId: '', autoNote: 'Нет запусков' };
    const prev = findPreviousRunSameConfig(sortedRuns, base.id);
    if (!prev) {
      return {
        runAId: '',
        runBId: base.id,
        autoNote: 'Нет предыдущего запуска с той же конфигурацией (planner + navigator + bench_definition_version_id).',
      };
    }
    return {
      runAId: prev.id,
      runBId: base.id,
      autoNote: `Пара по умолчанию: более новый #${base.run_number ?? '?'} vs предыдущий с тем же fingerprint #${prev.run_number ?? '?'}.`,
    };
  }, [mode, manualA, manualB, autoBaseId, sortedRuns]);

  useEffect(() => {
    if (!runAId || !runBId) {
      setTasksA([]);
      setTasksB([]);
      return;
    }
    if (!useApi) {
      setTasksA(BENCH_TASKS_BY_RUN[runAId] ?? []);
      setTasksB(BENCH_TASKS_BY_RUN[runBId] ?? []);
      return;
    }
    let cancel = false;
    (async () => {
      try {
        const [ta, tb] = await Promise.all([
          getBenchTasks(runAId, { limit: 500 }),
          getBenchTasks(runBId, { limit: 500 }),
        ]);
        if (!cancel) {
          setTasksA(ta?.data ?? []);
          setTasksB(tb?.data ?? []);
        }
      } catch {
        if (!cancel) {
          setTasksA([]);
          setTasksB([]);
        }
      }
    })();
    return () => {
      cancel = true;
    };
  }, [useApi, runAId, runBId]);

  const runA = sortedRuns.find((r) => r.id === runAId) ?? (useApi ? null : BENCH_RUNS.find((r) => r.id === runAId));
  const runB = sortedRuns.find((r) => r.id === runBId) ?? (useApi ? null : BENCH_RUNS.find((r) => r.id === runBId));

  const mA = aggregateBenchRunMetrics(tasksA, runA);
  const mB = aggregateBenchRunMetrics(tasksB, runB);

  const rows = [
    { key: 'total', label: 'Таски', a: mA.total, b: mB.total },
    { key: 'success', label: 'Success', a: mA.success, b: mB.success },
    { key: 'failed', label: 'Failed', a: mA.failed, b: mB.failed },
    { key: 'unknown', label: 'Unknown', a: mA.unknown, b: mB.unknown },
    { key: 'conn', label: 'Connection errors', a: mA.connectionErrors, b: mB.connectionErrors },
    {
      key: 'time',
      label: 'Время бенчмарка',
      a: formatDurationSeconds(mA.durationSeconds),
      b: formatDurationSeconds(mB.durationSeconds),
      rawA: mA.durationSeconds,
      rawB: mB.durationSeconds,
      isTime: true,
    },
    { key: 'pok', label: '% успешности', a: fmtPct(mA.pctSuccess), b: fmtPct(mB.pctSuccess), rawA: mA.pctSuccess, rawB: mB.pctSuccess, isPct: true },
    { key: 'pfail', label: '% failed', a: fmtPct(mA.pctFailed), b: fmtPct(mB.pctFailed), rawA: mA.pctFailed, rawB: mB.pctFailed, isPct: true },
  ];

  return (
    <div className="bench-diff">
      <h1 className="bench-diff__h1">Сравнение запусков</h1>
      <p className="bench-diff__intro">
        Сравнение только на уровне всего бенчмарка (агрегаты по всем таскам). Сравнение по отдельным кейсам не отображается.
      </p>

      {loading && useApi ? <p className="bench-diff__muted">Загрузка списка запусков…</p> : null}

      <div className="bench-diff__mode">
        <span className="bench-diff__mode-label">Режим</span>
        <label className="bench-diff__radio">
          <input type="radio" name="diff-mode" checked={mode === 'auto'} onChange={() => setMode('auto')} />
          Авто: с предыдущим с той же конфигурацией
        </label>
        <label className="bench-diff__radio">
          <input type="radio" name="diff-mode" checked={mode === 'manual'} onChange={() => setMode('manual')} />
          Вручную: любые два запуска
        </label>
      </div>

      {mode === 'auto' ? (
        <div className="bench-diff__pickers bench-diff__pickers--auto">
          <label>
            Новее (B), к нему ищется пара A
            <select value={autoBaseId} onChange={(e) => setAutoBaseId(e.target.value)}>
              {sortedRuns.map((r) => (
                <option key={r.id} value={r.id}>
                  {suiteLabel(r)} · {String(r.created_at ?? '').slice(0, 16)}
                </option>
              ))}
            </select>
          </label>
          {autoNote ? <p className={runAId ? 'bench-diff__auto-note bench-diff__auto-note--ok' : 'bench-diff__auto-note bench-diff__auto-note--warn'}>{autoNote}</p> : null}
        </div>
      ) : (
        <div className="bench-diff__pickers">
          <label>
            Run A (обычно старее)
            <select value={manualA} onChange={(e) => setManualA(e.target.value)}>
              {(useApi ? sortedRuns : BENCH_RUNS).map((r) => (
                <option key={r.id} value={r.id}>
                  {useApi ? suiteLabel(r) : `#${r.run_number} ${r.suite_label}`}
                </option>
              ))}
            </select>
          </label>
          <label>
            Run B (обычно новее)
            <select value={manualB} onChange={(e) => setManualB(e.target.value)}>
              {(useApi ? sortedRuns : BENCH_RUNS).map((r) => (
                <option key={r.id} value={r.id}>
                  {useApi ? suiteLabel(r) : `#${r.run_number} ${r.suite_label}`}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {runA && runB ? (
        <div className="bench-diff__run-heads">
          <div>
            <strong>Run A</strong>
            <div className="bench-diff__mono">{runA.id}</div>
            <div className="bench-diff__muted">{suiteLabel(runA)}</div>
            <div className="bench-diff__fp" title="Fingerprint">
              fp:{' '}
              <code>{(() => { const fp = runConfigFingerprint(runA); return fp.length > 56 ? `${fp.slice(0, 56)}…` : fp || '—'; })()}</code>
            </div>
          </div>
          <div>
            <strong>Run B</strong>
            <div className="bench-diff__mono">{runB.id}</div>
            <div className="bench-diff__muted">{suiteLabel(runB)}</div>
            <div className="bench-diff__fp" title="Fingerprint">
              fp:{' '}
              <code>{(() => { const fp = runConfigFingerprint(runB); return fp.length > 56 ? `${fp.slice(0, 56)}…` : fp || '—'; })()}</code>
            </div>
          </div>
        </div>
      ) : null}

      {!runAId || !runBId ? (
        <p className="bench-diff__muted">Выберите пару запусков для таблицы метрик.</p>
      ) : (
        <div className="bench-diff__table-wrap">
          <table className="bench-diff__table bench-diff__table--agg">
            <thead>
              <tr>
                <th>Метрика</th>
                <th>Run A</th>
                <th>Run B</th>
                <th>Δ (B − A)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                let delta = '—';
                if (row.isPct) {
                  delta = deltaPctPoints(row.rawA, row.rawB);
                } else if (row.isTime) {
                  delta = deltaNum(row.rawA, row.rawB);
                  if (delta !== '—') delta = `${delta} с`;
                } else if (typeof row.a === 'number' && typeof row.b === 'number') {
                  delta = deltaNum(row.a, row.b);
                }
                return (
                  <tr key={row.key}>
                    <td>{row.label}</td>
                    <td>{row.a}</td>
                    <td>{row.b}</td>
                    <td className="bench-diff__delta">{delta}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
