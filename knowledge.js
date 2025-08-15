// services/knowledge.js
const Database = require('better-sqlite3');
const path = require('path');
const { encrypt, decrypt } = require('./crypto');

const db = new Database(path.join(process.cwd(), 'knowler.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS knowledge (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT,            -- 'fact' | 'law' | 'formula' | 'unit' | 'syntax' | 'definition'
  subject TEXT,         -- e.g., 'Kraft', 'Ohmsches Gesetz'
  predicate TEXT,       -- e.g., 'ist', 'hat', 'definiert_durch'
  object TEXT,          -- e.g., 'm*a', 'Widerstand proportional zur Spannung'
  units TEXT,           -- canonical units for numeric object, if any (e.g., 'N', 'm/s^2')
  payload TEXT,         -- encrypted JSON {sourceDocId, quote, line, meta}
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_knowledge_kind ON knowledge(kind);
CREATE INDEX IF NOT EXISTS idx_knowledge_subject ON knowledge(subject);
CREATE INDEX IF NOT EXISTS idx_knowledge_predicate ON knowledge(predicate);
`);

function storeKnowledge(row) {
  const stmt = db.prepare(`
    INSERT INTO knowledge (kind, subject, predicate, object, units, payload)
    VALUES (@kind, @subject, @predicate, @object, @units, @payload)
  `);
  const safe = {
    kind: row.kind || null,
    subject: row.subject || null,
    predicate: row.predicate || null,
    object: row.object || null,
    units: row.units || null,
    payload: encrypt(row.payload || {})
  };
  const info = stmt.run(safe);
  return info.lastInsertRowid;
}

function queryKnowledge({ text, kind }) {
  let sql = `SELECT id, kind, subject, predicate, object, units, payload FROM knowledge`;
  const conds = [];
  const params = {};
  if (kind) { conds.push(`kind = @kind`); params.kind = kind; }
  if (text) {
    conds.push(`(subject LIKE @q OR predicate LIKE @q OR object LIKE @q)`);
    params.q = `%${text}%`;
  }
  if (conds.length) sql += ` WHERE ` + conds.join(` AND `);
  sql += ` ORDER BY id DESC LIMIT 200`;
  const rows = db.prepare(sql).all(params);
  return rows.map(r => ({...r, payload: decrypt(r.payload)}));
}

module.exports = { storeKnowledge, queryKnowledge, db };
