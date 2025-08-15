require('dotenv').config();
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { google } = require('@googleapis/drive');

const CACHE_DIR = path.resolve(process.cwd(), 'cache');
const CACHE_MAX_BYTES = parseInt(process.env.CACHE_MAX_BYTES || '2000000000', 10); // 2GB
const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID || null;

if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

function makeDriveClient() {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/drive.file']
  });
  const drive = google.drive({ version: 'v3', auth });
  return drive;
}

async function driveList() {
  try {
    const drive = makeDriveClient();
    const q = DRIVE_FOLDER_ID ? `'${DRIVE_FOLDER_ID}' in parents and trashed=false` : `trashed=false`;
    const { data } = await drive.files.list({ q, fields: 'files(id, name, mimeType, size)' });
    return data.files || [];
  } catch (e) {
    console.error('driveList error:', e.message || e);
    return null;
  }
}

async function driveUpload(localPath) {
  try {
    const drive = makeDriveClient();
    const name = path.basename(localPath);
    const fileMetadata = { name };
    if (DRIVE_FOLDER_ID) fileMetadata.parents = [DRIVE_FOLDER_ID];
    const media = { body: fs.createReadStream(localPath) };
    const { data } = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, name'
    });
    return data;
  } catch (e) {
    console.error('driveUpload error:', e.message || e);
    throw e;
  }
}

async function driveGet(fileId) {
  try {
    const drive = makeDriveClient();
    const outPath = path.join(CACHE_DIR, `${fileId}.download`);
    const dest = fs.createWriteStream(outPath);
    await new Promise((resolve, reject) => {
      drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' },
        (err, res) => {
          if (err) return reject(err);
          res.data.on('end', resolve).on('error', reject).pipe(dest);
        });
    });
    return { path: outPath };
  } catch (e) {
    console.error('driveGet error:', e.message || e);
    throw e;
  }
}

function dirSizeBytes(dir) {
  return fs.readdirSync(dir).reduce((acc, f) => {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    return acc + (st.isFile() ? st.size : 0);
  }, 0);
}

function enforceCacheLimit() {
  try {
    let size = dirSizeBytes(CACHE_DIR);
    if (size <= CACHE_MAX_BYTES) return;
    const entries = fs.readdirSync(CACHE_DIR).map(f => ({
      name: f,
      path: path.join(CACHE_DIR, f),
      mtime: fs.statSync(path.join(CACHE_DIR, f)).mtimeMs,
      size: fs.statSync(path.join(CACHE_DIR, f)).size
    })).sort((a,b)=>a.mtime-b.mtime);
    for (const e of entries) {
      if (size <= CACHE_MAX_BYTES) break;
      try {
        fs.unlinkSync(e.path);
        size -= e.size;
      } catch {}
    }
  } catch (e) {
    console.error('enforceCacheLimit error:', e.message || e);
  }
}

function startCacheWatcher() {
  const watcher = chokidar.watch(CACHE_DIR, { ignoreInitial: true, persistent: true });
  watcher.on('add', async (p) => {
    try {
      const st = fs.statSync(p);
      if (!st.isFile()) return;
      await driveUpload(p);
      enforceCacheLimit();
    } catch (e) {
      console.error('watcher upload error:', e.message || e);
    }
  });
  console.log('Drive Cache Watcher aktiv in:', CACHE_DIR);
}

module.exports = { startCacheWatcher, driveList, driveUpload, driveGet };
