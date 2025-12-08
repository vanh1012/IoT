import Schedule from "../models/Schedule.js";

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
    const schedules = await Schedule.find({ user: req.userId });

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


export const deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found"
      });
    }

    res.json({
      success: true,
      message: "Schedule deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
