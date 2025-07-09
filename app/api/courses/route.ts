import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Course from "@/lib/models/course"
import Department from "@/lib/models/department"
import mongoose from "mongoose"
import User from "@/lib/models/user"

/**
 * GET /api/courses
 * Get all courses with faculty and department information
 */
export async function GET() {
  try {
    await connectDB()
    const courses = await Course.find({})
      .populate("teacherId", "FullName")
      .populate("departmentId", "name")
      .sort({ createdAt: -1 })

    return NextResponse.json(courses, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/courses
 * Create a new course
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    // Validate request body
    if (!body.courseName ||   !body.semester  || !body.departmentId || !body.teacherId) {
      return NextResponse.json(
        {
          error: "Course name,  semester, faculty ID, and department ID are required",
        },
        { status: 400 },
      )
    }

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(body.departmentId) || !mongoose.Types.ObjectId.isValid(body.teacherId)) {
      return NextResponse.json({ error: "Invalid teacherId or department ID" }, { status: 400 })
    }


    // Check if teacher exists
    const teacher = await User.findById(body.teacherId)
    if (!teacher) {
      return NextResponse.json({ error: "teacher not found" }, { status: 404 })
    }
    // Check if department exists
    const department = await Department.findById(body.departmentId)
    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 })
    }

    // Create new course
    const course = await Course.create({
      courseName: body.courseName,
      teacherId:body.teacherId,
      semester: body.semester,
      departmentId: body.departmentId,
    })

    // Populate faculty and department information
    await course.populate([
      { path: "departmentId", select: "name" },
    ])

    return NextResponse.json(course, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
