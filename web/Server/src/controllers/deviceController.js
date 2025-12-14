import User from "../models/User.js";
import { controlDeviceService } from "../services/deviceService.js";
import { sendAlertEmail } from "../services/alertService.js";
import { publishMessage } from "../config/mqtt.js"

export const controlDevice = async (req, res) => {
  try {
    const { type, state } = req.body;
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
      updateObj,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // -------- Gửi MQTT lệnh điều khiển -------
    try {
      await controlDeviceService(type, state);
    } catch (err) {
      console.log("MQTT send failed:", err.message);
    }
    // -------- Gửi email cảnh báo -------
    try {
      const subject = `⚠️ Device ${type} was ${state ? "turned ON" : "turned OFF"}`;
      const text = `The device "${type}" has been ${state ? "activated" : "deactivated"}.\n\nTime: ${new Date().toLocaleString()}`;

      await sendAlertEmail(updatedUser.email, subject, text);
      // console.log("📩 Email sent for device control");
    } catch (err) {
      console.log("Email send failed:", err.message);
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

export const updateThreshold = async (req, res) => {
  try {
    const { temp, humid, soil } = req.body;

    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update DB theo từng cặp
    if (temp) {
      user.tempThresholdLowC = temp.low;
      user.tempThresholdHighC = temp.high;
    }

    if (humid) {
      user.humidThresholdLowPercent = humid.low;
      user.humidThresholdHighPercent = humid.high;
    }

    if (soil) {
      user.soilThresholdLowPercent = soil.low;
      user.soilThresholdHighPercent = soil.high;
    }

    await user.save();

    //  payload cho ESP32 
    const payload = {
      tempThresholdLowC: user.tempThresholdLowC,
      tempThresholdHighC: user.tempThresholdHighC,
      humidThresholdLowPercent: user.humidThresholdLowPercent,
      humidThresholdHighPercent: user.humidThresholdHighPercent,
      soilThresholdLowPercent: user.soilThresholdLowPercent,
      soilThresholdHighPercent: user.soilThresholdHighPercent
    };

    await publishMessage(
      "IoT23CLC09/Group5/thresHoldValue",
      payload
    );

    res.json({
      success: true,
      message: "Threshold updated & synced to ESP32",
      data: payload
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
