const socket = new WebSocket(`wss://${location.host}`);
let userId = sessionStorage.getItem('userId') || null;

const log = document.getElementById('log');
const input = document.getElementById('input');
const userIdDisplay = document.getElementById('user-id');
const statusText = document.getElementById('status');
const sendBtn = document.getElementById('send-btn');

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
    log.scrollTop = log.scrollHeight;
  }

  if (data.type === 'user-count') {
    statusText.innerHTML = `<span class="green-dot"></span> LIVE (${data.count})`;
  }

  if (data.type === 'banner') {
    showBanner(data.message);
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

// Banner controls from global scope
function showBanner(message) {
  const banner = document.getElementById('banner-bar');
  const bannerText = document.getElementById('banner-message');
  bannerText.textContent = message;
  banner.classList.remove('hidden');
  document.body.classList.add('banner-visible');
}

function closeBanner() {
  document.getElementById('banner-bar').classList.add('hidden');
  document.body.classList.remove('banner-visible');
}
