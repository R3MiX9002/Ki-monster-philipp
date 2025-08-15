const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

async function askGPT(prompt) {
  const res = await openai.createChatCompletion({
    model: process.env.MODEL || 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  });
  return res.data.choices[0].message.content;
}

module.exports = { askGPT };