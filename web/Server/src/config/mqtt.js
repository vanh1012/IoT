import mqtt from "mqtt";
import Sensor from "../models/Sensor.js";
import { saveIfChanged } from "../services/sensorService.js";

const client = mqtt.connect("mqtt://broker.hivemq.com", {
  port: 1883,
});

const sensorData = "IoT23CLC09/Group5/sensor";
const logData = "IoT23CLC09/Group5/log";
const thresHoldData = "IoT23CLC09/Group5/thres";

client.on("connect", () => {
  console.log("MQTT connected!");
  client.subscribe(sensorData);
  client.subscribe(logData);
  client.subscribe(thresHoldData);
});

client.on("message", async (topic, message) => {
  try {
    if (topic === sensorData) {
      const json = JSON.parse(message.toString());

      const data = {
        soilMoisture: json.soil,
        airHumidity: json.air,
        airTemperature: json.temp,
        timestamp: new Date(),
      };

      await saveIfChanged(data);
      return;
    }

    if (topic === logData) {
      console.log("LOG Message:", message.toString());
      return;
    }

    if (topic === thresHoldData) {
      console.log("Threshold update:", message.toString());
      return;
    }

  } catch (err) {
    console.error("MQTT message handling error:", err.message);
  }
});



export const publishSettings = (settings) => {
  client.publish("IoT23CLC09/Group5/cmd", JSON.stringify(settings));
  console.log("Command sent:", settings);
};

export const publishMessage = (topic, payload) => {
  return new Promise((resolve, reject) => {
    if (!client.connected) {
      reject(new Error("MQTT client is not connected"));
      return;
    }

    const jsonPayload = typeof payload === "string" ? payload : JSON.stringify(payload);

    client.publish(topic, jsonPayload, { qos: 1 }, (err) => {
      if (err) {
        console.error("MQTT publish error:", err.message);
        reject(err);
      } else {
        console.log(`Message published to ${topic}:`, payload);
        resolve({ topic, payload, timestamp: new Date().toISOString() });
      }
    });
  });
};

export const getConnectionStatus = () => {
  return {
    connected: client.connected,
    broker: "broker.hivemq.com",
    port: 1883
  };
};

export default client;
