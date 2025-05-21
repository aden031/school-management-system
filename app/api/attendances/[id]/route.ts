import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { Attendance } from "@/lib/models/attendance"
import "@/lib/models/student" // 👈 needed for populate
import mongoose from "mongoose"

// GET a single record
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const record = await Attendance.findById(id)
      .populate("studentId", "name studentId")

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    return NextResponse.json(record, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT to update
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params
    const body = await req.json()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const updated = await Attendance.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(updated, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const deleted = await Attendance.findByIdAndDelete(id)

    if (!deleted) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Deleted" }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
