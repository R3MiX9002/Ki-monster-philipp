const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname + '/../'));

app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  const reply = `Antwort auf "${message}"`;
  const thoughtTree = {
    text: "Frage",
    children: [
      { text: message, children: [
        { text: "Analyse", children: [{ text: "Antwort: " + reply }] }
      ]}
    ]
  };
  res.json({ reply, thoughtTree });
});

app.listen(3000, () => console.log("Server läuft auf http://localhost:3000"));
