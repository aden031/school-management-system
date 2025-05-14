import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Course from "@/lib/models/course"
import Faculty from "@/lib/models/faculty"
import Department from "@/lib/models/department"
import mongoose from "mongoose"

/**
 * GET /api/courses/:id - Get a single course with faculty + department info
 */
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 })
    }

    const course = await Course.findById(id)
      .populate("facultyId", "name")
      .populate("departmentId", "name")

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json(course, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * PUT /api/courses/:id - Update a course
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 })
    }

    const body = await request.json()
    const { courseName, code, semester, facultyId, departmentId } = body

    // Validate related IDs if they're being updated
    if (facultyId && !mongoose.Types.ObjectId.isValid(facultyId)) {
      return NextResponse.json({ error: "Invalid faculty ID" }, { status: 400 })
    }
    if (departmentId && !mongoose.Types.ObjectId.isValid(departmentId)) {
      return NextResponse.json({ error: "Invalid department ID" }, { status: 400 })
    }

    // Optional: check if referenced faculty/department exist
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

    const updated = await Course.findByIdAndUpdate(
      id,
      { courseName, code, semester, facultyId, departmentId },
      { new: true }
    )
      .populate("facultyId", "name")
      .populate("departmentId", "name")

    if (!updated) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json(updated, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * DELETE /api/courses/:id - Delete a course
 */
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 })
    }

    const deleted = await Course.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Course deleted successfully" }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
