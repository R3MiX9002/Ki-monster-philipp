// services/cryptwriter.js
// Query knowledge, reason with units, and produce structured outputs.
const { queryKnowledge } = require('./knowledge');
const { parseQuantity } = require('./units');
const { askGPT } = require('../gpt-connector');

async function answerWithKnowledge({ question, useGPT = true }) {
  // naive keyword search against subject/predicate/object
  const hits = queryKnowledge({ text: question });

  // Try simple inline computation if a quantity is present in the question.
  const m = question.match(/([0-9][0-9\.\se\+\-]*\s*[A-Za-z\/\^\*0-9]+)/g);
  const quantities = (m || []).map(parseQuantity).filter(Boolean);

  let calcNote = null;
  if (quantities.length >= 1) {
    // No full dimensional engine here; show parsed quantities as a starting point.
    calcNote = `Erkannte Größen: ${quantities.map(q => q.value + ' ' + q.unit).join(', ')}`;
  }

  if (useGPT) {
    const context = hits.slice(0, 12).map(h => {
      const src = h.payload?.sourceDocId ? ` [doc:${h.payload.sourceDocId} l${h.payload.line||'?'}]` : '';
      const u = h.units ? ` [${h.units}]` : '';
      return `• (${h.kind}) ${h.subject} ${h.predicate} ${h.object}${u}${src}`;
    }).join('\n');

    const prompt = [
      "Beantworte die Nutzerfrage faktenbasiert.",
      "Nutze, wenn sinnvoll, die folgenden Wissensfragmente (konsolidiere, fasse zusammen, widersprüche klar benennen):",
      context || "(keine Treffer)",
      "Wenn physikalische oder mathematische Regeln relevant sind, formuliere sie explizit.",
      "Einheiten: SI-Metrik. Rechenschritte nachvollziehbar, kurze Gleichungen.",
      "Sprache: Deutsch. Ton: sachlich-präzise.",
      calcNote ? `Hinweis: ${calcNote}` : ""
    ].filter(Boolean).join("\n\n");

    const reply = await askGPT(prompt);
    return { reply, hits };
  } else {
    // Non-GPT fallback: dump top hits
    const reply = hits.length
      ? "Gefundene Wissensfragmente:\n" + hits.slice(0, 10).map(h => `- (${h.kind}) ${h.subject} ${h.predicate} ${h.object}${h.units? ' ['+h.units+']':''}`).join('\n')
      : "Keine passenden Wissensfragmente gefunden.";
    return { reply, hits };
  }
}

module.exports = { answerWithKnowledge };
