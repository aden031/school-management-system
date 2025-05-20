import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { Exam } from "@/lib/models/exam"
import ExamType from "@/lib/models/examType"
import Student from "@/lib/models/student"
import Course from "@/lib/models/course"
import mongoose from "mongoose"

/**
 * GET /api/exams
 * Get all exams with populated course, examType, and student
 */
export async function GET() {
  try {
    await connectDB()

    const exams = await Exam.find({})
      .populate("courseId", "courseName code")
      .populate("examTypeId", "name marks")
      .populate("studentId", "name")
      .sort({ createdAt: -1 })

    return NextResponse.json(exams, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/exams
 * Create a new exam entry
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { studentId, examTypeId, courseId, marksObtained, date } = body

    // Validate input
    if (!studentId || !examTypeId || !courseId || marksObtained == null || !date) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 })
    }

    // Validate IDs
    const isValidId = (id: string) => mongoose.Types.ObjectId.isValid(id)
    if (![studentId, examTypeId, courseId].every(isValidId)) {
      return NextResponse.json({ error: "One or more invalid Object IDs." }, { status: 400 })
    }

    // Check related documents
    const student = await Student.findById(studentId)
    if (!student) return NextResponse.json({ error: "Student not found." }, { status: 404 })

    const examType = await ExamType.findById(examTypeId)
    if (!examType) return NextResponse.json({ error: "Exam type not found." }, { status: 404 })

    const course = await Course.findById(courseId)
    if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 })

    // Create exam entry
    const newExam = await Exam.create({ studentId, examTypeId, courseId, marksObtained, date })

    // Populate for response
    await newExam.populate([
      { path: "studentId", select: "name" },
      { path: "examTypeId", select: "name marks" },
      { path: "courseId", select: "courseName code" },
    ])

    return NextResponse.json(newExam, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
