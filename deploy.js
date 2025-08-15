require('dotenv').config();
const { execSync } = require('child_process');

if (!process.env.GITHUB_TOKEN) {
  console.error('❌ Fehler: Kein GITHUB_TOKEN in .env');
  process.exit(1);
}
const repo = 'R3MiX9002/Ki-monster-philipp';
const repoUrl = `https://${process.env.GITHUB_TOKEN}@github.com/${repo}.git`;

try {
  console.log('🚀 GitHub-Upload...');
  execSync('git init', { stdio: 'inherit' });
  try { execSync('git remote remove origin', { stdio: 'ignore' }); } catch {}
  execSync(`git remote add origin ${repoUrl}`, { stdio: 'inherit' });
  execSync('git add .', { stdio: 'inherit' });
  const msg = `Automatischer Upload: ${new Date().toISOString()}`;
  execSync(`git commit -m "${msg}"`, { stdio: 'inherit' });
  execSync('git branch -M main', { stdio: 'inherit' });
  execSync('git push -u origin main --force', { stdio: 'inherit' });
  console.log('✅ Upload abgeschlossen');
} catch(e) {
  console.error('❌ Upload-Fehler:', e.message || e);
  process.exit(1);
}
