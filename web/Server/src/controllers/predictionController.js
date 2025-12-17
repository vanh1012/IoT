// src/controllers/predictionController.js
import { predictTomorrowFromMongo } from "../services/predictionService.js";

function clampInt(n, min, max) {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, Math.trunc(x)));
}

export async function getTomorrowPrediction(req, res) {
  try {
    const limit = clampInt(req.query.limit ?? 100, 3, 2000);

    const prediction = await predictTomorrowFromMongo(limit);

    return res.json({
      success: true,
      data: prediction,
    });
  } catch (err) {
    console.error("getTomorrowPrediction error:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi dự đoán",
    });
  }
}
