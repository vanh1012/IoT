import Log from '../models/Log.js';
import Sensor from '../models/Sensor.js'
export const getLogs = async (req, res) => {
  try {
    const logs = await Log.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getSensorChart24h = async (req, res) => {
  try {
    const MAX_SAMPLES = 30;

    const latest = await Sensor.findOne().sort({ timestamp: -1 });
    if (!latest) return res.json([]);

    // 2. Mốc 24h trước
    const fromTime = new Date(latest.timestamp.getTime() - 24 * 60 * 60 * 1000);

    // 3. Lấy tất cả dữ liệu 24h (cũ -> mới)
    const data = await Sensor.find({
      timestamp: { $gte: fromTime, $lte: latest.timestamp },
    }).sort({ timestamp: 1 });

    let sampled = downSample(data.reverse(), MAX_SAMPLES);

    res.json({
      returned: sampled.length,
      data: sampled,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const downSample = (data, maxSamples) => {
  if (data.length <= maxSamples) return data;

  const step = Math.floor(data.length / maxSamples);
  const result = [];

  for (let i = 0; i < data.length && result.length < maxSamples; i += step) {
    result.push(data[i]);
  }

  return result;
};
