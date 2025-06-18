const socket = new WebSocket(`wss://${location.host}`);
let userId = sessionStorage.getItem('userId') || null;
let lastFartTime = 0;

const statusText = document.getElementById('status');
const fartCounter = document.getElementById('fart-counter');
const fartButton = document.getElementById('fart-button');

// Load fart sound
const fartSound = new Audio('fart.mp3');

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
  }

  if (data.type === 'user-count') {
    statusText.innerHTML = `<span class="green-dot"></span> Farters: ${data.count}`;
  }

  if (data.type === 'fart-count') {
    fartCounter.textContent = `Farts: ${data.count}`;
  }
});

fartButton.addEventListener('click', () => {
  const now = Date.now();
  if (now - lastFartTime >= 5000) {
    socket.send(JSON.stringify({ type: 'fart', userId }));
    lastFartTime = now;
    fartSound.currentTime = 0;
    fartSound.play();
  } else {
    console.log('⏱️ Please wait before farting again...');
  }
});
