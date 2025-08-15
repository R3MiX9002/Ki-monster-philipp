const { askGPT } = require('./gpt-connector');

async function processMessage(message, gpt = false) {
  let reply = 'Verstanden: ' + message;
  if (gpt) {
    reply = await askGPT('Antworte systematisch auf: ' + message);
  }
  const tree = {
    text: 'Start',
    children: [
      { text: 'Deduktiv: Beispiel 1' },
      { text: 'Induktiv: Beispiel 2' },
      { text: 'Abduktiv: Beispiel 3' }
    ]
  };
  return { reply, tree };
}

module.exports = { processMessage };