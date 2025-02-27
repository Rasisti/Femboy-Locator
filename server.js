// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files (HTML, CSS, JS) from the 'public' directory
app.use(express.static('public'));

// When a user connects, listen for their location updates
io.on('connection', (socket) => {
  console.log('A user connected');

  // When a user sends their location, broadcast it to everyone else
  socket.on('location', (data) => {
    console.log('User location: ', data);
    io.emit('location', data); // Broadcast location data to all clients
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Listen on port 3000
server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
