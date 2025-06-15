const socket = new WebSocket(`wss://${location.host}`);
let userId = sessionStorage.getItem('userId') || null;

const log = document.getElementById('log');
const input = document.getElementById('input');
const userIdDisplay = document.getElementById('user-id');
const sendBtn = document.getElementById('send-btn');

let hasLoadedHistory = false;

socket.addEventListener('open', () => {
  if (userId) {
    socket.send(JSON.stringify({ setUserId: userId }));
  }
});

socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'id') {
    if (!userId) {
      userId = data.id;
      sessionStorage.setItem('userId', userId);
    }
    userIdDisplay.textContent = `User: ${userId}`;
  }

  if (data.type === 'message') {
    const msg = document.createElement('div');
    msg.textContent = data.text;
    log.appendChild(msg);

    // Scroll to bottom - smooth only on initial history load
    if (!hasLoadedHistory) {
      requestAnimationFrame(() => {
        log.scrollTo({ top: log.scrollHeight, behavior: 'smooth' });
      });
    } else {
      log.scrollTop = log.scrollHeight;
    }
  }

  // Once messages start appearing, mark history as loaded
  if (!hasLoadedHistory) {
    hasLoadedHistory = true;
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
