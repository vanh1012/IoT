import User from "../models/User.js";
import Log from "../models/Log.js"
import { controlDeviceService } from "../services/deviceService.js";
import { sendAlertEmail, sendAlertPhone } from "../services/alertService.js";
import { publishMessage } from "../config/mqtt.js"

export const controlDevice = async (req, res) => {
  try {
    const { type, state } = req.body;

    if (!type || typeof state !== "boolean") {
      return res.status(400).json({ message: "Invalid input: type, state required" });
    }

    if (!["pump", "light"].includes(type)) {
      return res.status(400).json({ message: "Invalid type. Must be pump or light." });
    }

    // 1️⃣ Lấy user hiện tại
    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2️⃣ Chặn trạng thái không đổi
    if (user[type] === state) {
      return res.status(400).json({
        message: `Device "${type}" is already ${state ? "ON" : "OFF"}`
      });
    }

    // 3️⃣ Update DB
    const updateObj = {};
    updateObj[type] = state;

    const updatedUser = await User.findOneAndUpdate(
      {},
      { $set: updateObj },
      { new: true }
    );

    // 4️⃣ Gửi MQTT
    try {
      await controlDeviceService(type, state);
    } catch (err) {
      console.log("MQTT send failed:", err.message);
    }

    // 5️⃣ Gửi email
    try {
      const subject = `⚠️ Device ${type} was ${state ? "turned ON" : "turned OFF"}`;
      const text = `The device "${type}" has been ${state ? "activated" : "deactivated"}.\n\nTime: ${new Date().toLocaleString()}`;
      await sendAlertEmail(updatedUser.email, subject, text);
      // await sendAlertPhone(null, subject, text);
    } catch (err) {
      console.log("Email send failed:", err.message);
    }

    
    // -------- LOG hành động -------
    await Log.createLog({
      type: "MANUAL",
      message: `Device ${type} was turned ${state ? "ON" : "OFF"} from web`
    });

    res.json({
      message: "Device updated successfully",
      device: type,
      state,
      userSettings: {
        pump: updatedUser.pump,
        light: updatedUser.light
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// export const controlDevice = async (req, res) => {
//   try {
//     const { type, state } = req.body;
//     if (!type || typeof state !== "boolean") {
//       return res.status(400).json({ message: "Invalid input: type, state required" });
//     }

//     // Chỉ cho phép 2 loại
//     if (!["pump", "light"].includes(type)) {
//       return res.status(400).json({ message: "Invalid type. Must be pump or light." });
//     }

//     // Update object Mongo
//     const updateObj = {};
//     updateObj[type] = state;

//     // Update user
//     const updatedUser = await User.findOneAndUpdate(
//       {},
//       { $set: updateObj },
//       { new: true }
//     );


//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // -------- Gửi MQTT lệnh điều khiển -------
//     try {
//       await controlDeviceService(type, state);
//     } catch (err) {
//       console.log("MQTT send failed:", err.message);
//     }

//     // -------- Gửi email cảnh báo -------
//     try {
//       const subject = `⚠️ Device ${type} was ${state ? "turned ON" : "turned OFF"}`;
//       const text = `The device "${type}" has been ${state ? "activated" : "deactivated"}.\n\nTime: ${new Date().toLocaleString()}`;

//       await sendAlertEmail(updatedUser.email, subject, text);
//     } catch (err) {
//       console.log("Email send failed:", err.message);
//     }


//     res.json({
//       message: "Device updated successfully",
//       device: type,
//       state,
//       userSettings: {
//         pump: updatedUser.pump,
//         light: updatedUser.light,
//       }
//     });

//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

export const updateThreshold = async (req, res) => {
  try {
    const { temp, humid, soil } = req.body;

    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let changes = [];

    // Update DB theo từng cặp
    if (temp) {
      user.tempThresholdLowC = temp.low;
      user.tempThresholdHighC = temp.high;
      changes.push(`Temp: ${temp.low}°C → ${temp.high}°C`);
    }

    if (humid) {
      user.humidThresholdLowPercent = humid.low;
      user.humidThresholdHighPercent = humid.high;
      changes.push(`Humid: ${humid.low}% → ${humid.high}%`);
    }

    if (soil) {
      user.soilThresholdLowPercent = soil.low;
      user.soilThresholdHighPercent = soil.high;
      changes.push(`Soil: ${soil.low}% → ${soil.high}%`);
    }

    await user.save();

    // payload cho ESP32
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

    // -------- LOG -------
    await Log.createLog({
      type: "MANUAL",
      message: `Threshold updated from web: ${changes.join(" | ")}`
    });

    res.json({
      success: true,
      message: "Threshold updated & synced to ESP32",
      data: payload
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
