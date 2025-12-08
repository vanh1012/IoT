import Sensor from "../models/Sensor.js";

export const getLatest = async () => {
  return await Sensor.findOne().sort({ timestamp: -1 });
};

export const getHistory = async (limit = 50) => {
  return await Sensor.find()
    .sort({ timestamp: -1 })
    .limit(limit);
};
