const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files (for your HTML, CSS, and JS)
app.use(express.static('public'));

// When a user connects, listen for their location updates
io.on('connection', (socket) => {
  console.log('a user connected');

  // When a user sends their location, broadcast it to everyone else
  socket.on('location', (data) => {
    console.log('User location: ', data);
    io.emit('location', data); // Broadcast location data to all clients
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Listen on port 3000
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
