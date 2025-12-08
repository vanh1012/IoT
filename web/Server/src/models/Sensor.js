import mongoose from "mongoose";

const sensorSchema = new mongoose.Schema({
  soilMoisture: Number,
  airHumidity: Number,
  airTemperature: Number,
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model("Sensor", sensorSchema);
