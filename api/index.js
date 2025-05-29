export default async function handler(req, res) {
  const { id, text } = req.query;
  if (text) {
    const randomId = Math.random().toString(36).substring(2, 10);
    return res.redirect(`/api?id=${randomId}&text=${encodeURIComponent(text)}`);
  }
  if (!id || !req.query.text) return res.status(400).send('Missing text');
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(req.query.text)}&tl=en&client=tw-ob`;
  const ttsRes = await fetch(ttsUrl);
  if (!ttsRes.ok) return res.status(500).send('TTS failed');
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Content-Disposition', `attachment; filename="voice.mp3"`);
  const audioBuffer = await ttsRes.arrayBuffer();
  res.send(Buffer.from(audioBuffer));
}
