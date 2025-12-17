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
    const now = new Date();
    const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const history = await Sensor.aggregate([
      {
        $match: {
          timestamp: { $gte: startTime }
        }
      },
      {
        $project: {
          hour: {
            $dateTrunc: {
              date: "$timestamp",
              unit: "hour",
              binSize: 4
            }
          },
          airTemperature: 1,
          airHumidity: 1,
          soilMoisture: 1
        }
      },
      {
        $sort: { timestamp: 1 }
      },
      {
        $group: {
          _id: "$hour",
          temp: { $last: "$airTemperature" },
          humid: { $last: "$airHumidity" },
          soil: { $last: "$soilMoisture" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const map = {};
    history.forEach(item => {
      map[item._id.toISOString()] = item;
    });

    const data = [];

    for (let i = 5; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 4 * 60 * 60 * 1000);
      hour.setMinutes(0, 0, 0);

      const key = hour.toISOString();

      if (map[key]) {
        data.push({
          hour,
          temp: map[key].temp,
          humid: map[key].humid,
          soil: map[key].soil
        });
      } else {
        data.push({
          hour,
          temp: null,
          humid: null,
          soil: null
        });
      }
    }

    res.json({
      success: true,
      range: "last_24_hours",
      interval: "4_hours",
      data
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
