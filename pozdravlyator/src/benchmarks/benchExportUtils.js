import { BENCH_LAUNCH_IDS } from '../benchLaunchOptions';

export function downloadTextFile(filename, content, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Excel открывает CSV с BOM */
export function exportRunsToExcelCsv(runs, tasksByRun) {
  const headers = [
    'run_id',
    'run_number',
    'suite_label',
    'pipeline',
    'agent_version_string',
    'created_at',
    'task_id',
    'task_ques',
    'success',
    'judge_llm_result',
    'duration_seconds',
    'numb_steps',
  ];
  const rows = [headers.join(';')];
  for (const run of runs) {
    const tasks = tasksByRun[run.id] ?? [];
    for (const t of tasks) {
      rows.push(
        [
          run.id,
          run.run_number,
          run.suite_label,
          run.pipeline,
          run.agent_version_string,
          run.created_at,
          t.task_id,
          (t.task_ques || '').replaceAll(';', ','),
          t.success,
          t.judge_llm_result,
          t.duration_seconds,
          t.numb_steps,
        ].join(';')
      );
    }
  }
  const csv = '\uFEFF' + rows.join('\n');
  downloadTextFile(`bench-export-${Date.now()}.csv`, csv, 'text/csv;charset=utf-8');
}

export function buildLaunchPayload(selectionIds, params, extras = {}) {
  return {
    version: 1,
    generated_at: new Date().toISOString(),
    bench_suites: selectionIds,
    bench_run_params: params,
    ...extras,
  };
}

export function buildCurlExample(apiUrl, payload) {
  const url = apiUrl || 'https://api.internal/bench/v1/runs';
  return [
    `# Пример для CI/CD: положите тело запроса в payload.json (тот же JSON, что «Скачать JSON запуска»)`,
    `curl -X POST "${url}" \\`,
    `  -H "Content-Type: application/json" \\`,
    `  -H "Authorization: Bearer $BENCH_TOKEN" \\`,
    `  -d @payload.json`,
    '',
    `# Тело запуска (копия):`,
    JSON.stringify(payload, null, 2),
  ].join('\n');
}

export function defaultLaunchParams() {
  return {
    max_steps: 40,
    max_concurrent: 2,
    save_screenshots: true,
    screen_without_markup: false,
    planner_model: 'gpt-4o',
    planner_version: '1.4.0',
    navigator_model: 'gpt-4o',
    navigator_version: '2.1.0',
    judge_name: 'gpt-4o-mini-judge',
    gigado_backend_url: 'https://api.internal/gigado',
    bench_test_path: '/suites/sbervoyager',
    result_dir: 's3://bench-results/pending/',
    web_browser_path: '/config/chromium-bench.json',
    web_browser_extension_dir: '/plugins/navigator-v2',
    web_browser_user_dir: '/data/browser-user-auto',
    kubernetes_pod_id: '',
  };
}

export function getSelectedSuiteIds(benchSelection) {
  return BENCH_LAUNCH_IDS.filter((id) => benchSelection[id]);
}
