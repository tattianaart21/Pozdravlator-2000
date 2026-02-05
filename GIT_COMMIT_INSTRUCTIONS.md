# Как добавить изменения в Git (пошагово)

Выполняйте команды **по одной** в терминале. Перейдите в папку проекта, затем:

---

## Шаг 1. Перейти в папку репозитория

```powershell
cd birthday-bot
```

Если вы уже в `birthday-bot`, этот шаг можно пропустить.

---

## Шаг 2. Посмотреть, что изменено

```powershell
git status
```

Должны быть видны файлы:
- `pozdravlyator/src/components/MemePicker.jsx`
- `pozdravlyator/src/services/memeApi.js`

---

## Шаг 3. Добавить файлы в индекс (staging)

**Вариант А — добавить только эти два файла:**

```powershell
git add pozdravlyator/src/components/MemePicker.jsx pozdravlyator/src/services/memeApi.js
```

**Вариант Б — добавить все изменённые файлы в проекте:**

```powershell
git add -A
```

---

## Шаг 4. Сделать коммит

```powershell
git commit -m "fix: стабильная загрузка картинок при генерации поздравления (picsum + таймаут)"
```

Сообщение можно заменить на своё, например:
- `fix: картинки не грузятся при генерации поздравления`
- `fix: загрузка изображений в MemePicker`

---

## Шаг 5. Отправить изменения на удалённый репозиторий (если есть origin)

```powershell
git push origin main
```

Если ветка называется `master`, используйте:

```powershell
git push origin master
```

---

## Кратко одной цепочкой (PowerShell)

Из папки, где лежит `birthday-bot`:

```powershell
cd birthday-bot
git add pozdravlyator/src/components/MemePicker.jsx pozdravlyator/src/services/memeApi.js
git commit -m "fix: стабильная загрузка картинок при генерации поздравления"
git push origin main
```

Готово.
