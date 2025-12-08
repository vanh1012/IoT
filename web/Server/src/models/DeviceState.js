import mongoose from "mongoose";

const deviceStateSchema = new mongoose.Schema({
  pump: { type: Boolean, default: false },
  light: { type: Boolean, default: false },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model("DeviceState", deviceStateSchema);
