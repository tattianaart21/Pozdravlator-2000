import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Copy, Download, Loader2, Search } from 'lucide-react';
import { BENCH_RUNS, BENCH_TASKS_BY_RUN } from './fullMockData';
import {
  aggregateBenchRunMetrics,
  getBenchRuns,
  getBenchTasks,
  getAvailableNavigatorModels,
  isBenchApiEnabled,
  pipelinesForTab,
  runWithUiFields,
} from './benchApi';
import { benchRunStatusLabel, deriveBenchRunDisplayStatus, formatDurationSeconds } from './benchMetrics';
import { exportRunsToExcelCsv } from './benchExportUtils';
import '../pages/BenchmarksAdmin.css';

const TABS = [
  { id: 'all', label: 'Все' },
  { id: 'sbervoyager', label: 'Sbervoyager' },
  { id: 'business', label: 'Бизнес' },
];

const PAGE_SIZES = [10, 20, 50];

function shortId(uuid) {
  return uuid.length > 12 ? `${uuid.slice(0, 8)}…` : uuid;
}

function statusBadgeClass(status) {
  if (status === 'running') return 'bench-admin-page__badge bench-admin-page__badge--run';
  if (status === 'paused') return 'bench-admin-page__badge bench-admin-page__badge--pause';
  if (status === 'cancelled') return 'bench-admin-page__badge bench-admin-page__badge--fail';
  return 'bench-admin-page__badge bench-admin-page__badge--ok';
}

export function BenchmarksRunsPage() {
  const navigate = useNavigate();
  const useApi = isBenchApiEnabled();

  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [toast, setToast] = useState(null);

  const [navModels, setNavModels] = useState([]);
  const [apiRuns, setApiRuns] = useState({ data: [], pagination: { total: 0, limit: 20, offset: 0 } });
  const [tasksByRunId, setTasksByRunId] = useState({});
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    if (!useApi) return;
    let cancel = false;
    getAvailableNavigatorModels()
      .then((rows) => {
        if (!cancel && Array.isArray(rows)) setNavModels(rows);
      })
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, [useApi]);

  useEffect(() => {
    if (!useApi) return;
    let cancel = false;
    (async () => {
      setApiLoading(true);
      setApiError(null);
      try {
        const pipelines = pipelinesForTab(tab === 'business' ? 'business' : tab === 'sbervoyager' ? 'sbervoyager' : 'all');
        const offset = Math.max(0, (page - 1) * pageSize);
        const q = {
          limit: pageSize,
          offset,
          sort_by: 'created_at',
          order: 'desc',
        };
        if (pipelines?.length) q.pipelines = pipelines;
        if (agentFilter) q.navigator_models = [agentFilter];
        const res = await getBenchRuns(q);
        if (cancel) return;
        setApiRuns(res);
        const runs = (res?.data ?? []).map(runWithUiFields);
        const entries = await Promise.all(
          runs.map(async (r) => {
            try {
              const tr = await getBenchTasks(r.id, { limit: 500 });
              return [r.id, tr?.data ?? []];
            } catch {
              return [r.id, []];
            }
          })
        );
        if (!cancel) setTasksByRunId(Object.fromEntries(entries));
      } catch (e) {
        if (!cancel) setApiError(e?.message ?? String(e));
      } finally {
        if (!cancel) setApiLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [useApi, tab, page, pageSize, agentFilter, fetchKey]);

  const filteredMock = useMemo(() => {
    let rows = [...BENCH_RUNS];
    if (tab === 'sbervoyager') rows = rows.filter((r) => r.suite_label === 'Sbervoyager');
    if (tab === 'business') rows = rows.filter((r) => r.suite_label !== 'Sbervoyager');
    if (agentFilter) rows = rows.filter((r) => r.agent_version_string === agentFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((r) => {
        const tasks = BENCH_TASKS_BY_RUN[r.id] ?? [];
        const taskBlob = tasks.map((t) => `${t.task_ques} ${t.task_id} ${t.task_web_name}`).join(' ').toLowerCase();
        return (
          r.id.toLowerCase().includes(q) ||
          r.agent_version_string.toLowerCase().includes(q) ||
          String(r.user_id ?? '').toLowerCase().includes(q) ||
          String(r.run_number).includes(q) ||
          taskBlob.includes(q)
        );
      });
    }
    rows.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    return rows;
  }, [tab, search, agentFilter]);

  const pageRowsMock = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(filteredMock.length / pageSize));
    const safePage = Math.min(page, totalPages);
    return {
      rows: filteredMock.slice((safePage - 1) * pageSize, safePage * pageSize),
      total: filteredMock.length,
      safePage,
      totalPages,
    };
  }, [filteredMock, page, pageSize]);

  const pageRowsApi = useMemo(() => {
    const rows = (apiRuns?.data ?? []).map(runWithUiFields);
    const qRaw = search.trim().toLowerCase();
    let list = rows;
    if (qRaw) {
      list = rows.filter((r) => {
        const tasks = tasksByRunId[r.id] ?? [];
        const taskBlob = tasks.map((t) => `${t.task_ques} ${t.task_id} ${t.task_web_name}`).join(' ').toLowerCase();
        return (
          r.id.toLowerCase().includes(qRaw) ||
          String(r.planner_model ?? '').toLowerCase().includes(qRaw) ||
          String(r.navigator_model ?? '').toLowerCase().includes(qRaw) ||
          composeAgentSnippet(r).toLowerCase().includes(qRaw) ||
          String(r.user_id ?? '').toLowerCase().includes(qRaw) ||
          String(r.run_number ?? '').includes(qRaw) ||
          taskBlob.includes(qRaw)
        );
      });
    }
    const total = apiRuns?.pagination?.total ?? 0;
    const totalPagesFromServer = Math.max(1, Math.ceil(total / pageSize));
    return {
      rows: list,
      total,
      safePage: Math.min(page, totalPagesFromServer),
      totalPages: totalPagesFromServer,
      serverLimitedSearch: Boolean(qRaw),
    };
  }, [apiRuns, tasksByRunId, search, page, pageSize]);

  const versionsMock = useMemo(() => Array.from(new Set(BENCH_RUNS.map((r) => r.agent_version_string))), []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
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

  if (useApi && apiError) {
    return (
      <div className="bench-admin-page">
        <div className="bench-admin-page__shell">
          <p style={{ padding: '24px', color: '#c62828' }}>{apiError}</p>
          <button type="button" className="bench-admin-page__link" style={{ marginLeft: '24px' }} onClick={() => setFetchKey((k) => k + 1)}>
            Повторить
          </button>
        </div>
      </div>
    );
  }

  const effective = useApi
    ? {
        rows: pageRowsApi.rows,
        total: pageRowsApi.total,
        safePage: pageRowsApi.safePage,
        totalPages: pageRowsApi.totalPages,
        serverLimitedSearch: pageRowsApi.serverLimitedSearch,
      }
    : {
        rows: pageRowsMock.rows,
        total: pageRowsMock.total,
        safePage: pageRowsMock.safePage,
        totalPages: pageRowsMock.totalPages,
        serverLimitedSearch: false,
      };

  function metricsFor(runId, tasksFallback, runRow) {
    const tasks = useApi ? tasksByRunId[runId] ?? tasksFallback ?? [] : BENCH_TASKS_BY_RUN[runId] ?? tasksFallback ?? [];
    return aggregateBenchRunMetrics(tasks, runRow);
  }

  const COL_COUNT = 15;

  return (
    <div className="bench-admin-page">
      <div className="bench-admin-page__shell">
        <div className="bench-admin-page__top">
          <nav className="bench-admin-page__tabs" aria-label="Фильтр набора">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`bench-admin-page__tab ${tab === t.id ? 'bench-admin-page__tab--active' : ''}`}
                onClick={() => {
                  setTab(t.id);
                  setPage(1);
                }}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="bench-admin-page__toolbar">
            <div className="bench-admin-page__search">
              <Search size={16} aria-hidden />
              <input
                type="search"
                placeholder="Поиск…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                aria-label="Поиск"
              />
            </div>
            <button
              type="button"
              className="bench-admin-page__icon-btn"
              title="Excel (CSV)"
              onClick={() => {
                const tasksMap = useApi ? tasksByRunId : BENCH_TASKS_BY_RUN;
                const rowsToExport = useApi ? effective.rows : filteredMock;
                exportRunsToExcelCsv(rowsToExport.map((r) => runWithUiFields(r)), tasksMap);
                showToast('CSV скачан');
              }}
            >
              <Download size={18} aria-hidden />
            </button>
          </div>
        </div>

        {effective.serverLimitedSearch && useApi ? (
          <p style={{ padding: '0 0 12px', color: 'var(--bench-muted)', fontSize: '13px' }}>
            Текстовый поиск действует только на текущей странице (после загрузки тасок для этих run).
          </p>
        ) : null}

        <div className="bench-admin-page__filter-row">
          <select
            className="bench-admin-page__select"
            value={agentFilter}
            onChange={(e) => {
              setAgentFilter(e.target.value);
              setPage(1);
            }}
            aria-label={useApi ? 'Navigator model' : 'Версия агента'}
          >
            <option value="">{useApi ? 'Все navigator_model' : 'Все версии агента (композит)'}</option>
            {useApi
              ? navModels.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))
              : versionsMock.map((v) => (
                  <option key={v} value={v}>
                    {v.length > 80 ? `${v.slice(0, 80)}…` : v}
                  </option>
                ))}
          </select>
        </div>

        <div className="bench-admin-page__table-wrap bench-admin-page__table-wrap--wide">
          <table className="bench-admin-page__table bench-admin-page__table--runs-metrics">
            <thead>
              <tr>
                <th>Run ID</th>
                <th>№</th>
                <th>Набор</th>
                <th>Pipeline</th>
                <th>Агент</th>
                <th>Статус</th>
                <th>Таски</th>
                <th>OK</th>
                <th>Fail</th>
                <th>?</th>
                <th>Conn</th>
                <th>Время</th>
                <th>% OK</th>
                <th>% Fail</th>
                <th>Создано</th>
              </tr>
            </thead>
            <tbody>
              {useApi && apiLoading && effective.rows.length === 0 ? (
                <tr>
                  <td colSpan={COL_COUNT} style={{ textAlign: 'center', padding: '32px', color: 'var(--bench-muted)' }}>
                    <Loader2 size={22} className="bench-admin-spin" style={{ verticalAlign: 'middle', marginRight: 8 }} aria-hidden />
                    Загрузка…
                  </td>
                </tr>
              ) : null}
              {effective.rows.length === 0 && !(useApi && apiLoading) ? (
                <tr>
                  <td colSpan={COL_COUNT} style={{ textAlign: 'center', padding: '32px', color: 'var(--bench-muted)' }}>
                    Нет записей
                  </td>
                </tr>
              ) : null}
              {effective.rows.map((row) => {
                const tasks = useApi ? tasksByRunId[row.id] ?? [] : BENCH_TASKS_BY_RUN[row.id] ?? [];
                const m = metricsFor(row.id, tasks, row);
                const agentStr = row.agent_version_string ?? composeAgentSnippet(row);
                const disp = deriveBenchRunDisplayStatus(row, tasks);
                const stLabel = benchRunStatusLabel(disp);
                return (
                  <tr
                    key={row.id}
                    className="bench-admin-page__row--nav"
                    onClick={() => navigate(`/runs/${row.id}`)}
                  >
                    <td>
                      <span className="bench-admin-page__mono" title={row.id}>
                        {shortId(row.id)}
                      </span>
                      <button type="button" className="bench-admin-page__copy" title="Копировать" onClick={(e) => { e.stopPropagation(); copyText(row.id, 'Run ID'); }}>
                        <Copy size={14} aria-hidden />
                      </button>
                    </td>
                    <td>{row.run_number ?? '—'}</td>
                    <td>
                      <span className="bench-admin-page__badge bench-admin-page__badge--partial">{row.suite_label ?? '—'}</span>
                    </td>
                    <td style={{ color: 'var(--bench-muted)', fontSize: '12px' }}>{row.pipeline ?? '—'}</td>
                    <td>
                      <span className="bench-admin-page__mono" title={agentStr}>
                        {agentStr.length > 28 ? `${agentStr.slice(0, 28)}…` : agentStr}
                      </span>
                    </td>
                    <td>
                      <span className={statusBadgeClass(disp)}>{stLabel}</span>
                    </td>
                    <td>{m.total}</td>
                    <td>{m.success}</td>
                    <td>{m.failed}</td>
                    <td>{m.unknown}</td>
                    <td>{m.connectionErrors}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDurationSeconds(m.durationSeconds)}</td>
                    <td>{m.pctSuccess != null ? `${m.pctSuccess}%` : '—'}</td>
                    <td>{m.pctFailed != null ? `${m.pctFailed}%` : '—'}</td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>{row.created_at ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="bench-admin-page__footer">
          <span>
            Всего: <strong>{effective.total}</strong> · стр. {effective.safePage}/{effective.totalPages}
          </span>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  По {n}
                </option>
              ))}
            </select>
            <div className="bench-admin-page__pagination">
              <button type="button" disabled={effective.safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft size={18} aria-hidden /> Назад
              </button>
              <button type="button" disabled={effective.safePage >= effective.totalPages} onClick={() => setPage((p) => Math.min(effective.totalPages, p + 1))}>
                Вперёд <ChevronRight size={18} aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast ? <div className="bench-admin-page__toast" role="status">{toast}</div> : null}
      <style>{`.bench-admin-spin { animation: bench-spin 0.7s linear infinite; } @keyframes bench-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function composeAgentSnippet(run) {
  return [run.planner_model, run.planner_version, run.navigator_model, run.navigator_version].filter(Boolean).join(' · ');
}
