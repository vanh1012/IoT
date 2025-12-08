import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from "bcrypt";
dotenv.config();

const hash = await bcrypt.hash("123456", 10);
console.log(hash);

import './config/db.js';
import './config/mqtt.js';
import sensorRoutes from './routes/sensorRoutes.js';
import deviceRoutes from "./routes/deviceRoutes.js";
import mqttRoutes from "./routes/mqttRoutes.js";
import projectBotRoutes from './routes/projectBotRoutes.js';
import predictionRoutes from './routes/predictionRoutes.js';

dotenv.config();
import mqttRoutes   from "./routes/mqttRoutes.js";
import authRoutes   from "./routes/authRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js"

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/sensors', sensorRoutes);
app.use("/api/device", deviceRoutes);
app.use("/api/mqtt", mqttRoutes)

app.use("/api/project-bot", projectBotRoutes);
app.use("/api/prediction", predictionRoutes);
app.use("/api/mqtt", mqttRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/schedule", scheduleRoutes);

app.get('/', (req, res) => {
  res.send("Smart IoT API Running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);
