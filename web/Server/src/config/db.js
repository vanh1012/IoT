import "dotenv/config"
import mongoose from "mongoose"

const connection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL)
    const state = mongoose.connection.readyState;
    const states = ["Disconnected", "Connected", "Connecting", "Disconnecting"]
    console.log(`MongoDB status: ${states[state]}`)
  } catch (error) {
    console.error("MongoDB connect error:", error.message)
  }
};

connection();

export default connection;
