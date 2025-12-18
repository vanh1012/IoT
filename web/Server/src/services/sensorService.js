import Sensor from "../models/Sensor.js";

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

  if (!latest) {
    return await Sensor.create(newData);
  }

  const isDifferent =
    latest.soilMoisture !== newData.soilMoisture ||
    latest.airHumidity !== newData.airHumidity ||
    latest.airTemperature !== newData.airTemperature;

  if (!isDifferent) return false; 
  await Sensor.create(newData);
};