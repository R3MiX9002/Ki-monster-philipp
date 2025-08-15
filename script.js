async function sendMessage() {
  const input = document.getElementById('userInput').value;
  const useGPT = document.getElementById('enableGPT').checked;
  const res = await fetch('/api/message', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ message: input, gpt: useGPT })
  });
  const data = await res.json();
  document.getElementById('messages').innerHTML += '<div>' + data.reply + '</div>';
}