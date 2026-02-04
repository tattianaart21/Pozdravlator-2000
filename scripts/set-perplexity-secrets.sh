#!/usr/bin/env bash
# Устанавливает секреты Supabase Edge Function для использования Perplexity API.
# Ключ берётся из переменной PERPLEXITY_API_KEY или из файла .env в корне проекта.
# Использование:
#   PERPLEXITY_API_KEY="pplx-ваш-ключ" ./scripts/set-perplexity-secrets.sh
# или создайте .env с строкой PERPLEXITY_API_KEY=pplx-...
set -e
cd "$(dirname "$0")/.."
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi
if [ -z "$PERPLEXITY_API_KEY" ]; then
  echo "Задайте PERPLEXITY_API_KEY: export PERPLEXITY_API_KEY=\"pplx-...\""
  echo "или добавьте в .env: PERPLEXITY_API_KEY=pplx-..."
  exit 1
fi
echo "Устанавливаю секреты Supabase для Perplexity..."
supabase secrets set AI_CHAT_URL="https://api.perplexity.ai/chat/completions"
supabase secrets set AI_API_KEY="$PERPLEXITY_API_KEY"
supabase secrets set AI_MODEL="sonar"
echo "Готово. Генерация поздравлений будет идти через Perplexity (sonar)."
