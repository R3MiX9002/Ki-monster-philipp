require('dotenv').config();
const fetch = require('node-fetch');

function headers() {
  return {
    'Authorization': `Bearer ${process.env.GITHUB_TOKEN || ''}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'KI-Monster-Philipp'
  };
}

async function safeJson(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { error: text }; }
}

async function getGitHubUser() {
  const res = await fetch('https://api.github.com/user', { headers: headers() });
  return safeJson(res);
}

async function getRepos() {
  const res = await fetch('https://api.github.com/user/repos?per_page=100', { headers: headers() });
  return safeJson(res);
}

module.exports = { getGitHubUser, getRepos };
