
# 🔊 Text-to-Speech Generator

This lightweight Node.js (Next.js) API endpoint allows you to generate a unique URL for any text input, then fetches the text converted into speech (audio) using Google Translate’s Text-to-Speech (TTS) service. Perfect for quickly creating shareable TTS links or audio streams in your projects.

## 🚀 Features

- ⚡ Generates a unique short ID for any submitted text.
- 🔗 Returns a shareable URL to access the audio.
- 🔊 Fetches the audio from Google Translate TTS on-demand.
- 📦 Simple Map-based cache for temporary storage.
- 🔐 Ideal for serverless deployments or Next.js API routes.

## 🛠️ Requirements

- Node.js v14 or higher.
- Next.js or any backend supporting API routes.
- Internet access to call Google Translate TTS service.

## 📡 Usage

1. **Setup**:
   - Create a file under `pages/api/tts.js` in your Next.js project.
   - Paste the following code:

   ```js
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
   ```

2. **Run Your Server**:
   ```bash
   npm run dev
   ```

3. **Generate a TTS URL**:
   - Request with a text query:
     ```
     GET /api/tts?text=Hello%20World
     ```
   - Response:
     ```json
     {
       "status": "success",
       "url": "https://yourdomain.com/?id=abcdefgh"
     }
     ```

4. **Fetch the Audio**:
   - Use the returned URL or request with the ID:
     ```
     GET /api/tts?id=abcdefgh
     ```
   - The API will respond with an MP3 audio file of the spoken text.

## 📄 Example Response

**Request:**

```
GET /api/tts?text=Hello%20there
```

**Response:**

```json
{
  "status": "success",
  "url": "https://yourdomain.com/?id=xyz12345"
}
```

**Fetching audio:**

```
GET /api/tts?id=xyz12345
```

Returns audio/mpeg stream with speech of "Hello there".

## ⚠️ Error Handling

- Returns HTTP 400 if neither `text` nor valid `id` query params are provided.
- Returns HTTP 500 if the Google TTS service fails.
- Caches text only in-memory (Map) and resets on server restart — not persistent.

## 🛠️ Setup & Deployment

- Designed for Next.js API routes but can be adapted for any Node.js server.
- Make sure to allow outbound requests to Google Translate TTS endpoint.
- For production, consider using persistent cache or database if needed.

## 📝 License

This project is licensed under the MIT License – see the [LICENSE](https://github.com/NotFlexCoder/NotFlexCoder/blob/main/LICENSE) file for details.
