const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];
let chatHistory = [];

function broadcast(data) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on('connection', (ws) => {
  let userId = 'User-' + Math.floor(Math.random() * 10000);

  clients.push(ws);
  broadcast({ type: 'user-count', count: clients.length });

  ws.send(JSON.stringify({ type: 'id', id: userId }));
  chatHistory.forEach(historyMsg => {
    ws.send(JSON.stringify({ type: 'message', text: historyMsg }));
  });

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch (e) {
      if (userId) {
        const fullMessage = `${userId}: ${raw}`;
        chatHistory.push(fullMessage);
        if (chatHistory.length > 500) chatHistory.shift(); // Limit to 500
        broadcast({ type: 'message', text: fullMessage });
      }
      return;
    }

    if (msg.setUserId) {
      userId = msg.setUserId;
      ws.userId = userId;
      ws.send(JSON.stringify({ type: 'id', id: userId }));
    }
  });

  ws.on('close', () => {
    clients = clients.filter(c => c !== ws);
    broadcast({ type: 'user-count', count: clients.length });
  });

  ws.on('error', () => {
    clients = clients.filter(c => c !== ws);
    broadcast({ type: 'user-count', count: clients.length });
  });
});

app.use(express.static(path.join(__dirname, 'public')));

server.listen(3000, () => {
  console.log('✅ Terminal chat running at http://localhost:3000');
});
