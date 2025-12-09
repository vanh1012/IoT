import User from "../models/User.js";
import { controlDeviceService } from "../services/deviceService.js";

export const controlDevice = async (req, res) => {
  try {
    const { type, state } = req.body;
    console.log(type, state);
    const userId = req.userId; // bạn lấy từ JWT middleware
    console.log(userId);
    // Validate input
    if (!type || typeof state !== "boolean") {
      return res.status(400).json({ message: "Invalid input: type, state required" });
    }

    // Chỉ cho phép 2 loại
    if (!["pump", "light"].includes(type)) {
      return res.status(400).json({ message: "Invalid type. Must be pump or light." });
    }

    // Update object Mongo
    const updateObj = {};
    updateObj[type] = state;

    // Update user
    const updatedUser = await User.findOneAndUpdate(
      { userId },
      updateObj,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    try {
      await controlDeviceService(type, state);
    } catch (err) {
      console.log("MQTT send failed:", err.message);
    }

    res.json({
      message: "Device updated successfully",
      device: type,
      state,
      userSettings: {
        pump: updatedUser.pump,
        light: updatedUser.light,
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
