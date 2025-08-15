// services/memory.js
const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(process.cwd(), 'knowler.db'));

db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS docs (
  id TEXT PRIMARY KEY,
  title TEXT,
  size_bytes INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS chunks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doc_id TEXT,
  idx INTEGER,
  content TEXT,
  FOREIGN KEY(doc_id) REFERENCES docs(id)
);
CREATE TABLE IF NOT EXISTS summaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doc_id TEXT,
  style TEXT,
  summary TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(doc_id) REFERENCES docs(id)
);
CREATE TABLE IF NOT EXISTS kv (
  k TEXT PRIMARY KEY,
  v TEXT
);
`);

const upsertDoc = db.prepare(`
INSERT INTO docs(id, title, size_bytes) VALUES(@id, @title, @size_bytes)
ON CONFLICT(id) DO UPDATE SET title=excluded.title, size_bytes=excluded.size_bytes;
`);
const addChunk = db.prepare(`INSERT INTO chunks(doc_id, idx, content) VALUES(?, ?, ?);`);
const getChunks = db.prepare(`SELECT content FROM chunks WHERE doc_id=? ORDER BY idx;`);
const addSummary = db.prepare(`INSERT INTO summaries(doc_id, style, summary) VALUES(?,?,?);`);
const getLatestSummary = db.prepare(`
  SELECT summary FROM summaries WHERE doc_id=? AND style=? ORDER BY id DESC LIMIT 1;
`);

module.exports = {
  upsertDoc,
  addChunk,
  getChunks,
  addSummary,
  getLatestSummary,
  db
};
