import { controlDeviceService } from "../services/deviceService.js";

export const controlDevice = async (req, res) => {
  try {
    const { pump, light } = req.body;

    if (pump === undefined && light === undefined) {
      return res.status(400).json({ message: "Missing device control fields" });
    }

    const result = await controlDeviceService({ pump, light });

    res.json({
      message: "Command sent successfully",
      settings: result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
