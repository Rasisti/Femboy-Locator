const express = require("express");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
const server = require("http").createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

let users = {}; // Store active users

wss.on("connection", (ws) => {
    console.log("New user connected");

    ws.on("message", (data) => {
        const msg = JSON.parse(data);

        if (msg.type === "updateLocation") {
            users[msg.username] = {
                lat: msg.lat,
                lon: msg.lon,
                pic: msg.pic,
            };

            // Broadcast updated users to all clients
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: "users", users }));
                }
            });
        }
    });

    ws.on("close", () => {
        console.log("User disconnected");
        // Remove user from list
        for (let user in users) {
            if (users[user].ws === ws) {
                delete users[user];
            }
        }
    });
});

app.get("/", (req, res) => {
    res.send("WebSocket server running!");
});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});
