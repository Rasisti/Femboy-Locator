const map = L.map('map').setView([0, 0], 2); // Default center and zoom level

// Load OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let userMarker;
let userMarkers = {}; // Store markers for other users by their socket ID

const socket = io();  // Connect to the WebSocket server

// Function to update the user's location on the map
function updateUserLocation(lat, lon) {
  if (!userMarker) {
    userMarker = L.marker([lat, lon]).addTo(map);
  } else {
    userMarker.setLatLng([lat, lon]);
  }
  map.setView([lat, lon], 15); // Adjust map view to zoom in on the user
}

// Broadcast location to the backend and other users
function broadcastLocation(lat, lon) {
  socket.emit('location', { lat, lon });
}

// Get user's current position with high accuracy
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      updateUserLocation(lat, lon);
      broadcastLocation(lat, lon); // Send location to backend
    },
    function (error) {
      console.error('Error getting location', error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000
    }
  );
} else {
  alert('Geolocation is not supported by this browser.');
}

// Listen for other users' locations from the server
socket.on('location', (data) => {
  const { id, lat, lon } = data;
  
  // If marker doesn't exist for this user, create one
  if (!userMarkers[id]) {
    userMarkers[id] = L.marker([lat, lon]).addTo(map);
  } else {
    // If marker exists, update position
    userMarkers[id].setLatLng([lat, lon]);
  }
});

// Listen for the initial location of all users when a new user connects
socket.on('allLocations', (users) => {
  for (const id in users) {
    const { lat, lon } = users[id];
    if (!userMarkers[id]) {
      userMarkers[id] = L.marker([lat, lon]).addTo(map);
    }
  }
});

// Listen for when a user disconnects
socket.on('removeMarker', (id) => {
  if (userMarkers[id]) {
    map.removeLayer(userMarkers[id]);
    delete userMarkers[id];
  }
});
