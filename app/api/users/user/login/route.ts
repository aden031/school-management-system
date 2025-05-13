import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectToDatabase from "@/lib/db"
import User from "@/lib/models/user"

export async function POST(request: Request) {
  try {
    const { Email, password } = await request.json()

    if (!Email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    await connectToDatabase()

    const user = await User.findOne({ Email })
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const { password: _, ...userData } = user.toObject()
    return NextResponse.json(userData)
  } catch (error) {
    console.error("POST /api/users/login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
