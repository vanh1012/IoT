import { publishSettings } from "../config/mqtt.js";

export const controlDeviceService = async ({ pump, light }) => {
  const settings = {};

  if (pump !== undefined) settings.pump = pump;
  if (light !== undefined) settings.light = light;

  publishSettings(settings);

  return settings;
};
