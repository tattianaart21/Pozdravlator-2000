// Supabase Edge Function: генерация поздравлений через ИИ (OpenAI, DeepSeek, Perplexity и др.)
// Деплой: supabase functions deploy generate-congratulation
// DeepSeek (по умолчанию): задай только AI_API_KEY — используем открытый OpenAI-совместимый API DeepSeek.
// Другие провайдеры: AI_CHAT_URL + AI_API_KEY + AI_MODEL

/** DeepSeek — открытый OpenAI-совместимый API, подходит для качественной генерации на русском */
const DEEPSEEK_CHAT_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';

const TONES: Record<string, string> = {
  touching: 'Трогательный',
  ironic: 'Ироничный',
  formal: 'Официальный',
  epic: 'Эпичный',
  verse: 'В стихах',
};

const TONE_INSTRUCTIONS: Record<string, string> = {
  touching: 'Трогательный: тёплые, душевные слова, обращение «дорогая/ый», личные нотки. Без пафоса и юмора.',
  ironic: 'Ироничный: лёгкий юмор, дружеские подколы, самоирония. Никакого официоза и сантиментов.',
  formal: 'Официальный: сдержанно, уважительно, «позвольте поздравить», «уважаемый/ая». Без сленга и панибратства.',
  epic: 'Эпичный: пафосно, с восклицаниями, «великий день», «пусть судьба благоволит». Ярко и торжественно.',
  verse: 'В стихах: короткое поздравление в стихотворной форме (2–4 строки), рифма, опора на данные досье. Без прозы.',
};

const ROLES: Record<string, string> = {
  mom: 'Мама',
  dad: 'Папа',
  friend: 'Друг / подруга',
  partner: 'Партнёр',
  colleague: 'Коллега',
  other: 'Свой вариант',
};

const SYSTEM_MESSAGE = `Ты — опытный автор персонализированных поздравлений. Твои тексты короткие и опираются только на факты о человеке. Ты мастерски склоняешь имена по падежам. Не используешь шаблонные фразы без связи с досье. Критически важно: все 5 вариантов должны быть РАЗНЫМИ по структуре, началу и содержанию — разная длина, разное первое предложение, разный акцент (воспоминания / мечты / хобби / вкусы / роль). Запрещено повторять одну и ту же формулировку или конструкцию.`;

function hasPersonalInfo(dossier: Record<string, unknown>): boolean {
  const fields = ['hobbies', 'dreams', 'jokes', 'memories', 'tastes'];
  return fields.some((f) => {
    const v = dossier[f];
    return v != null && String(v).trim() !== '';
  });
}

function buildPromptGeneric(name: string, toneId: string, occasion: string): string {
  const toneName = TONES[toneId] ?? 'Трогательный';
  const toneInstruction = TONE_INSTRUCTIONS[toneId] ?? TONE_INSTRUCTIONS.touching;
  return [
    'Досье пустое — нет хобби, мечт, воспоминаний и т.д. Сгенерируй 5 СТАНДАРТНЫХ поздравлений БЕЗ персонализации.',
    'Используй ТОЛЬКО: имя получателя, повод и тон. Не придумывай факты о человеке.',
    '',
    `Имя (в именительном падеже): ${name}.`,
    `Повод: ${occasion}.`,
    `Тон: ${toneName}. ${toneInstruction}`,
    '',
    'Правила: склоняй имя по падежам («Поздравляю Машу», «Маше желаю», «Маша, с днём рождения»). 5 разных вариантов по структуре и началу. Без нумерации, по одному на строку.',
  ].join('\n');
}

function buildPrompt(
  dossier: Record<string, unknown>,
  toneId: string,
  occasion: string,
  eventInfo?: { daysUntil?: number; eventDate?: string } | null
): string {
  const name = (dossier.name != null ? String(dossier.name).trim() : '') || 'друг';
  if (!hasPersonalInfo(dossier)) {
    return buildPromptGeneric(name, toneId, occasion);
  }

  const toneName = TONES[toneId] ?? 'Трогательный';
  const toneInstruction = TONE_INSTRUCTIONS[toneId] ?? TONE_INSTRUCTIONS.touching;

  const parts = [
    'Сгенерируй ровно 5 разных вариантов поздравления.',
    `Повод: ${occasion}.`,
    `Имя получателя (в именительном падеже): ${name}.`,
  ];
  if (eventInfo?.daysUntil != null) {
    parts.push(`Событие через ${eventInfo.daysUntil} дн.${eventInfo.eventDate ? ` (дата: ${eventInfo.eventDate})` : ''}.`);
  }
  parts.push(
    '',
    'Правила:',
    '1) Склоняй имя по падежам: «Поздравляю Машу», «Маше желаю», «Маша, с днём рождения». Ошибки недопустимы.',
    '2) Используй ТОЛЬКО факты из досье. Никаких общих пожеланий без привязки к человеку.',
    `3) Тон: ${toneName}. ${toneInstruction} Все 5 вариантов в этом тоне.`,
    '',
    '4) ОБЯЗАТЕЛЬНОЕ РАЗНООБРАЗИЕ — каждый вариант с другим акцентом и другой структурой:',
    '   • Вариант 1: опора на совместные воспоминания (если есть в досье).',
    '   • Вариант 2: опора на мечты или планы.',
    '   • Вариант 3: опора на хобби или увлечения.',
    '   • Вариант 4: опора на вкусы (музыка, кино, книги) или шутки/мемы.',
    '   • Вариант 5: опора на роль/отношения или комбинация нескольких тем и другое начало фразы.',
    '   Разная длина (одно предложение / два / три), разное первое слово. Не повторяй одни и те же обороты.',
    '',
    'Досье (используй только эти данные):',
  );

  if (dossier.role) parts.push(`Роль: ${ROLES[dossier.role as string] ?? dossier.role}.`);
  if (dossier.hobbies) parts.push(`Хобби: ${dossier.hobbies}.`);
  if (dossier.dreams) parts.push(`Мечты: ${dossier.dreams}.`);
  if (dossier.jokes) parts.push(`Внутренние шутки/мемы: ${dossier.jokes}.`);
  if (dossier.memories) parts.push(`Совместные воспоминания: ${dossier.memories}.`);
  if (dossier.tastes) parts.push(`Вкусы (музыка, кино, книги): ${dossier.tastes}.`);

  parts.push(
    '',
    'Ответ: ровно 5 разных текстов, по одному на строку. Без нумерации, без заголовков, без кавычек. Каждая строка — один вариант. Варианты не должны быть похожи по формулировкам.'
  );

  return parts.join('\n');
}

function parseVariants(content: string): string[] {
  const lines = content
    .split(/\n+/)
    .map((s) => s.replace(/^\d+[.)]\s*/, '').replace(/^["']|["']$/g, '').trim())
    .filter((s) => s.length > 15);
  return lines.slice(0, 5);
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { dossier, toneId, occasion = 'День рождения', eventInfo = null } = await req.json();
    const name = dossier?.name != null ? String(dossier.name).trim() : '';
    if (!name) {
      return new Response(JSON.stringify({ error: 'dossier.name required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = buildPrompt(dossier, toneId ?? 'touching', occasion, eventInfo);
    const chatUrl = Deno.env.get('AI_CHAT_URL') || DEEPSEEK_CHAT_URL;
    const apiKey = Deno.env.get('AI_API_KEY');
    const model = Deno.env.get('AI_MODEL') || (chatUrl === DEEPSEEK_CHAT_URL ? DEEPSEEK_MODEL : 'gpt-4o-mini');

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Set AI_API_KEY in Supabase secrets (e.g. DeepSeek key from platform.deepseek.com)' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: Record<string, unknown> = {
      model,
      messages: [
        { role: 'system', content: SYSTEM_MESSAGE },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1024,
      temperature: 0.95,
    };

    let res = await fetch(chatUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    // Обработка 300 (Multiple Choices) и других 3xx: один редирект по Location
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('Location');
      if (location) {
        const redirectUrl = location.startsWith('http') ? location : new URL(location, chatUrl).href;
        res = await fetch(redirectUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(body),
        });
      }
    }

    if (!res.ok) {
      const err = await res.text();
      const message = res.status === 300
        ? 'Сервис ИИ вернул перенаправление (300). Попробуйте позже или проверьте настройки API.'
        : `AI API error: ${res.status}`;
      return new Response(
        JSON.stringify({ error: message, details: err }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await res.json();
    const content =
      data.choices?.[0]?.message?.content ??
      data.choices?.[0]?.text ??
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      '';

    const texts = parseVariants(content);
    if (texts.length === 0) texts.push(content.trim() || 'Поздравляю! Пусть всё будет хорошо.');

    return new Response(JSON.stringify({ texts }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
