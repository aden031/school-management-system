import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Student from "@/lib/models/student"
import Faculty from "@/lib/models/faculty"
import Class from "@/lib/models/class"
import mongoose from "mongoose"

/**
 * GET /api/student
 * Get all students with faculty and class information
 */
export async function GET() {
  try {
    await connectDB()
    const students = await Student.find({})
      .populate({
        path: "classId",
        select: "semester type classMode",
        populate: {
          path: "departmentId",
          select: "name",
        },
      })
      .sort({ createdAt: -1 })

    return NextResponse.json(students, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/student
 * Create a new student
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    // Validate request body
    if (!body.name  || !body.classId || !body.parentPhone || !body.studentId) {
      return NextResponse.json(
        {
          error: "Name, faculty ID, class ID, parent phone, and student ID are required",
        },
        { status: 400 },
      )
    }

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(body.classId)) {
      return NextResponse.json({ error: "Invalid faculty or class ID" }, { status: 400 })
    }

    // Check if faculty exists

    // Check if class exists
    const classObj = await Class.findById(body.classId)
    if (!classObj) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    // Check if student ID already exists
    const existingStudent = await Student.findOne({ studentId: body.studentId })
    if (existingStudent) {
      return NextResponse.json({ error: "Student ID already exists" }, { status: 400 })
    }

    // Create new student
    const student = await Student.create({
      name: body.name,
      classId: body.classId,
      gender: body.gender,
      parentPhone: body.parentPhone,
      phone: body.phone,
      studentId: body.studentId,
      passcode: body.passcode || "1234",
      status: body.status || "active",
      studentImage: body.studentImage || null,
    })

    // Populate faculty and class information
    await student.populate([
      {
        path: "classId",
        select: "semester type classMode",
        populate: {
          path: "departmentId",
          select: "name",
        },
      },
    ])

    console.log("student", student,body)

    return NextResponse.json(student, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
