import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Course from "@/lib/models/course"
import Department from "@/lib/models/department"
import mongoose from "mongoose"

/**
 * GET /api/courses
 * Get all courses with faculty and department information
 */
export async function GET() {
  try {
    await connectDB()
    const courses = await Course.find({})
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
    if (!body.courseName || !body.code || !body.semester  || !body.departmentId) {
      return NextResponse.json(
        {
          error: "Course name, code, semester, faculty ID, and department ID are required",
        },
        { status: 400 },
      )
    }

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(body.departmentId)) {
      return NextResponse.json({ error: "Invalid faculty or department ID" }, { status: 400 })
    }


    // Check if department exists
    const department = await Department.findById(body.departmentId)
    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 })
    }

    // Check if course name already exists
    const existingCourse = await Course.findOne({ courseName: body.courseName })
    if (existingCourse) {
      return NextResponse.json({ error: "Course name already exists" }, { status: 400 })
    }

    // Create new course
    const course = await Course.create({
      courseName: body.courseName,
      code: body.code,
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
