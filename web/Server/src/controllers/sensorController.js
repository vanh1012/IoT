import { getLatest, getHistory } from "../services/sensorService.js";

export const getLatestSensorData = async (req, res) => {
  try {
    const data = await getLatest();
    if (!data) return res.status(404).json({ message: "No data found" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSensorHistory = async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  try {
    const history = await getHistory(limit);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
