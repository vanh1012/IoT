import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["AUTO", "MANUAL", "ALERT"],
    required: true
  },
  message: String,
  createdAt: { type: Date, default: Date.now },
  user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true 
    }
});

export default mongoose.model("Log", logSchema);
