// src/services/predictionService.js
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { DecisionTreeRegression } from "ml-cart";
import { fileURLToPath } from "url";

// =======================
// 1. KẾT NỐI MONGOOSE
// =======================
const uri =
  process.env.MONGO_DB_URL ||
  process.env.MONGO_URI ||
  process.env.MONGODB_URI;

const dbName = process.env.MONGO_DB || "IoT";
const collectionName = process.env.MONGO_COLLECTION || "sensors";

if (!uri) {
  throw new Error("MONGO_DB_URL/MONGO_URI chưa được set. Kiểm tra lại file .env");
}

let connectPromise = null;

async function connectMongoose() {
  if (mongoose.connection.readyState === 1) return;
  if (!connectPromise) {
    connectPromise = mongoose.connect(uri, { dbName });
  }
  await connectPromise;
}

// =======================
// 2. MODEL (Schema)
// =======================
const sensorSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, required: true },
    soilMoisture: { type: Number, required: true },
    airHumidity: { type: Number, required: true },
    airTemperature: { type: Number, required: true },
  },
  {
    collection: collectionName,
    versionKey: false,
  }
);

const Sensor = mongoose.models.Sensor || mongoose.model("Sensor", sensorSchema);

// =======================
//  TIỆN ÍCH: CLAMP
// =======================
function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

// =======================
// 3. ĐỌC TỐI ĐA limit BẢN GHI GẦN NHẤT
// =======================
async function loadLastSensorData(limit = 100) {
  const docs = await Sensor.find(
    {},
    { _id: 0, timestamp: 1, soilMoisture: 1, airHumidity: 1, airTemperature: 1 }
  )
    .sort({ timestamp: 1 })
    .lean();

  if (!docs.length) {
    throw new Error(`Không có document nào trong ${dbName}.${collectionName}`);
  }

  const used = docs.slice(-limit);

  if (used.length < 3) {
    throw new Error(`Cần >= 3 bản ghi để train Regression Tree, hiện có ${used.length}`);
  }

  return used.map((d) => ({
    ...d,
    timestamp: d.timestamp instanceof Date ? d.timestamp : new Date(d.timestamp),
  }));
}

// =======================
// 4. TRAIN 1 REGRESSION TREE
// =======================
function trainTree(xs, ys) {
  if (xs.length !== ys.length || xs.length === 0) {
    throw new Error("Dữ liệu không hợp lệ cho Regression Tree");
  }

  const trainingSet = xs.map((x) => [x]);

  const options = {
    gainFunction: "regression",
    splitFunction: "mean",
    minNumSamples: 3,
    maxDepth: 10,
  };

  const tree = new DecisionTreeRegression(options);
  tree.train(trainingSet, ys);
  return tree;
}

// =======================
// 5. TRAIN & DỰ ĐOÁN CHO NGÀY MAI
// =======================
function trainAndPredictTomorrowFromSamples(samples) {
  const t0 = samples[0].timestamp.getTime();
  const millisPerDay = 24 * 60 * 60 * 1000;

  const xs = samples.map((s) => (s.timestamp.getTime() - t0) / millisPerDay);

  const temps = samples.map((s) => Number(s.airTemperature));
  const hums = samples.map((s) => Number(s.airHumidity));
  const soils = samples.map((s) => Number(s.soilMoisture));

  const treeTemp = trainTree(xs, temps);
  const treeHum = trainTree(xs, hums);
  const treeSoil = trainTree(xs, soils);

  const lastSample = samples[samples.length - 1];
  const lastX = (lastSample.timestamp.getTime() - t0) / millisPerDay;

  const xTomorrow = lastX + 1;
  const xTomorrowFeatures = [[xTomorrow]];

  let predTemp = treeTemp.predict(xTomorrowFeatures)[0];
  let predHum = treeHum.predict(xTomorrowFeatures)[0];
  let predSoil = treeSoil.predict(xTomorrowFeatures)[0];

  predTemp = clamp(predTemp, -10, 60);
  predHum = clamp(predHum, 0, 100);
  predSoil = clamp(predSoil, 0, 100);

  const tomorrowDate = new Date(lastSample.timestamp.getTime() + millisPerDay);

  return {
    date: tomorrowDate.toISOString().slice(0, 10),
    airTemperature: predTemp,
    airHumidity: predHum,
    soilMoisture: predSoil,
  };
}

// =======================
// 6. PUBLIC API
// =======================
export async function predictTomorrowFromMongo(limit = 100) {
  await connectMongoose();
  const samples = await loadLastSensorData(limit);
  return trainAndPredictTomorrowFromSamples(samples);
}

// =======================
// OPTIONAL CLI TEST
// =======================
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  (async () => {
    try {
      const pred = await predictTomorrowFromMongo(100);
      console.log("Dự đoán cho ngày:", pred.date);
      console.log("  Nhiệt độ (°C):      ", pred.airTemperature.toFixed(2));
      console.log("  Độ ẩm không khí (%):", pred.airHumidity.toFixed(2));
      console.log("  Độ ẩm đất (%):      ", pred.soilMoisture.toFixed(2));
      await mongoose.disconnect();
    } catch (err) {
      console.error("Lỗi:", err.message);
      await mongoose.disconnect().catch(() => {});
    }
  })();
}
