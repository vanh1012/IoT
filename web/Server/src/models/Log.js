import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["AUTO", "MANUAL"],
    required: true
  },
  message: String,
  createdAt: { type: Date, default: Date.now }
});

logSchema.statics.createLog = async function ({ type, message }) {
  try {
    await this.create({
      type,
      message
    });
  } catch (err) {
    console.error("Log error:", err.message);
  }
};

export default mongoose.model("Log", logSchema);


