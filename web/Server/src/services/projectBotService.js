// src/services/projectBotService.js
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { predictTomorrowFromMongo } from "./predictionService.js"; // cùng folder services


const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ================== CONTEXT ĐỀ TÀI ==================
const PROJECT_CONTEXT = `
1.1 Sự Cần Thiết và Tác Động Thực Tế
Trong nhịp sống bận rộn hiện nay, việc chăm sóc cây trồng thủ công gặp nhiều hạn chế: người dùng khó theo dõi thường xuyên nhiệt độ và độ ẩm, dẫn đến tưới quá mức hoặc thiếu nước, ảnh hưởng đến sự phát triển của cây. Với các mô hình trồng trọt hộ gia đình và nông nghiệp đô thị, việc tưới tiêu thủ công còn tốn thời gian và thiếu chính xác.

Do đó, việc xây dựng Hệ thống tưới cây thông minh là cần thiết nhằm tự động hóa quá trình chăm sóc cây dựa trên công nghệ IoT. Hệ thống giúp giám sát môi trường theo thời gian thực, điều khiển thiết bị từ xa, tiết kiệm nước, tối ưu công sức chăm sóc và nâng cao hiệu quả sinh trưởng của cây. Đây là giải pháp phù hợp cho gia đình, người bận rộn, người yêu cây cảnh và các mô hình nông nghiệp hiện đại.

1.2 Mục tiêu Dự án
Dự án “Hệ thống tưới cây thông minh” được xây dựng với mục tiêu ứng dụng công nghệ IoT vào việc tự động hóa quá trình chăm sóc cây trồng.

1.3 Tổng quan chức năng
Hệ thống tưới cây thông minh là một giải pháp IoT có các chức năng chính sau (dưới góc độ người sử dụng):

Giám sát môi trường: Giám sát độ ẩm không khí, độ ẩm đất và nhiệt độ không khí thông qua cảm biến, giúp người dùng nắm được tình trạng đất và môi trường trồng trọt một cách chính xác và liên tục.

Đề xuất thông số: Có chức năng đề xuất độ ẩm, nhiệt độ thích hợp với môi trường và loại cây trồng vào ngày mai (dựa trên dữ liệu).

Tương tác thông minh: Tích hợp Chatbot cho phép người dùng hỏi các thông số môi trường hiện tại, hoặc gợi ý về nhu cầu độ ẩm của cây.

Cảnh báo tự động: Gửi email thông báo đến người dùng khi độ ẩm/ nhiệt độ không nằm trong vùng an toàn, hoặc khi có sự kiện bật/tắt máy bơm, đèn.

Điều khiển từ xa: Cho phép điều khiển thiết bị từ xa (máy bơm, bật đèn) và điều chỉnh các thông số ngưỡng môi trường qua Internet.

Lập lịch tưới: Cho phép người dùng thông qua Website điều chỉnh được ngày, giờ để tự động tưới.

Phân tích dữ liệu: Cung cấp biểu đồ độ ẩm, nhiệt độ trong ngày, tuần, tháng giúp người dùng phân tích và theo dõi xu hướng môi trường trồng trọt.

Quản lý người dùng: Triển khai Website quản lý tài khoản cho người dùng.

Hiển thị trực quan: Hiển thị thông tin nhiệt độ, độ ẩm đất, không khí trên màn hình LCD đặt tại thiết bị.

Lịch sử hoạt động: Ghi lại mọi hoạt động của người dùng như bật/tắt thiết bị, điều chỉnh mức nhiệt độ, độ ẩm để tiện theo dõi và kiểm soát.
`;

// ================== SYSTEM INSTRUCTION ==================
const SYSTEM_INSTRUCTION = `
Bạn là Chatbot hỗ trợ cho đồ án "Hệ thống tưới cây thông minh".

Nhiệm vụ:
- Chỉ trả lời các câu hỏi LIÊN QUAN đến đề tài này và các nội dung trong phần mô tả dự án dưới đây.
- Bỏ các dấu markdown không cần thiết trong câu trả lời. Để dưới dạng plain text.
- Ưu tiên giải thích:
  + Sự cần thiết và tác động thực tế của hệ thống.
  + Mục tiêu dự án.
  + Các chức năng chính của hệ thống dưới góc độ người dùng.
- Trả lời bằng tiếng Việt, giọng điệu thân thiện, dễ hiểu, súc tích.

Giới hạn:
- Không trả lời các câu hỏi ngoài phạm vi đề tài (ví dụ: kiến thức không liên quan, các môn học khác, chuyện đời tư, v.v.).
- Nếu câu hỏi ngoài phạm vi, hãy trả lời theo mẫu:
  "Hiện tại em chỉ được phép trả lời trong phạm vi đề tài 'Hệ thống tưới cây thông minh' (phần sự cần thiết, mục tiêu và các chức năng chính của hệ thống). Anh/chị có thể hỏi lại về các nội dung này giúp em nhé."

Gợi ý:
- Sau mỗi câu trả lời, nếu phù hợp, gợi ý thêm 2–3 câu hỏi liên quan mà người dùng có thể hỏi tiếp về đề tài.

Dưới đây là mô tả đề tài mà bạn được phép sử dụng làm kiến thức nền:
${PROJECT_CONTEXT}
`;

// ================== TIỆN ÍCH: RETRY / BACKOFF / FALLBACK ==================
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isOverloadedError(err) {
  const msg = (err?.message || "").toLowerCase();
  return (
    msg.includes("503") ||
    msg.includes("overloaded") ||
    msg.includes("unavailable") ||
    msg.includes("resource_exhausted")
  );
}

async function generateWithRetry({ model, contents, config }, retries = 3) {
  let lastErr;

  for (let i = 0; i <= retries; i++) {
    try {
      return await ai.models.generateContent({ model, contents, config });
    } catch (err) {
      lastErr = err;

      // Chỉ retry khi overload/unavailable
      if (!isOverloadedError(err) || i === retries) break;

      // Exponential backoff: 500ms, 1000ms, 2000ms, 4000ms...
      await sleep(500 * Math.pow(2, i));
    }
  }

  throw lastErr;
}

async function generateWithFallback({ contents, config }) {
  // Ưu tiên flash mới, fallback sang flash đời cũ hơn
  const models = ["gemini-2.5-flash", "gemini-2.0-flash"];
  let lastErr;

  for (const m of models) {
    try {
      return await generateWithRetry({ model: m, contents, config }, 3);
    } catch (err) {
      lastErr = err;

      // Nếu lỗi không phải overload -> không cần thử model khác, throw luôn
      if (!isOverloadedError(err)) break;
    }
  }

  throw lastErr;
}

// ================== HÀM NHẬN DIỆN CÂU HỎI DỰ ĐOÁN ==================
function isForecastQuestion(text) {
  const lower = (text || "").toLowerCase();

  const hasTomorrow =
    lower.includes("ngày mai") || lower.includes("mai") || lower.includes("tomorrow");

  const hasTemp =
    lower.includes("nhiệt độ") || lower.includes("nhiệt") || lower.includes("temperature");
  const hasHumidity =
    lower.includes("độ ẩm") || lower.includes("humidity") || lower.includes("ẩm đất");

  return hasTomorrow && (hasTemp || hasHumidity);
}

// ================== HÀM HỎI GEMINI (SERVICE CHÍNH) ==================
export async function askProjectBot(userMessage) {
  let predictionSnippet = "";

  // 1. Nếu là câu hỏi dự đoán ngày mai → gọi model Regression Tree
  if (isForecastQuestion(userMessage)) {
    try {
      const pred = await predictTomorrowFromMongo(100);

      predictionSnippet = `
Dữ liệu dự đoán từ hệ thống (xem như module phân tích dữ liệu của đồ án):
- Ngày dự đoán: ${pred.date}
- Nhiệt độ không khí ngày mai (ước lượng): ${pred.airTemperature.toFixed(2)} °C
- Độ ẩm không khí ngày mai (ước lượng): ${pred.airHumidity.toFixed(2)} %
- Độ ẩm đất ngày mai (ước lượng): ${pred.soilMoisture.toFixed(2)} %.

Hãy sử dụng các con số trên để trả lời câu hỏi của người dùng theo cách dễ hiểu, gắn với bối cảnh hệ thống tưới cây thông minh.
`;
    } catch (err) {
      predictionSnippet = `
Hiện tại module dự đoán dữ liệu ngày mai đang gặp lỗi nên không lấy được số liệu cụ thể.
Tuy nhiên, bạn vẫn phải trả lời trong phạm vi đề tài "Hệ thống tưới cây thông minh", có thể giải thích vai trò của chức năng đề xuất thông số dựa trên dữ liệu lịch sử.
(Chi tiết lỗi nội bộ: ${err.message})
`;
    }
  }

  // 2. Chuẩn bị payload cho Gemini
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `
${predictionSnippet}

Câu hỏi của người dùng: "${userMessage}".

Hãy trả lời chỉ dựa trên:
- phạm vi đề tài "Hệ thống tưới cây thông minh" đã được mô tả trong systemInstruction,
- và (nếu có) các số liệu dự đoán ở trên.
`,
        },
      ],
    },
  ];

  const config = {
    systemInstruction: SYSTEM_INSTRUCTION,
  };

  // 3. Gọi Gemini với retry + fallback
  const response = await generateWithFallback({ contents, config });

  // node SDK mới: response có thể là object, nhưng chị đang dùng response.text nên giữ nguyên
  return response.text;
}

// ================== (OPTIONAL) CLI test riêng ==================
if (import.meta.main) {
  const readline = await import("readline");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("Chatbot tưới cây thông minh (gõ 'exit' để thoát)");
  rl.setPrompt("Bạn: ");
  rl.prompt();

  rl.on("line", async (line) => {
    const input = line.trim();
    if (!input) {
      rl.prompt();
      return;
    }

    if (input.toLowerCase() === "exit" || input.toLowerCase() === "quit") {
      console.log("Bot: Hẹn gặp lại ạ! 🌱");
      rl.close();
      return;
    }

    try {
      const answer = await askProjectBot(input);
      console.log("Bot:", answer.trim(), "\n");
    } catch (err) {
      console.error("Bot lỗi:", err.message);
    }

    rl.prompt();
  });

  rl.on("close", () => {
    process.exit(0);
  });
}
