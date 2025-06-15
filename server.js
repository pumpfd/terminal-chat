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
  let userId = null;

  // Wait for messages from this client
  ws.on('message', (raw) => {
    let msg;

    try {
      msg = JSON.parse(raw);
    } catch (e) {
      // Not JSON — treat as plain chat message
      if (userId) {
        const fullMessage = `${userId}: ${raw}`;
        chatHistory.push(fullMessage);

        // Broadcast to all clients
        clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'message', text: fullMessage }));
          }
        });
      }
      return;
    }

    // Handle special message: setUserId
    if (msg.setUserId) {
      userId = msg.setUserId;
      ws.userId = userId;
      console.log(`${userId} connected.`);

      // Confirm back to client
      ws.send(JSON.stringify({ type: 'id', id: userId }));

      // Send chat history to this new connection
      chatHistory.forEach(historyMsg => {
        ws.send(JSON.stringify({ type: 'message', text: historyMsg }));
      });

      return;
    }
  });

  clients.push(ws);

  ws.on('close', () => {
    clients = clients.filter(c => c !== ws);
    console.log(`${ws.userId || 'Unknown user'} disconnected.`);
  });
});

app.use(express.static(path.join(__dirname, 'public')));

server.listen(3000, () => {
  console.log('✅ Terminal chat running at http://localhost:3000');
});
