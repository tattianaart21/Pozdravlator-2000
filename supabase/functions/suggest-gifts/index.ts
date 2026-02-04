// Supabase Edge Function: идеи подарков по досье через ИИ (те же секреты: AI_CHAT_URL, AI_API_KEY, AI_MODEL)
// Деплой: supabase functions deploy suggest-gifts

const DEEPSEEK_CHAT_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';

function buildPrompt(dossier: Record<string, unknown>, occasion?: string): string {
  const parts = [
    'По досье и поводу подбери ровно 5 конкретных идей подарков. Идеи персонализированы: хобби, мечты, вкусы, воспоминания. Учитывай повод (например, ДР — универсальнее, 23 февраля — иначе). Пиши по-русски, без нумерации — одна идея на строку. Короткая фраза (например: «Книга автора X в подарочном издании», «Мастер-класс по гончарному делу»).',
    '',
    'Досье:',
  ];
  if (dossier.name) parts.push(`Имя: ${dossier.name}.`);
  if (dossier.role) parts.push(`Роль: ${dossier.role}.`);
  if (dossier.hobbies) parts.push(`Хобби: ${dossier.hobbies}.`);
  if (dossier.dreams) parts.push(`Мечты: ${dossier.dreams}.`);
  if (dossier.tastes) parts.push(`Вкусы (музыка, кино, книги): ${dossier.tastes}.`);
  if (dossier.memories) parts.push(`Воспоминания: ${dossier.memories}.`);
  if (dossier.jokes) parts.push(`Шутки/мемы: ${dossier.jokes}.`);
  if (occasion) parts.push('', `Повод для подарка: ${occasion}.`);
  parts.push('', 'Ответ: только 5 идей, по одной на строку.');
  return parts.join('\n');
}

function parseIdeas(content: string): string[] {
  return content
    .split(/\n+/)
    .map((s) => s.replace(/^\d+[.)]\s*/, '').replace(/^[-•]\s*/, '').trim())
    .filter((s) => s.length > 3)
    .slice(0, 5);
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
    const { dossier, occasion } = await req.json();
    if (!dossier || typeof dossier !== 'object') {
      return new Response(JSON.stringify({ error: 'dossier object required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const chatUrl = Deno.env.get('AI_CHAT_URL') || DEEPSEEK_CHAT_URL;
    const apiKey = Deno.env.get('AI_API_KEY');
    const model = Deno.env.get('AI_MODEL') || (chatUrl === DEEPSEEK_CHAT_URL ? DEEPSEEK_MODEL : 'gpt-4o-mini');

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Set AI_API_KEY in Supabase secrets' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = buildPrompt(dossier, occasion);
    const body: Record<string, unknown> = {
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 512,
      temperature: 0.7,
    };

    const res = await fetch(chatUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(
        JSON.stringify({ error: `AI API error: ${res.status}`, details: err }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await res.json();
    const content =
      data.choices?.[0]?.message?.content ??
      data.choices?.[0]?.text ??
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      '';
    const ideas = parseIdeas(content);

    return new Response(JSON.stringify({ ideas }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
