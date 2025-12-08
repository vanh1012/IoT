import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["AUTO", "MANUAL", "ALERT"],
    required: true
  },
  message: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Log", logSchema);
