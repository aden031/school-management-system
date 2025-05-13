import mongoose from "mongoose"

let isConnected = false

const connectToDatabase = async () => {
  if (isConnected) return

  try {
    await mongoose.connect(process.env.NEXT_PUBLIC_MONGODB_URI!, {
      dbName: "garaduates", 
    })
    isConnected = true
    console.log("MongoDB connected")
  } catch (error) {
    console.error("MongoDB connection error:", error)
  }
}

export default connectToDatabase
