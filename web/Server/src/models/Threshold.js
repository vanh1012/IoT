import mongoose from "mongoose";

const thresholdSchema = new mongoose.Schema({
  tempThresholdLowC: {
    type: Number,
    required: true
  },
  tempThresholdHighC: {
    type: Number,
    required: true
  },
  soilThresholdLowPercent: {
    type: Number,
    required: true
  },
  soilThresholdHighPercent: {
    type: Number,
    required: true
  },
  humidThresholdLowPercent: {
    type: Number,
    required: true
  },
  humidThresholdHighPercent: {
    type: Number,
    required: true
  }
}, { timestamps: true });

export default mongoose.model("Threshold", thresholdSchema);
