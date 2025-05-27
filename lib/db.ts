import mongoose from "mongoose"

let isConnected = false

const connectToDatabase = async () => {
  if (isConnected) return

  try {
    await mongoose.connect("mongodb+srv://alaja:1dqEAiHKSIiWuW1r@cluster0.grizelt.mongodb.net/garaduates?retryWrites=true&w=majority&appName=Cluster0", {
      dbName: "garaduates", 
    })
    isConnected = true
    console.log("MongoDB connected")
  } catch (error) {
    console.error("MongoDB connection error:", error)
  }
}

export default connectToDatabase
