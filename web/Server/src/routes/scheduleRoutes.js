import express from "express";
import {
  createSchedule,
  getSchedules,
  deleteSchedule
} from "../controllers/scheduleController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";


const router = express.Router();

router.use(authMiddleware);

router.get("/", getSchedules);
router.post("/", createSchedule);
router.delete("/:id", deleteSchedule);

export default router;
