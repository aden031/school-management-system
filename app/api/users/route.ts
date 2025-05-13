import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import User from "@/lib/models/user"

export async function GET() {
  try {
    await connectToDatabase()
    const users = await User.find().select("-password").lean()
    return NextResponse.json(users)
  } catch (error) {
    console.error("GET /api/users error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
