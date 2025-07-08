const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];
let chatHistory = [];

wss.on('connection', (ws) => {
  let userId = 'User-' + Math.floor(Math.random() * 10000);

  ws.send(JSON.stringify({ type: 'id', id: userId }));

  clients.push(ws);
  broadcastLiveCount();

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch (e) {
      if (userId) {
        const fullMessage = `${userId}: ${raw}`;
        chatHistory.push(fullMessage);

        clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'message', text: fullMessage }));
          }
        });
      }
      return;
    }

    if (msg.setUserId) {
      userId = msg.setUserId;
      ws.userId = userId;
      console.log(`${userId} connected (existing session)`);

      ws.send(JSON.stringify({ type: 'id', id: userId }));

      chatHistory.forEach(historyMsg => {
        ws.send(JSON.stringify({ type: 'message', text: historyMsg }));
      });

      return;
    }
  });

  ws.on('close', () => {
    clients = clients.filter(c => c !== ws);
    broadcastLiveCount();
    console.log(`${userId} disconnected`);
  });
});

function broadcastLiveCount() {
  const count = clients.length;
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'liveCount', count }));
    }
  });
}

app.use(express.static(path.join(__dirname, 'public')));

server.listen(3000, () => {
  console.log('✅ Bonk Chat running at http://localhost:3000');
});
