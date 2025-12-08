// src/routes/predictionRoutes.js
import { Router } from "express";
import { getTomorrowPrediction } from "../controllers/predictionController.js";

const router = Router();

// GET /api/prediction/tomorrow?limit=100
router.get("/tomorrow", getTomorrowPrediction);

export default router;
