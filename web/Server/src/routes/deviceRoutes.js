import express from "express";
import { controlDevice, updateThresholds } from "../controllers/deviceController.js";

const router = express.Router();

router.post("/control", controlDevice);
router.post("/threshold", updateThresholds)
export default router;
