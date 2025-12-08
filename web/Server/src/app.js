import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import './config/db.js';
import './config/mqtt.js';
import sensorRoutes from './routes/sensorRoutes.js';
import deviceRoutes from "./routes/deviceRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/sensors', sensorRoutes);
app.use("/api/device", deviceRoutes);

app.get('/', (req, res) => {
  res.send("Smart IoT API Running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
