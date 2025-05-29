const cache = new Map();

export default async function handler(req, res) {
  const { text, id } = req.query;

  if (text) {
    const randomId = Math.random().toString(36).substring(2, 10);
    cache.set(randomId, text);
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const url = `${protocol}://${req.headers.host}/?id=${randomId}`;
    return res.json({ status: 'success', url });
  }

  if (id && cache.has(id)) {
    const storedText = cache.get(id);
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(storedText)}&tl=en&client=tw-ob`;
    const ttsRes = await fetch(ttsUrl);
    if (!ttsRes.ok) return res.status(500).json({ status: 'error', message: 'TTS failed' });
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${id}.mp3"`);
    const audioBuffer = await ttsRes.arrayBuffer();
    return res.send(Buffer.from(audioBuffer));
  }

  res.status(400).json({ status: 'error', message: 'Missing text or invalid id' });
}
