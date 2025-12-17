import { publishSettings } from "../config/mqtt.js";
import Schedule from "../models/Schedule.js";
import User from "../models/User.js";
export const createSchedule = async (req, res) => {
  try {
    const { action, enabled, time, duration } = req.body;

    if (!action || !time || !duration) {
      return res.status(400).json({
        success: false,
        message: "action, time and duration are required"
      });
    }

    const schedule = await Schedule.create({
      action,
      enabled,
      time,
      duration,
      user: req.userId
    });

    res.status(201).json({
      success: true,
      message: "Schedule created successfully",
      data: schedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find();
    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found"
      });
    }

    res.json({
      success: true,
      message: "Schedule updated successfully",
      data: schedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



const toMinutes = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

export const deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();

    const startMin = toMinutes(schedule.time);
    const endMin = startMin + schedule.duration;

    // 👉 đang nằm trong khoảng chạy
    const isRunning =
      currentMin >= startMin && currentMin < endMin;

    if (isRunning) {
      const user = await User.findOne();
      if (user) {
        const device = schedule.action;

        // chỉ tắt nếu đang bật
        if (user[device] === true) {
          console.log(`⛔ Schedule deleted while running → STOP ${device}`);

          // 1️⃣ gửi MQTT tắt thiết bị
          publishSettings({
            [device]: false,
          });

          // 2️⃣ update DB
          user[device] = false;
          user.updatedAt = new Date();
          await user.save();
        }
      }
    }

    // 3️⃣ xóa lịch
    await schedule.deleteOne();

    res.json({
      success: true,
      message: "Schedule deleted successfully",
      stoppedDevice: isRunning ? schedule.action : null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};