import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import AcademicYear from "@/lib/models/academicyear"
import mongoose from "mongoose"

// GET a single academic year by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }
    const record = await AcademicYear.findById(id)
    if (!record) {
      return NextResponse.json({ error: "Academic year not found" }, { status: 404 })
    }
    return NextResponse.json(record, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT update academic year by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }
    const body = await req.json()
		if (body.isActive) {
      const existingActive = await AcademicYear.findOne({ isActive: true, _id: { $ne: id } })
      if (existingActive) {
        return NextResponse.json({ error: "There is already an active academic year. Deactivate it first." }, { status: 400 })
      }
    }
    const updated = await AcademicYear.findByIdAndUpdate(id, body, { new: true })
    if (!updated) {
      return NextResponse.json({ error: "Academic year not found" }, { status: 404 })
    }
    return NextResponse.json(updated, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE academic year by ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }
    const deleted = await AcademicYear.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json({ error: "Academic year not found" }, { status: 404 })
    }
    return NextResponse.json({ message: "Academic year deleted" }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
