import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  action: { type: String, enum: ["pump", "light"], required: true },
  enabled: { type: Boolean, default: true },
  time: { type: String, required: true },
  duration : {type : Number, required : true},
  user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true 
    }
});

export default mongoose.model("Schedule", scheduleSchema);
