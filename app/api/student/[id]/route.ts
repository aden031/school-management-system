import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Student from "@/lib/models/student"
import mongoose from "mongoose"

/**
 * GET /api/student/[id]
 * Get a single student by ID with full populated data
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 })
    }

    const student = await Student.findById(id)
      .populate("facultyId", "name")
      .populate({
        path: "classId",
        select: "semester type classMode",
        populate: {
          path: "departmentId",
          select: "name",
        },
      })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json(student, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * PUT /api/student/[id]
 * Update a student
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const { id } = params
    const body = await request.json()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 })
    }

    const updated = await Student.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })
      .populate("facultyId", "name")
      .populate({
        path: "classId",
        select: "semester type classMode",
        populate: {
          path: "departmentId",
          select: "name",
        },
      })

    if (!updated) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json(updated, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * DELETE /api/student/[id]
 * Delete a student
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 })
    }

    const deleted = await Student.findByIdAndDelete(id)

    if (!deleted) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Student deleted successfully" }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
