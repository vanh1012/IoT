import { publishMessage, getConnectionStatus } from "../config/mqtt.js";

export const sendMqttMessage = async (req, res) => {
  try {
    const { topic, data } = req.body;

    if (!topic) {
      return res.status(400).json({ 
        success: false,
        message: "Missing 'topic' field" 
      });
    }

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ 
        success: false,
        message: "'data' must be a JSON object with your custom key-value pairs" 
      });
    }

    const result = await publishMessage(topic, data);

    res.json({
      success: true,
      message: "MQTT message sent successfully",
      data: result
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const getMqttStatus = (req, res) => {
  const status = getConnectionStatus();
  res.json({
    success: true,
    data: status
  });
};
