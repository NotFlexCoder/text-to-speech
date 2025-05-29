export default async function handler(req, res) {
  const { id, text } = req.query;

  if (text) {
    const randomId = Math.random().toString(36).substring(2, 10);
    const url = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api?id=${randomId}&text=${encodeURIComponent(text)}`;
    return res.json({ url });
  }

  if (id && req.query.text) {
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(req.query.text)}&tl=en&client=tw-ob`;
    const ttsRes = await fetch(ttsUrl);
    if (!ttsRes.ok) return res.status(500).send('TTS failed');
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'attachment; filename="voice.mp3"');
    const buffer = await ttsRes.arrayBuffer();
    return res.send(Buffer.from(buffer));
  }

  res.status(400).json({ error: 'Missing ?text= or ?id= and text' });
}
