const WebSocket = require('ws');
const http = require('http');
const url = require('url');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Store active rooms and their connections
const rooms = new Map();

wss.on('connection', (ws, req) => {
  const queryParams = url.parse(req.url, true).query;
  const roomId = queryParams.room;
  
  if (!roomId) {
    ws.close(1008, 'Room ID required');
    return;
  }

  console.log(`Client connected to room: ${roomId}`);

  // Initialize room if it doesn't exist
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }

  // Add client to room
  rooms.get(roomId).add(ws);

  // Send room info to client
  ws.send(JSON.stringify({
    type: 'room-joined',
    roomId: roomId,
    participants: rooms.get(roomId).size
  }));

  // Broadcast to other clients in the room when someone joins
  rooms.get(roomId).forEach(client => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'participant-joined',
        roomId: roomId
      }));
    }
  });

  // Handle messages from client
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`Message from room ${roomId}:`, data.type);

      // Broadcast message to all other clients in the room
      rooms.get(roomId).forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    console.log(`Client disconnected from room: ${roomId}`);
    
    if (rooms.has(roomId)) {
      rooms.get(roomId).delete(ws);
      
      // Remove room if empty
      if (rooms.get(roomId).size === 0) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} deleted`);
      } else {
        // Notify remaining clients
        rooms.get(roomId).forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'participant-left',
              roomId: roomId
            }));
          }
        });
      }
    }
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Health check endpoint
server.on('request', (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      rooms: rooms.size,
      totalConnections: Array.from(rooms.values()).reduce((sum, room) => sum + room.size, 0)
    }));
  } else if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>WebRTC Signaling Server</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .status { padding: 10px; background: #f0f0f0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>WebRTC Signaling Server</h1>
        <div class="status">
          <p><strong>Status:</strong> Running</p>
          <p><strong>Active Rooms:</strong> ${rooms.size}</p>
          <p><strong>Total Connections:</strong> ${Array.from(rooms.values()).reduce((sum, room) => sum + room.size, 0)}</p>
        </div>
        <p>WebSocket endpoint: ws://localhost:8080/ws</p>
      </body>
      </html>
    `);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`WebRTC Signaling Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
