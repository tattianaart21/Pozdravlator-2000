/** Локальное хранилище определений бенчей и задач (CRUD, мягкое удаление таски через archived). */

const STORAGE_KEY = 'benchmarks-benches-v1';

function uid() {
  return crypto.randomUUID();
}

export function loadBenches() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedInitial();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seedInitial();
    return parsed.map(normalizeBench);
  } catch {
    return seedInitial();
  }
}

function persist(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function normalizeBench(b) {
  return {
    id: b.id ?? uid(),
    name: String(b.name ?? 'Бенч'),
    kind: b.kind === 'business' ? 'business' : 'sbervoyager',
    createdAt: b.createdAt ?? new Date().toISOString(),
    tasks: Array.isArray(b.tasks) ? b.tasks.map(normalizeTask) : [],
  };
}

function normalizeTask(t) {
  return {
    id: t.id ?? uid(),
    task_id: String(t.task_id ?? '').trim() || 'task',
    web_name: String(t.web_name ?? '').trim(),
    ques: String(t.ques ?? t.task_ques ?? '').trim(),
    web: String(t.web ?? t.task_web ?? '').trim(),
    archived: Boolean(t.archived),
  };
}

function seedInitial() {
  const benchId = uid();
  const list = [
    {
      id: benchId,
      name: 'Sbervoyager',
      kind: 'sbervoyager',
      createdAt: new Date().toISOString(),
      tasks: [
        {
          id: uid(),
          task_id: 'sv-amz-001',
          web_name: 'Amazon',
          ques: 'Найти беспроводные наушники до 5000 ₽ и добавить в корзину',
          web: 'https://amazon.com',
          archived: false,
        },
        {
          id: uid(),
          task_id: 'sv-book-002',
          web_name: 'Booking',
          ques: 'Найти отель в Казани на выходные, фильтр 4★',
          web: 'https://booking.com',
          archived: false,
        },
      ],
    },
  ];
  persist(list);
  return list;
}

export function saveBenches(list) {
  persist(list.map(normalizeBench));
}

export function createBench({ name, kind }) {
  const list = loadBenches();
  const b = normalizeBench({
    id: uid(),
    name: name || 'Новый бенч',
    kind,
    createdAt: new Date().toISOString(),
    tasks: [],
  });
  list.push(b);
  saveBenches(list);
  return b;
}

export function updateBench(benchId, patch) {
  const list = loadBenches();
  const i = list.findIndex((b) => b.id === benchId);
  if (i < 0) return null;
  list[i] = normalizeBench({ ...list[i], ...patch, id: benchId });
  saveBenches(list);
  return list[i];
}

export function deleteBench(benchId) {
  const list = loadBenches().filter((b) => b.id !== benchId);
  saveBenches(list);
}

export function addTask(benchId, task) {
  const list = loadBenches();
  const b = list.find((x) => x.id === benchId);
  if (!b) return null;
  const t = normalizeTask({ ...task, id: uid(), archived: false });
  b.tasks.push(t);
  saveBenches(list);
  return t;
}

export function updateTask(benchId, taskId, patch) {
  const list = loadBenches();
  const b = list.find((x) => x.id === benchId);
  if (!b) return null;
  const i = b.tasks.findIndex((t) => t.id === taskId);
  if (i < 0) return null;
  b.tasks[i] = normalizeTask({ ...b.tasks[i], ...patch, id: taskId });
  saveBenches(list);
  return b.tasks[i];
}

/** Мягкое удаление */
export function archiveTask(benchId, taskId, archived = true) {
  return updateTask(benchId, taskId, { archived });
}

export function activeTasks(bench) {
  return (bench?.tasks ?? []).filter((t) => !t.archived);
}

/** Приводит объект из JSONL / внешнего бенча к полям таски в UI. */
export function mapExternalTaskRow(obj) {
  if (!obj || typeof obj !== 'object') return null;
  const task_id =
    obj.task_id ??
    obj.taskId ??
    obj.id ??
    obj.identifier ??
    '';
  const web_name = String(obj.web_name ?? obj.task_web_name ?? obj.site ?? obj.name ?? '').trim();
  const ques = String(obj.ques ?? obj.task_ques ?? obj.question ?? obj.query ?? obj.prompt ?? '').trim();
  const web = String(obj.web ?? obj.task_web ?? obj.url ?? obj.start_url ?? '').trim();
  return { task_id: String(task_id).trim(), web_name, ques, web };
}

/**
 * Текст файла → массив объектов.
 * Поддержка: JSONL (одна JSON-строка на строку) или один JSON-массив [...].
 * @returns {{ objects: object[], lineErrors: Array<{ line: number, msg: string }> }}
 */
export function parseBenchTasksFile(text) {
  const trimmed = text.trim();
  if (!trimmed) return { objects: [], lineErrors: [] };
  if (trimmed.startsWith('[')) {
    try {
      const arr = JSON.parse(trimmed);
      return { objects: Array.isArray(arr) ? arr : [], lineErrors: [] };
    } catch (e) {
      return { objects: [], lineErrors: [{ line: 1, msg: String(e.message || e) }] };
    }
  }
  const objects = [];
  const lineErrors = [];
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('//')) continue;
    try {
      objects.push(JSON.parse(line));
    } catch (e) {
      lineErrors.push({ line: i + 1, msg: String(e.message || e) });
    }
  }
  return { objects, lineErrors };
}

/**
 * Добавляет таски в бенч из распарсенных объектов.
 * @returns {{ imported: number, skipped: number, errors: Array<{ line?: number, msg: string }> }}
 */
export function importTaskObjectsIntoBench(benchId, objects, { skipDuplicateTaskId = true } = {}) {
  const list = loadBenches();
  const b = list.find((x) => x.id === benchId);
  if (!b) {
    return { imported: 0, skipped: 0, errors: [{ msg: 'Бенч не найден' }] };
  }
  const errors = [];
  let imported = 0;
  let skipped = 0;
  const existingTaskIds = new Set(b.tasks.map((t) => t.task_id));

  objects.forEach((raw, idx) => {
    try {
      const mapped = mapExternalTaskRow(raw);
      if (!mapped || !mapped.task_id) {
        errors.push({ line: idx + 1, msg: 'Нет распознаваемого task_id / task_id пустой' });
        return;
      }
      if (skipDuplicateTaskId && existingTaskIds.has(mapped.task_id)) {
        skipped += 1;
        return;
      }
      existingTaskIds.add(mapped.task_id);
      b.tasks.push(
        normalizeTask({
          id: uid(),
          task_id: mapped.task_id,
          web_name: mapped.web_name,
          ques: mapped.ques,
          web: mapped.web,
          archived: false,
        })
      );
      imported += 1;
    } catch (e) {
      errors.push({ line: idx + 1, msg: String(e.message || e) });
    }
  });

  saveBenches(list);
  return { imported, skipped, errors };
}
