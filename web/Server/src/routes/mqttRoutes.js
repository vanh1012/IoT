import express from "express";
import { sendMqttMessage, getMqttStatus } from "../controllers/mqttController.js";

const router = express.Router();

router.post("/publish", sendMqttMessage);

router.get("/status", getMqttStatus);

export default router;
