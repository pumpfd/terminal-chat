const socket = new WebSocket(`ws://${location.host}`);
let userId = null;

const log = document.getElementById('log');
const input = document.getElementById('input');
const userIdDisplay = document.getElementById('user-id');
const sendBtn = document.getElementById('send-btn');

socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'id') {
    userId = data.id;
    userIdDisplay.textContent = `User: ${userId}`;
  } else if (data.type === 'message') {
    const msg = document.createElement('div');
    msg.textContent = data.text;
    log.appendChild(msg);
    log.scrollTop = log.scrollHeight;
  }
});

function sendMessage() {
  if (input.value.trim() !== '') {
    socket.send(input.value.trim());
    input.value = '';
  }
}

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

sendBtn.addEventListener('click', sendMessage);