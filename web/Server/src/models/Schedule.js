import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  action: { type: String, enum: ["pump", "light"], required: true },
  enabled: { type: Boolean, default: true },
  time: { type: String, required: true }, // HH:mm
  repeat: [{ type: String }] // ["Mon", "Tue", ...] or empty = every day
});

export default mongoose.model("Schedule", scheduleSchema);
