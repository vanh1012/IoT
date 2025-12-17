import express from "express";
import { getLogs, getSensorChart24h } from "../controllers/getController.js";

const router = express.Router();

router.get("/logs", getLogs);
router.get("/chart", getSensorChart24h);

export default router;
