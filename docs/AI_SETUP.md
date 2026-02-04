# Подключение ИИ для генерации поздравлений (DeepSeek, ChatGPT, Perplexity)

Чтобы поздравления были разнообразными, с правильным склонением имён и разным тоном, подключите один из ИИ.

**Рекомендуется: DeepSeek** — открытый OpenAI-совместимый API, хорошее качество на русском, выгодные тарифы.  
Edge Function по умолчанию использует DeepSeek: достаточно задать только ключ `AI_API_KEY`.

- **DeepSeek (по умолчанию)** — задай только `AI_API_KEY`, URL и модель подставятся автоматически  
- **OpenAI (ChatGPT)** — gpt-4o-mini или gpt-4o  
- **Perplexity** — sonar-модели с поиском  

Ключ API хранится в Supabase (Edge Function), в браузере он не светится.

---

## Шаг 1. Деплой Edge Functions

**Важно:** команды выполняйте из **корня проекта** (папка `birthday-bot`), а не из `pozdravlyator` — иначе Supabase не найдёт `supabase/functions/`.

В проекте в `supabase/config.toml` задано `verify_jwt = false` для обеих функций — иначе с сайта (без входа) приходит **401 Unauthorized**. После изменения config нужно переразвернуть функции.

```bash
cd /Users/user/Desktop/birthday-bot
supabase login
supabase link --project-ref bnytrqhthghkwcydjlyq
supabase functions deploy generate-congratulation
supabase functions deploy suggest-gifts
```

- **generate-congratulation** — генерация поздравлений (обязательно для ИИ).  
- **suggest-gifts** — идеи подарков по досье через ИИ (опционально; без неё подарки подбираются локально по ключевым словам).

После деплоя:
- `https://bnytrqhthghkwcydjlyq.supabase.co/functions/v1/generate-congratulation`
- `https://bnytrqhthghkwcydjlyq.supabase.co/functions/v1/suggest-gifts`

---

## Шаг 2. Задайте секрет API

В [Supabase Dashboard](https://supabase.com/dashboard) → ваш проект → **Project Settings** → **Edge Functions** → **Secrets** задайте переменные.

### Вариант A: DeepSeek (по умолчанию — рекомендуется)

1. Ключ: [platform.deepseek.com](https://platform.deepseek.com) → API Keys → Create API Key  
2. Задайте **только один** секрет:

| Имя | Значение |
|-----|----------|
| `AI_API_KEY` | ваш ключ DeepSeek (sk-...) |

URL и модель подставляются автоматически: `https://api.deepseek.com/v1/chat/completions`, модель `deepseek-chat`.

Через CLI:
```bash
supabase secrets set AI_API_KEY="sk-ваш-ключ-deepseek"
```

Готово. Остальные секреты (`AI_CHAT_URL`, `AI_MODEL`) задавать не нужно — используется открытый OpenAI-совместимый API DeepSeek.

---

### Вариант B: OpenAI (ChatGPT)

1. Ключ: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Секреты:

| Имя | Значение |
|-----|----------|
| `AI_CHAT_URL` | `https://api.openai.com/v1/chat/completions` |
| `AI_API_KEY` | `sk-...` (ваш ключ) |
| `AI_MODEL` | `gpt-4o-mini` (дешевле) или `gpt-4o` (качественнее) |

Через CLI:
```bash
supabase secrets set AI_CHAT_URL="https://api.openai.com/v1/chat/completions"
supabase secrets set AI_API_KEY="sk-ваш-ключ"
supabase secrets set AI_MODEL="gpt-4o-mini"
```

---

### Вариант C: Perplexity

1. Ключ: [perplexity.ai](https://www.perplexity.ai) → Settings → API или [docs.perplexity.ai](https://docs.perplexity.ai)
2. Секреты:

| Имя | Значение |
|-----|----------|
| `AI_CHAT_URL` | `https://api.perplexity.ai/chat/completions` |
| `AI_API_KEY` | `pplx-...` (ваш ключ) |
| `AI_MODEL` | `sonar` (по умолчанию) или `sonar-pro` (см. [docs.perplexity.ai](https://docs.perplexity.ai/docs/getting-started/models)) |

Через скрипт (ключ из переменной или из `.env` в корне проекта):
```bash
# Ключ уже в .env — просто запустите:
./scripts/set-perplexity-secrets.sh

# или задайте ключ вручную:
PERPLEXITY_API_KEY="pplx-ваш-ключ" ./scripts/set-perplexity-secrets.sh
```

Через CLI вручную:
```bash
supabase secrets set AI_CHAT_URL="https://api.perplexity.ai/chat/completions"
supabase secrets set AI_API_KEY="pplx-ваш-ключ"
supabase secrets set AI_MODEL="sonar"
```

---

## Шаг 3. Подключение в приложении

В папке **pozdravlyator** создайте или отредактируйте `.env`:

```env
VITE_SUPABASE_URL=https://bnytrqhthghkwcydjlyq.supabase.co
VITE_SUPABASE_ANON_KEY=ваш_anon_ключ

# URL Edge Function — после деплоя и настройки секретов
VITE_AI_API_URL=https://bnytrqhthghkwcydjlyq.supabase.co/functions/v1/generate-congratulation

# Идеи подарков по досье через ИИ (опционально)
VITE_AI_GIFTS_URL=https://bnytrqhthghkwcydjlyq.supabase.co/functions/v1/suggest-gifts
```

Перезапустите приложение (`npm run dev`). Генерация поздравлений и подбор подарков пойдут через Edge Functions → выбранный ИИ (DeepSeek/Perplexity и т.д.).

---

## Если ИИ не настроен

Если `VITE_AI_API_URL` не задан или секрет `AI_API_KEY` не задан в Supabase, приложение использует **локальную генерацию** из полей досье (склонение имён и тона учтены, качество ниже, чем у DeepSeek/ChatGPT).

---

## Другие провайдеры (OpenAI-совместимые)

Любой API с форматом chat completions (model, messages, max_tokens) подойдёт. Задайте:

- `AI_CHAT_URL` — полный URL до `.../chat/completions`
- `AI_API_KEY` — ключ в заголовке `Authorization: Bearer ...`
- `AI_MODEL` — имя модели

Примеры: Groq, Together, Anthropic (если есть chat endpoint), Ollama с прокси и т.д.
