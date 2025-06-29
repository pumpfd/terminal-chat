const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];
let totalValue = 0;
const VALUE_PER_CLICK = 69;

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
  ws.send(JSON.stringify({ type: 'value-update', value: totalValue }));

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    if (msg.setUserId) {
      userId = msg.setUserId;
      ws.userId = userId;
      ws.send(JSON.stringify({ type: 'id', id: userId }));
    }

    if (msg.type === 'add-value') {
      totalValue += VALUE_PER_CLICK;
      broadcast({ type: 'value-update', value: totalValue });
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
  console.log('🚀 ValueTrak running at http://localhost:3000');
});
