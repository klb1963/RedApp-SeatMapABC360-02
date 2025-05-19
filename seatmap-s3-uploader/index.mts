// index.mts

import express from 'express';
import type { Request, Response } from 'express';
import { uploadXmlToS3 } from './uploadToS3.mjs';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['POST'],
  allowedHeaders: ['Content-Type', 'X-Auth']
}));

const PORT = 4000;

// 🧠 поддержка XML body
app.use(express.text({
  type: 'application/xml',
  limit: '2mb'  // или больше, если нужно
}));

app.post('/upload', async function (req: Request, res: Response) {
  const authHeader = req.headers['x-auth'];
  if (authHeader !== 'leonid-secret') {
    return res.status(403).send('Forbidden');
  }

  const xml = req.body;

  try {
    const filename = await uploadXmlToS3(xml);
    res.status(200).send(`Uploaded as ${filename}`);
  } catch (err) {
    console.error('❌ Upload failed:', err);
    res.status(500).send('Upload failed');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Uploader server running at http://localhost:${PORT}`);
});