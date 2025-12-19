import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  pump: { type: Boolean, default: false },
  light: { type: Boolean, default: false },
  tempThresholdLowC: {
    type: Number,
    default : 10
  },
  tempThresholdHighC: {
    type: Number,
    default : 35
  },
  soilThresholdLowPercent: {
    type: Number,
    default : 30
  },
  soilThresholdHighPercent: {
    type: Number,
    default : 60,
  },
  humidThresholdLowPercent: {
    type: Number,
    default : 20
  },
  humidThresholdHighPercent: {
    type: Number,
    default : 70
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
