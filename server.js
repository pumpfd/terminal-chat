const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];

wss.on('connection', (ws) => {
  const userId = 'User-' + Math.floor(Math.random() * 10000);
  ws.userId = userId;
  console.log(`${userId} connected.`);
  
  ws.send(JSON.stringify({ type: 'id', id: userId }));

  ws.on('message', (msg) => {
    const message = `${userId}: ${msg}`;
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'message', text: message }));
      }
    });
  });

  clients.push(ws);

  ws.on('close', () => {
    console.log(`${userId} disconnected.`);
    clients = clients.filter(c => c !== ws);
  });
});

app.use(express.static(path.join(__dirname, 'public')));

server.listen(3000, () => {
  console.log('✅ Terminal chat running at http://localhost:3000');
});