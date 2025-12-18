import transporter from "../config/nodemailer.js";
import User from "../models/User.js";
import axios from "axios";

export const sendAlertEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: to,
      subject: subject,
      text: text,
    });

    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false };
  }
};

export const sendAlertPhone = async (to, subject, text) => {
  try {
    const key = process.env.PUSHSAFER_KEY;
    const device = to || process.env.PUSHSAFER_DEVICE || "a"; // to dùng như "device"

    if (!key) {
      throw new Error("Missing PUSHSAFER_KEY in .env");
    }

    // Pushsafer: k=key, m=message, t=title, d=device
    const params = new URLSearchParams();
    params.set("k", key);
    params.set("m", text);          // message
    params.set("t", subject || "⚠️ IoT Alert"); // title
    params.set("d", device);

    // (optional) thêm sound/vibration/icon nếu muốn
    // params.set("s", "1");
    // params.set("v", "1");
    // params.set("i", "1");

    await axios.post("https://www.pushsafer.com/api", params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 15000,
    });
    console.log("✅ Push sent to:", device, "| title:", subject);
    return { success: true };
  } catch (error) {
    console.error("Pushsafer send error:", error?.response?.data || error);
    return { success: false };
  }
};

let lastestAlertText = "";

export const checkThresholdAndAlert = async ({ temp, humid, soil }) => {
  const user = await User.findOne();
  if (!user) return;

  let alerts = [];

  if (temp < user.tempThresholdLowC || temp > user.tempThresholdHighC) {
    alerts.push(`⚠️ Nhiệt độ không nằm trong vùng an toàn: ${temp}°C (${user.tempThresholdLowC}°C - ${user.tempThresholdHighC}°C)`);
  }

  if (humid < user.humidThresholdLowPercent || humid > user.humidThresholdHighPercent) {
    alerts.push(`⚠️ Độ ẩm KK không nằm trong vùng an toàn: ${humid}% (${user.humidThresholdLowPercent}% - ${user.humidThresholdHighPercent}%)`);
  }

  if (soil < user.soilThresholdLowPercent || soil > user.soilThresholdHighPercent) {
    alerts.push(`⚠️ Độ ẩm đất không nằm trong vùng an toàn: ${soil}% (${user.soilThresholdLowPercent}% - ${user.soilThresholdHighPercent}%)`);
  }

  if (alerts.length === 0) {
    lastestAlertText = "";
    return;
  }

  const alertText = alerts.join("|");
  if (alertText === lastestAlertText) return;

  lastestAlertText = alertText;

  await sendAlertEmail(
    user.email,
    "⚠️ IoT cảnh báo: Ngưỡng môi trường không nằm trong giới hạn",
    alerts.join("\n")
  );

  console.log("📩 Alert email sent");

  await sendAlertPhone(process.env.PUSHSAFER_DEVICE || "a", "⚠️ IoT Alert", alerts.join("\n"));
  console.log("📱 Alert push sent");
};
