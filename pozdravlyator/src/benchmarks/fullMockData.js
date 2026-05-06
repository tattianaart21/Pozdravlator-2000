/** Полные моки под схемы bench_run и bench_task_run + промежуточные статусы (судья / без). */

export const TRACE_ADMIN_BASE = import.meta.env.VITE_TRACE_ADMIN_BASE_URL ?? 'https://admin.example/traces';

const RUN_1_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const RUN_2_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
/** Тот же fingerprint, что у RUN_1 — для демо сравнения «с предыдущим». */
const RUN_3_ID = 'c3d4e5f6-a7b8-9012-cdef-123456789012';
/** Запуск «в работе» (без finish_time у run и открытая таска). */
const RUN_4_ID = 'd4e5f6a7-b8c9-0123-def0-234567890123';

export const BENCH_RUNS = [
  {
    id: RUN_1_ID,
    start_time: '2026-04-28 14:00:00',
    finish_time: '2026-04-28 14:42:00',
    web_browser_path: '/config/chromium-bench.json',
    web_browser_extension_dir: '/plugins/navigator-v2',
    web_browser_user_dir: '/data/browser-user-42',
    pipeline: 'e2e',
    save_screenshots: true,
    planner_model: 'gpt-4o',
    planner_version: '1.4.0',
    navigator_version: '2.1.0',
    navigator_model: 'gpt-4o',
    max_steps: 40,
    judge_name: 'gpt-4o-mini-judge',
    result_dir: 's3://bench-results/run-42/',
    bench_test_path: '/suites/sbervoyager',
    gigado_backend_url: 'https://api.internal/gigado',
    max_concurrent: 4,
    screen_without_markup: false,
    user_id: 'ci@pipeline',
    run_number: 42,
    kubernetes_pod_id: 'bench-runner-7f8d9-x2kpq',
    created_at: '2026-04-28 14:32:01',
    bench_definition_version_id: 'bdv-sber-v3',
    agent_version_string: 'nav@2.1.0|planner@1.4.0|gpt-4o|plugin:1.2.3|wsr:0.9.1|prompt:hash-a3f9c2',
    suite_label: 'Sbervoyager',
  },
  {
    id: RUN_2_ID,
    start_time: '2026-04-28 10:55:00',
    finish_time: '2026-04-28 11:18:00',
    web_browser_path: '/config/chromium-business.json',
    web_browser_extension_dir: '/plugins/navigator-v2',
    web_browser_user_dir: '/data/browser-user-41',
    pipeline: 'business',
    save_screenshots: true,
    planner_model: 'gpt-4o',
    planner_version: '1.4.0',
    navigator_version: '2.1.0',
    navigator_model: 'gpt-4o',
    max_steps: 60,
    judge_name: 'gpt-4o-mini-judge',
    result_dir: 's3://bench-results/run-41/',
    bench_test_path: '/suites/business-basket',
    gigado_backend_url: 'https://api.internal/gigado',
    max_concurrent: 2,
    screen_without_markup: true,
    user_id: 'ivan.petrov',
    run_number: 41,
    kubernetes_pod_id: 'bench-runner-6a2b1-y9mnw',
    created_at: '2026-04-28 11:05:44',
    bench_definition_version_id: 'bdv-biz-v2',
    agent_version_string: 'nav@2.1.0|planner@1.4.0|gpt-4o|plugin:1.2.3|wsr:0.9.1|prompt:hash-a3f9c2',
    suite_label: 'Бизнес-корзина',
  },
  {
    id: RUN_3_ID,
    start_time: '2026-04-28 12:00:00',
    finish_time: '2026-04-28 12:28:00',
    web_browser_path: '/config/chromium-bench.json',
    web_browser_extension_dir: '/plugins/navigator-v2',
    web_browser_user_dir: '/data/browser-user-39',
    pipeline: 'e2e',
    save_screenshots: true,
    planner_model: 'gpt-4o',
    planner_version: '1.4.0',
    navigator_version: '2.1.0',
    navigator_model: 'gpt-4o',
    max_steps: 40,
    judge_name: 'gpt-4o-mini-judge',
    result_dir: 's3://bench-results/run-39/',
    bench_test_path: '/suites/sbervoyager',
    gigado_backend_url: 'https://api.internal/gigado',
    max_concurrent: 4,
    screen_without_markup: false,
    user_id: 'ci@pipeline',
    run_number: 39,
    kubernetes_pod_id: 'bench-runner-prev-x1',
    created_at: '2026-04-28 12:05:00',
    bench_definition_version_id: 'bdv-sber-v3',
    agent_version_string: 'nav@2.1.0|planner@1.4.0|gpt-4o|plugin:1.2.3|wsr:0.9.1|prompt:hash-a3f9c2',
    suite_label: 'Sbervoyager',
  },
  {
    id: RUN_4_ID,
    start_time: '2026-04-28 15:10:00',
    finish_time: null,
    web_browser_path: '/config/chromium-bench.json',
    web_browser_extension_dir: '/plugins/navigator-v2',
    web_browser_user_dir: '/data/browser-user-43',
    pipeline: 'e2e',
    save_screenshots: true,
    planner_model: 'gpt-4o-mini',
    planner_version: '1.0.0',
    navigator_version: '2.2.0',
    navigator_model: 'gpt-4o-mini',
    max_steps: 30,
    judge_name: 'gpt-4o-mini-judge',
    result_dir: 's3://bench-results/run-43/',
    bench_test_path: '/suites/sbervoyager',
    gigado_backend_url: 'https://api.internal/gigado',
    max_concurrent: 2,
    screen_without_markup: false,
    user_id: 'qa@local',
    run_number: 43,
    kubernetes_pod_id: 'bench-runner-live-zz',
    created_at: '2026-04-28 15:12:00',
    bench_definition_version_id: 'bdv-sber-v4',
    agent_version_string: 'gpt-4o-mini · live',
    suite_label: 'Sbervoyager',
    bench_run_status: 'running',
  },
];

/** Промежуточный статус (не отдельная таблица в ТЗ — отображение идеи хранения). */
const statusEventsDemo = [
  { step: 1, label: 'Старт', success: 'running', judge_llm_result: null, at: '2026-04-28 14:00:05' },
  { step: 5, label: 'После клика каталог', success: 'yes', judge_llm_result: null, at: '2026-04-28 14:02:10' },
  { step: 12, label: 'До финального сабмита', success: 'yes', judge_llm_result: 'pending', at: '2026-04-28 14:08:00' },
];

export const BENCH_TASKS_BY_RUN = {
  [RUN_1_ID]: [
    {
      id: 't10000001-0001-4001-8001-000000000001',
      run_id: RUN_1_ID,
      session_id: '11111111-1111-1111-1111-111111111111',
      chat_id: 'caaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      history_json_url: 's3://bench-demo/history-1111.json',
      gif_url: 's3://bench-demo/run-1111.gif',
      task_id: 'sv-amz-001',
      task_web_name: 'Amazon',
      task_ques: 'Найти беспроводные наушники до 5000 ₽ и добавить в корзину',
      task_web: 'https://amazon.com',
      start_time: '2026-04-28 14:01:00',
      finish_time: '2026-04-28 14:03:04',
      duration_seconds: 124.6,
      numb_steps: 18,
      success: 'yes',
      final_answer: 'В корзину добавлены наушники Sony WH-CH520',
      judge_llm_result: 'pass',
      created_at: '2026-04-28 14:03:05',
      status_events: statusEventsDemo,
    },
    {
      id: 't10000001-0001-4001-8001-000000000002',
      run_id: RUN_1_ID,
      session_id: '11111111-1111-1111-1111-111111111112',
      chat_id: 'caaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab',
      history_json_url: 's3://bench-demo/history-1112.json',
      gif_url: 's3://bench-demo/run-1112.gif',
      task_id: 'sv-book-002',
      task_web_name: 'Booking',
      task_ques: 'Найти отель в Казани на выходные, фильтр 4★',
      task_web: 'https://booking.com',
      start_time: '2026-04-28 14:10:00',
      finish_time: '2026-04-28 14:11:29',
      duration_seconds: 89.1,
      numb_steps: 12,
      success: 'yes',
      final_answer: 'Выбран отель X, даты 10–12 мая',
      judge_llm_result: 'pass',
      created_at: '2026-04-28 14:11:30',
      status_events: [
        { step: 1, label: 'Старт', success: 'running', judge_llm_result: null, at: '2026-04-28 14:10:01' },
        { step: 8, label: 'Фильтр 4★', success: 'yes', judge_llm_result: null, at: '2026-04-28 14:10:40' },
      ],
    },
    {
      id: 't10000001-0001-4001-8001-000000000099',
      run_id: RUN_1_ID,
      session_id: '11111111-1111-1111-1111-111111111199',
      chat_id: 'caaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa99',
      history_json_url: 's3://bench-demo/history-timeout.json',
      gif_url: null,
      task_id: 'sv-timeout-099',
      task_web_name: 'Demo timeout',
      task_ques: 'Демо: connection timeout',
      task_web: 'https://example.com',
      start_time: '2026-04-28 14:20:00',
      finish_time: '2026-04-28 14:20:45',
      duration_seconds: 45,
      numb_steps: 3,
      success: 'connection timeout',
      final_answer: null,
      judge_llm_result: null,
      created_at: '2026-04-28 14:20:46',
      status_events: [],
    },
  ],
  [RUN_3_ID]: [
    {
      id: 't30000003-0003-4003-8003-000000000001',
      run_id: RUN_3_ID,
      session_id: '33333333-3333-3333-3333-333333333331',
      chat_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      history_json_url: 's3://bench-demo/history-3331.json',
      gif_url: null,
      task_id: 'sv-amz-001',
      task_web_name: 'Amazon',
      task_ques: 'Найти беспроводные наушники до 5000 ₽ и добавить в корзину',
      task_web: 'https://amazon.com',
      start_time: '2026-04-28 12:01:00',
      finish_time: '2026-04-28 12:04:00',
      duration_seconds: 180,
      numb_steps: 20,
      success: 'no',
      final_answer: 'Не удалось',
      judge_llm_result: 'fail',
      created_at: '2026-04-28 12:04:01',
      status_events: [],
    },
    {
      id: 't30000003-0003-4003-8003-000000000002',
      run_id: RUN_3_ID,
      session_id: '33333333-3333-3333-3333-333333333332',
      chat_id: 'cccccccc-cccc-cccc-cccc-ccccccccccc2',
      history_json_url: 's3://bench-demo/history-3332.json',
      gif_url: null,
      task_id: 'sv-unknown-002',
      task_web_name: 'Wildberries',
      task_ques: 'Проверить наличие товара',
      task_web: 'https://wb.ru',
      start_time: '2026-04-28 12:10:00',
      finish_time: '2026-04-28 12:12:00',
      duration_seconds: 120,
      numb_steps: 8,
      success: 'pending',
      final_answer: null,
      judge_llm_result: null,
      created_at: '2026-04-28 12:12:01',
      status_events: [],
    },
  ],
  [RUN_2_ID]: [
    {
      id: 't20000002-0002-4002-8002-000000000001',
      run_id: RUN_2_ID,
      session_id: '22222222-2222-2222-2222-222222222222',
      chat_id: 'cbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      history_json_url: 's3://bench-demo/history-2222.json',
      gif_url: 's3://bench-demo/run-2222.gif',
      task_id: 'biz-ozon-borscht',
      task_web_name: 'Озон',
      task_ques: 'Собрать корзину для борща (свёкла, капуста, говядина)',
      task_web: 'https://ozon.ru',
      start_time: '2026-04-28 11:00:00',
      finish_time: '2026-04-28 11:05:12',
      duration_seconds: 312.2,
      numb_steps: 34,
      success: 'partial',
      final_answer: 'В корзине 2 из 3 позиций',
      judge_llm_result: 'fail',
      created_at: '2026-04-28 11:05:13',
      status_events: [
        { step: 1, label: 'Старт', success: 'running', judge_llm_result: null, at: '2026-04-28 11:00:02' },
        { step: 20, label: 'Капуста не найдена', success: 'no', judge_llm_result: null, at: '2026-04-28 11:03:00' },
        { step: 34, label: 'Финиш', success: 'partial', judge_llm_result: 'fail', at: '2026-04-28 11:05:10' },
      ],
    },
    {
      id: 't20000002-0002-4002-8002-000000000002',
      run_id: RUN_2_ID,
      session_id: '22222222-2222-2222-2222-222222222223',
      chat_id: 'cbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc',
      history_json_url: 's3://bench-demo/history-2223.json',
      gif_url: 's3://bench-demo/run-2223.gif',
      task_id: 'biz-price-tomyum',
      task_web_name: 'Сравнение',
      task_ques: 'Сравнить цены том ям на Ozon и Самокат, кратко в таблице',
      task_web: 'https://ozon.ru',
      start_time: '2026-04-28 11:06:00',
      finish_time: '2026-04-28 11:10:16',
      duration_seconds: 256.0,
      numb_steps: 28,
      success: 'no',
      final_answer: 'Таблица не сформирована',
      judge_llm_result: 'fail',
      created_at: '2026-04-28 11:10:17',
      status_events: [],
    },
  ],
  [RUN_4_ID]: [
    {
      id: 't40000004-0004-4004-8004-000000000001',
      run_id: RUN_4_ID,
      session_id: '44444444-4444-4444-4444-444444444441',
      chat_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      history_json_url: null,
      gif_url: null,
      task_id: 'sv-live-001',
      task_web_name: 'Live',
      task_ques: 'Таска в процессе',
      task_web: 'https://example.com',
      start_time: '2026-04-28 15:12:10',
      finish_time: null,
      duration_seconds: null,
      numb_steps: 4,
      success: 'running',
      final_answer: null,
      judge_llm_result: null,
      created_at: '2026-04-28 15:12:11',
      status_events: [],
    },
  ],
};

/** Версии бизнес-бенча (п. 3.1) — неизменяемые после публикации */
export const BENCH_DEFINITION_VERSIONS = [
  {
    id: 'bdv-biz-v1',
    definition_key: 'business-basket',
    version: 1,
    created_at: '2026-04-01 09:00:00',
    label: 'Корзина v1',
    tasks: [
      { task_id: 'biz-ozon-1', task_web_name: 'Озон', task_ques: 'Добавить молоко 3.2% в корзину' },
      { task_id: 'biz-sam-1', task_web_name: 'Самокат', task_ques: 'Добавить хлеб в корзину' },
    ],
  },
  {
    id: 'bdv-biz-v2',
    definition_key: 'business-basket',
    version: 2,
    created_at: '2026-04-15 12:00:00',
    label: 'Корзина v2 + сравнение цен',
    tasks: [
      { task_id: 'biz-ozon-borscht', task_web_name: 'Озон', task_ques: 'Сборка корзины для борща' },
      { task_id: 'biz-price-tomyum', task_web_name: 'Сравнение', task_ques: 'Том ям: Ozon vs Самокат' },
    ],
  },
];

export function getRun(runId) {
  return BENCH_RUNS.find((r) => r.id === runId);
}

export function getTasksForRun(runId) {
  return BENCH_TASKS_BY_RUN[runId] ?? [];
}

export function getTaskBySessionId(sessionId) {
  if (!sessionId) return null;
  const dec = decodeURIComponent(sessionId);
  for (const tasks of Object.values(BENCH_TASKS_BY_RUN)) {
    const t = tasks.find((x) => x.session_id === dec);
    if (t) {
      const run = getRun(t.run_id);
      return { task: t, run };
    }
  }
  return null;
}

export function aggregateRunStats(runId) {
  const tasks = getTasksForRun(runId);
  const n = tasks.length;
  const pass = tasks.filter((t) => t.success === 'yes').length;
  const passJudge = tasks.filter((t) => t.judge_llm_result === 'pass').length;
  return {
    total: n,
    passRate: n ? `${Math.round((pass / n) * 100)}%` : '—',
    passWithJudge: n ? `${Math.round((passJudge / n) * 100)}%` : '—',
  };
}
