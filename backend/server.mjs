import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
const UPLOADLOG = 'upload-log.json';
import { JSONFilePreset } from 'lowdb/node';
import { recoverPersonalSignature } from '@metamask/eth-sig-util';
import { bufferToHex } from 'ethereumjs-util';
import { create } from 'ipfs-http-client';

const db = await JSONFilePreset('wallet-logins.json', { logins: [] });

const app = express();
app.use(cors());
app.use(express.json());

// Setup multer to save files in /uploads
const upload = multer({ dest: 'uploads/' });

// Create IPFS client
const ipfs = create({ url: 'http://localhost:5001' });

/**
 * Wallet login logging
 */
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

/**
 * Admin view of login records
 */
app.get('/api/logins', async (_req, res) => {
  await db.read();
  res.json(db.data.logins);
});

/**
 * Upload with MetaMask signature verification + IPFS storage + upload log
 */
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

/**
 * Return all uploads (filename, cid, address, date) for admin/frontend usage
 */
app.get('/api/uploads', (req, res) => {
  if (!fs.existsSync(UPLOADLOG)) {
    return res.json([]);
  }
  const allUploads = JSON.parse(fs.readFileSync(UPLOADLOG, "utf-8"));
  res.json(allUploads);
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
