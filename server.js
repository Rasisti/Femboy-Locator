import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import Redis from "ioredis";

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const redis = new Redis();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("updateLocation", async (data) => {
    await redis.setex(`user:${socket.id}`, 300, JSON.stringify(data));
    const users = await getAllUsers();
    io.emit("usersUpdate", users);
  });

  socket.on("disconnect", async () => {
    await redis.del(`user:${socket.id}`);
    const users = await getAllUsers();
    io.emit("usersUpdate", users);
    console.log("User disconnected:", socket.id);
  });
});

const getAllUsers = async () => {
  const keys = await redis.keys("user:*");
  const users = await Promise.all(keys.map(async (key) => JSON.parse(await redis.get(key))));
  return users;
};

server.listen(3001, () => console.log("Backend running on port 3001"));
