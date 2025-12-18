import { publishSettings } from "../config/mqtt.js";

export const controlDeviceService = async (type, state) => {
  const settings = {
    [type]: state
  };

  publishSettings(settings);

  return settings;
};

import User from "../models/User.js";

export const updateThresholds = async (req, res) => {
  try {
    const userId = req.userId;

    const {
      tempThresholdLowC,
      tempThresholdHighC,
      soilThresholdLowPercent,
      soilThresholdHighPercent,
      humidThresholdLowPercent,
      humidThresholdHighPercent
    } = req.body;

    // Validate đủ 6 giá trị
    if (
      tempThresholdLowC == null ||
      tempThresholdHighC == null ||
      soilThresholdLowPercent == null ||
      soilThresholdHighPercent == null ||
      humidThresholdLowPercent == null ||
      humidThresholdHighPercent == null
    ) {
      return res.status(400).json({ message: "Missing threshold values" });
    }

    // Update DB
    const updatedUser = await User.findOneAndUpdate(
      { userId },
      {
        tempThresholdLowC,
        tempThresholdHighC,
        soilThresholdLowPercent,
        soilThresholdHighPercent,
        humidThresholdLowPercent,
        humidThresholdHighPercent,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Thresholds updated successfully",
      thresholds: {
        tempThresholdLowC: updatedUser.tempThresholdLowC,
        tempThresholdHighC: updatedUser.tempThresholdHighC,
        soilThresholdLowPercent: updatedUser.soilThresholdLowPercent,
        soilThresholdHighPercent: updatedUser.soilThresholdHighPercent,
        humidThresholdLowPercent: updatedUser.humidThresholdLowPercent,
        humidThresholdHighPercent: updatedUser.humidThresholdHighPercent
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


