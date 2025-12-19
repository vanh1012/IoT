/* eslint-disable no-undef */
/* eslint-env node */
import dotenv from 'dotenv';
dotenv.config();

import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import connection from "./config/db.js";
import { startMQTT } from "./config/mqtt.js";

console.log(process.env.GMAIL_USER)
const PORT = 5000;

// 1. Tạo http server
const server = http.createServer(app);

// 2. Gắn socket
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// 3. Socket events
io.on("connection", (socket) => {
  console.log("🟢 Web connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Web disconnected:", socket.id);
  });
});

// 4. Start toàn bộ hệ thống
const start = async () => {
  try {
    await connection();
    console.log("✅ Database connected");

    startMQTT();
    console.log("✅ MQTT started");

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup failed:", err.message);
    process.exit(1);
  }
};

start();
