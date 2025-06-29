const socket = new WebSocket(`wss://${location.host}`);
let userId = sessionStorage.getItem('userId') || null;
let lastClickTime = 0;
let totalValue = 0;

const statusText = document.getElementById('status');
const valueCounter = document.getElementById('value-counter');
const coinButton = document.getElementById('fart-button');
// Load ka-ching sound
const kaChingSound = new Audio('kaching.mp3');

// Each click adds $69
const VALUE_PER_CLICK = 690;

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
    statusText.innerHTML = `<span class="green-dot"></span> ${data.count}`;
  }

  if (data.type === 'value-update') {
    totalValue = data.value;
    valueCounter.textContent = `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  }
});

coinButton.addEventListener('click', () => {
  const now = Date.now();
  if (now - lastClickTime >= 1000) {
    socket.send(JSON.stringify({ type: 'add-value', userId }));
    lastClickTime = now;

    // Play the ka-ching sound
    kaChingSound.currentTime = 0; // rewind if it's still playing
    kaChingSound.play();
  } else {
    console.log('⏱️ Slow down, click too fast!');
  }
});
