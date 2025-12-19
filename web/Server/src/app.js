import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();

import sensorRoutes from "./routes/sensorRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import projectBotRoutes from "./routes/projectBotRoutes.js";
import predictionRoutes from "./routes/predictionRoutes.js";
import getRoutes from "./routes/getRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";

import "./services/scheduleCron.js";




app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

app.use("/api/sensors", sensorRoutes);
app.use("/api/device", deviceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/", getRoutes);
app.use("/api/project-bot", projectBotRoutes);
app.use("/api/prediction", predictionRoutes);

app.get("/", (req, res) => {
  res.send("Smart IoT API Running!");
});

export default app; // 🔥 RẤT QUAN TRỌNG
