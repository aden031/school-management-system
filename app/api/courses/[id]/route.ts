import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Course from "@/lib/models/course"
import Department from "@/lib/models/department"
import mongoose from "mongoose"
import User from "@/lib/models/user"

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
    const { courseName,  semester, departmentId , teacherId } = body

    // Validate related IDs if they're being updated
    if (!mongoose.Types.ObjectId.isValid(departmentId) || !mongoose.Types.ObjectId.isValid(teacherId)) {
      return NextResponse.json({ error: "Invalid department or teacherId ID" }, { status: 400 })
    }

    // Optional: check if referenced faculty/department exist

    if (teacherId) {
      const teacher = await User.findById(teacherId)
      if (!teacher) {
        return NextResponse.json({ error: "teacher not found" }, { status: 404 })
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
      { courseName,  semester ,teacherId ,departmentId },
      { new: true }
    )
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
