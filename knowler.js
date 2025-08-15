// services/knowler.js
const { cache } = require('./cache');
const { upsertDoc, addChunk, getChunks, addSummary, getLatestSummary } = require('./memory');
const { askGPT } = require('../gpt-connector');
const crypto = require('crypto');

const MAX_PROCESS_BYTES = 200 * 1024 * 1024; // 200 MB pro Verarbeitung

function makeDocId(title) {
  return crypto.createHash('sha256').update(String(title) + Date.now()).digest('hex').slice(0, 16);
}

/**
 * Nimmt einen Readable-Stream (Text) entgegen, streamt bis 200 MB,
 * chunked in ~8KB, speichert in Cache + SQLite.
 */
async function ingestTextStream(stream, { title = 'ohne_titel' } = {}) {
  const docId = makeDocId(title);
  let total = 0;
  let idx = 0;
  let buffer = '';

  upsertDoc.run({ id: docId, title, size_bytes: 0 });

  for await (const chunk of stream) {
    const str = chunk.toString('utf8');
    total += Buffer.byteLength(str, 'utf8');
    if (total > MAX_PROCESS_BYTES) {
      break; // harte Grenze
    }
    buffer += str;
    // grob in 8KB Häppchen
    while (Buffer.byteLength(buffer, 'utf8') >= 8 * 1024) {
      const slice = buffer.slice(0, 8 * 1024);
      addChunk.run(docId, idx++, slice);
      buffer = buffer.slice(8 * 1024);
    }
  }
  if (buffer.length) addChunk.run(docId, idx++, buffer);

  // Doc-Size & Cache
  upsertDoc.run({ id: docId, title, size_bytes: total });
  cache.set(`doc:${docId}:meta`, { title, size_bytes: total });
  cache.set(`doc:${docId}:chunks_count`, idx);

  return { docId, bytesIngested: total, chunks: idx };
}

function reconstructDoc(docId) {
  const rows = getChunks.all(docId);
  return rows.map(r => r.content).join('');
}

function beamtendeutschPrompt(text) {
  return [
    "Fasse den folgenden Text in maximal 10 Sätzen zusammen.",
    "Stil: Beamtendeutsch (formal, passiv, abstrakt, nominalstil, präzise, unpersönlich).",
    "Keine Meinung, keine Metaphern, keine Beispiele.",
    "Sprache: Deutsch.",
    "Text:",
    text
  ].join("\n\n");
}

async function handleCommand(cmd, payload = {}) {
  switch (cmd) {
    case 'summarize_beamtendeutsch': {
      const { docId } = payload;
      const text = reconstructDoc(docId);
      if (!text) return { ok: false, error: 'Dokument nicht gefunden oder leer.' };

      const MAX_SEGMENT = 20000; // Zeichen
      if (text.length <= MAX_SEGMENT) {
        const summary = await askGPT(beamtendeutschPrompt(text));
        addSummary.run(docId, 'beamtendeutsch', summary);
        return { ok: true, summaryStyle: 'beamtendeutsch', summary };
      } else {
        const parts = chunkString(text, MAX_SEGMENT);
        const miniSummaries = [];
        for (const p of parts) {
          miniSummaries.push(await askGPT(beamtendeutschPrompt(p)));
        }
        const merged = await askGPT(beamtendeutschPrompt(miniSummaries.join('\n\n')));
        addSummary.run(docId, 'beamtendeutsch', merged);
        return { ok: true, summaryStyle: 'beamtendeutsch', summary: merged, segments: parts.length };
      }
    }
    case 'recall_summary': {
      const { docId } = payload;
      const row = getLatestSummary.get(docId, 'beamtendeutsch');
      if (!row) return { ok: false, error: 'Keine Zusammenfassung vorhanden.' };
      return { ok: true, summaryStyle: 'beamtendeutsch', summary: row.summary };
    }
    default:
      return { ok: false, error: 'Unbekannter Befehl.' };
  }
}

function chunkString(s, size) {
  const out = [];
  for (let i = 0; i < s.length; i += size) out.push(s.slice(i, i + size));
  return out;
}

module.exports = {
  ingestTextStream,
  handleCommand,
  MAX_PROCESS_BYTES
};
