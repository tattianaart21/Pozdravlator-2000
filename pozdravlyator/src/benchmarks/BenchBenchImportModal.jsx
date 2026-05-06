import { useEffect, useMemo, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { importTaskObjectsIntoBench, loadBenches, parseBenchTasksFile } from './benchesStore';
import './BenchBenchImportModal.css';

export function BenchBenchImportModal({ open, onClose, onImported }) {
  const [benches, setBenches] = useState(() => loadBenches());
  const [benchId, setBenchId] = useState(() => loadBenches()[0]?.id ?? '');
  const [status, setStatus] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const list = loadBenches();
    setBenches(list);
    setBenchId((id) => list.find((b) => b.id === id)?.id ?? list[0]?.id ?? '');
    setStatus(null);
  }, [open]);

  const benchName = useMemo(() => benches.find((b) => b.id === benchId)?.name ?? '', [benches, benchId]);

  if (!open) return null;

  const onPickFile = () => fileRef.current?.click();

  const onFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !benchId) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      const { objects, lineErrors } = parseBenchTasksFile(text);
      const res = importTaskObjectsIntoBench(benchId, objects);
      const parts = [`Добавлено: ${res.imported}`];
      if (res.skipped) parts.push(`дубликатов пропущено: ${res.skipped}`);
      if (res.errors.length) parts.push(`ошибок строк: ${res.errors.length}`);
      if (lineErrors.length) parts.push(`ошибок JSON: ${lineErrors.length}`);
      setStatus(parts.join(' · '));
      onImported?.();
    };
    reader.onerror = () => setStatus('Не удалось прочитать файл');
    reader.readAsText(file, 'UTF-8');
  };

  return (
    <div className="bench-import-overlay" role="presentation" onClick={onClose}>
      <div className="bench-import-dialog" role="dialog" aria-labelledby="bench-import-title" onClick={(ev) => ev.stopPropagation()}>
        <h2 id="bench-import-title" className="bench-import-dialog__title">
          <Upload size={20} aria-hidden /> Импорт бенча
        </h2>
        <p className="bench-import-dialog__hint">JSONL или JSON-массив задач (task_id, web_name, ques, web и синонимы).</p>
        <label className="bench-import-field">
          <span>Бенч</span>
          <select value={benchId} onChange={(e) => setBenchId(e.target.value)}>
            {benches.length === 0 ? <option value="">Нет бенчей — создайте на странице «Бенчи»</option> : null}
            {benches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <div className="bench-import-dialog__actions">
          <button type="button" className="bench-import-btn" onClick={onClose}>
            Закрыть
          </button>
          <button type="button" className="bench-import-btn bench-import-btn--primary" disabled={!benchId} onClick={onPickFile}>
            Выбрать файл…
          </button>
        </div>
        <input ref={fileRef} type="file" accept=".jsonl,.json,application/json,text/json" className="bench-import-file" onChange={onFile} tabIndex={-1} />
        {status ? (
          <p className="bench-import-dialog__status" role="status">
            «{benchName}»: {status}
          </p>
        ) : null}
      </div>
    </div>
  );
}
