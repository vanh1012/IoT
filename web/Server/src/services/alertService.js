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
};

