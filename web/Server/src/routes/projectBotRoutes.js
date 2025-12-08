// src/routes/projectBotRoutes.js
import { Router } from "express";
import { chatWithProjectBot } from "../controllers/projectBotController.js";

const router = Router();

// POST /api/project-bot/chat
router.post("/chat", chatWithProjectBot);

export default router;
