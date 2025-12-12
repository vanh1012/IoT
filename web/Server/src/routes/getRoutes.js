import express from "express";
import { getHumid, getSoil, getTemp } from "../controllers/getController.js";

const router = express.Router();

router.get('/humidthreshold', getHumid);
router.get('/soilthreshold', getSoil);
router.get('/tempthreshold', getTemp);

export default router;
