import mqtt from "mqtt";
import Sensor from "../models/Sensor.js";

const client = mqtt.connect("mqtt://broker.hivemq.com", {
  port: 1883,
});

client.on("connect", () => {
  console.log("MQTT connected!");
  client.subscribe("IoT23CLC09/Group5/data");
});

client.on("message", async (topic, message) => {
  try {
    const json = JSON.parse(message.toString());

    const data = {
      soilMoisture: json.soil,
      airHumidity: json.air,
      airTemperature: json.temp,
      timestamp: new Date(),
    };

    await Sensor.create(data);
    console.log("📥 Sensor saved:", data);

  } catch (err) {
    console.error("❌ MQTT parse/save error:", err.message);
  }
});

// Gửi lệnh điều khiển xuống ESP
export const publishSettings = (settings) => {
  client.publish("IoT23CLC09/Group5/cmd/settings", JSON.stringify(settings));
  console.log("📤 Command sent:", settings);
};

export default client;
