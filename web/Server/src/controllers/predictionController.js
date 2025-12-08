// src/controllers/predictionController.js
import { predictTomorrowFromMongo } from "../services/predictionService.js";

export async function getTomorrowPrediction(req, res) {
  try {
    // cho phép client truyền ?limit=200, default = 100
    const limit = Number(req.query.limit) || 100;

    const prediction = await predictTomorrowFromMongo(limit);

    return res.json({
      success: true,
      data: prediction,
    });
  } catch (err) {
    console.error("getTomorrowPrediction error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Lỗi hệ thống khi dự đoán",
    });
  }
}
