import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Class from "@/lib/models/class"
import Faculty from "@/lib/models/faculty"
import Department from "@/lib/models/department"
import mongoose from "mongoose"

/**
 * GET /api/classes/:id - Get a single class with faculty & department info
 */
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid class ID" }, { status: 400 })
    }

    const classData = await Class.findById(id)
      .populate("facultyId", "name")
      .populate("departmentId", "name")

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    return NextResponse.json(classData, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * PUT /api/classes/:id - Update a class
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid class ID" }, { status: 400 })
    }

    const body = await request.json()
    const { facultyId, departmentId, semester, classMode, type, status } = body

    // Optional validation
    if (facultyId && !mongoose.Types.ObjectId.isValid(facultyId)) {
      return NextResponse.json({ error: "Invalid faculty ID" }, { status: 400 })
    }

    if (departmentId && !mongoose.Types.ObjectId.isValid(departmentId)) {
      return NextResponse.json({ error: "Invalid department ID" }, { status: 400 })
    }

    if (facultyId) {
      const faculty = await Faculty.findById(facultyId)
      if (!faculty) {
        return NextResponse.json({ error: "Faculty not found" }, { status: 404 })
      }
    }

    if (departmentId) {
      const department = await Department.findById(departmentId)
      if (!department) {
        return NextResponse.json({ error: "Department not found" }, { status: 404 })
      }
    }

    const updated = await Class.findByIdAndUpdate(
      id,
      { facultyId, departmentId, semester, classMode, type, status },
      { new: true }
    )
      .populate("facultyId", "name")
      .populate("departmentId", "name")

    if (!updated) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    return NextResponse.json(updated, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * DELETE /api/classes/:id - Delete a class
 */
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid class ID" }, { status: 400 })
    }

    const deleted = await Class.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Class deleted successfully" }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
