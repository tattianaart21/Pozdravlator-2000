import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronRight, ChevronUp, Frown, Play, Plus, Smile, Trash2 } from 'lucide-react';
import {
  activeTasks,
  addTask,
  archiveTask,
  createBench,
  deleteBench,
  loadBenches,
  updateBench,
  updateTask,
} from './benchesStore';
import { useBenchmarksUi } from './BenchmarksUiContext';
import './BenchmarksBenchesPage.css';

function TaskModal({ open, title, initial, onSave, onClose }) {
  const [form, setForm] = useState(() => initial ?? { task_id: '', web_name: '', ques: '', web: '' });
  useEffect(() => {
    if (open) setForm(initial ?? { task_id: '', web_name: '', ques: '', web: '' });
  }, [open, initial]);
  if (!open) return null;
  return (
    <div className="bench-benches-modal-overlay" role="presentation" onClick={onClose}>
      <div className="bench-benches-modal" role="dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="bench-benches-modal__title">{title}</h3>
        <label className="bench-benches-field">
          <span>id (task_id)</span>
          <input value={form.task_id} onChange={(e) => setForm((f) => ({ ...f, task_id: e.target.value }))} />
        </label>
        <label className="bench-benches-field">
          <span>web_name</span>
          <input value={form.web_name} onChange={(e) => setForm((f) => ({ ...f, web_name: e.target.value }))} />
        </label>
        <label className="bench-benches-field">
          <span>ques</span>
          <textarea rows={3} value={form.ques} onChange={(e) => setForm((f) => ({ ...f, ques: e.target.value }))} />
        </label>
        <label className="bench-benches-field">
          <span>web</span>
          <input value={form.web} onChange={(e) => setForm((f) => ({ ...f, web: e.target.value }))} placeholder="https://…" />
        </label>
        <div className="bench-benches-modal__actions">
          <button type="button" className="bench-benches-btn" onClick={onClose}>
            Отмена
          </button>
          <button
            type="button"
            className="bench-benches-btn bench-benches-btn--primary"
            onClick={() => {
              onSave(form);
              onClose();
            }}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

export function BenchmarksBenchesPage() {
  const { openLaunchWithSelectedTasks } = useBenchmarksUi();
  const [benches, setBenches] = useState(() => loadBenches());
  const [expanded, setExpanded] = useState(() => new Set());
  const [selectedTasks, setSelectedTasks] = useState(() => ({}));
  const [showArchived, setShowArchived] = useState(false);
  const [taskModal, setTaskModal] = useState(null);

  const refresh = useCallback(() => setBenches(loadBenches()), []);

  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleTaskSelect = (benchId, taskId) => {
    setSelectedTasks((prev) => {
      const key = `${benchId}:${taskId}`;
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = { benchId, taskId };
      return next;
    });
  };

  const selectedList = useMemo(() => {
    const byBench = new Map(benches.map((b) => [b.id, b]));
    const rows = [];
    for (const k of Object.keys(selectedTasks)) {
      const { benchId, taskId } = selectedTasks[k];
      const b = byBench.get(benchId);
      const t = b?.tasks?.find((x) => x.id === taskId);
      if (b && t && !t.archived) rows.push({ benchId, benchName: b.name, task: t });
    }
    return rows;
  }, [selectedTasks, benches]);

  const handleLaunchSelected = () => {
    if (selectedList.length === 0) return;
    const benchIds = new Set(selectedList.map((r) => r.benchId));
    const tasks = selectedList.map((row) => ({
      id: row.task.id,
      task_id: row.task.task_id,
      web_name: row.task.web_name,
      ques: row.task.ques,
      web: row.task.web,
      _benchId: row.benchId,
    }));
    openLaunchWithSelectedTasks({
      benchId: benchIds.size === 1 ? selectedList[0].benchId : '_merged',
      benchName: benchIds.size === 1 ? selectedList[0].benchName : 'Выбранные таски',
      tasks,
    });
  };

  const launchWholeBench = (bench) => {
    const act = activeTasks(bench);
    if (act.length === 0) return;
    const tasks = act.map((t) => ({
      id: t.id,
      task_id: t.task_id,
      web_name: t.web_name,
      ques: t.ques,
      web: t.web,
      _benchId: bench.id,
    }));
    openLaunchWithSelectedTasks({
      benchId: bench.id,
      benchName: bench.name,
      tasks,
    });
  };

  const selectAllActiveInBench = (benchId, checked) => {
    const b = benches.find((x) => x.id === benchId);
    if (!b) return;
    setSelectedTasks((prev) => {
      const next = { ...prev };
      for (const t of activeTasks(b)) {
        const key = `${benchId}:${t.id}`;
        if (checked) next[key] = { benchId, taskId: t.id };
        else delete next[key];
      }
      return next;
    });
  };

  return (
    <div className="bench-benches">
      <header className="bench-benches__head">
        <h1 className="bench-benches__h1">Бенчи</h1>
        <div className="bench-benches__toolbar">
          <button
            type="button"
            className="bench-benches-btn bench-benches-btn--primary"
            onClick={() => {
              const name = window.prompt('Название бенча', 'Новый бенч');
              if (name === null) return;
              createBench({ name: name.trim() || 'Бенч', kind: 'sbervoyager' });
              refresh();
            }}
          >
            <Plus size={18} aria-hidden /> Новый бенч
          </button>
        </div>
      </header>

      <div className="bench-benches__launch-bar">
        <button type="button" className="bench-benches-btn bench-benches-btn--primary" disabled={selectedList.length === 0} onClick={handleLaunchSelected}>
          Запуск выбранных ({selectedList.length})
        </button>
        <label className="bench-benches-check">
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
          Показать архив
        </label>
      </div>

      <ul className="bench-benches__list">
        {benches.map((bench) => {
          const isOpen = expanded.has(bench.id);
          const tasks = showArchived ? bench.tasks : activeTasks(bench);
          const archivedCount = bench.tasks.filter((t) => t.archived).length;
          return (
            <li key={bench.id} className={`bench-benches-card ${isOpen ? 'bench-benches-card--open' : ''}`}>
              <div className="bench-benches-card__head">
                <button type="button" className="bench-benches-card__expand" onClick={() => toggleExpand(bench.id)} aria-expanded={isOpen}>
                  {isOpen ? <ChevronUp size={18} aria-hidden /> : <ChevronRight size={18} aria-hidden />}
                </button>
                <div className="bench-benches-card__title-block">
                  <input
                    className="bench-benches-card__name-input"
                    value={bench.name}
                    onChange={(e) => {
                      updateBench(bench.id, { name: e.target.value });
                      refresh();
                    }}
                    aria-label="Название бенча"
                  />
                  <span className="bench-benches-card__meta">
                    {bench.kind === 'sbervoyager' ? 'Sbervoyager' : 'Бизнес'} · {activeTasks(bench).length} активных
                    {archivedCount ? ` · ${archivedCount} в архиве` : ''}
                  </span>
                </div>
                <button
                  type="button"
                  className="bench-benches-btn bench-benches-btn--compact bench-benches-btn--on-dark"
                  title="Запустить все активные таски этого бенча"
                  disabled={activeTasks(bench).length === 0}
                  onClick={() => launchWholeBench(bench)}
                >
                  <Play size={16} aria-hidden /> Весь бенч
                </button>
                <button
                  type="button"
                  className="bench-benches-icon-btn bench-benches-icon-btn--on-dark"
                  title="Удалить бенч"
                  onClick={() => {
                    if (window.confirm('Удалить бенч и все его задачи?')) {
                      deleteBench(bench.id);
                      refresh();
                    }
                  }}
                >
                  <Trash2 size={18} aria-hidden />
                </button>
              </div>

              {isOpen ? (
                <div className="bench-benches-card__body">
                  <div className="bench-benches-nest">
                    <div className="bench-benches-nest__head">
                      <h3 className="bench-benches-nest__title">Задачи бенча ({tasks.length})</h3>
                      {(() => {
                        const act = activeTasks(bench);
                        const allSel = act.length > 0 && act.every((t) => selectedTasks[`${bench.id}:${t.id}`]);
                        const someSel = act.some((t) => selectedTasks[`${bench.id}:${t.id}`]);
                        return act.length > 0 ? (
                          <label className="bench-benches-select-all bench-benches-select-all--nest">
                            <input
                              type="checkbox"
                              checked={allSel}
                              ref={(el) => {
                                if (el) el.indeterminate = someSel && !allSel;
                              }}
                              onChange={(e) => selectAllActiveInBench(bench.id, e.target.checked)}
                            />
                            Выбрать все активные
                          </label>
                        ) : null;
                      })()}
                    </div>
                    <ul className="bench-benches-task-list">
                      {tasks.length === 0 ? (
                        <li className="bench-benches-task-empty">Нет задач. Добавьте первую.</li>
                      ) : (
                        tasks.map((t) => (
                          <li key={t.id} className={`bench-benches-task-card ${t.archived ? 'bench-benches-task-card--archived' : ''}`}>
                            <div className="bench-benches-task-card__inner">
                              <div className="bench-benches-task-card__check">
                                {!t.archived ? (
                                  <input
                                    type="checkbox"
                                    checked={Boolean(selectedTasks[`${bench.id}:${t.id}`])}
                                    onChange={() => toggleTaskSelect(bench.id, t.id)}
                                    aria-label={`Выбрать ${t.task_id}`}
                                  />
                                ) : (
                                  <span className="bench-benches-muted">—</span>
                                )}
                              </div>
                              <div className="bench-benches-task-card__grid">
                                <div className="bench-benches-kv">
                                  <span className="bench-benches-kv__label">web_name</span>
                                  <span className="bench-benches-kv__value">{t.web_name || '—'}</span>
                                </div>
                                <div className="bench-benches-kv">
                                  <span className="bench-benches-kv__label">id (task_id)</span>
                                  <span className="bench-benches-kv__value bench-benches-kv__value--mono">{t.task_id}</span>
                                </div>
                                <div className="bench-benches-kv">
                                  <span className="bench-benches-kv__label">статус</span>
                                  <span className={t.archived ? 'bench-benches-pill bench-benches-pill--fail' : 'bench-benches-pill bench-benches-pill--ok'}>
                                    {t.archived ? (
                                      <>
                                        <Frown size={14} strokeWidth={2} aria-hidden /> В архиве
                                      </>
                                    ) : (
                                      <>
                                        <Smile size={14} strokeWidth={2} aria-hidden /> Активна
                                      </>
                                    )}
                                  </span>
                                </div>
                                <div className="bench-benches-kv bench-benches-kv--wide">
                                  <span className="bench-benches-kv__label">ques</span>
                                  <span className="bench-benches-kv__value">{t.ques || '—'}</span>
                                </div>
                                <div className="bench-benches-kv bench-benches-kv--wide">
                                  <span className="bench-benches-kv__label">web</span>
                                  <span className="bench-benches-kv__value bench-benches-kv__value--mono">
                                    {t.web ? (
                                      <a href={t.web} target="_blank" rel="noreferrer" className="bench-benches-task-link">
                                        {t.web.length > 56 ? `${t.web.slice(0, 56)}…` : t.web}
                                      </a>
                                    ) : (
                                      '—'
                                    )}
                                  </span>
                                </div>
                              </div>
                              <div className="bench-benches-task-card__actions">
                                <button
                                  type="button"
                                  className="bench-benches-link-btn"
                                  onClick={() =>
                                    setTaskModal({
                                      benchId: bench.id,
                                      taskId: t.id,
                                      title: 'Редактировать задачу',
                                      initial: { task_id: t.task_id, web_name: t.web_name, ques: t.ques, web: t.web },
                                    })
                                  }
                                >
                                  Изменить
                                </button>
                                {!t.archived ? (
                                  <button type="button" className="bench-benches-link-btn" onClick={() => { archiveTask(bench.id, t.id, true); refresh(); }}>
                                    В архив
                                  </button>
                                ) : (
                                  <button type="button" className="bench-benches-link-btn" onClick={() => { archiveTask(bench.id, t.id, false); refresh(); }}>
                                    Восстановить
                                  </button>
                                )}
                              </div>
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                  <button
                    type="button"
                    className="bench-benches-btn bench-benches-btn--after-nest"
                    onClick={() =>
                      setTaskModal({
                        benchId: bench.id,
                        taskId: null,
                        title: 'Новая задача',
                        initial: { task_id: '', web_name: '', ques: '', web: '' },
                      })
                    }
                  >
                    <Plus size={16} aria-hidden /> Добавить задачу
                  </button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <TaskModal
        key={taskModal ? `${taskModal.benchId}-${taskModal.taskId ?? 'new'}` : 'closed'}
        open={Boolean(taskModal)}
        title={taskModal?.title}
        initial={taskModal?.initial}
        onClose={() => setTaskModal(null)}
        onSave={(form) => {
          if (!taskModal) return;
          if (taskModal.taskId) {
            updateTask(taskModal.benchId, taskModal.taskId, form);
          } else {
            addTask(taskModal.benchId, form);
          }
          refresh();
        }}
      />

    </div>
  );
}
