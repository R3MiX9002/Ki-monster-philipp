// services/cache.js
const LRU = require('lru-cache');

const MAX_CACHE_BYTES = 500 * 1024 * 1024; // 500 MB

const cache = new LRU({
  maxSize: MAX_CACHE_BYTES,
  sizeCalculation: (value, key) => {
    if (typeof value === 'string') return Buffer.byteLength(value, 'utf8');
    if (Buffer.isBuffer(value)) return value.length;
    try {
      const s = JSON.stringify(value);
      return Buffer.byteLength(s, 'utf8');
    } catch {
      return 1024; // fallback
    }
  }
});

module.exports = { cache, MAX_CACHE_BYTES };
