// src/services/predictionService.js
import dotenv from "dotenv";
dotenv.config();

import { MongoClient } from "mongodb";
import { DecisionTreeRegression } from "ml-cart";

// =======================
// 1. KẾT NỐI MONGODB
// =======================
const uri = process.env.MONGO_DB_URL;
const dbName = process.env.MONGO_DB || "IoT";
const collectionName = process.env.MONGO_COLLECTION || "sensors";

if (!uri) {
  throw new Error("MONGO_URI chưa được set. Kiểm tra lại file .env");
}

const client = new MongoClient(uri);

// =======================
//  TIỆN ÍCH: CLAMP
// =======================
function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

// =======================
// 2. ĐỌC TỐI ĐA limit BẢN GHI GẦN NHẤT
// =======================
async function loadLastSensorData(limit = 100) {
  const collection = client.db(dbName).collection(collectionName);

  const docs = await collection
    .find(
      {},
      {
        projection: {
          _id: 0,
          timestamp: 1,
          soilMoisture: 1,
          airHumidity: 1,
          airTemperature: 1,
        },
      }
    )
    .sort({ timestamp: 1 }) // tăng dần theo thời gian
    .toArray();

  if (!docs.length) {
    throw new Error("Không có document nào trong IoT.sensors");
  }

  // chỉ giữ limit bản ghi cuối
  const used = docs.slice(-limit);

  if (used.length < 3) {
    throw new Error(
      `Cần >= 3 bản ghi để train Regression Tree, hiện có ${used.length}`
    );
  }

  return used.map((d) => ({
    ...d,
    timestamp: new Date(d.timestamp),
  }));
}

// ===================================
// 3. TRAIN 1 REGRESSION TREE
// ===================================
function trainTree(xs, ys) {
  if (xs.length !== ys.length || xs.length === 0) {
    throw new Error("Dữ liệu không hợp lệ cho Regression Tree");
  }

  const trainingSet = xs.map((x) => [x]); // Nx1

  const options = {
    gainFunction: "regression",
    splitFunction: "mean",
    minNumSamples: 3,
    maxDepth: 10, // giới hạn cho bớt overfit
  };

  const tree = new DecisionTreeRegression(options);
  tree.train(trainingSet, ys);
  return tree;
}

// ===================================
// 4. TRAIN & DỰ ĐOÁN CHO NGÀY MAI
// ===================================
function trainAndPredictTomorrowFromSamples(samples) {
  const t0 = samples[0].timestamp.getTime();
  const millisPerDay = 24 * 60 * 60 * 1000;

  const xs = samples.map(
    (s) => (s.timestamp.getTime() - t0) / millisPerDay
  );

  const temps = samples.map((s) => s.airTemperature);
  const hums = samples.map((s) => s.airHumidity);
  const soils = samples.map((s) => s.soilMoisture);

  // 3 regression tree riêng
  const treeTemp = trainTree(xs, temps);
  const treeHum = trainTree(xs, hums);
  const treeSoil = trainTree(xs, soils);

  // thời điểm cuối
  const lastSample = samples[samples.length - 1];
  const lastX = (lastSample.timestamp.getTime() - t0) / millisPerDay;

  // x cho NGÀY MAI
  const xTomorrow = lastX + 1;
  const xTomorrowFeatures = [[xTomorrow]]; // 1x1

  let predTemp = treeTemp.predict(xTomorrowFeatures)[0];
  let predHum = treeHum.predict(xTomorrowFeatures)[0];
  let predSoil = treeSoil.predict(xTomorrowFeatures)[0];

  // ÉP VỀ NGƯỠNG VẬT LÝ
  predTemp = clamp(predTemp, -10, 60);
  predHum = clamp(predHum, 0, 100);
  predSoil = clamp(predSoil, 0, 100);

  const tomorrowDate = new Date(
    lastSample.timestamp.getTime() + millisPerDay
  );

  return {
    date: tomorrowDate.toISOString().slice(0, 10),
    airTemperature: predTemp,
    airHumidity: predHum,
    soilMoisture: predSoil,
  };
}

// ===================================
// 5. HÀM PUBLIC: DỰ ĐOÁN TỪ MONGO
// ===================================
export async function predictTomorrowFromMongo(limit = 100) {
  await client.connect(); // có thể tối ưu để chỉ connect 1 lần cho cả app

  const samples = await loadLastSensorData(limit);
  const prediction = trainAndPredictTomorrowFromSamples(samples);

  return prediction;
}

// (optional) Nếu muốn test nhanh service riêng:
// node src/services/predictionService.js
if (import.meta.main) {
  (async () => {
    try {
      const pred = await predictTomorrowFromMongo(100);
      console.log("Dự đoán cho ngày:", pred.date);
      console.log("  Nhiệt độ (°C):      ", pred.airTemperature.toFixed(2));
      console.log("  Độ ẩm không khí (%):", pred.airHumidity.toFixed(2));
      console.log("  Độ ẩm đất (%):      ", pred.soilMoisture.toFixed(2));
      await client.close();
    } catch (err) {
      console.error("Lỗi:", err.message);
    }
  })();
}
