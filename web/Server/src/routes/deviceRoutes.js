import express from "express";
import { controlDevice, updateThreshold } from "../controllers/deviceController.js";

const router = express.Router();

router.post("/control", controlDevice);
router.post("/threshold", updateThreshold)
export default router;
