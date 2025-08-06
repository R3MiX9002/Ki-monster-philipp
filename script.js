const messages = document.getElementById('messages');
async function sendMessage() {
  const input = document.getElementById('userInput');
  const text = input.value;
  if (!text) return;
  addMessage(text, 'user');
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ message: text })
  }).then(res => res.json());
  addMessage(response.reply, 'bot');
  updateTree(response.thoughtTree);
}
function addMessage(msg, role) {
  const div = document.createElement('div');
  div.className = role;
  div.textContent = msg;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}
