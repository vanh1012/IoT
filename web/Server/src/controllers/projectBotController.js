// src/controllers/projectBotController.js
import { askProjectBot } from "../services/projectBotService.js";

const isDev = process.env.NODE_ENV !== "production";

export async function chatWithProjectBot(req, res) {
  try {
    const { message } = req.body || {};

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Thiếu 'message' (string) trong body.",
      });
    }

    const answer = await askProjectBot(message.trim());

    return res.json({
      success: true,
      data: { question: message.trim(), answer },
    });
  } catch (err) {
    console.error("chatWithProjectBot error:", err?.stack || err);
    return res.status(500).json({
      success: false,
      message: isDev ? (err?.message || String(err)) : "Lỗi hệ thống khi xử lý chatbot.",
    });
  }
}
