require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { processMessage } = require('./services/logic-engine');
const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/message', async (req, res) => {
  const { message, gpt } = req.body;
  const result = await processMessage(message, gpt);
  res.json(result);
});

app.listen(3000, () => console.log('KI-Monster Philipp läuft auf http://localhost:3000'));