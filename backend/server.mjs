import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import { JSONFilePreset } from 'lowdb/node';
import { recoverPersonalSignature } from '@metamask/eth-sig-util';
import { bufferToHex } from 'ethereumjs-util';
import { create } from "ipfs-http-client";

const UPLOADLOG = 'upload-log.json';
const db = await JSONFilePreset('wallet-logins.json', { logins: [] });

const app = express();

// === CORS configuration - Only ONE block, right after app is created ===
app.use(cors({
  origin: "https://decentralized-dropbox-gib9b2qsm-aasthas-projects-456487e7.vercel.app/",
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
// =======================================================================

const upload = multer({ dest: 'uploads/' });
const ipfs = create({ url: 'http://localhost:5001' });

// -- Routes --

app.post('/api/login', async (req, res) => {
  const { address } = req.body;
  if (!address) {
    return res.status(400).json({ error: 'Missing address' });
  }
  if (!db.data.logins.some(l => l.address === address)) {
    db.data.logins.push({
      address,
      time: new Date().toISOString(),
    });
    await db.write();
  }
  res.json({ success: true });
});

app.get('/api/logins', async (_req, res) => {
  await db.read();
  res.json(db.data.logins);
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  const { address, signature, message } = req.body;

  if (!address || !signature || !message || !req.file) {
    return res.status(400).json({ error: 'Missing fields or file' });
  }

  try {
    const msgBufferHex = bufferToHex(Buffer.from(message, 'utf8'));
    const recoveredAddress = recoverPersonalSignature({
      data: msgBufferHex,
      signature,
    });

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      fs.unlinkSync(req.file.path);
      return res.status(401).json({ error: 'Signature verification failed' });
    }

    // Pin file to IPFS
    const fileStream = fs.createReadStream(req.file.path);
    const result = await ipfs.add(fileStream);
    const cid = result.cid.toString();
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'Upload successful',
      cid,
      ipfs_url: `https://ipfs.io/ipfs/${cid}`,
    });

    // ---- Upload log: save upload details in upload-log.json ----
    try {
      const entry = {
        filename: req.file.originalname,
        cid,
        address,
        date: new Date().toISOString()
      };
      let old = [];
      if (fs.existsSync(UPLOADLOG)) {
        old = JSON.parse(fs.readFileSync(UPLOADLOG, "utf-8"));
      }
      old.unshift(entry);
      fs.writeFileSync(UPLOADLOG, JSON.stringify(old.slice(0, 1000), null, 2));
    } catch (e) {
      console.error("Error logging upload:", e);
    }
    // ----------------------------------------------------------

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/api/uploads', (req, res) => {
  if (!fs.existsSync(UPLOADLOG)) {
    return res.json([]);
  }
  const allUploads = JSON.parse(fs.readFileSync(UPLOADLOG, "utf-8"));
  res.json(allUploads);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
