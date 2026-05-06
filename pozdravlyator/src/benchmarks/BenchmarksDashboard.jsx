import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BENCH_RUNS, BENCH_TASKS_BY_RUN, aggregateRunStats } from './fullMockData';
import {
  aggregateRunStatsFromTasks,
  classifyRunSuite,
  getBenchRuns,
  getBenchTasks,
  isBenchApiEnabled,
  runWithUiFields,
} from './benchApi';
import { exportRunsToExcelCsv } from './benchExportUtils';
import './BenchmarksDashboard.css';

async function prefetchTasksForRuns(runs, concurrency = 6) {
  const map = {};
  let i = 0;
  const workers = Array.from({ length: Math.min(concurrency, runs.length || 1) }, async () => {
    for (;;) {
      const idx = i++;
      if (idx >= runs.length) break;
      const r = runs[idx];
      try {
        const tr = await getBenchTasks(r.id, { limit: 500 });
        map[r.id] = tr?.data ?? [];
      } catch {
        map[r.id] = [];
      }
    }
  });
  await Promise.all(workers);
  return map;
}

export function BenchmarksDashboard() {
  const useApi = isBenchApiEnabled();
  const [agentFilter, setAgentFilter] = useState('');

  const [apiRuns, setApiRuns] = useState([]);
  const [tasksByRunId, setTasksByRunId] = useState({});
  const [apiLoading, setApiLoading] = useState(useApi);

  useEffect(() => {
    if (!useApi) return;
    let cancel = false;
    (async () => {
      setApiLoading(true);
      try {
        const res = await getBenchRuns({ limit: 50, offset: 0, sort_by: 'created_at', order: 'desc' });
        if (cancel) return;
        const runs = (res?.data ?? []).map(runWithUiFields);
        setApiRuns(runs);
        const tasksMap = await prefetchTasksForRuns(runs);
        if (!cancel) setTasksByRunId(tasksMap);
      } finally {
        if (!cancel) setApiLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [useApi]);

  const versions = useMemo(() => {
    if (useApi) return Array.from(new Set(apiRuns.map((r) => r.agent_version_string ?? ''))).filter(Boolean);
    return Array.from(new Set(BENCH_RUNS.map((r) => r.agent_version_string)));
  }, [useApi, apiRuns]);

  const runsFiltered = useMemo(() => {
    if (!useApi) {
      let rows = [...BENCH_RUNS];
      if (agentFilter) rows = rows.filter((r) => r.agent_version_string === agentFilter);
      return rows;
    }
    if (!agentFilter) return apiRuns;
    return apiRuns.filter((r) => r.agent_version_string === agentFilter);
  }, [useApi, agentFilter, apiRuns]);

  function exportCsv() {
    const tasksMap = useApi ? tasksByRunId : BENCH_TASKS_BY_RUN;
    exportRunsToExcelCsv(runsFiltered.map((r) => runWithUiFields(r)), tasksMap);
  }

  return (
    <div className="bench-dash">
      <section className="bench-dash__hero bench-dash__hero--compact">
        <h1 className="bench-dash__h1">Дашборд</h1>
        <div className="bench-dash__toolbar">
          <label className="bench-dash__filter">
            Версия агента
            <select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)}>
              <option value="">Все</option>
              {versions.map((v) => (
                <option key={v} value={v}>
                  {v.length > 72 ? `${v.slice(0, 72)}…` : v}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="bench-dash__btn" onClick={exportCsv}>
            CSV
          </button>
        </div>
      </section>

      {useApi && apiLoading ? (
        <p style={{ padding: '0 0 16px', color: '#71717a', fontSize: '14px' }}>Загрузка…</p>
      ) : null}

      <section className="bench-dash__table-wrap">
        <h2 className="bench-dash__h2">Последние запуски</h2>
        <table className="bench-dash__table">
          <thead>
            <tr>
              <th>№</th>
              <th>Набор</th>
              <th>Pipeline</th>
              <th>Версия агента</th>
              <th>Pass / +Judge</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {runsFiltered.map((r) => {
              const tasks = useApi ? tasksByRunId[r.id] ?? [] : BENCH_TASKS_BY_RUN[r.id] ?? [];
              const st = useApi ? aggregateRunStatsFromTasks(tasks) : aggregateRunStats(r.id);
              const suite = useApi ? (classifyRunSuite(r) === 'biz' ? 'Бизнес' : 'Sbervoyager') : r.suite_label;
              return (
                <tr key={r.id}>
                  <td>{r.run_number ?? '—'}</td>
                  <td>{suite}</td>
                  <td>{r.pipeline ?? '—'}</td>
                  <td className="bench-dash__mono" title={r.agent_version_string}>
                    {(r.agent_version_string ?? '').length > 40 ? `${(r.agent_version_string ?? '').slice(0, 40)}…` : r.agent_version_string || '—'}
                  </td>
                  <td>
                    {st.passRate} / {st.passWithJudge}
                  </td>
                  <td>
                    <Link to={`/runs/${r.id}`} className="bench-dash__link">
                      Детали
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
