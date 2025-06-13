import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import User from "@/lib/models/user"
import connectToDatabase from "@/lib/db"
import mongoose from "mongoose"

const allowedTitles = ["parent", "teacher", "officer" , "student" , "admin"]
const allowedStatus = ["active", "inactive"]

export async function GET(request: Request) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
      }

      const user = await User.findById(id).select("-password")
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      return NextResponse.json(user)
    }

    const users = await User.find().select("-password")
    return NextResponse.json(users)
  } catch (error) {
    console.error("GET error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { FullName, Email, password, phone,  Title, Status ,studentId } = await request.json()

    if (!FullName || !Email || !password || !phone) {
      return NextResponse.json({ error: "Name, email and password required" }, { status: 400 })
    }

    if (Title && !allowedTitles.includes(Title)) {
      return NextResponse.json({ error: "Invalid title" }, { status: 400 })
    }

    if (Status && !allowedStatus.includes(Status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    await connectToDatabase()

    const existing = await User.findOne({ $or: [{ Email }, { FullName }] })
    if (existing) {
      return NextResponse.json(
        { error: existing.Email === Email ? "Email exists" : "Name exists" },
        { status: 400 }
      )
    }

    const hashed = await bcrypt.hash(password, 10)

    const newUser = await User.create({
      FullName,
      Email,
      password: hashed,
      phone,
      studentId,
      Title: Title || "teacher",
      Status: Status || "active",
    })

    const { password: _, ...userData } = newUser.toObject()
    return NextResponse.json(userData, { status: 201 })
  } catch (error) {
    console.error("POST error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, FullName, Email, password, Title, Status } = await request.json()

    if (!id ) {
      return NextResponse.json({ error: "ID, name and email required" }, { status: 400 })
    }

    if (Title && !allowedTitles.includes(Title)) {
      return NextResponse.json({ error: "Invalid title" }, { status: 400 })
    }

    if (Status && !allowedStatus.includes(Status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    await connectToDatabase()

    const existingUser = await User.findOne({
      $or: [{ Email }, { FullName }],
      _id: { $ne: new mongoose.Types.ObjectId(id) },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: existingUser.Email === Email ? "Email exists" : "Name exists" },
        { status: 400 }
      )
    }

    const updateData: any = { FullName, Email, Title, Status }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const updated = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password")

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PUT error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Valid ID required" }, { status: 400 })
    }

    await connectToDatabase()

    const deleted = await User.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User deleted" })
  } catch (error) {
    console.error("DELETE error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
