// services/crypto.js
// AES-256-GCM helper for encrypting knowledge payloads at rest.
const crypto = require('crypto');

const ALGO = 'aes-256-gcm';
// Key must be 32 bytes. Provide CRYPT_KEY in env (hex or base64). Fallback derives from OPENAI_API_KEY (not ideal, but practical).
function getKey() {
  const env = process.env.CRYPT_KEY || process.env.OPENAI_API_KEY || '';
  let buf;
  if (/^[0-9a-fA-F]+$/.test(env) && env.length >= 64) buf = Buffer.from(env.slice(0, 64), 'hex');
  else if (env) buf = crypto.createHash('sha256').update(env).digest();
  else buf = crypto.randomBytes(32);
  return buf;
}

function encrypt(obj) {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const plaintext = Buffer.from(JSON.stringify(obj), 'utf8');
  const enc = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([Buffer.from('01', 'hex'), iv, tag, enc]).toString('base64'); // version|iv|tag|cipher
}

function decrypt(b64) {
  const raw = Buffer.from(b64, 'base64');
  const ver = raw.slice(0,1);
  if (ver.toString('hex') !== '01') throw new Error('Unsupported version');
  const iv = raw.slice(1, 13);
  const tag = raw.slice(13, 29);
  const enc = raw.slice(29);
  const key = getKey();
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return JSON.parse(dec.toString('utf8'));
}

module.exports = { encrypt, decrypt };
