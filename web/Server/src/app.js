import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from "bcrypt";
dotenv.config();

// const hash = await bcrypt.hash("123456", 10);
// console.log(hash);

import  connection  from './config/db.js';
import { startMQTT } from "./config/mqtt.js"
// đảm bảo kết nối đến Database trước  MQTT
const start = async () => {
  try {
    await connection();

    startMQTT();

  } catch (err) {
    console.error("❌ Startup failed:", err.message);
    process.exit(1);
  }
};
start();
import sensorRoutes from './routes/sensorRoutes.js';
import deviceRoutes from "./routes/deviceRoutes.js";
// import mqttRoutes from "./routes/mqttRoutes.js";
import getRoutes from "./routes/getRoutes.js";
import authRoutes   from "./routes/authRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js"

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/sensors', sensorRoutes);
app.use("/api/device", deviceRoutes);
// app.use("/api/mqtt", mqttRoutes)
app.use("/api/auth", authRoutes);
app.use("/api/schedule", scheduleRoutes );
app.use("/api/", getRoutes);


app.get('/', (req, res) => {
  res.send("Smart IoT API Running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);
