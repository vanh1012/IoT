import User from '../models/User.js';

export const getTemp = async (req, res) => {
  try {
    const user = await User.findOne();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: {}
      });
    }

    return res.status(200).json({
      success: true,
      message: "Temperature data retrieved",
      data: {
        low: user.tempThresholdLowC,
        high: user.tempThresholdHighC
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      data: {}
    });
  }
};


export const getHumid = async (req, res) => {
  try {
    const user = await User.findOne();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: {}
      });
    }

    return res.status(200).json({
      success: true,
      message: "Humidity data retrieved",
      data: {
        low: user.humidThresholdLowPercent,
        high: user.humidThresholdHighPercent
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      data: {}
    });
  }
};

export const getSoil = async (req, res) => {
  try {
    const user = await User.findOne();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: {}
      });
    }

    return res.status(200).json({
      success: true,
      message: "Soil moisture data retrieved",
      data: {
        low: user.soilThresholdLowPercent,
        high: user.soilThresholdHighPercent
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      data: {}
    });
  }
};
