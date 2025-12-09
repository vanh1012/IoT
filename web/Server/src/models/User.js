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
  },
  tempThresholdHighC: {
    type: Number
  },
  soilThresholdLowPercent: {
    type: Number
  },
  soilThresholdHighPercent: {
    type: Number
  },
  humidThresholdLowPercent: {
    type: Number
  },
  humidThresholdHighPercent: {
    type: Number
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
