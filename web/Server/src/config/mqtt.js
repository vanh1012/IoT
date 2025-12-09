import mqtt from "mqtt";
import Sensor from "../models/Sensor.js";
import User from "../models/User.js"
import { saveIfChanged } from "../services/sensorService.js";

const client = mqtt.connect("mqtt://broker.hivemq.com", {
  port: 1883,
});

// subscribe 
const sensorData = "IoT23CLC09/Group5/sensor";
const logData = "IoT23CLC09/Group5/log";
const thresHoldData = "IoT23CLC09/Group5/thres";
const thresSyncReqTopic = "IoT23CLC09/Group5/thresSyncReq";
// Publish
const thresHoldValueTopic = "IoT23CLC09/Group5/thresHoldValue";
const cmdTopic = "IoT23CLC09/Group5/cmd";
// ACK
const thresholdAckTopic = "IoT23CLC09/Group5/thresAck";

let thresholdSent = true;

client.on("connect", async () => {
  console.log("MQTT connected!");
  client.subscribe(sensorData);
  client.subscribe(logData);
  client.subscribe(thresHoldData);
  client.subscribe(thresholdAckTopic);
  client.subscribe(thresSyncReqTopic);

  await publishThresholdOnce(); // chỉ gửi 1 lần khi server khởi động
});

client.on("message", async (topic, message) => {
  try {
    if (topic === sensorData) { // nhận dữ liệu cảm biến 
      const json = JSON.parse(message.toString());
      await saveIfChanged({
        soilMoisture: json.soil,
        airHumidity: json.air,
        airTemperature: json.temp,
        timestamp: new Date(),
      });
      return;
    }

    if (topic === logData) { // nhận lại hoạt động bật tắt bơm/đèn, chỉnh sửa ngưỡng từ esp32
      console.log("LOG Message:", message.toString());
      return;
    }

    if (topic === thresholdAckTopic) { // Confirm rằng Esp32 đã đồng bộ được các biến ngưỡng 
      console.log("ESP32 confirmed threshold received!");
      thresholdSent = true;
      return;
    }

    if (topic === thresSyncReqTopic) { // Nhận chỉ thỉ đồng bộ biến ngưỡng đến Esp32
      console.log("📥 ESP32 requested threshold sync");
      thresholdSent = false;
      await publishThresholdOnce();
      return;
    }

    if (topic === thresHoldData) { // Nhận giá trị biến ngưỡng được cập nhật từ Esp32 
      const json = JSON.parse(message.toString());
      console.log("📩 New Threshold received from ESP:", json);

      const user = await User.findOne();
      if (!user) return;

      user.tempThresholdLowC = json.tempThresholdLowC;
      user.tempThresholdHighC = json.tempThresholdHighC;
      user.soilThresholdLowPercent = json.soilThresholdLowPercent;
      user.soilThresholdHighPercent = json.soilThresholdHighPercent;
      user.humidThresholdLowPercent = json.humidThresholdLowPercent;
      user.humidThresholdHighPercent = json.humidThresholdHighPercent;

      await user.save();
      console.log("💾 Threshold updated in DB");
      return;
    }

  } catch (err) {
    console.error("MQTT error:", err.message);
  }
});


export const publishSettings = (settings) => {
  client.publish(cmdTopic, JSON.stringify(settings));
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


export const publishThresholdOnce = async () => {
  if (thresholdSent) return;

  const user = await User.findOne();
  if (!user) return;

  const payload = {
    tempThresholdLowC: user.tempThresholdLowC,
    tempThresholdHighC: user.tempThresholdHighC,
    soilThresholdLowPercent: user.soilThresholdLowPercent,
    soilThresholdHighPercent: user.soilThresholdHighPercent,
    humidThresholdLowPercent: user.humidThresholdLowPercent,
    humidThresholdHighPercent: user.humidThresholdHighPercent
  };
  for (const key in payload) {
    const value = payload[key];
    if (value === null || value === undefined || isNaN(value)) {
      console.log(`publishThresholdOnce : Không gửi cập nhật threshold vì thiếu ${key} trong user:`, value);
      return;
    }
  }
  client.publish(thresHoldValueTopic, JSON.stringify(payload), { qos: 1 });
  console.log("📤 Sent thresholds →", payload);
};
export default client;
