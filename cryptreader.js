// services/cryptreader.js
// Extract structured knowledge from plain text and store it encrypted.
const { storeKnowledge } = require('./knowledge');
const { parseQuantity } = require('./units');

// Heuristics for equations, facts, units, and syntax.
function extractFromText(docId, text) {
  const lines = String(text).split(/\r?\n/);
  const inserted = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // 1) Equations / formulas: e.g., F = m * a
    if (/^[A-Za-z][A-Za-z0-9_ ]*\s*=\s*[^=]+$/.test(trimmed)) {
      const [lhs, rhs] = trimmed.split('=').map(s => s.trim());
      inserted.push(storeKnowledge({
        kind: 'formula',
        subject: lhs,
        predicate: 'definiert_durch',
        object: rhs,
        units: null,
        payload: { sourceDocId: docId, quote: trimmed, line: i + 1 }
      }));
    }

    // 2) Simple declarative facts: "X ist Y" / "X sind Y"
    const ist = trimmed.match(/^(.+?)\s+(ist|sind)\s+(.+?)\.?$/i);
    if (ist) {
      inserted.push(storeKnowledge({
        kind: 'fact',
        subject: ist[1],
        predicate: ist[2].toLowerCase(),
        object: ist[3],
        units: null,
        payload: { sourceDocId: docId, quote: trimmed, line: i + 1 }
      }));
    }

    // 3) Quantities with units
    const q = parseQuantity(trimmed);
    if (q) {
      inserted.push(storeKnowledge({
        kind: 'unit',
        subject: 'quantity',
        predicate: 'has',
        object: String(q.value),
        units: q.unit,
        payload: { sourceDocId: docId, quote: trimmed, line: i + 1 }
      }));
    }

    // 4) Code-like syntax patterns (very rough): function declarations
    if (/function\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(/.test(trimmed) || /^\s*class\s+[A-Za-z_]/.test(trimmed)) {
      inserted.push(storeKnowledge({
        kind: 'syntax',
        subject: 'code',
        predicate: 'pattern',
        object: trimmed.slice(0, 120),
        units: null,
        payload: { sourceDocId: docId, quote: trimmed, line: i + 1 }
      }));
    }
  });

  return inserted;
}

module.exports = { extractFromText };
