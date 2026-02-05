// Supabase Edge Function: случайный стикер из указанных стикерпаков Telegram.
// Деплой: supabase functions deploy get-telegram-sticker
// Секрет: TELEGRAM_BOT_TOKEN (токен от @BotFather).
// Имя стикерпака — последняя часть ссылки t.me/addstickers/ИмяНабора (например: CatHappy).

const TELEGRAM_API = 'https://api.telegram.org/bot';

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
    const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'TELEGRAM_BOT_TOKEN not set in Supabase secrets' }),
        { status: 501, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { packNames = [] } = (await req.json()) as { packNames?: string[] };
    const names = Array.isArray(packNames)
      ? packNames.map((n) => String(n).trim()).filter(Boolean)
      : [];
    if (names.length === 0) {
      return new Response(
        JSON.stringify({ error: 'packNames required (array of sticker set names)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const base = `${TELEGRAM_API}${token}`;
    const shuffled = [...names].sort(() => Math.random() - 0.5);

    for (const name of shuffled) {
      const setRes = await fetch(`${base}/getStickerSet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!setRes.ok) continue;
      const setData = await setRes.json();
      const stickers = setData?.result?.stickers;
      if (!Array.isArray(stickers) || stickers.length === 0) continue;

      const sticker = stickers[Math.floor(Math.random() * stickers.length)];
      const fileId = sticker?.file_id;
      if (!fileId) continue;

      const fileRes = await fetch(`${base}/getFile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: fileId }),
      });
      if (!fileRes.ok) continue;
      const fileData = await fileRes.json();
      const filePath = fileData?.result?.file_path;
      if (!filePath) continue;

      const fileUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
      const imgRes = await fetch(fileUrl);
      if (!imgRes.ok) continue;

      const buf = await imgRes.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      const mime = imgRes.headers.get('content-type') || 'image/webp';
      const dataUrl = `data:${mime};base64,${base64}`;

      return new Response(JSON.stringify({ url: dataUrl, title: 'Стикер', postLink: '' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ error: 'No stickers found in given packs' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
