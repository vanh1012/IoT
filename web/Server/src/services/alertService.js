import transporter from "../config/nodemailer.js";
import User from "../models/User.js"
export const sendAlertEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: to,
      subject: subject,
      text: text
    });

    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false };
  }
};

let lastestAlertText = "";

export const checkThresholdAndAlert = async ({ temp, humid, soil }) => {
  const user = await User.findOne();
  if (!user) return;

  let alerts = [];

  if (temp < user.tempThresholdLowC || temp > user.tempThresholdHighC) {
    alerts.push(`⚠️ Temperature out of range: ${temp}°C`);
  }

  if (humid < user.humidThresholdLowPercent || humid > user.humidThresholdHighPercent) {
    alerts.push(`⚠️ Humidity out of range: ${humid}%`);
  }

  if (soil < user.soilThresholdLowPercent || soil > user.soilThresholdHighPercent) {
    alerts.push(`⚠️ Soil moisture out of range: ${soil}%`);
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
    "⚠️ IoT Alert",
    alerts.join("\n")
  );

  console.log("📩 Alert email sent");
};

