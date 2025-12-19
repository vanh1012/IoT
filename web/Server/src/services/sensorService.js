import Sensor from "../models/Sensor.js";
import { io } from "../socket.js";   

export const getLatest = async () => {
  return await Sensor.findOne().sort({ timestamp: -1 });
};

export const getHistory = async (limit = 50) => {
  return await Sensor.find()
    .sort({ timestamp: -1 })
    .limit(limit);
};

export const saveIfChanged = async (newData) => {
  const latest = await getLatest();

  // 1. Chưa có dữ liệu nào trong DB
  if (!latest) {
    const saved = await Sensor.create(newData);

    io.emit("sensor_latest", saved); // 🔥 realtime
    return saved;
  }

  // 2. So sánh
  const isDifferent =
    latest.soilMoisture !== newData.soilMoisture ||
    latest.airHumidity !== newData.airHumidity ||
    latest.airTemperature !== newData.airTemperature;

  if (!isDifferent) {
    return false; // ❌ không lưu, không emit
  }

  // 3. Có thay đổi → lưu
  const saved = await Sensor.create(newData);

  // 4. Emit realtime
  io.emit("sensor_latest", saved);

  return saved;
};
