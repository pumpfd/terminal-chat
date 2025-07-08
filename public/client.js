const socket = new WebSocket(`wss://${location.host}`);
let userId = sessionStorage.getItem('userId') || null;

const log = document.getElementById('log');
const input = document.getElementById('input');
const userIdDisplay = document.getElementById('user-id');
const sendBtn = document.getElementById('send-btn');

let cooldown = false;
const cooldownTime = 4; // in seconds

// When connected, send existing user ID if we have one
socket.addEventListener('open', () => {
  if (userId) {
    socket.send(JSON.stringify({ setUserId: userId }));
  }
});

// When receiving messages
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
    log.scrollTop = log.scrollHeight;
  }

  if (data.type === 'count') {
    const status = document.getElementById('status');
    status.innerHTML = `<span class="green-dot"></span> LIVE (${data.count})`;
  }
});

// Send message with cooldown
function sendMessage() {
  if (cooldown || input.value.trim() === '') return;

  socket.send(input.value.trim());
  input.value = '';

  cooldown = true;
  sendBtn.disabled = true;
  let timeLeft = cooldownTime;

  const originalText = sendBtn.textContent;
  sendBtn.textContent = `${timeLeft}s`;

  const countdown = setInterval(() => {
    timeLeft--;
    sendBtn.textContent = `${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(countdown);
      cooldown = false;
      sendBtn.disabled = false;
      sendBtn.textContent = originalText;
    }
  }, 1000);
}

// Event listeners
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});
sendBtn.addEventListener('click', sendMessage);
