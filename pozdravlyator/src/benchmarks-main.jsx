import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { BenchmarksLayout } from './benchmarks/BenchmarksLayout';
import { BenchmarksDashboard } from './benchmarks/BenchmarksDashboard';
import { BenchmarksRunsPage } from './benchmarks/BenchmarksRunsPage';
import { BenchmarksRunDetail } from './benchmarks/BenchmarksRunDetail';
import { BenchmarksDiff } from './benchmarks/BenchmarksDiff';
import { BenchmarksBenchesPage } from './benchmarks/BenchmarksBenchesPage';
import { TraceCardPage } from './pages/TraceCardPage';
import './benchmarks-entry.css';

/**
 * Бенчмарки: дашборд, бенчи и задачи (localStorage), запуски, diff, карточка задачи.
 * URL: .../benchmarks.html#/…
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <main className="bench-entry-shell">
        <Routes>
          <Route path="/" element={<BenchmarksLayout />}>
            <Route index element={<BenchmarksDashboard />} />
            <Route path="runs" element={<BenchmarksRunsPage />} />
            <Route path="runs/:runId" element={<BenchmarksRunDetail />} />
            <Route path="diff" element={<BenchmarksDiff />} />
            <Route path="benches" element={<BenchmarksBenchesPage />} />
            <Route path="trace/:sessionId" element={<TraceCardPage />} />
          </Route>
        </Routes>
      </main>
    </HashRouter>
  </StrictMode>
);
