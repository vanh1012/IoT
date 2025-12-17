// src/controllers/projectBotController.js
import { askProjectBot } from "../services/projectBotService.js";

export async function chatWithProjectBot(req, res) {
  try {
    const { message } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Thiếu 'message' (string) trong body.",
      });
    }

    const answer = await askProjectBot(message);
    
    return res.json({
      success: true,
      data: {
        question: message,
        answer,
      },
    });
  } catch (err) {
    console.error("chatWithProjectBot error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Lỗi hệ thống khi xử lý chatbot.",
    });
  }
}
