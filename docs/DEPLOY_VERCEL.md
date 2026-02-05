# Деплой Поздравлятора 2000 на Vercel

## Способ 1: Через сайт Vercel (рекомендуется)

1. Зайдите на [vercel.com](https://vercel.com) и войдите через **GitHub** (аккаунт `tattianaart21`).
2. Нажмите **Add New…** → **Project**.
3. Импортируйте репозиторий **tattianaart21/Pozdravlator-2000** (если не виден — нажмите **Configure** у GitHub и выдайте доступ репозиторию).
4. **Важно:** в **Root Directory** укажите **`pozdravlyator`** (без слэшей). Сборка должна идти из этой папки, иначе команда `vite build` не найдётся (ошибка 127).
5. **Environment Variables** (переменные окружения) — добавьте:
   - `VITE_SUPABASE_URL` — ваш Supabase URL (например `https://bnytrqhthghkwcydjlyq.supabase.co`).
   - `VITE_SUPABASE_ANON_KEY` — ваш Supabase anon key (из Dashboard → Project Settings → API).
   Значения берите из `pozdravlyator/.env` (локально).
6. Нажмите **Deploy**. Через 1–2 минуты появится ссылка вида `https://pozdravlyator-2000.vercel.app`.

После деплоя приложение будет доступно по этой ссылке. ИИ (генерация поздравлений и подарков) работает через ваши Edge Functions в Supabase.

---

## Чтобы открывалось с телефона и по ссылке Vercel (Supabase)

Supabase по умолчанию разрешает запросы только с настроенных адресов. Нужно добавить домен Vercel:

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard) → ваш проект.
2. **Authentication** → **URL Configuration**.
3. **Site URL** — поставьте ваш адрес Vercel, например:  
   `https://pozdravlyator-2000.vercel.app`  
   (точный URL смотрите в Vercel в проекте → Domain).
4. **Redirect URLs** — в списке добавьте (если ещё нет):
   - `https://pozdravlyator-2000.vercel.app/**`
   - `https://*.vercel.app/**`  
   (звёздочка подхватит любые поддомены Vercel, в т.ч. превью).
5. Сохраните (**Save**).

После этого приложение должно открываться по ссылке с телефона и с других устройств.

---

## Если 404 не исчезает

1. **Проверьте сборку:** Vercel → проект → **Deployments** → последний деплой → **Building** / лог. Сборка должна завершиться без ошибок, в логе должна быть строка вроде `Build Completed`.
2. **Проверьте Root Directory:** **Settings** → **General** → **Root Directory**. Либо `pozdravlyator`, либо пусто (корень), если используете корневой `vercel.json`.
3. **Переразверните:** в **Deployments** нажмите **⋯** у последнего деплоя → **Redeploy** (без кэша), дождитесь окончания и снова откройте ссылку сайта.

---

## Способ 2: Через Vercel CLI

```bash
cd /Users/user/Desktop/birthday-bot/pozdravlyator
npx vercel
```

Следуйте подсказкам (логин, если нужно). Когда спросит про переменные — добавьте `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` или задайте их потом в Dashboard проекта.

Для продакшн-деплоя в тот же проект:

```bash
npx vercel --prod
```
