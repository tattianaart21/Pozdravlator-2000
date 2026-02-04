#!/usr/bin/env node
/**
 * Проверка ручки Perplexity: отправляется ли запрос во фронт → Edge Function → Perplexity и приходит ли ответ.
 * Читает URL и anon key из pozdravlyator/.env, шлёт POST в generate-congratulation, выводит результат.
 *
 * Запуск из корня проекта:
 *   node scripts/test-perplexity-request.mjs
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const envPath = resolve(root, 'pozdravlyator', '.env');

function loadEnv() {
  try {
    const raw = readFileSync(envPath, 'utf8');
    const env = {};
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
        value = value.slice(1, -1);
      env[key] = value;
    }
    return env;
  } catch (e) {
    console.error('Не удалось прочитать', envPath, e.message);
    process.exit(1);
  }
}

const env = loadEnv();
const url = env.VITE_AI_API_URL;
const anonKey = env.VITE_SUPABASE_ANON_KEY;

if (!url) {
  console.error('В pozdravlyator/.env не задан VITE_AI_API_URL. Добавьте:\n  VITE_AI_API_URL=https://bnytrqhthghkwcydjlyq.supabase.co/functions/v1/generate-congratulation');
  process.exit(1);
}

const payload = {
  dossier: { name: 'Мария', hobbies: 'книги', role: 'friend' },
  toneId: 'touching',
  occasion: 'День рождения',
  eventInfo: null,
};

console.log('Запрос отправляется на:', url);
console.log('Тело:', JSON.stringify(payload, null, 2));

const headers = { 'Content-Type': 'application/json' };
if (anonKey) headers['Authorization'] = `Bearer ${anonKey}`;

try {
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  console.log('\nОтвет: статус', res.status, res.statusText);

  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  if (res.ok) {
    const texts = body.texts;
    if (Array.isArray(texts) && texts.length > 0) {
      console.log('Получено вариантов поздравлений:', texts.length);
      texts.forEach((t, i) => console.log(`  ${i + 1}. ${t.slice(0, 80)}${t.length > 80 ? '…' : ''}`));
      console.log('\nРучка Perplexity работает: запрос отправлен, ответ получен.');
    } else {
      console.log('Тело ответа:', body);
      console.log('\nРучка ответила успешно, но формат ответа неожиданный (ожидался массив texts).');
    }
  } else {
    console.log('Тело ошибки:', body);
    console.log('\nРучка вернула ошибку. Проверьте: 1) задеплоена ли функция generate-congratulation, 2) заданы ли в Supabase секреты AI_API_KEY и при необходимости AI_CHAT_URL, AI_MODEL (см. scripts/set-perplexity-secrets.sh).');
    process.exit(1);
  }
} catch (err) {
  console.error('Ошибка при запросе:', err.message);
  console.log('\nЗапрос не удалось отправить или ответ не получен. Проверьте сеть и URL.');
  process.exit(1);
}
