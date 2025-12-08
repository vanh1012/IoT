import express from "express";
import { controlDevice } from "../controllers/deviceController.js";

const router = express.Router();

router.post("/control", controlDevice);

export default router;
