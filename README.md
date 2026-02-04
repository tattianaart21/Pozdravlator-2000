# Поздравлятор 2000

PWA для персонализированных поздравлений: генерация текстов через ИИ (Perplexity/DeepSeek), досье контактов, календарь событий, идеи подарков, открытки за 60 секунд.

## Структура проекта

- **pozdravlyator/** — фронтенд (React, Vite): дашборд, генератор, календарь, сохранённые, авторизация Supabase.
- **supabase/functions/** — Edge Functions: `generate-congratulation`, `suggest-gifts` (ИИ для поздравлений и подарков).
- **docs/** — документация (AI_SETUP.md, сценарии).
- **scripts/** — скрипты (Perplexity secrets, проверка запроса к ИИ).

## Быстрый старт

1. Клонировать репозиторий.
2. В **корне**: скопировать `.env.example` в `.env`, задать `PERPLEXITY_API_KEY` (для скрипта секретов).
3. В **pozdravlyator**: скопировать `pozdravlyator/.env.example` в `pozdravlyator/.env`, указать `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY`.
4. Установить зависимости и запустить фронт:
   ```bash
   cd pozdravlyator && npm install && npm run dev
   ```
5. Задеплоить Edge Functions и задать секреты ИИ — см. **docs/AI_SETUP.md**.

## Деплой Edge Functions (из корня)

```bash
cd /path/to/birthday-bot
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy generate-congratulation
supabase functions deploy suggest-gifts
```

Секреты (Perplexity/DeepSeek): `scripts/set-perplexity-secrets.sh` или вручную в Dashboard → Edge Functions → Secrets.

## Лицензия

Проект создан в образовательных целях.
